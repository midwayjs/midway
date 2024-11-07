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
  private marks: Set<string> = new Set();
  private measures: Set<string> = new Set();

  private constructor(private readonly group: string) {}

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
    const markKey = this.formatKey(key, 'start');
    performance.mark(markKey);
    this.marks.add(markKey);
  }

  public markEnd(key: string) {
    const startKey = this.formatKey(key, 'start');
    const endKey = this.formatKey(key, 'end');
    const measureKey = `${this.group}:${key}`;

    performance.mark(endKey);
    this.marks.add(endKey);

    performance.measure(measureKey, startKey, endKey);
    this.measures.add(measureKey);
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

  public clean() {
    this.marks.forEach(mark => {
      try {
        performance.clearMarks(mark);
      } catch (error) {
        console.warn(`Failed to clear mark ${mark}: ${error}`);
      }
    });
    this.marks.clear();

    this.measures.forEach(measure => {
      try {
        performance.clearMeasures(measure);
      } catch (error) {
        console.warn(`Failed to clear measure ${measure}: ${error}`);
      }
    });
    this.measures.clear();

    this.disconnect();
  }

  public static cleanAll() {
    this.instances.forEach(instance => instance.clean());
    this.instances.clear();
  }

  public static getInitialPerformanceEntries(): any[] {
    const entries: any[] = [];
    performance.getEntries().forEach(entry => {
      if (entry.name.startsWith(this.DEFAULT_GROUP.INITIALIZE)) {
        entries.push(entry.toJSON());
      }
    });
    return entries;
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
    FRAMEWORK_INITIALIZE: 'FrameworkInitialize',
    FRAMEWORK_RUN: 'FrameworkRun',
    LIFECYCLE_PREPARE: 'LifecyclePrepare',
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
      `${this.MEASURE_KEYS.FRAMEWORK_INITIALIZE}:${frameworkName}`
    );
  }

  static frameworkInitializeEnd(frameworkName: string) {
    this.markEnd(`${this.MEASURE_KEYS.FRAMEWORK_INITIALIZE}:${frameworkName}`);
  }

  static frameworkRunStart(frameworkName: string) {
    this.markStart(`${this.MEASURE_KEYS.FRAMEWORK_RUN}:${frameworkName}`);
  }

  static frameworkRunEnd(frameworkName: string) {
    this.markEnd(`${this.MEASURE_KEYS.FRAMEWORK_RUN}:${frameworkName}`);
  }

  static lifecycleStart(namespace: string, lifecycleName: string) {
    this.markStart(
      `${this.MEASURE_KEYS.LIFECYCLE_PREPARE}:${namespace}:${lifecycleName}`
    );
  }

  static lifecycleEnd(namespace: string, lifecycleName: string) {
    this.markEnd(
      `${this.MEASURE_KEYS.LIFECYCLE_PREPARE}:${namespace}:${lifecycleName}`
    );
  }
}
