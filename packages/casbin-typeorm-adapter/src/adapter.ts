import { DataSource, Repository } from 'typeorm';
import { CasbinRule } from './casbinRule';
import { CasbinMongoRule } from './casbinMongoRule';
import {
  CasbinRuleConstructor,
  GenericCasbinRule,
  TypeORMAdapterConfig,
} from './interface';
import { BaseAdapter } from '@midwayjs/casbin';

/**
 * TypeORMAdapter represents the TypeORM filtered adapter for policy storage.
 */
export class TypeORMAdapter extends BaseAdapter<GenericCasbinRule> {
  private adapterConfig: TypeORMAdapterConfig;
  private typeorm: DataSource;

  constructor(dataSource: DataSource, options: TypeORMAdapterConfig) {
    super();
    this.typeorm = dataSource;
    this.adapterConfig = options;
  }

  private async clearTable() {
    await this.getRepository().clear();
  }

  /**
   * Returns either a {@link CasbinRule} or a {@link CasbinMongoRule}, depending on the type. If passed a custom entity through the adapter config it will use that entity type.
   * This switch is required as the normal {@link CasbinRule} does not work when using MongoDB as a backend (due to a missing ObjectID field).
   * @param type
   * @param adapterConfig
   */
  private static getCasbinRuleType(
    type: string,
    adapterConfig?: TypeORMAdapterConfig
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
    return this.typeorm.getRepository(this.getAdapterLine());
  }

  protected getAdapterLine(): new () => GenericCasbinRule {
    return TypeORMAdapter.getCasbinRuleType(
      this.adapterConfig.type,
      this.adapterConfig
    );
  }
  protected async loadPolicyByAdapter(): Promise<GenericCasbinRule[]> {
    return this.getRepository().find();
  }
  protected async loadPolicyWithFilterByAdapter(
    filter: any
  ): Promise<GenericCasbinRule[]> {
    return this.getRepository().find({ where: filter });
  }
  protected async savePolicyByAdapter(
    policies: GenericCasbinRule[]
  ): Promise<void> {
    await this.clearTable();
    const queryRunner = this.typeorm.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(policies);
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
    await this.getRepository().save(policies);
  }
  protected async removePolicyByAdapter(
    removePolicy: GenericCasbinRule,
    newestPolicies?: GenericCasbinRule[]
  ): Promise<void> {
    await this.getRepository().delete({
      ...removePolicy,
    });
  }
}
