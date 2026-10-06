import { useCallback, useEffect, useState } from 'react';
import type { Locale } from './types';

export type Theme = 'light' | 'dark';

const THEME_KEY = 'mw-tutorial-theme';
const LOCALE_KEY = 'mw-tutorial-locale';
const VISITED_KEY = 'mw-tutorial-visited';

/** 主题，初始值由 index.html 里的内联脚本写到 <html data-theme>。 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(
    () => (document.documentElement.dataset.theme as Theme) || 'light'
  );
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  const toggle = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem(THEME_KEY, next);
      return next;
    });
  }, []);
  return [theme, toggle] as const;
}

/** 首页使用的语言：优先读上次的选择，其次按浏览器语言。 */
export function preferredLocale(): Locale {
  const saved = localStorage.getItem(LOCALE_KEY);
  if (saved === 'zh-cn' || saved === 'en') return saved;
  return navigator.language.toLowerCase().startsWith('zh') ? 'zh-cn' : 'en';
}

export function rememberLocale(locale: Locale) {
  localStorage.setItem(LOCALE_KEY, locale);
}

function readVisited(): string[] {
  try {
    return JSON.parse(localStorage.getItem(VISITED_KEY) || '[]');
  } catch {
    return [];
  }
}

/** 已学过的课程，key 形如 `class/1-getting-started/2-first-controller`，与语言无关。 */
export function useVisited(current?: string) {
  const [visited, setVisited] = useState(() => new Set(readVisited()));
  useEffect(() => {
    if (!current) return;
    setVisited(prev => {
      if (prev.has(current)) return prev;
      const next = new Set(prev).add(current);
      localStorage.setItem(VISITED_KEY, JSON.stringify([...next]));
      return next;
    });
  }, [current]);
  return visited;
}
