// hooks/useScrollRestoration.ts

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

function saveScrollPos(url: string) {
  const scrollPos = { x: window.scrollX, y: window.scrollY };
  sessionStorage.setItem(`scrollPos:${url}`, JSON.stringify(scrollPos));
}

function restoreScrollPos(url: string) {
  try {
    const json = sessionStorage.getItem(`scrollPos:${url}`);
    if (json) {
      const scrollPos = JSON.parse(json);
      if (scrollPos && typeof scrollPos.x === 'number' && typeof scrollPos.y === 'number') {
        window.scrollTo(scrollPos.x, scrollPos.y);
      }
    }
  } catch (e) {
    console.error("Failed to restore scroll position:", e);
  }
}

export function useScrollRestoration() {
  const router = useRouter();
  const shouldScrollRestore = useRef(false);

  useEffect(() => {
    if (!('scrollRestoration' in window.history)) {
      return;
    }

    window.history.scrollRestoration = 'manual';

    const onBeforeUnload = () => {
      saveScrollPos(router.asPath);
    };

    const onRouteChangeStart = () => {
      saveScrollPos(router.asPath);
    };

    const onRouteChangeComplete = (url: string) => {
      if (shouldScrollRestore.current) {
        shouldScrollRestore.current = false;
        restoreScrollPos(url);
      }
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    router.events.on('routeChangeStart', onRouteChangeStart);
    router.events.on('routeChangeComplete', onRouteChangeComplete);
    router.beforePopState(state => {
      shouldScrollRestore.current = true;
      return true;
    });

    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      router.events.off('routeChangeStart', onRouteChangeStart);
      router.events.off('routeChangeComplete', onRouteChangeComplete);
      router.beforePopState(() => true);
    };
  }, [router]);
}