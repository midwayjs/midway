import { useEffect, useState } from 'react';
import { catalog, loaders } from 'virtual:tutorial-catalog';
import { Landing } from './components/Landing';
import { LessonPage } from './components/LessonPage';
import { messages } from './i18n';
import { href, navigate, onLinkClick, useRoute } from './router';
import type { Locale, Track, Variant } from './types';

const variantCache = new Map<string, Promise<Variant>>();

function loadVariant(track: Track, locale: Locale) {
  const key = `${track}/${locale}`;
  if (!variantCache.has(key)) {
    variantCache.set(key, loaders[key]().then(m => m.default));
  }
  return variantCache.get(key)!;
}

/** 按需加载某个风格 + 语言的课程数据。 */
function useVariant(track?: Track, locale?: Locale) {
  const [variant, setVariant] = useState<Variant>();
  useEffect(() => {
    if (!track || !locale) return;
    let active = true;
    loadVariant(track, locale).then(v => active && setVariant(v));
    return () => {
      active = false;
    };
  }, [track, locale]);
  return variant?.track === track && variant?.locale === locale ? variant : undefined;
}

export function App() {
  const route = useRoute();
  const track = route.name === 'home' ? undefined : route.track;
  const locale = route.name === 'home' ? undefined : route.locale;
  const variant = useVariant(track, locale);

  useEffect(() => {
    if (route.name !== 'variant') return;
    const first = catalog.find(c => c.track === route.track && c.locale === route.locale)
      ?.parts[0];
    if (first) navigate(href(route.track, route.locale, first.slug, first.lessons[0].slug), true);
  }, [route]);

  useEffect(() => {
    document.documentElement.lang = locale === 'en' ? 'en' : 'zh-CN';
  }, [locale]);

  if (route.name === 'home') return <Landing />;
  if (route.name === 'variant' || !variant) {
    return <div className="page-loading">{messages[route.locale].loading}</div>;
  }

  const part = variant.parts.find(p => p.slug === route.part);
  const lesson = part?.lessons.find(l => l.slug === route.lesson);
  if (!part || !lesson) {
    const t = messages[route.locale];
    return (
      <div className="page-loading">
        <p>{t.notFound}</p>
        <a className="btn btn-primary" href={href()} onClick={onLinkClick}>
          {t.backHome}
        </a>
      </div>
    );
  }

  return <LessonPage variant={variant} part={part} lesson={lesson} />;
}
