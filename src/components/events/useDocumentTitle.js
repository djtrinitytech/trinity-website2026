import { useEffect } from "react";

// Sets the tab title while an events page is mounted, restoring the previous one on leave
export default function useDocumentTitle(title) {
  useEffect(() => {
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
