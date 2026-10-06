import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from '../icons';
import { href, onLinkClick } from '../router';
import type { Lesson, Part, Variant } from '../types';

interface Props {
  variant: Variant;
  current: Lesson;
  currentPart: Part;
  visited: Set<string>;
  label: string;
}

/** 顶部的课程目录下拉框。 */
export function LessonPicker({ variant, current, currentPart, visited, label }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => setOpen(false), [current]);

  let counter = 0;

  return (
    <div className="picker" ref={rootRef}>
      <button
        type="button"
        className="picker-trigger"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen(v => !v)}
      >
        <span className="picker-part">{currentPart.title}</span>
        <span className="picker-title">{current.title}</span>
        <ChevronDown size={14} className="picker-chevron" />
      </button>

      {open && (
        <div className="picker-panel" role="menu" aria-label={label}>
          {variant.parts.map(part => (
            <div key={part.slug} className="picker-group">
              <div className="picker-group-title">{part.title}</div>
              {part.lessons.map(lesson => {
                counter += 1;
                const key = `${variant.track}/${part.slug}/${lesson.slug}`;
                const active = lesson === current;
                return (
                  <a
                    key={lesson.slug}
                    role="menuitem"
                    className={`picker-item${active ? ' active' : ''}`}
                    href={href(variant.track, variant.locale, part.slug, lesson.slug)}
                    onClick={onLinkClick}
                  >
                    <span className={`picker-dot${visited.has(key) ? ' done' : ''}`}>
                      {visited.has(key) && !active ? <Check size={11} strokeWidth={3} /> : counter}
                    </span>
                    {lesson.title}
                  </a>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
