import { useState } from 'react';
import { catalog, samples } from 'virtual:tutorial-catalog';
import { DOCS_URL, GITHUB_URL, messages, trackInfo } from '../i18n';
import { ArrowRight, BookOpen, FileCode, Github, Globe, Terminal } from '../icons';
import { preferredLocale, rememberLocale, useTheme } from '../prefs';
import { href, onLinkClick } from '../router';
import type { Locale, Track } from '../types';
import { IconButton, LocaleButton, Logo, ThemeButton } from './common';

const TRACKS: Track[] = ['class', 'function'];
const HOW_ICONS = [BookOpen, FileCode, Globe];

/** 教程首页：介绍 + 选择写法。 */
export function Landing() {
  const [locale, setLocale] = useState<Locale>(preferredLocale);
  const [theme, toggleTheme] = useTheme();
  const t = messages[locale];

  const switchLocale = () => {
    const next = locale === 'zh-cn' ? 'en' : 'zh-cn';
    rememberLocale(next);
    setLocale(next);
  };

  return (
    <div className="landing">
      <header className="landing-header">
        <Logo label={t.brand} />
        <div className="toolbar">
          <a className="btn btn-ghost" href={DOCS_URL[locale]}>
            <BookOpen /> <span className="hide-sm">{t.docs}</span>
          </a>
          <LocaleButton label={t.switchLocale} onClick={switchLocale} />
          <ThemeButton theme={theme} title={t.theme} onClick={toggleTheme} />
          <IconButton as="a" href={GITHUB_URL} title="GitHub">
            <Github />
          </IconButton>
        </div>
      </header>

      <section className="hero">
        <span className="eyebrow">
          <Terminal size={14} /> {t.heroEyebrow}
        </span>
        <h1>
          {t.heroTitleA}
          <span className="gradient-text">{t.heroTitleB}</span>
        </h1>
        <p className="hero-desc">{t.heroDesc}</p>
      </section>

      <section className="tracks" aria-label={t.chooseTrack}>
        <h2 className="section-label">{t.chooseTrack}</h2>
        <div className="track-grid">
          {TRACKS.map(track => {
            const entry = catalog.find(c => c.track === track && c.locale === locale)!;
            const info = trackInfo[track][locale];
            const count = entry.parts.reduce((n, p) => n + p.lessons.length, 0);
            const first = entry.parts[0];
            const to = href(track, locale, first.slug, first.lessons[0].slug);
            return (
              <a key={track} className="track-card" href={to} onClick={onLinkClick}>
                <div className="track-card-head">
                  <div>
                    <h3>{info.name}</h3>
                    <p>{info.desc}</p>
                  </div>
                  <span className="pill">{t.lessons(count)}</span>
                </div>
                <div
                  className="track-sample"
                  dangerouslySetInnerHTML={{ __html: samples[track] }}
                />
                <ol className="track-parts">
                  {entry.parts.map(part => (
                    <li key={part.slug}>{part.title}</li>
                  ))}
                </ol>
                <span className="track-cta">
                  {t.start} <ArrowRight />
                </span>
              </a>
            );
          })}
        </div>
      </section>

      <section className="how">
        <h2 className="section-label">{t.howTitle}</h2>
        <div className="how-grid">
          {t.how.map((step, i) => {
            const StepIcon = HOW_ICONS[i];
            return (
              <div key={step.title} className="how-item">
                <span className="how-icon">
                  <StepIcon size={18} />
                </span>
                <div>
                  <h3>
                    <span className="how-index">0{i + 1}</span> {step.title}
                  </h3>
                  <p>{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <footer className="landing-footer">{t.browserNote}</footer>
    </div>
  );
}
