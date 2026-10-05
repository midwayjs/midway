import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { Languages, Moon, Sun } from '../icons';
import type { Theme } from '../prefs';
import { href, onLinkClick } from '../router';

const BASE = import.meta.env.BASE_URL;

/** 左上角的 Midway 标识，点击回到教程首页。 */
export function Logo({ label }: { label: string }) {
  return (
    <a className="logo" href={href()} onClick={onLinkClick}>
      <img src={`${BASE}logo.svg`} alt="" width={26} height={26} />
      <span className="logo-name">Midway</span>
      <span className="logo-sep" aria-hidden="true" />
      <span className="logo-label">{label}</span>
    </a>
  );
}

type IconButtonProps =
  | ({ as?: 'button'; title: string; children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>)
  | ({ as: 'a'; title: string; children: ReactNode } & AnchorHTMLAttributes<HTMLAnchorElement>);

/** 只有图标的按钮，`title` 同时作为无障碍标签。 */
export function IconButton(props: IconButtonProps) {
  if (props.as === 'a') {
    const { as: _as, title, children, ...rest } = props;
    return (
      <a className="icon-btn" title={title} aria-label={title} target="_blank" rel="noreferrer" {...rest}>
        {children}
      </a>
    );
  }
  const { as: _as, title, children, ...rest } = props;
  return (
    <button type="button" className="icon-btn" title={title} aria-label={title} {...rest}>
      {children}
    </button>
  );
}

export function ThemeButton(props: { theme: Theme; title: string; onClick: () => void }) {
  return (
    <IconButton title={props.title} onClick={props.onClick}>
      {props.theme === 'dark' ? <Sun /> : <Moon />}
    </IconButton>
  );
}

export function LocaleButton(props: { label: string; onClick: () => void }) {
  return (
    <button type="button" className="btn btn-ghost" onClick={props.onClick}>
      <Languages /> <span className="hide-sm">{props.label}</span>
    </button>
  );
}
