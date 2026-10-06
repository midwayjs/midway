import sdk, { type Project, type VM } from '@stackblitz/sdk';
import { useEffect, useRef, useState } from 'react';
import type { messages } from '../i18n';
import { ExternalLink, FileCode, Globe, Lightbulb, RotateCcw, ShieldAlert } from '../icons';
import type { Theme } from '../prefs';
import type { ProjectFiles } from '../types';

interface Props {
  files: ProjectFiles;
  /** 应用参考答案后的完整项目文件，没有练习时为 null。 */
  solution: ProjectFiles | null;
  focus: string;
  preview: string;
  routes: string[];
  /** 应用答案后追加显示、并自动打开的预览路径。 */
  solutionRoutes: string[];
  title: string;
  theme: Theme;
  messages: (typeof messages)['en'];
}

/** 这些文件变化时需要重新创建 VM（依赖要重新安装）。 */
const BOOT_FILES = ['package.json', '.npmrc'];

function sleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([promise, sleep(ms).then(() => null)]);
}

/** 等到 WebContainer 里的服务起来再切预览路径，避免启动瞬间被忽略。 */
async function setPreviewRoute(vm: VM, route: string, waitForRestart = false) {
  const path = route.startsWith('/') ? route : `/${route}`;
  if (waitForRestart) await sleep(1600);
  const attempts = waitForRestart ? 20 : 90;
  for (let i = 0; i < attempts; i++) {
    const url = await withTimeout(vm.preview.getUrl().catch(() => null), 1000);
    if (url) {
      await vm.preview.setUrl(path).catch(() => {});
      return true;
    }
    await sleep(400);
  }
  return false;
}

async function embedProject(mount: HTMLElement, projectData: Project, theme: Theme, focus: string) {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await sdk.embedProject(mount, projectData, {
        openFile: focus,
        view: 'default',
        height: '100%',
        terminalHeight: 38,
        theme,
        crossOriginIsolated: true,
      });
    } catch (err) {
      lastError = err;
      mount.replaceChildren();
      await sleep(1200 * (attempt + 1));
    }
  }
  throw lastError;
}

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
export function Workspace({
  files,
  solution,
  focus,
  preview,
  routes,
  solutionRoutes,
  title,
  theme,
  messages: t,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const vmRef = useRef<VM>(undefined);
  const appliedRef = useRef<ProjectFiles>({});
  const queueRef = useRef<Promise<void>>(Promise.resolve());
  const latestRef = useRef({ files, focus, preview, title, theme });
  const [booting, setBooting] = useState(false);
  const [bootError, setBootError] = useState(false);
  const [bootId, setBootId] = useState(0);
  const [solved, setSolved] = useState(false);
  const [activeRoute, setActiveRoute] = useState(preview);
  const [previewReady, setPreviewReady] = useState(false);
  const isolated = typeof window !== 'undefined' && window.crossOriginIsolated;
  const visibleRoutes = solved ? [...routes, ...solutionRoutes] : routes;

  latestRef.current = { files, focus, preview, title, theme };

  useEffect(() => {
    setSolved(false);
    setActiveRoute(preview);
  }, [files, preview]);

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
        setBootError(false);
        setPreviewReady(false);
        try {
          host.replaceChildren();
          const mount = document.createElement('div');
          host.appendChild(mount);
          vmRef.current = await embedProject(
            mount,
            project(target.title, target.files),
            target.theme,
            target.focus
          );
          appliedRef.current = target.files;
          setBooting(false);
          setPreviewReady(await setPreviewRoute(vmRef.current, target.preview));
        } catch (err) {
          vmRef.current = undefined;
          setBootError(true);
          setPreviewReady(false);
          throw err;
        } finally {
          setBooting(false);
        }
        return;
      }

      const vm = vmRef.current!;
      await syncFiles(vm, appliedRef.current, target.files);
      appliedRef.current = target.files;
      await vm.editor.openFile(target.focus);
      setPreviewReady(await setPreviewRoute(vm, target.preview));
    });
  }, [files, isolated, bootId]);

  const retryBoot = () => {
    vmRef.current = undefined;
    appliedRef.current = {};
    setBootError(false);
    setPreviewReady(false);
    setBootId(id => id + 1);
  };

  const apply = (target: ProjectFiles, route: string) => {
    const vm = vmRef.current;
    if (!vm) return;
    enqueue(async () => {
      await syncFiles(vm, appliedRef.current, target);
      appliedRef.current = target;
      await vm.editor.openFile(latestRef.current.focus);
      await setPreviewRoute(vm, route, true);
    });
  };

  const reset = () => {
    setSolved(false);
    setActiveRoute(preview);
    apply(latestRef.current.files, preview);
  };

  const solve = () => {
    if (!solution) return;
    const route = solutionRoutes[0] ?? activeRoute;
    setSolved(true);
    setActiveRoute(route);
    apply(solution, route);
  };

  const openPreview = (route: string) => {
    setActiveRoute(route);
    const vm = vmRef.current;
    if (!vm) return;
    enqueue(async () => {
      await setPreviewRoute(vm, route);
    });
  };

  const openExternal = () => {
    const current = solved && solution ? solution : files;
    sdk.openProject(project(title, current), { openFile: focus, newWindow: true });
  };

  return (
    <div className="workspace">
      <div className="workspace-bar">
        <div className="workspace-meta">
          <span className="workspace-file">
            <FileCode size={14} />
            {focus}
          </span>
        </div>
        <div className="workspace-actions">
          {isolated && solution && (
            <button
              type="button"
              className={`btn btn-sm ${solved ? 'btn-ghost' : 'btn-soft'}`}
              onClick={solve}
              disabled={solved || booting}
              title={t.solveTip}
            >
              <Lightbulb size={14} /> {solved ? t.solved : t.solve}
            </button>
          )}
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
          {previewReady && visibleRoutes.length > 1 && (
            <div className="workspace-preview-float">
              <span className="workspace-preview-label">
                <Globe size={13} />
                {t.previewRoutes}
              </span>
              <div className="workspace-routes" role="tablist" aria-label={t.previewRoutes}>
                {visibleRoutes.map(route => (
                  <button
                    key={route}
                    type="button"
                    role="tab"
                    aria-selected={route === activeRoute}
                    className={`workspace-route${route === activeRoute ? ' active' : ''}`}
                    onClick={() => openPreview(route)}
                    disabled={booting}
                    title={t.previewRouteTip(route)}
                  >
                    {route}
                  </button>
                ))}
              </div>
            </div>
          )}
          {booting && (
            <div className="workspace-booting">
              <span className="spinner" />
              {t.booting}
            </div>
          )}
          {bootError && !booting && (
            <div className="workspace-booting">
              <p>{t.bootError}</p>
              <button type="button" className="btn btn-primary btn-sm" onClick={retryBoot}>
                {t.retry}
              </button>
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
