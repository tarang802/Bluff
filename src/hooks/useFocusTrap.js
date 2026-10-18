import { useEffect, useRef } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Overlays can stack (a confirm over the champion screen), so only the
// topmost one handles Tab and Escape.
const stack = [];
let scrollLocks = 0;

function lockScroll() {
  if (scrollLocks++ > 0) return;
  const gap = window.innerWidth - document.documentElement.clientWidth;
  document.body.style.overflow = 'hidden';
  if (gap > 0) document.body.style.paddingRight = `${gap}px`;
}

function unlockScroll() {
  scrollLocks = Math.max(0, scrollLocks - 1);
  if (scrollLocks > 0) return;
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
}

function focusables(node) {
  return [...node.querySelectorAll(FOCUSABLE)].filter(
    (el) => el.getClientRects().length > 0 && !el.closest('[inert]'),
  );
}

export function useFocusTrap(active, containerRef, { onEscape, initialFocusRef } = {}) {
  const escapeRef = useRef(onEscape);
  escapeRef.current = onEscape;

  useEffect(() => {
    if (!active) return undefined;
    const token = {};
    stack.push(token);
    const previous = document.activeElement;
    lockScroll();

    const raf = requestAnimationFrame(() => {
      const node = containerRef.current;
      if (!node) return;
      const target = initialFocusRef?.current || focusables(node)[0] || node;
      target.focus({ preventScroll: true });
    });

    const onKeyDown = (e) => {
      if (stack[stack.length - 1] !== token) return;
      if (e.key === 'Escape') {
        if (escapeRef.current) {
          e.preventDefault();
          escapeRef.current();
        }
        return;
      }
      if (e.key !== 'Tab') return;
      const node = containerRef.current;
      if (!node) return;
      const items = focusables(node);
      if (!items.length) {
        e.preventDefault();
        node.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (!node.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKeyDown);
      stack.splice(stack.indexOf(token), 1);
      unlockScroll();
      if (previous instanceof HTMLElement && document.contains(previous)) {
        previous.focus({ preventScroll: true });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
}
