import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { getPublishedAnnouncements } from "../services/announcementService";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

const STORAGE_LAST_SEEN_KEY = "trinity_announcements_last_seen_at";
const STORAGE_SEEN_IDS_KEY = "trinity_seen_announcement_ids";

const AnnouncementNotificationContext = createContext({
  unreadCount: 0,
  unreadItems: [],
  markAllAsRead: () => {},
  refreshUnread: () => {},
});

export function AnnouncementNotificationProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadItems, setUnreadItems] = useState([]);
  const latestItemsRef = useRef([]);

  const computeUnread = useCallback((items) => {
    if (!items || items.length === 0) {
      setUnreadCount(0);
      setUnreadItems([]);
      return;
    }

    latestItemsRef.current = items;
    const lastSeenStr = localStorage.getItem(STORAGE_LAST_SEEN_KEY);
    let seenIds = [];
    try {
      const raw = localStorage.getItem(STORAGE_SEEN_IDS_KEY);
      if (raw) seenIds = JSON.parse(raw);
    } catch {
      seenIds = [];
    }
    const seenIdsSet = new Set((seenIds || []).map(String));

    // First time visitor who has never visited the Announcements page:
    // Mark all existing as new so they get the ping to explore announcements
    if (!lastSeenStr && seenIdsSet.size === 0) {
      setUnreadCount(items.length);
      setUnreadItems(items);
      return;
    }

    const lastSeenTime = lastSeenStr ? new Date(lastSeenStr).getTime() : 0;

    const unread = items.filter((item) => {
      const itemId = String(item.id);
      if (seenIdsSet.has(itemId)) return false;

      const dateStr = item.publish_at || item.created_at;
      if (dateStr) {
        const itemTime = new Date(dateStr).getTime();
        if (!isNaN(itemTime) && itemTime <= lastSeenTime) {
          return false;
        }
      }
      return true;
    });

    setUnreadCount(unread.length);
    setUnreadItems(unread);
  }, []);

  const fetchAndEvaluate = useCallback(async () => {
    try {
      const { data, error } = await getPublishedAnnouncements();
      if (!error && data && data.length > 0) {
        computeUnread(data);
      } else {
        computeUnread([]);
      }
    } catch {
      computeUnread([]);
    }
  }, [computeUnread]);

  const markAllAsRead = useCallback((customList) => {
    const list = customList || latestItemsRef.current || [];
    const nowIso = new Date().toISOString();
    localStorage.setItem(STORAGE_LAST_SEEN_KEY, nowIso);

    let existingSeen = [];
    try {
      const raw = localStorage.getItem(STORAGE_SEEN_IDS_KEY);
      if (raw) existingSeen = JSON.parse(raw);
    } catch {
      existingSeen = [];
    }

    const currentIds = list.map((item) => String(item.id));
    const merged = Array.from(new Set([...existingSeen, ...currentIds]));
    localStorage.setItem(STORAGE_SEEN_IDS_KEY, JSON.stringify(merged));

    setUnreadCount(0);
    setUnreadItems([]);
    window.dispatchEvent(new CustomEvent("trinity:announcements-read"));
  }, []);

  // Sync on mount and subscribe to Realtime & lifecycle events
  useEffect(() => {
    fetchAndEvaluate();

    // 1. Sync when user refocuses tab / returns to window
    const handleFocus = () => {
      fetchAndEvaluate();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchAndEvaluate();
      }
    };

    // 2. Sync cross-tab when user marks as read in another tab
    const handleStorage = (e) => {
      if (
        e.key === STORAGE_LAST_SEEN_KEY ||
        e.key === STORAGE_SEEN_IDS_KEY
      ) {
        fetchAndEvaluate();
      }
    };

    // 3. Custom event within same window
    const handleCustomRead = () => {
      setUnreadCount(0);
      setUnreadItems([]);
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("trinity:announcements-read", handleCustomRead);

    // 4. Supabase real-time channel subscription for instant announcement ping
    let channel = null;
    if (isSupabaseConfigured()) {
      try {
        channel = supabase
          .channel("trinity-realtime-announcements")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "announcements",
            },
            () => {
              fetchAndEvaluate();
            }
          )
          .subscribe();
      } catch (err) {
        console.warn("Realtime subscription error for announcements:", err);
      }
    }

    // Periodic check every 60 seconds while page is open
    const intervalId = setInterval(fetchAndEvaluate, 60000);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("trinity:announcements-read", handleCustomRead);
      clearInterval(intervalId);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchAndEvaluate]);

  return (
    <AnnouncementNotificationContext.Provider
      value={{
        unreadCount,
        unreadItems,
        markAllAsRead,
        refreshUnread: fetchAndEvaluate,
      }}
    >
      {children}
    </AnnouncementNotificationContext.Provider>
  );
}

export const useAnnouncementNotification = () =>
  useContext(AnnouncementNotificationContext);
