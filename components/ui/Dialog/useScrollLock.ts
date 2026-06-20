import { useEffect } from 'react';

export function useScrollLock(open: boolean): void {
  useEffect(() => {
    if (open) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.documentElement.style.setProperty('--scrollbar-width', '0px');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    return () => {
      document.documentElement.style.setProperty('--scrollbar-width', '0px');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [open]);
}
