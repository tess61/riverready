import { useEffect } from 'react';

// Unique tab title per page (helps screen-reader users, history and bookmarks).
export function useTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | RiverReady` : 'RiverReady';
  }, [title]);
}
