import { useEffect, useState, type MouseEvent } from 'react';
import type { Locale, Track } from './types';

const BASE = import.meta.env.BASE_URL;

/** 当前页面对应的路由。 */
export type Route =
  | { name: 'home' }
  | { name: 'variant'; track: Track; locale: Locale }
  | { name: 'lesson'; track: Track; locale: Locale; part: string; lesson: string };

const NAV_EVENT = 'mw-tutorial:navigate';

function parse(pathname: string): Route {
  const rest = pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname;
  const [track, locale, part, lesson] = rest.split('/').filter(Boolean);
  const validTrack = track === 'class' || track === 'function';
  const validLocale = locale === 'zh-cn' || locale === 'en';
  if (!validTrack || !validLocale) return { name: 'home' };
  if (part && lesson) return { name: 'lesson', track, locale, part, lesson };
  return { name: 'variant', track, locale };
}

/** 生成站内链接。 */
export function href(...segments: string[]) {
  return BASE + segments.filter(Boolean).join('/');
}

/** 站内跳转，不刷新页面。 */
export function navigate(to: string, replace = false) {
  if (replace) history.replaceState(null, '', to);
  else history.pushState(null, '', to);
  window.dispatchEvent(new Event(NAV_EVENT));
}

/** 拦截普通点击，交给前端路由处理；保留新标签页打开等行为。 */
export function onLinkClick(event: MouseEvent<HTMLAnchorElement>) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
  event.preventDefault();
  navigate(event.currentTarget.getAttribute('href')!);
}

/** 订阅地址变化，返回解析后的路由。 */
export function useRoute(): Route {
  const [route, setRoute] = useState(() => parse(location.pathname));
  useEffect(() => {
    const update = () => setRoute(parse(location.pathname));
    window.addEventListener('popstate', update);
    window.addEventListener(NAV_EVENT, update);
    return () => {
      window.removeEventListener('popstate', update);
      window.removeEventListener(NAV_EVENT, update);
    };
  }, []);
  return route;
}
