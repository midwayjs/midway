type ClassType = new (...args: any[]) => any;

export class MetadataManager {
  private _metadata: WeakMap<ClassType, any> = new WeakMap();

  /**
   * Defines metadata for a target class or property
   */
  public defineMetadata(
    metadataKey,
    metadataValue,
    target: ClassType,
    propertyKey?: string
  ): void {
    this.setMetadata(metadataKey, metadataValue, target, propertyKey);
  }

  /**
   * Retrieves metadata for a target class or property
   */
  public getMetadata(
    metadataKey,
    target: ClassType,
    propertyKey?: string
  ): any {
    while (target) {
      if (this.hasOwnMetadata(metadataKey, target, propertyKey)) {
        return this.getOwnMetadata(metadataKey, target, propertyKey);
      }
      target = Object.getPrototypeOf(target);
    }
  }

  /**
   * Retrieves own metadata for a target class or property
   */
  public getOwnMetadata(
    metadataKey,
    target: ClassType,
    propertyKey?: string
  ): any {
    if (this.checkMetadataStructureValid(target, propertyKey)) {
      if (propertyKey) {
        return this._metadata.get(target).properties[propertyKey][metadataKey];
      } else {
        return this._metadata.get(target).class[metadataKey];
      }
    }
  }

  /**
   * Checks if metadata exists for a target class or property
   */
  public hasMetadata(
    metadataKey,
    target: ClassType,
    propertyKey?: string
  ): boolean {
    while (target) {
      if (this.hasOwnMetadata(metadataKey, target, propertyKey)) {
        return true;
      }
      target = Object.getPrototypeOf(target);
    }
  }

  /**
   * Checks if own metadata exists for a target class or property
   */
  public hasOwnMetadata(
    metadataKey,
    target: ClassType,
    propertyKey?: string
  ): boolean {
    if (this.checkMetadataStructureValid(target, propertyKey)) {
      if (propertyKey) {
        return !!this._metadata.get(target).properties[propertyKey][
          metadataKey
        ];
      } else {
        return !!this._metadata.get(target).class[metadataKey];
      }
    }
  }

  /**
   * Deletes metadata for a target class or property
   */
  public deleteMetadata(
    metadataKey,
    target: ClassType,
    propertyKey?: string
  ): boolean {
    if (this.checkMetadataStructureValid(target, propertyKey)) {
      if (propertyKey) {
        return delete this._metadata.get(target).properties[propertyKey][
          metadataKey
        ];
      } else {
        return delete this._metadata.get(target).class[metadataKey];
      }
    }
  }

  /**
   * Retrieves all metadata keys for a target class or property
   */
  public getMetadataKeys(target: ClassType, propertyKey?: string): string[] {
    if (this.checkMetadataStructureValid(target, propertyKey)) {
      if (propertyKey) {
        return Object.keys(this._metadata.get(target).properties[propertyKey]);
      } else {
        return Object.keys(this._metadata.get(target).class);
      }
    }
  }

  /**
   * Initializes metadata for a target class or property
   */
  private initMetadata(target: ClassType, property?: string): void {
    if (!this._metadata.has(target)) {
      this._metadata.set(target, {
        class: {},
        properties: {},
      });
    }

    if (property && !this._metadata.get(target).properties[property]) {
      this._metadata.get(target).properties[property] = {};
    }
  }

  /**
   * Checks if the metadata structure is valid for a target class or property
   */
  private checkMetadataStructureValid(
    target: ClassType,
    propertyKey?: string
  ): boolean {
    if (!this._metadata.has(target)) {
      return false;
    }
    if (propertyKey) {
      return !!this._metadata.get(target).properties;
    }
    return !!this._metadata.get(target).class;
  }

  /**
   * Sets metadata for a target class or property
   */
  private setMetadata(
    metadataKey,
    metadataValue,
    key: ClassType,
    propertyKey?: string
  ): void {
    this.initMetadata(key, propertyKey);
    if (propertyKey) {
      this._metadata.get(key).properties[propertyKey][metadataKey] =
        metadataValue;
    } else {
      this._metadata.get(key).class[metadataKey] = metadataValue;
    }
  }
}
