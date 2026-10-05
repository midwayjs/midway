import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { catalog } from 'virtual:tutorial-catalog';
import { DOCS_URL, GITHUB_URL, messages, trackInfo } from '../i18n';
import { ArrowRight, ChevronLeft, ChevronRight, Github } from '../icons';
import { rememberLocale, useTheme, useVisited } from '../prefs';
import { href, navigate, onLinkClick } from '../router';
import type { Lesson, Part, Track, Variant } from '../types';
import { IconButton, LocaleButton, Logo, ThemeButton } from './common';
import { LessonPicker } from './LessonPicker';
import { useSplit } from './useSplit';
import { Workspace } from './Workspace';

interface Props {
  variant: Variant;
  part: Part;
  lesson: Lesson;
}

/** 课程页：左侧讲解，右侧在线运行环境。 */
export function LessonPage({ variant, part, lesson }: Props) {
  const { track, locale } = variant;
  const t = messages[locale];
  const [theme, toggleTheme] = useTheme();
  const articleRef = useRef<HTMLDivElement>(null);
  const split = useSplit();

  const flat = useMemo(
    () => variant.parts.flatMap(p => p.lessons.map(l => ({ part: p, lesson: l }))),
    [variant]
  );
  const index = flat.findIndex(item => item.lesson === lesson);
  const prev = flat[index - 1];
  const next = flat[index + 1];
  const lessonHref = (item: { part: Part; lesson: Lesson }) =>
    href(track, locale, item.part.slug, item.lesson.slug);

  const visited = useVisited(`${track}/${part.slug}/${lesson.slug}`);
  const files = useMemo(() => ({ ...variant.template, ...lesson.files }), [variant, lesson]);
  const solution = useMemo(
    () => (lesson.solution ? { ...files, ...lesson.solution } : null),
    [files, lesson]
  );
  const isPartStart = part.lessons[0] === lesson;

  useEffect(() => {
    articleRef.current?.scrollTo({ top: 0 });
    document.title = `${lesson.title} · Midway.js ${t.brand}`;
  }, [lesson, t.brand]);

  const switchTrack = (target: Track) => {
    if (target === track) return;
    const entry = catalog.find(c => c.track === target && c.locale === locale)!;
    const targets = entry.parts.flatMap(p => p.lessons.map(l => [p.slug, l.slug]));
    const [p, l] = targets[Math.min(index, targets.length - 1)];
    navigate(href(target, locale, p, l));
  };

  const switchLocale = () => {
    const target = locale === 'zh-cn' ? 'en' : 'zh-cn';
    rememberLocale(target);
    const entry = catalog.find(c => c.track === track && c.locale === target)!;
    const samePart = entry.parts.find(p => p.slug === part.slug);
    const sameLesson = samePart?.lessons.find(l => l.slug === lesson.slug);
    const fallback = entry.parts[0];
    navigate(
      sameLesson
        ? href(track, target, part.slug, lesson.slug)
        : href(track, target, fallback.slug, fallback.lessons[0].slug)
    );
  };

  const onArticleClick = (event: MouseEvent<HTMLDivElement>) => {
    const button = (event.target as HTMLElement).closest('.code-copy');
    if (!button) return;
    const code = button.closest('.code-block')?.querySelector('pre')?.textContent ?? '';
    navigator.clipboard.writeText(code).then(() => {
      button.classList.add('copied');
      setTimeout(() => button.classList.remove('copied'), 1500);
    });
  };

  return (
    <div className="lesson-layout">
      <header className="topbar">
        <Logo label={t.brand} />

        <nav className="topbar-nav">
          <a
            className={`icon-btn${prev ? '' : ' disabled'}`}
            href={prev ? lessonHref(prev) : undefined}
            onClick={prev ? onLinkClick : undefined}
            title={t.prev}
            aria-label={t.prev}
          >
            <ChevronLeft />
          </a>
          <LessonPicker
            variant={variant}
            current={lesson}
            currentPart={part}
            visited={visited}
            label={t.outline}
          />
          <a
            className={`icon-btn${next ? '' : ' disabled'}`}
            href={next ? lessonHref(next) : undefined}
            onClick={next ? onLinkClick : undefined}
            title={t.next}
            aria-label={t.next}
          >
            <ChevronRight />
          </a>
        </nav>

        <div className="toolbar">
          <div className="segmented" role="tablist">
            {(['class', 'function'] as Track[]).map(item => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={item === track}
                className={item === track ? 'active' : ''}
                onClick={() => switchTrack(item)}
              >
                {trackInfo[item][locale].short}
              </button>
            ))}
          </div>
          <LocaleButton label={t.switchLocale} onClick={switchLocale} />
          <ThemeButton theme={theme} title={t.theme} onClick={toggleTheme} />
          <IconButton as="a" href={GITHUB_URL} title="GitHub">
            <Github />
          </IconButton>
        </div>

        <div className="progress" style={{ width: `${((index + 1) / flat.length) * 100}%` }} />
      </header>

      <main className="split" ref={split.containerRef}>
        <section
          className="lesson-pane"
          style={{ flexBasis: `${split.percent}%` }}
          ref={articleRef}
          onClick={onArticleClick}
        >
          <div className="lesson-inner">
            <div className="lesson-meta">
              <span className="lesson-part">{part.title}</span>
              <span className="lesson-count">{t.lessonOf(index + 1, flat.length)}</span>
            </div>

            {isPartStart && part.introHtml && (
              <details className="part-intro">
                <summary>{t.partIntro}</summary>
                <div className="prose" dangerouslySetInnerHTML={{ __html: part.introHtml }} />
              </details>
            )}

            <article className="prose" dangerouslySetInnerHTML={{ __html: lesson.html }} />

            <nav className="pager">
              {prev ? (
                <a className="pager-card" href={lessonHref(prev)} onClick={onLinkClick}>
                  <span className="pager-label">
                    <ChevronLeft size={14} /> {t.prev}
                  </span>
                  <span className="pager-title">{prev.lesson.title}</span>
                </a>
              ) : (
                <span />
              )}
              {next ? (
                <a className="pager-card next" href={lessonHref(next)} onClick={onLinkClick}>
                  <span className="pager-label">
                    {t.next} <ChevronRight size={14} />
                  </span>
                  <span className="pager-title">{next.lesson.title}</span>
                </a>
              ) : (
                <a className="pager-card next" href={DOCS_URL[locale]}>
                  <span className="pager-label">
                    {t.finish} <ArrowRight size={14} />
                  </span>
                  <span className="pager-title">Midway.js Docs</span>
                </a>
              )}
            </nav>
          </div>
        </section>

        <div
          className="divider"
          role="separator"
          aria-orientation="vertical"
          onPointerDown={split.onPointerDown}
          onDoubleClick={split.reset}
        />

        <section className="workspace-pane">
          <Workspace
            files={files}
            solution={solution}
            focus={lesson.focus}
            preview={lesson.preview}
            title={lesson.title}
            theme={theme}
            messages={t}
          />
        </section>
      </main>
    </div>
  );
}
