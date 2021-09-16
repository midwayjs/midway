/**
 * Object Definition Registry 实现
 */
import {
  getProviderId,
  getProviderName,
  getProviderUUId,
  ObjectIdentifier,
} from '@midwayjs/decorator';
import {
  IIdentifierRelationShip,
  IObjectDefinition,
  IObjectDefinitionRegistry,
} from '../interface';

const PREFIX = '_id_default_';

class LegacyIdentifierRelation
  extends Map<ObjectIdentifier, string>
  implements IIdentifierRelationShip
{
  saveClassRelation(module: any, namespace?: string) {
    const providerId = getProviderUUId(module);
    // save uuid
    this.set(providerId, providerId);
    if (providerId) {
      // save alias id
      const aliasId = getProviderId(module);
      if (aliasId) {
        // save alias Id
        this.set(aliasId, providerId);
      }
      // save className alias
      this.set(getProviderName(module), providerId);
      // save namespace alias
      if (namespace) {
        this.set(namespace + ':' + getProviderName(module), providerId);
      }
    }
  }

  saveFunctionRelation(id: ObjectIdentifier, uuid: string) {
    this.set(uuid, uuid);
    this.set(id, uuid);
  }

  hasRelation(id: ObjectIdentifier): boolean {
    return this.has(id);
  }

  getRelation(id: ObjectIdentifier): string {
    return this.get(id);
  }
}

export class ObjectDefinitionRegistry
  extends Map
  implements IObjectDefinitionRegistry
{
  private singletonIds = [];
  private _identifierRelation: IIdentifierRelationShip =
    new LegacyIdentifierRelation();

  get identifierRelation() {
    if (!this._identifierRelation) {
      this._identifierRelation = new LegacyIdentifierRelation();
    }
    return this._identifierRelation;
  }

  set identifierRelation(identifierRelation) {
    this._identifierRelation = identifierRelation;
  }

  get identifiers() {
    const ids = [];
    for (const key of this.keys()) {
      if (key.indexOf(PREFIX) === -1) {
        ids.push(key);
      }
    }
    return ids;
  }

  get count() {
    return this.size;
  }

  getSingletonDefinitionIds(): ObjectIdentifier[] {
    return this.singletonIds;
  }

  getDefinitionByName(name: string): IObjectDefinition[] {
    const definitions = [];
    for (const v of this.values()) {
      const definition = v as IObjectDefinition;
      if (definition.name === name) {
        definitions.push(definition);
      }
    }
    return definitions;
  }

  registerDefinition(
    identifier: ObjectIdentifier,
    definition: IObjectDefinition
  ) {
    if (definition.isSingletonScope()) {
      this.singletonIds.push(identifier);
    }
    this.set(identifier, definition);
  }

  getDefinition(identifier: ObjectIdentifier): IObjectDefinition {
    identifier = this.identifierRelation.getRelation(identifier) ?? identifier;
    return this.get(identifier);
  }

  removeDefinition(identifier: ObjectIdentifier): void {
    this.delete(identifier);
  }

  hasDefinition(identifier: ObjectIdentifier): boolean {
    identifier = this.identifierRelation.getRelation(identifier) ?? identifier;
    return this.has(identifier);
  }

  clearAll(): void {
    this.singletonIds = [];
    this.clear();
  }

  hasObject(identifier: ObjectIdentifier): boolean {
    identifier = this.identifierRelation.getRelation(identifier) ?? identifier;
    return this.has(PREFIX + identifier);
  }

  registerObject(identifier: ObjectIdentifier, target: any) {
    this.set(PREFIX + identifier, target);
  }

  getObject(identifier: ObjectIdentifier): any {
    identifier = this.identifierRelation.getRelation(identifier) ?? identifier;
    return this.get(PREFIX + identifier);
  }

  getIdentifierRelation(): IIdentifierRelationShip {
    return this.identifierRelation;
  }

  setIdentifierRelation(identifierRelation: IIdentifierRelationShip) {
    this.identifierRelation = identifierRelation;
  }
}
