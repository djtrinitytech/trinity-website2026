import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  LogOut,
  Plus,
  PlusCircle,
  Trash2,
  Crop,
  Upload,
  Check,
  ChevronDown,
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  Folder,
  Users,
  Camera,
  LayoutGrid,
  ArrowLeft,
  Search,
  Edit3,
  Image as ImageIcon
} from "lucide-react";
import { supabase } from "../lib/supabase";
const ADMIN_STORAGE_KEY = "gallery_trinity_admins";
const AUTH_STORAGE_KEY = "gallery_trinity_auth";
function getAdminEmails() {
  try {
    const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
  }
  return ["admin@trinity.gallery"];
}
function saveAdminEmails(emails) {
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(emails));
}
function getAuthUser() {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      const user = JSON.parse(stored);
      if (Date.now() - user.authenticatedAt < 24 * 60 * 60 * 1e3) return user;
    }
  } catch {
  }
  return null;
}
function saveAuthUser(user) {
  if (user) localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  else localStorage.removeItem(AUTH_STORAGE_KEY);
}
function ImageCropper({
  src,
  onCrop,
  onCancel
}) {
  const imgRef = useRef(null);
  const [cropRect, setCropRect] = useState({ x: 50, y: 50, w: 200, h: 200 });
  const [dragging, setDragging] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, rx: 0, ry: 0, rw: 0, rh: 0 });
  const handleMouseDown = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    if (mx >= cropRect.x + cropRect.w - 15 && mx <= cropRect.x + cropRect.w + 5 && my >= cropRect.y + cropRect.h - 15 && my <= cropRect.y + cropRect.h + 5) {
      setDragging("resize");
      setDragStart({ x: mx, y: my, rx: cropRect.x, ry: cropRect.y, rw: cropRect.w, rh: cropRect.h });
    } else if (mx >= cropRect.x && mx <= cropRect.x + cropRect.w && my >= cropRect.y && my <= cropRect.y + cropRect.h) {
      setDragging("move");
      setDragStart({ x: mx, y: my, rx: cropRect.x, ry: cropRect.y, rw: cropRect.w, rh: cropRect.h });
    }
  };
  const handleMouseMove = (e) => {
    if (!dragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    if (dragging === "move") {
      setCropRect({ ...cropRect, x: Math.max(0, dragStart.rx + (mx - dragStart.x)), y: Math.max(0, dragStart.ry + (my - dragStart.y)) });
    } else {
      setCropRect({ ...cropRect, w: Math.max(60, dragStart.rw + (mx - dragStart.x)), h: Math.max(60, dragStart.rh + (my - dragStart.y)) });
    }
  };
  const handleMouseUp = () => setDragging(null);
  const applyCrop = () => {
    const img = imgRef.current;
    if (!img) return;
    const scaleX = img.naturalWidth / img.clientWidth;
    const scaleY = img.naturalHeight / img.clientHeight;
    const offscreen = document.createElement("canvas");
    const sw = cropRect.w * scaleX;
    const sh = cropRect.h * scaleY;
    offscreen.width = sw;
    offscreen.height = sh;
    const ctx = offscreen.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(img, cropRect.x * scaleX, cropRect.y * scaleY, sw, sh, 0, 0, sw, sh);
    onCrop(offscreen.toDataURL("image/jpeg", 0.92));
  };
  return <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl"
  >
      <div className="relative flex flex-col items-center gap-4 max-w-[90vw] max-h-[90vh]">
        <div className="text-xs font-mono uppercase tracking-widest text-amber-300 mb-1">
          <Crop className="w-4 h-4 inline mr-2" />
          Drag to move • Bottom-right handle to resize
        </div>
        <div
    className="relative cursor-crosshair select-none"
    onMouseDown={handleMouseDown}
    onMouseMove={handleMouseMove}
    onMouseUp={handleMouseUp}
    onMouseLeave={handleMouseUp}
  >
          <img
    ref={imgRef}
    src={src}
    crossOrigin="anonymous"
    alt="Crop preview"
    className="max-w-[80vw] max-h-[65vh] object-contain"
    draggable={false}
  />
          <div
    className="absolute border-2 border-amber-400 pointer-events-none"
    style={{
      left: cropRect.x,
      top: cropRect.y,
      width: cropRect.w,
      height: cropRect.h,
      boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)"
    }}
  >
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-amber-500 cursor-se-resize" />
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-mono uppercase tracking-wider hover:bg-slate-700 border border-slate-600 transition-all cursor-pointer">
            Cancel
          </button>
          <button onClick={applyCrop} className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-mono uppercase tracking-wider font-bold hover:bg-amber-400 border border-amber-300 transition-all cursor-pointer flex items-center gap-2">
            <Check className="w-3.5 h-3.5" /> Apply Crop
          </button>
        </div>
      </div>
    </motion.div>;
}
export default function AdminPanel({ isOpen, onClose, events, onUpdateEvents }) {
  const [authUser, setAuthUser] = useState(getAuthUser);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [activeSection, setActiveSection] = useState("overview");
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [cropState, setCropState] = useState(null);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [adminEmails, setAdminEmails] = useState(getAdminEmails);
  const [showAddPhoto, setShowAddPhoto] = useState(null);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [newPhotoTitle, setNewPhotoTitle] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEventFilter, setSelectedEventFilter] = useState(null);
  const fileInputRef = useRef(null);
  const [uploadEventId, setUploadEventId] = useState(null);
  const coverImageRef = useRef(null);
  const [coverUploadEventId, setCoverUploadEventId] = useState(null);
  const [discEventTitle, setDiscEventTitle] = useState("");
  const [discEventSubtitle, setDiscEventSubtitle] = useState("");
  const [discEventYear, setDiscEventYear] = useState((/* @__PURE__ */ new Date()).getFullYear().toString());
  const [discPattern, setDiscPattern] = useState("sunburst");
  const [discPalette, setDiscPalette] = useState(["#1b1d1f", "#e8572b", "#f0c94c"]);
  const [discCoverImage, setDiscCoverImage] = useState("");
  const [discPhotoTitle, setDiscPhotoTitle] = useState("");
  const [discPhotoUrl, setDiscPhotoUrl] = useState("");
  const [discPhotoDate, setDiscPhotoDate] = useState("");
  const [discPhotoLocation, setDiscPhotoLocation] = useState("Gallery Trinity");
  const [discFrameStyle, setDiscFrameStyle] = useState("baroque-gold");
  const [discSubmitting, setDiscSubmitting] = useState(false);
  const [discSubmitResult, setDiscSubmitResult] = useState(null);
  const handleLogin = () => {
    setLoginError("");
    const emails = getAdminEmails();
    if (!loginEmail.trim()) {
      setLoginError("Please enter your email");
      return;
    }
    if (!emails.includes(loginEmail.trim().toLowerCase())) {
      setLoginError("Access denied. Email not registered as admin.");
      return;
    }
    if (loginPassword !== "trinity2025") {
      setLoginError("Invalid password.");
      return;
    }
    const user = { email: loginEmail.trim().toLowerCase(), authenticatedAt: Date.now() };
    saveAuthUser(user);
    setAuthUser(user);
    setLoginEmail("");
    setLoginPassword("");
  };
  const handleLogout = () => {
    saveAuthUser(null);
    setAuthUser(null);
  };
  const handleAddDisc = async () => {
    setDiscSubmitResult(null);
    if (!discEventTitle.trim()) {
      setDiscSubmitResult({ ok: false, message: "Event title is required." });
      return;
    }
    if (!discPhotoTitle.trim()) {
      setDiscSubmitResult({ ok: false, message: "Photo title is required." });
      return;
    }
    if (!discPhotoUrl.trim()) {
      setDiscSubmitResult({ ok: false, message: "Photo URL is required." });
      return;
    }
    setDiscSubmitting(true);
    const eventId = discEventTitle.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const newRow = {
      event_id: eventId,
      event_title: discEventTitle.trim(),
      event_subtitle: discEventSubtitle.trim() || null,
      event_year: discEventYear.trim() || null,
      event_pattern: discPattern,
      event_palette: discPalette,
      event_cover_image: discCoverImage.trim() || null,
      photo_title: discPhotoTitle.trim(),
      photo_url: discPhotoUrl.trim(),
      photo_date: discPhotoDate.trim() || null,
      photo_location: discPhotoLocation.trim() || "Gallery Trinity",
      frame_style: discFrameStyle
    };
    try {
      const { data, error } = await supabase.from("gallery2").insert(newRow).select().single();
      if (error) {
        setDiscSubmitResult({
          ok: false,
          message: `Database error: ${error.message}${error.code === "42501" ? " \u2014 INSERT policy not yet enabled on gallery2." : ""}`
        });
        return;
      }
      const insertedId = data?.id ?? `${eventId}-${Date.now()}`;
      const existingEventIndex = events.findIndex((ev) => ev.id === eventId);
      const newPhoto = {
        id: insertedId,
        src: discPhotoUrl.trim(),
        title: discPhotoTitle.trim(),
        date: discPhotoDate.trim() || new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
        location: discPhotoLocation.trim() || "Gallery Trinity",
        eventId,
        eventName: discEventTitle.trim(),
        frameStyle: discFrameStyle
      };

      if (existingEventIndex >= 0) {
        const updatedEvents = events.map((ev, idx) => {
          if (idx !== existingEventIndex) return ev;
          return {
            ...ev,
            coverImage: discCoverImage.trim() || ev.coverImage || discPhotoUrl.trim(),
            photos: [...ev.photos, newPhoto]
          };
        });
        onUpdateEvents(updatedEvents);
      } else {
        const newEvent = {
          id: eventId,
          title: discEventTitle.trim(),
          subtitle: discEventSubtitle.trim() || "Trinity Gallery Collection",
          year: discEventYear.trim() || new Date().getFullYear().toString(),
          pattern: discPattern,
          palette: discPalette,
          coverImage: discCoverImage.trim() || discPhotoUrl.trim(),
          photos: [newPhoto]
        };
        onUpdateEvents([...events, newEvent]);
      }
      setDiscSubmitResult({ ok: true, message: `\u2713 "${discEventTitle.trim()}" disc added to Supabase and carousel updated!` });
      setDiscEventTitle("");
      setDiscEventSubtitle("");
      setDiscEventYear((/* @__PURE__ */ new Date()).getFullYear().toString());
      setDiscPattern("sunburst");
      setDiscPalette(["#1b1d1f", "#e8572b", "#f0c94c"]);
      setDiscCoverImage("");
      setDiscPhotoTitle("");
      setDiscPhotoUrl("");
      setDiscPhotoDate("");
      setDiscPhotoLocation("Gallery Trinity");
      setDiscFrameStyle("baroque-gold");
    } catch (err) {
      setDiscSubmitResult({ ok: false, message: `Unexpected error: ${String(err)}` });
    } finally {
      setDiscSubmitting(false);
    }
  };
  const addAdmin = () => {
    if (!newAdminEmail.trim() || !newAdminEmail.includes("@")) return;
    const updated = [.../* @__PURE__ */ new Set([...adminEmails, newAdminEmail.trim().toLowerCase()])];
    setAdminEmails(updated);
    saveAdminEmails(updated);
    setNewAdminEmail("");
  };
  const removeAdmin = (email) => {
    if (adminEmails.length <= 1) return;
    const updated = adminEmails.filter((e) => e !== email);
    setAdminEmails(updated);
    saveAdminEmails(updated);
  };
  const deletePhoto = (eventId, photoId) => {
    const updated = events.map(
      (ev) => ev.id === eventId ? { ...ev, photos: ev.photos.filter((p) => p.id !== photoId) } : ev
    );
    onUpdateEvents(updated);
    setConfirmDelete(null);
  };
  const addPhoto = (eventId) => {
    if (!newPhotoUrl.trim()) return;
    const event = events.find((e) => e.id === eventId);
    if (!event) return;
    const newPhoto = {
      id: `${eventId}-${Date.now()}`,
      src: newPhotoUrl.trim(),
      title: newPhotoTitle.trim() || "Untitled Photo",
      date: (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      location: "Gallery Trinity",
      eventId,
      eventName: event.title,
      frameStyle: "baroque-gold"
    };
    const updated = events.map(
      (ev) => ev.id === eventId ? { ...ev, photos: [...ev.photos, newPhoto] } : ev
    );
    onUpdateEvents(updated);
    setNewPhotoUrl("");
    setNewPhotoTitle("");
    setShowAddPhoto(null);
  };
  const updatePhotoSrc = (eventId, photoId, newSrc) => {
    const updated = events.map(
      (ev) => ev.id === eventId ? { ...ev, photos: ev.photos.map((p) => p.id === photoId ? { ...p, src: newSrc } : p) } : ev
    );
    onUpdateEvents(updated);
    setCropState(null);
  };
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length || !uploadEventId) return;
    const eventObj = events.find((ev) => ev.id === uploadEventId);
    if (!eventObj) return;
    let updatedEvents = [...events];
    let pending = files.length;
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result;
        if (dataUrl) {
          const newPhoto = {
            id: `${uploadEventId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            src: dataUrl,
            title: file.name.replace(/\.[^.]+$/, "") || "Untitled Photo",
            date: (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
            location: "Gallery Trinity",
            eventId: uploadEventId,
            eventName: eventObj.title,
            frameStyle: "baroque-gold"
          };
          updatedEvents = updatedEvents.map(
            (ev2) => ev2.id === uploadEventId ? { ...ev2, photos: [...ev2.photos, newPhoto] } : ev2
          );
        }
        pending--;
        if (pending === 0) onUpdateEvents(updatedEvents);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };
  const handleCoverImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !coverUploadEventId) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result;
      if (dataUrl) {
        const updated = events.map(
          (ev2) => ev2.id === coverUploadEventId ? { ...ev2, coverImage: dataUrl } : ev2
        );
        onUpdateEvents(updated);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
    setCoverUploadEventId(null);
  };
  const getCropPhoto = () => {
    if (!cropState) return null;
    return events.find((e) => e.id === cropState.eventId)?.photos.find((p) => p.id === cropState.photoId) ?? null;
  };
  const totalPhotos = events.reduce((sum, ev) => sum + ev.photos.length, 0);
  const totalEvents = events.length;
  const filteredEvents = selectedEventFilter ? events.filter((e) => e.id === selectedEventFilter) : events;
  if (!isOpen) return null;
  return <>
      {
    /* Crop Overlay */
  }
      <AnimatePresence>
        {cropState && getCropPhoto() && <ImageCropper
    src={getCropPhoto().src}
    onCrop={(croppedUrl) => updatePhotoSrc(cropState.eventId, cropState.photoId, croppedUrl)}
    onCancel={() => setCropState(null)}
  />}
      </AnimatePresence>

      {
    /* Hidden file inputs */
  }
      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
      <input ref={coverImageRef} type="file" accept="image/*" className="hidden" onChange={handleCoverImageUpload} />

      {
    /* FULL-SCREEN OVERLAY */
  }
      <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.4 }}
    className="fixed inset-0 z-[90] bg-[#080b12] flex flex-col overflow-hidden"
  >
        {!authUser ? (
    /* ═══════════════════════════════════════════════════════════════
       LOGIN SCREEN - Full-Screen Centered
       ═══════════════════════════════════════════════════════════════ */
    <div className="flex-1 flex items-center justify-center relative">
            {
      /* Ambient Background */
    }
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-[200px]" />
              <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-amber-600/5 rounded-full blur-[150px]" />
            </div>

            {
      /* Close Button */
    }
            <button
      onClick={onClose}
      className="absolute top-6 right-6 p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-all cursor-pointer z-10"
    >
              <X className="w-5 h-5" />
            </button>

            <motion.div
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-md px-8"
    >
              {
      /* Logo */
    }
              <div className="flex flex-col items-center mb-10">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-amber-500/25 to-amber-700/10 border border-amber-500/30 flex items-center justify-center mb-5 shadow-[0_0_60px_rgba(245,158,11,0.15)]">
                  <Shield className="w-9 h-9 text-amber-400" />
                </div>
                <h2 className="text-2xl font-serif text-amber-50 tracking-wider font-semibold">Admin Access</h2>
                <p className="text-[10px] text-amber-400/50 font-mono uppercase tracking-[0.3em] mt-2">Gallery Trinity • Secure Dashboard</p>
              </div>

              {
      /* Email */
    }
              <div className="mb-5">
                <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-amber-300/60 mb-2.5 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500/40" />
                  <input
      type="email"
      value={loginEmail}
      onChange={(e) => setLoginEmail(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
      placeholder="admin@trinity.gallery"
      className="w-full pl-11 pr-4 py-3.5 bg-slate-900/80 border border-amber-500/20 rounded-xl text-sm text-amber-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400/50 focus:shadow-[0_0_20px_rgba(245,158,11,0.1)] transition-all font-mono"
    />
                </div>
              </div>

              {
      /* Password */
    }
              <div className="mb-5">
                <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-amber-300/60 mb-2.5 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500/40" />
                  <input
      type={showPassword ? "text" : "password"}
      value={loginPassword}
      onChange={(e) => setLoginPassword(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
      placeholder="••••••••"
      className="w-full pl-11 pr-12 py-3.5 bg-slate-900/80 border border-amber-500/20 rounded-xl text-sm text-amber-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400/50 focus:shadow-[0_0_20px_rgba(245,158,11,0.1)] transition-all font-mono"
    />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-amber-300 transition-colors cursor-pointer">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {
      /* Error */
    }
              <AnimatePresence>
                {loginError && <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs font-mono flex items-center gap-2.5"
    >
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {loginError}
                  </motion.div>}
              </AnimatePresence>

              {
      /* Login Button */
    }
              <button
      onClick={handleLogin}
      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-bold text-sm uppercase tracking-[0.2em] font-mono hover:shadow-[0_0_35px_rgba(245,158,11,0.4)] hover:scale-[1.02] transition-all cursor-pointer border border-amber-300/40"
    >
                Sign In
              </button>

              <p className="text-[9px] text-slate-600 font-mono text-center mt-5 tracking-wider">
                Default: admin@trinity.gallery / trinity2025
              </p>
            </motion.div>
          </div>
  ) : (
    /* ═══════════════════════════════════════════════════════════════
       FULL-SCREEN DASHBOARD
       ═══════════════════════════════════════════════════════════════ */
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

            {
      /* ── SIDEBAR ─────────────────────────────────────────────── */
    }
            <aside className="w-full md:w-64 lg:w-72 bg-[#0c1019] border-r border-amber-500/10 flex flex-col flex-shrink-0">
              {
      /* Sidebar Header */
    }
              <div className="px-5 py-5 border-b border-amber-500/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500/25 to-amber-600/10 border border-amber-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                    <Shield className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-amber-100 tracking-wide">Admin Panel</div>
                    <div className="text-[9px] text-amber-400/50 font-mono tracking-wider">{authUser.email}</div>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-500 hover:text-white border border-slate-700/50 transition-all cursor-pointer md:hidden">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {
      /* Nav Items */
    }
              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {[
      { key: "overview", icon: LayoutGrid, label: "Overview" },
      { key: "photos", icon: Camera, label: "Manage Photos" },
      { key: "admins", icon: Users, label: "Manage Admins" },
      { key: "add-disc", icon: PlusCircle, label: "Add Gallery Disc" }
    ].map((item) => <button
      key={item.key}
      onClick={() => setActiveSection(item.key)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-mono transition-all cursor-pointer ${activeSection === item.key ? "bg-amber-500/15 text-amber-300 border border-amber-500/25 shadow-[0_0_15px_rgba(245,158,11,0.08)]" : "text-slate-400 hover:text-amber-200 hover:bg-slate-800/50 border border-transparent"}`}
    >
                    <item.icon className="w-4.5 h-4.5" />
                    <span className="tracking-wider">{item.label}</span>
                  </button>)}
              </nav>

              {
      /* Sidebar Footer */
    }
              <div className="p-3 border-t border-amber-500/10">
                <button
      onClick={onClose}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-mono text-slate-500 hover:text-amber-300 hover:bg-slate-800/50 transition-all cursor-pointer border border-transparent"
    >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="tracking-wider">Back to Gallery</span>
                </button>
                <button
      onClick={handleLogout}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-mono text-slate-500 hover:text-red-300 hover:bg-red-500/10 transition-all cursor-pointer border border-transparent mt-1"
    >
                  <LogOut className="w-4 h-4" />
                  <span className="tracking-wider">Sign Out</span>
                </button>
              </div>
            </aside>


            {
      /* ── MAIN CONTENT ────────────────────────────────────────── */
    }
            <main className="flex-1 flex flex-col overflow-hidden bg-[#080b12]">

              {
      /* Top Bar */
    }
              <header className="px-6 lg:px-8 py-4 border-b border-amber-500/10 bg-[#0a0e17]/80 backdrop-blur-sm flex items-center justify-between flex-shrink-0">
                <div>
                  <h1 className="text-lg font-serif text-amber-100 tracking-wider font-semibold capitalize">
                    {activeSection === "overview" ? "Dashboard Overview" : activeSection === "photos" ? "Manage Event Photos" : activeSection === "add-disc" ? "Add Gallery Disc" : "Admin Management"}
                  </h1>
                  <p className="text-[10px] text-slate-500 font-mono tracking-wider mt-0.5">
                    {activeSection === "overview" ? `${totalEvents} events \u2022 ${totalPhotos} photos` : activeSection === "photos" ? "Add, delete, and crop photos across all events" : activeSection === "add-disc" ? "Create a new gallery disc entry in Supabase" : `${adminEmails.length} registered admin(s)`}
                  </p>
                </div>
                <button onClick={onClose} className="hidden md:flex p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-500 hover:text-white border border-slate-700/50 transition-all cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </header>


              {
      /* Scrollable Content */
    }
              <div className="flex-1 overflow-y-auto p-6 lg:p-8">

                {
      /* ── OVERVIEW SECTION ─────────────────────────────── */
    }
                {activeSection === "overview" && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    {
      /* Stats Grid */
    }
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
      { label: "Total Events", value: totalEvents, icon: Folder, color: "amber" },
      { label: "Total Photos", value: totalPhotos, icon: Camera, color: "blue" },
      { label: "Admin Users", value: adminEmails.length, icon: Users, color: "emerald" },
      { label: "Avg / Event", value: totalEvents > 0 ? Math.round(totalPhotos / totalEvents) : 0, icon: LayoutGrid, color: "purple" }
    ].map((stat) => <div key={stat.label} className="p-5 rounded-2xl bg-slate-900/50 border border-amber-500/10 hover:border-amber-500/25 transition-all">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">{stat.label}</span>
                            <div className={`p-2 rounded-lg ${stat.color === "amber" ? "bg-amber-500/15 text-amber-400" : stat.color === "blue" ? "bg-blue-500/15 text-blue-400" : stat.color === "emerald" ? "bg-emerald-500/15 text-emerald-400" : "bg-purple-500/15 text-purple-400"}`}>
                              <stat.icon className="w-4 h-4" />
                            </div>
                          </div>
                          <div className="text-3xl font-serif font-bold text-amber-50">{stat.value}</div>
                        </div>)}
                    </div>

                    {
      /* Events Summary Table */
    }
                    <div className="rounded-2xl bg-slate-900/50 border border-amber-500/10 overflow-hidden">
                      <div className="px-6 py-4 border-b border-amber-500/10">
                        <h3 className="text-sm font-mono uppercase tracking-widest text-amber-300/80">Events Breakdown</h3>
                      </div>
                      <div className="divide-y divide-slate-800/80">
                        {events.map((event) => <div key={event.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-800/30 transition-colors">
                            <div className="w-12 h-12 rounded-xl bg-slate-800 overflow-hidden border border-slate-700 flex-shrink-0">
                              {event.coverImage && <img src={event.coverImage} alt="" className="w-full h-full object-cover" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-amber-100">{event.title}</div>
                              <div className="text-[10px] text-slate-500 font-mono">{event.subtitle}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-serif font-bold text-amber-200">{event.photos.length}</div>
                              <div className="text-[9px] text-slate-500 font-mono uppercase">photos</div>
                            </div>
                            <button
      onClick={() => {
        setActiveSection("photos");
        setSelectedEventFilter(event.id);
        setExpandedEvent(event.id);
      }}
      className="p-2 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer border border-amber-500/20"
    >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>)}
                      </div>
                    </div>
                  </motion.div>}


                {
      /* ── MANAGE PHOTOS SECTION ────────────────────────── */
    }
                {activeSection === "photos" && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                    {
      /* Filter & Search Bar */
    }
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
      type="text"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Search photos..."
      className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-amber-500/15 rounded-xl text-sm text-amber-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400/40 font-mono"
    />
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        <button
      onClick={() => setSelectedEventFilter(null)}
      className={`px-4 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border ${!selectedEventFilter ? "bg-amber-500/20 text-amber-300 border-amber-500/30 font-semibold" : "bg-slate-900/40 text-slate-400 border-slate-700/50 hover:text-amber-200"}`}
    >
                          All Events
                        </button>
                        {events.map((ev) => <button
      key={ev.id}
      onClick={() => setSelectedEventFilter(selectedEventFilter === ev.id ? null : ev.id)}
      className={`px-4 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border ${selectedEventFilter === ev.id ? "bg-amber-500/20 text-amber-300 border-amber-500/30 font-semibold" : "bg-slate-900/40 text-slate-400 border-slate-700/50 hover:text-amber-200"}`}
    >
                            {ev.title}
                          </button>)}
                      </div>
                    </div>

                    {
      /* Events Accordion */
    }
                    {filteredEvents.map((event) => <div key={event.id} className="rounded-2xl border border-amber-500/10 bg-slate-900/40 overflow-hidden">
                        {
      /* Event Header */
    }
                        <div className="w-full flex items-center justify-between px-5 py-4 hover:bg-amber-500/5 transition-all">
                          <button
      onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
      className="flex items-center gap-4 flex-1 text-left cursor-pointer"
    >
                            <div className="relative w-11 h-11 rounded-xl border border-amber-500/20 overflow-hidden bg-slate-800 flex-shrink-0 group/thumb">
                              {event.coverImage ? <img src={event.coverImage} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-600"><ImageIcon className="w-4 h-4" /></div>}
                            </div>
                            <div className="text-left">
                              <div className="text-sm font-semibold text-amber-100 tracking-wider">{event.title}</div>
                              <div className="text-[10px] text-slate-500 font-mono">{event.photos.length} photos • {event.year}</div>
                            </div>
                          </button>
                          <div className="flex items-center gap-2">
                            <button
      onClick={() => {
        setCoverUploadEventId(event.id);
        coverImageRef.current?.click();
      }}
      title="Change CD disc image"
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300 transition-all cursor-pointer border border-amber-500/20 text-[10px] font-mono uppercase tracking-wider"
    >
                              <Camera className="w-3 h-3" /> CD Image
                            </button>
                            <motion.div animate={{ rotate: expandedEvent === event.id ? 180 : 0 }} transition={{ duration: 0.2 }} className="cursor-pointer" onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}>
                              <ChevronDown className="w-5 h-5 text-amber-400/50" />
                            </motion.div>
                          </div>
                        </div>

                        {
      /* Expanded Photo Grid */
    }
                        <AnimatePresence>
                          {expandedEvent === event.id && <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden"
    >
                              <div className="px-5 pb-5 border-t border-amber-500/10">
                                {
      /* Photo Cards Grid */
    }
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mt-4">
                                  {event.photos.filter((p) => !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase())).map((photo) => <div
      key={photo.id}
      className="group rounded-xl bg-slate-800/60 border border-slate-700/50 overflow-hidden hover:border-amber-500/30 transition-all"
    >
                                      {
      /* Photo Image */
    }
                                      <div className="relative aspect-[4/3] overflow-hidden">
                                        <img src={photo.src} alt={photo.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                                        {
      /* Hover Actions Overlay */
    }
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center gap-2 pb-3">
                                          <button
      onClick={() => setCropState({ photoId: photo.id, eventId: event.id })}
      className="px-3 py-2 rounded-lg bg-blue-500/25 text-blue-200 text-[10px] font-mono uppercase tracking-wider hover:bg-blue-500/40 transition-all cursor-pointer border border-blue-500/30 backdrop-blur-sm flex items-center gap-1.5"
    >
                                            <Crop className="w-3 h-3" /> Crop
                                          </button>
                                          {confirmDelete === photo.id ? <button
      onClick={() => deletePhoto(event.id, photo.id)}
      className="px-3 py-2 rounded-lg bg-red-500/40 text-red-200 text-[10px] font-mono uppercase tracking-wider hover:bg-red-500/60 transition-all cursor-pointer border border-red-500/40 backdrop-blur-sm flex items-center gap-1.5 animate-pulse"
    >
                                              <Check className="w-3 h-3" /> Confirm
                                            </button> : <button
      onClick={() => setConfirmDelete(photo.id)}
      className="px-3 py-2 rounded-lg bg-red-500/20 text-red-300/80 text-[10px] font-mono uppercase tracking-wider hover:bg-red-500/40 transition-all cursor-pointer border border-red-500/25 backdrop-blur-sm flex items-center gap-1.5"
    >
                                              <Trash2 className="w-3 h-3" /> Delete
                                            </button>}
                                        </div>
                                      </div>
                                      {
      /* Photo Info */
    }
                                      <div className="px-3 py-2.5">
                                        <div className="text-xs text-amber-100 font-medium truncate">{photo.title}</div>
                                        <div className="text-[9px] text-slate-500 font-mono mt-0.5">{photo.date} • {photo.location}</div>
                                      </div>
                                    </div>)}
                                </div>

                                {event.photos.length === 0 && <div className="text-center py-10 text-sm text-slate-600 font-mono flex flex-col items-center gap-2">
                                    <ImageIcon className="w-8 h-8 text-slate-700" />
                                    No photos in this event yet
                                  </div>}

                                {
      /* Add Photo */
    }
                                <AnimatePresence>
                                  {showAddPhoto === event.id ? <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-4 p-4 rounded-xl bg-slate-800/60 border border-amber-500/15 space-y-3 overflow-hidden"
    >
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <input
      type="text"
      value={newPhotoTitle}
      onChange={(e) => setNewPhotoTitle(e.target.value)}
      placeholder="Photo title..."
      className="px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-amber-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/40 font-mono"
    />
                                        <input
      type="text"
      value={newPhotoUrl}
      onChange={(e) => setNewPhotoUrl(e.target.value)}
      placeholder="Image URL..."
      className="px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-amber-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/40 font-mono"
    />
                                      </div>
                                      {newPhotoUrl && <div className="w-full h-32 rounded-xl bg-slate-700 overflow-hidden border border-slate-600">
                                          <img src={newPhotoUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => {
      e.target.style.display = "none";
    }} />
                                        </div>}
                                      <div className="flex gap-3">
                                        <button
      onClick={() => {
        setUploadEventId(event.id);
        fileInputRef.current?.click();
      }}
      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-700 text-slate-300 text-xs font-mono uppercase tracking-wider hover:bg-slate-600 border border-slate-600 transition-all cursor-pointer"
    >
                                          <Upload className="w-3.5 h-3.5" /> Upload File
                                        </button>
                                        <button
      onClick={() => addPhoto(event.id)}
      disabled={!newPhotoUrl.trim()}
      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-mono uppercase tracking-wider font-bold hover:bg-amber-400 border border-amber-300 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
    >
                                          <Check className="w-3.5 h-3.5" /> Add Photo
                                        </button>
                                      </div>
                                      <button
      onClick={() => {
        setShowAddPhoto(null);
        setNewPhotoUrl("");
        setNewPhotoTitle("");
      }}
      className="w-full py-2 text-xs text-slate-500 hover:text-slate-300 font-mono uppercase tracking-wider cursor-pointer"
    >
                                        Cancel
                                      </button>
                                    </motion.div> : <button
      onClick={() => setShowAddPhoto(event.id)}
      className="mt-4 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-dashed border-amber-500/20 text-amber-400/60 text-xs font-mono uppercase tracking-widest hover:border-amber-400/40 hover:text-amber-300 hover:bg-amber-500/5 transition-all cursor-pointer"
    >
                                      <Plus className="w-4 h-4" /> Add New Photo
                                    </button>}
                                </AnimatePresence>
                              </div>
                            </motion.div>}
                        </AnimatePresence>
                      </div>)}
                  </motion.div>}


                {
      /* ── ADD GALLERY DISC SECTION ─────────────────────── */
    }
                {activeSection === "add-disc" && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-3xl">

                    {
      /* Info banner */
    }
                    <div className="rounded-2xl bg-amber-500/8 border border-amber-500/20 px-5 py-4 flex items-start gap-3">
                      <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-amber-300 font-mono tracking-wide">Requires INSERT policy on <code className="bg-amber-500/15 px-1 rounded">gallery2</code></p>
                        <p className="text-[10px] text-slate-500 font-mono mt-1">Until the RLS INSERT policy is added in Supabase, submit will show a database error. The form is fully ready.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                      {
      /* ── LEFT: Disc / Event Info ── */
    }
                      <div className="rounded-2xl bg-slate-900/50 border border-amber-500/10 p-6 space-y-4">
                        <h3 className="text-sm font-mono uppercase tracking-widest text-amber-300/80 pb-2 border-b border-amber-500/10">Disc Settings</h3>

                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 mb-1.5">Event Title *</label>
                          <input
      type="text"
      value={discEventTitle}
      onChange={(e) => setDiscEventTitle(e.target.value)}
      placeholder="e.g. FRESHERS '26"
      className="w-full px-3 py-2.5 bg-slate-800 border border-amber-500/15 rounded-xl text-sm text-amber-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400/40 font-mono"
    />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 mb-1.5">Subtitle</label>
                          <input
      type="text"
      value={discEventSubtitle}
      onChange={(e) => setDiscEventSubtitle(e.target.value)}
      placeholder="e.g. The Night of Lights"
      className="w-full px-3 py-2.5 bg-slate-800 border border-amber-500/15 rounded-xl text-sm text-amber-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400/40 font-mono"
    />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 mb-1.5">Year</label>
                          <input
      type="text"
      value={discEventYear}
      onChange={(e) => setDiscEventYear(e.target.value)}
      placeholder="2026"
      className="w-full px-3 py-2.5 bg-slate-800 border border-amber-500/15 rounded-xl text-sm text-amber-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400/40 font-mono"
    />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 mb-1.5">Disc Pattern</label>
                          <div className="grid grid-cols-4 gap-1.5">
                            {["sunburst", "rings", "halftone", "horizon", "stripes", "eclipse", "mosaic"].map((p) => <button
      key={p}
      type="button"
      onClick={() => setDiscPattern(p)}
      className={`py-1.5 px-2 rounded-lg text-[9px] font-mono uppercase tracking-wider transition-all cursor-pointer border ${discPattern === p ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300"}`}
    >
                                {p}
                              </button>)}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 mb-1.5">Palette (3 colors)</label>
                          <div className="flex gap-3 items-center flex-wrap">
                            {[0, 1, 2].map((i) => <div key={i} className="flex flex-col items-center gap-1.5">
                                <div className="relative w-10 h-10 rounded-xl border-2 border-slate-600 overflow-hidden" style={{ background: discPalette[i] }}>
                                  <input
      type="color"
      value={discPalette[i]}
      onChange={(e) => {
        const next = [...discPalette];
        next[i] = e.target.value;
        setDiscPalette(next);
      }}
      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
    />
                                </div>
                                <span className="text-[8px] font-mono text-slate-600">{["BG", "MID", "ACC"][i]}</span>
                              </div>)}
                            <code className="text-[9px] text-slate-600 font-mono">{discPalette.join(", ")}</code>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 mb-1.5">Cover Image URL <span className="text-slate-600">(optional)</span></label>
                          <input
      type="text"
      value={discCoverImage}
      onChange={(e) => setDiscCoverImage(e.target.value)}
      placeholder="https://... (defaults to photo URL)"
      className="w-full px-3 py-2.5 bg-slate-800 border border-amber-500/15 rounded-xl text-xs text-amber-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400/40 font-mono"
    />
                        </div>
                      </div>

                      {
      /* ── RIGHT: Photo Info ── */
    }
                      <div className="rounded-2xl bg-slate-900/50 border border-amber-500/10 p-6 space-y-4">
                        <h3 className="text-sm font-mono uppercase tracking-widest text-amber-300/80 pb-2 border-b border-amber-500/10">Photo / Disc Image</h3>

                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 mb-1.5">Photo Title *</label>
                          <input
      type="text"
      value={discPhotoTitle}
      onChange={(e) => setDiscPhotoTitle(e.target.value)}
      placeholder="e.g. Opening Night"
      className="w-full px-3 py-2.5 bg-slate-800 border border-amber-500/15 rounded-xl text-sm text-amber-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400/40 font-mono"
    />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 mb-1.5">Photo URL *</label>
                          <input
      type="text"
      value={discPhotoUrl}
      onChange={(e) => setDiscPhotoUrl(e.target.value)}
      placeholder="https://..."
      className="w-full px-3 py-2.5 bg-slate-800 border border-amber-500/15 rounded-xl text-xs text-amber-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400/40 font-mono"
    />
                        </div>

                        {discPhotoUrl && <div className="w-full h-36 rounded-xl bg-slate-800 overflow-hidden border border-slate-700">
                            <img
      src={discPhotoUrl}
      alt="Preview"
      className="w-full h-full object-cover"
      onError={(e) => {
        e.target.style.display = "none";
      }}
    />
                          </div>}

                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 mb-1.5">Date</label>
                          <input
      type="text"
      value={discPhotoDate}
      onChange={(e) => setDiscPhotoDate(e.target.value)}
      placeholder="e.g. Jan 15, 2026"
      className="w-full px-3 py-2.5 bg-slate-800 border border-amber-500/15 rounded-xl text-sm text-amber-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400/40 font-mono"
    />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 mb-1.5">Location</label>
                          <input
      type="text"
      value={discPhotoLocation}
      onChange={(e) => setDiscPhotoLocation(e.target.value)}
      placeholder="Gallery Trinity"
      className="w-full px-3 py-2.5 bg-slate-800 border border-amber-500/15 rounded-xl text-sm text-amber-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400/40 font-mono"
    />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 mb-1.5">Frame Style</label>
                          <div className="grid grid-cols-2 gap-1.5">
                            {["baroque-gold", "burnt-mahogany", "broken-victorian", "chipped-wood"].map((fs) => <button
      key={fs}
      type="button"
      onClick={() => setDiscFrameStyle(fs)}
      className={`py-1.5 px-2 rounded-lg text-[9px] font-mono uppercase tracking-wider transition-all cursor-pointer border ${discFrameStyle === fs ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300"}`}
    >
                                {fs}
                              </button>)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {
      /* Result Banner */
    }
                    <AnimatePresence>
                      {discSubmitResult && <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={`rounded-xl px-5 py-3.5 text-sm font-mono border ${discSubmitResult.ok ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300" : "bg-red-500/10 border-red-500/25 text-red-300"}`}
    >
                          {discSubmitResult.message}
                        </motion.div>}
                    </AnimatePresence>

                    {
      /* Submit Button */
    }
                    <button
      onClick={handleAddDisc}
      disabled={discSubmitting}
      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-bold text-sm uppercase tracking-[0.2em] font-mono hover:shadow-[0_0_35px_rgba(245,158,11,0.4)] hover:scale-[1.01] transition-all cursor-pointer border border-amber-300/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
    >
                      {discSubmitting ? <>
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                          Saving to Supabase...
                        </> : <>
                          <PlusCircle className="w-4 h-4" />
                          Add Gallery Disc
                        </>}
                    </button>

                  </motion.div>}


                {
      /* ── MANAGE ADMINS SECTION ────────────────────────── */
    }
                {activeSection === "admins" && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-2xl">
                    {
      /* Current Admins */
    }
                    <div className="rounded-2xl bg-slate-900/50 border border-amber-500/10 overflow-hidden">
                      <div className="px-6 py-4 border-b border-amber-500/10">
                        <h3 className="text-sm font-mono uppercase tracking-widest text-amber-300/80">Registered Admins</h3>
                      </div>
                      <div className="divide-y divide-slate-800/80">
                        {adminEmails.map((email) => <div key={email} className="px-6 py-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                <Mail className="w-4.5 h-4.5 text-amber-400/60" />
                              </div>
                              <div>
                                <div className="text-sm text-amber-100 font-mono">{email}</div>
                                {email === authUser.email && <span className="text-[8px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-mono tracking-wider border border-emerald-500/25 mt-0.5 inline-block">
                                    CURRENT SESSION
                                  </span>}
                              </div>
                            </div>
                            {adminEmails.length > 1 && email !== authUser.email && <button
      onClick={() => removeAdmin(email)}
      className="p-2 rounded-lg bg-red-500/10 text-red-400/60 hover:bg-red-500/20 hover:text-red-300 transition-all cursor-pointer border border-red-500/15"
    >
                                <Trash2 className="w-4 h-4" />
                              </button>}
                          </div>)}
                      </div>
                    </div>

                    {
      /* Add New Admin */
    }
                    <div className="rounded-2xl bg-slate-900/50 border border-amber-500/10 p-6">
                      <h3 className="text-sm font-mono uppercase tracking-widest text-amber-300/80 mb-4">Add New Admin</h3>
                      <div className="flex gap-3">
                        <div className="relative flex-1">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input
      type="email"
      value={newAdminEmail}
      onChange={(e) => setNewAdminEmail(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && addAdmin()}
      placeholder="newemail@example.com"
      className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-amber-500/15 rounded-xl text-sm text-amber-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400/40 font-mono"
    />
                        </div>
                        <button
      onClick={addAdmin}
      className="px-5 py-3 rounded-xl bg-amber-500 text-slate-950 text-sm font-mono uppercase tracking-wider font-bold hover:bg-amber-400 border border-amber-300 transition-all cursor-pointer flex items-center gap-2"
    >
                          <Plus className="w-4 h-4" /> Add
                        </button>
                      </div>
                      <p className="mt-3 text-[10px] text-slate-600 font-mono tracking-wider">
                        Added admins can log in with the shared password. At least one admin must remain registered.
                      </p>
                    </div>
                  </motion.div>}

              </div>
            </main>
          </div>
  )}
      </motion.div>
    </>;
}
