import {
  performance,
  PerformanceObserver,
  PerformanceObserverEntryList,
} from 'perf_hooks';

export class MidwayPerformanceManager {
  private static instances: Map<string, MidwayPerformanceManager> = new Map();
  public static DEFAULT_GROUP = {
    INITIALIZE: 'MidwayInitialize',
  };
  private observer: PerformanceObserver | null = null;
  private group: string;

  private constructor(group: string) {
    this.group = group;
  }

  static getInstance(group: string): MidwayPerformanceManager {
    if (!this.instances.has(group)) {
      this.instances.set(group, new MidwayPerformanceManager(group));
    }
    return this.instances.get(group)!;
  }

  private formatKey(key: string, step: 'start' | 'end') {
    return `${this.group}:${key}-${step}`;
  }

  public markStart(key: string) {
    performance.mark(this.formatKey(key, 'start'));
  }

  public markEnd(key: string) {
    performance.mark(this.formatKey(key, 'end'));
    performance.measure(
      `${this.group}:${key}`,
      this.formatKey(key, 'start'),
      this.formatKey(key, 'end')
    );
  }

  public observeMeasure(
    callback: (list: PerformanceObserverEntryList) => void
  ) {
    if (this.observer) {
      return;
    }

    this.observer = new PerformanceObserver(list => {
      const filteredEntries = list
        .getEntries()
        .filter(entry => entry.name.startsWith(`${this.group}:`));
      if (filteredEntries.length > 0) {
        callback({
          getEntries: () => filteredEntries,
        } as PerformanceObserverEntryList);
      }
    });

    this.observer.observe({ entryTypes: ['measure'] });
    return this.observer;
  }

  public disconnect() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  public getGroup() {
    return this.group;
  }
}

export class MidwayInitializerPerformanceManager {
  static MEASURE_KEYS = {
    INITIALIZE: 'Initialize',
    METADATA_PREPARE: 'MetadataPrepare',
    DETECTOR_PREPARE: 'DetectorPrepare',
    DEFINITION_PREPARE: 'DefinitionPrepare',
    CONFIG_LOAD: 'ConfigLoad',
    LOGGER_PREPARE: 'LoggerPrepare',
    FRAMEWORK_PREPARE: 'FrameworkPrepare',
    CUSTOM_FRAMEWORK_PREPARE: 'CustomFrameworkPrepare',
    LIFECYCLE_PREPARE: 'LifecyclePrepare',
    CUSTOM_LIFECYCLE_PREPARE: 'CustomLifecyclePrepare',
    PRELOAD_MODULE_PREPARE: 'PreloadModulePrepare',
  };

  static markStart(key: string) {
    const manager = MidwayPerformanceManager.getInstance(
      MidwayPerformanceManager.DEFAULT_GROUP.INITIALIZE
    );
    manager.markStart(key);
  }

  static markEnd(key: string) {
    const manager = MidwayPerformanceManager.getInstance(
      MidwayPerformanceManager.DEFAULT_GROUP.INITIALIZE
    );
    manager.markEnd(key);
  }

  static frameworkInitializeStart(frameworkName: string) {
    this.markStart(
      `${this.MEASURE_KEYS.CUSTOM_FRAMEWORK_PREPARE}:${frameworkName}`
    );
  }

  static frameworkInitializeEnd(frameworkName: string) {
    this.markEnd(
      `${this.MEASURE_KEYS.CUSTOM_FRAMEWORK_PREPARE}:${frameworkName}`
    );
  }

  static lifecycleStart(namespace: string, lifecycleName: string) {
    this.markStart(
      `${this.MEASURE_KEYS.CUSTOM_LIFECYCLE_PREPARE}:${namespace}:${lifecycleName}`
    );
  }

  static lifecycleEnd(namespace: string, lifecycleName: string) {
    this.markEnd(
      `${this.MEASURE_KEYS.CUSTOM_LIFECYCLE_PREPARE}:${namespace}:${lifecycleName}`
    );
  }
}
