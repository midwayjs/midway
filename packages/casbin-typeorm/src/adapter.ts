import { Helper, Model, FilteredAdapter } from 'casbin';
import { CasbinRule } from './casbinRule';
import {
  DataSource,
  DataSourceOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { CasbinMongoRule } from './casbinMongoRule';

type GenericCasbinRule = CasbinRule | CasbinMongoRule;
type CasbinRuleConstructor = new (...args: any[]) => GenericCasbinRule;

interface ExistentConnection {
  connection: DataSource;
}
export type TypeORMAdapterOptions = ExistentConnection | DataSourceOptions;

export interface TypeORMAdapterConfig {
  customCasbinRuleEntity?: CasbinRuleConstructor;
}
/**
 * TypeORMAdapter represents the TypeORM filtered adapter for policy storage.
 */
export default class TypeORMAdapter implements FilteredAdapter {
  private adapterConfig?: TypeORMAdapterConfig;
  private option: DataSourceOptions;
  private typeorm: DataSource;
  private filtered = false;

  private constructor(
    option: TypeORMAdapterOptions,
    adapterConfig?: TypeORMAdapterConfig,
  ) {
    this.adapterConfig = adapterConfig;

    if ((option as ExistentConnection).connection) {
      this.typeorm = (option as ExistentConnection).connection;
      this.option = this.typeorm.options;
    } else {
      this.option = option as DataSourceOptions;
    }
  }

  public isFiltered(): boolean {
    return this.filtered;
  }

  /**
   * newAdapter is the constructor.
   * @param option typeorm connection option
   * @param adapterConfig additional configuration options for the adapter
   */
  public static async newAdapter(
    option: TypeORMAdapterOptions,
    adapterConfig?: TypeORMAdapterConfig,
  ) {
    let a: TypeORMAdapter;

    const defaults = {
      synchronize: true,
      name: 'node-casbin-official',
    };
    if ((option as ExistentConnection).connection) {
      a = new TypeORMAdapter(option, adapterConfig);
    } else {
      const options = option as DataSourceOptions;
      const entities = {
        entities: [
          TypeORMAdapter.getCasbinRuleType(options.type, adapterConfig),
        ],
      };
      const configuration = Object.assign(defaults, options);
      a = new TypeORMAdapter(
        Object.assign(configuration, entities),
        adapterConfig,
      );
    }
    await a.open();
    return a;
  }

  private async open() {
    if (!this.typeorm) {
      this.typeorm = new DataSource(this.option);
    }

    if (!this.typeorm.isInitialized) {
      await this.typeorm.initialize();
    }
  }

  public async close() {
    if (this.typeorm.isInitialized) {
      await this.typeorm.destroy();
    }
  }

  private async clearTable() {
    await this.getRepository().clear();
  }

  private loadPolicyLine(line: GenericCasbinRule, model: Model) {
    const result =
      line.ptype +
      ', ' +
      [line.v0, line.v1, line.v2, line.v3, line.v4, line.v5, line.v6]
        .filter((n) => n)
        .map((n) => `"${n}"`)
        .join(', ');
    Helper.loadPolicyLine(result, model);
  }

  /**
   * loadPolicy loads all policy rules from the storage.
   */
  public async loadPolicy(model: Model) {
    const lines = await this.getRepository().find();

    for (const line of lines) {
      this.loadPolicyLine(line, model);
    }
  }

  // Loading policies based on filter condition
  public async loadFilteredPolicy(
    model: Model,
    filter: FindOptionsWhere<GenericCasbinRule>,
  ) {
    const filteredLines = await this.getRepository().find({ where: filter });
    for (const line of filteredLines) {
      this.loadPolicyLine(line, model);
    }
    this.filtered = true;
  }

  private savePolicyLine(ptype: string, rule: string[]): GenericCasbinRule {
    const line = new (this.getCasbinRuleConstructor())();

    line.ptype = ptype;
    if (rule.length > 0) {
      line.v0 = rule[0];
    }
    if (rule.length > 1) {
      line.v1 = rule[1];
    }
    if (rule.length > 2) {
      line.v2 = rule[2];
    }
    if (rule.length > 3) {
      line.v3 = rule[3];
    }
    if (rule.length > 4) {
      line.v4 = rule[4];
    }
    if (rule.length > 5) {
      line.v5 = rule[5];
    }
    if (rule.length > 6) {
      line.v6 = rule[6];
    }

    return line;
  }

  /**
   * savePolicy saves all policy rules to the storage.
   */
  public async savePolicy(model: Model) {
    await this.clearTable();

    let astMap = model.model.get('p');
    const lines: GenericCasbinRule[] = [];
    // @ts-ignore
    for (const [ptype, ast] of astMap) {
      for (const rule of ast.policy) {
        const line = this.savePolicyLine(ptype, rule);
        lines.push(line);
      }
    }

    astMap = model.model.get('g');
    // @ts-ignore
    for (const [ptype, ast] of astMap) {
      for (const rule of ast.policy) {
        const line = this.savePolicyLine(ptype, rule);
        lines.push(line);
      }
    }

    const queryRunner = this.typeorm.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(lines);
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    return true;
  }

  /**
   * addPolicy adds a policy rule to the storage.
   */
  public async addPolicy(sec: string, ptype: string, rule: string[]) {
    const line = this.savePolicyLine(ptype, rule);
    await this.getRepository().save(line);
  }

  /**
   * addPolicies adds policy rules to the storage.
   */
  public async addPolicies(sec: string, ptype: string, rules: string[][]) {
    const lines: GenericCasbinRule[] = [];
    for (const rule of rules) {
      const line = this.savePolicyLine(ptype, rule);
      lines.push(line);
    }

    const queryRunner = this.typeorm.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(lines);
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * removePolicy removes a policy rule from the storage.
   */
  public async removePolicy(sec: string, ptype: string, rule: string[]) {
    const line = this.savePolicyLine(ptype, rule);
    await this.getRepository().delete({
      ...line,
    });
  }

  /**
   * removePolicies removes policy rules from the storage.
   */
  public async removePolicies(sec: string, ptype: string, rules: string[][]) {
    const queryRunner = this.typeorm.createQueryRunner();
    const type = TypeORMAdapter.getCasbinRuleType(
      this.option.type,
      this.adapterConfig,
    );

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const rule of rules) {
        const line = this.savePolicyLine(ptype, rule);
        await queryRunner.manager.delete(type, line);
      }
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * removeFilteredPolicy removes policy rules that match the filter from the storage.
   */
  public async removeFilteredPolicy(
    sec: string,
    ptype: string,
    fieldIndex: number,
    ...fieldValues: string[]
  ) {
    const line = new (this.getCasbinRuleConstructor())();

    line.ptype = ptype;

    if (fieldIndex <= 0 && 0 < fieldIndex + fieldValues.length) {
      line.v0 = fieldValues[0 - fieldIndex];
    }
    if (fieldIndex <= 1 && 1 < fieldIndex + fieldValues.length) {
      line.v1 = fieldValues[1 - fieldIndex];
    }
    if (fieldIndex <= 2 && 2 < fieldIndex + fieldValues.length) {
      line.v2 = fieldValues[2 - fieldIndex];
    }
    if (fieldIndex <= 3 && 3 < fieldIndex + fieldValues.length) {
      line.v3 = fieldValues[3 - fieldIndex];
    }
    if (fieldIndex <= 4 && 4 < fieldIndex + fieldValues.length) {
      line.v4 = fieldValues[4 - fieldIndex];
    }
    if (fieldIndex <= 5 && 5 < fieldIndex + fieldValues.length) {
      line.v5 = fieldValues[5 - fieldIndex];
    }
    if (fieldIndex <= 6 && 6 < fieldIndex + fieldValues.length) {
      line.v6 = fieldValues[6 - fieldIndex];
    }

    await this.getRepository().delete({
      ...line,
    });
  }

  private getCasbinRuleConstructor(): CasbinRuleConstructor {
    return TypeORMAdapter.getCasbinRuleType(
      this.option.type,
      this.adapterConfig,
    );
  }

  /**
   * Returns either a {@link CasbinRule} or a {@link CasbinMongoRule}, depending on the type. If passed a custom entity through the adapter config it will use that entity type.
   * This switch is required as the normal {@link CasbinRule} does not work when using MongoDB as a backend (due to a missing ObjectID field).
   * @param type
   */
  private static getCasbinRuleType(
    type: string,
    adapterConfig?: TypeORMAdapterConfig,
  ): CasbinRuleConstructor {
    if (adapterConfig?.customCasbinRuleEntity) {
      return adapterConfig.customCasbinRuleEntity;
    }

    if (type === 'mongodb') {
      return CasbinMongoRule;
    }
    return CasbinRule;
  }

  private getRepository(): Repository<GenericCasbinRule> {
    return this.typeorm.getRepository(this.getCasbinRuleConstructor());
  }
}
