import sdk, { type Project, type VM } from '@stackblitz/sdk';
import { useEffect, useRef, useState } from 'react';
import type { messages } from '../i18n';
import { ExternalLink, FileCode, RotateCcw, ShieldAlert } from '../icons';
import type { Theme } from '../prefs';
import type { ProjectFiles } from '../types';

interface Props {
  files: ProjectFiles;
  focus: string;
  preview: string;
  title: string;
  theme: Theme;
  messages: (typeof messages)['en'];
}

/** 这些文件变化时需要重新创建 VM（依赖要重新安装）。 */
const BOOT_FILES = ['package.json', '.npmrc'];

function project(title: string, files: ProjectFiles): Project {
  return { title, template: 'node', files };
}

/** StackBlitz 返回的已打开文件可能是 CRLF 换行。 */
function normalizeEol(text?: string) {
  return text?.replace(/\r\n/g, '\n');
}

/**
 * 把编辑器里的文件同步成目标状态：只写入有变化的文件，并删除上一课遗留的文件。
 * 用户在 src/ 下新建的文件也会被清理，保证每节课的起点一致。
 */
async function syncFiles(vm: VM, previous: ProjectFiles, next: ProjectFiles) {
  const snapshot = await vm.getFsSnapshot().catch(() => null);
  const current = snapshot ?? previous;
  const destroy = Object.keys(current).filter(
    path => !(path in next) && (path in previous || path.startsWith('src/'))
  );
  const create: ProjectFiles = {};
  for (const [path, content] of Object.entries(next)) {
    if (normalizeEol(current[path]) !== normalizeEol(content)) create[path] = content;
  }
  if (destroy.length || Object.keys(create).length) {
    await vm.applyFsDiff({ create, destroy });
  }
}

/** 右侧的 StackBlitz 在线运行环境。 */
export function Workspace({ files, focus, preview, title, theme, messages: t }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const vmRef = useRef<VM>(undefined);
  const appliedRef = useRef<ProjectFiles>({});
  const queueRef = useRef<Promise<void>>(Promise.resolve());
  const latestRef = useRef({ files, focus, preview, title, theme });
  const [booting, setBooting] = useState(false);
  const isolated = typeof window !== 'undefined' && window.crossOriginIsolated;

  latestRef.current = { files, focus, preview, title, theme };

  const enqueue = (task: () => Promise<void>) => {
    queueRef.current = queueRef.current.then(task).catch(err => {
      console.error('[tutorial] workspace error', err);
    });
  };

  useEffect(() => {
    if (!isolated) return;
    enqueue(async () => {
      // 排队期间可能又切换了课程，只处理最新的状态
      const target = latestRef.current;
      if (target.files !== files) return;
      const host = hostRef.current;
      if (!host) return;

      const needsBoot =
        !vmRef.current ||
        BOOT_FILES.some(name => appliedRef.current[name] !== target.files[name]);

      if (needsBoot) {
        setBooting(true);
        host.replaceChildren();
        const mount = document.createElement('div');
        host.appendChild(mount);
        vmRef.current = await sdk.embedProject(mount, project(target.title, target.files), {
          openFile: target.focus,
          view: 'default',
          height: '100%',
          terminalHeight: 38,
          theme: target.theme,
          crossOriginIsolated: true,
        });
        appliedRef.current = target.files;
        setBooting(false);
        return;
      }

      const vm = vmRef.current!;
      await syncFiles(vm, appliedRef.current, target.files);
      appliedRef.current = target.files;
      await vm.editor.openFile(target.focus);
      // 预览接口仍是实验特性，服务还没就绪时可能失败，不影响课程切换
      await vm.preview.setUrl(target.preview).catch(() => {});
    });
  }, [files, isolated]);

  const reset = () => {
    const vm = vmRef.current;
    if (!vm) return;
    enqueue(async () => {
      await syncFiles(vm, appliedRef.current, latestRef.current.files);
      await vm.editor.openFile(latestRef.current.focus);
    });
  };

  const openExternal = () => {
    sdk.openProject(project(title, files), { openFile: focus, newWindow: true });
  };

  return (
    <div className="workspace">
      <div className="workspace-bar">
        <span className="workspace-file">
          <FileCode size={14} />
          {focus}
        </span>
        <div className="workspace-actions">
          {isolated && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={reset} title={t.resetTip}>
              <RotateCcw size={14} /> {t.reset}
            </button>
          )}
          <button type="button" className="btn btn-ghost btn-sm" onClick={openExternal}>
            <ExternalLink size={14} /> <span className="hide-sm">{t.openInStackBlitz}</span>
          </button>
        </div>
      </div>

      {isolated ? (
        <div className="workspace-body">
          <div className="workspace-host" ref={hostRef} />
          {booting && (
            <div className="workspace-booting">
              <span className="spinner" />
              {t.booting}
            </div>
          )}
        </div>
      ) : (
        <div className="workspace-body workspace-fallback">
          <div className="fallback-card">
            <span className="fallback-icon">
              <ShieldAlert size={22} />
            </span>
            <h3>{t.isolationTitle}</h3>
            <p>{t.isolationDesc}</p>
            <button type="button" className="btn btn-primary" onClick={openExternal}>
              <ExternalLink size={15} /> {t.openInStackBlitz}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
