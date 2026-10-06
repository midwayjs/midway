import { useCallback, useRef, useState, type PointerEvent } from 'react';

const KEY = 'mw-tutorial-split';
const DEFAULT = 42;
const MIN = 26;
const MAX = 70;

/** 左右分栏的拖拽逻辑，宽度以百分比保存在 localStorage。 */
export function useSplit() {
  const containerRef = useRef<HTMLElement>(null);
  const [percent, setPercent] = useState(() => {
    const saved = Number(localStorage.getItem(KEY));
    return saved >= MIN && saved <= MAX ? saved : DEFAULT;
  });

  const onPointerDown = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    event.preventDefault();
    const handle = event.currentTarget;
    handle.setPointerCapture(event.pointerId);
    // iframe 会吞掉指针事件，拖拽期间临时禁用
    document.body.classList.add('is-resizing');
    const rect = container.getBoundingClientRect();
    let latest = percent;

    const move = (e: globalThis.PointerEvent) => {
      latest = Math.min(MAX, Math.max(MIN, ((e.clientX - rect.left) / rect.width) * 100));
      setPercent(latest);
    };
    const up = () => {
      document.body.classList.remove('is-resizing');
      localStorage.setItem(KEY, String(Math.round(latest)));
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', up);
      handle.removeEventListener('pointercancel', up);
    };
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', up);
    handle.addEventListener('pointercancel', up);
  }, [percent]);

  const reset = useCallback(() => {
    setPercent(DEFAULT);
    localStorage.removeItem(KEY);
  }, []);

  return { containerRef, percent, onPointerDown, reset };
}
