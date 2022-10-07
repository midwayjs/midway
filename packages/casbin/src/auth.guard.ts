import {
  Config,
  getPropertyMetadata,
  Guard,
  IGuard,
  IMidwayContext,
  Inject,
} from '@midwayjs/core';
import { CasbinEnforcerService } from './enforcer.service';
import { CasbinConfigOptions, Permission } from './interface';
import { AuthPossession, PERMISSIONS_METADATA_KEY } from './constants';

@Guard()
export class AuthGuard implements IGuard {
  @Inject()
  enforcer: CasbinEnforcerService;

  @Config('casbin')
  casbinConfig: CasbinConfigOptions;

  async canActivate(
    context: IMidwayContext,
    supplierClz,
    methodName: string
  ): Promise<boolean> {
    const permissions: Permission[] = getPropertyMetadata<Permission[]>(
      PERMISSIONS_METADATA_KEY,
      supplierClz,
      methodName
    );

    if (!permissions) {
      return true;
    }

    const username = this.casbinConfig.usernameFromContext(context);

    if (!username) {
      return false;
    }

    const hasPermission = async (
      user: string,
      permission: Permission
    ): Promise<boolean> => {
      const { possession, resource, action } = permission;
      const poss = [];

      if (possession === AuthPossession.OWN_ANY) {
        poss.push(AuthPossession.ANY, AuthPossession.OWN);
      } else {
        poss.push(possession);
      }

      return AuthGuard.asyncSome<AuthPossession>(poss, async p => {
        if (p === AuthPossession.OWN) {
          return (permission as any).isOwn(context);
        } else {
          return this.enforcer.enforce(user, resource, `${action}:${p}`);
        }
      });
    };

    return await AuthGuard.asyncEvery<Permission>(
      permissions,
      async permission => hasPermission(username, permission)
    );
  }

  static async asyncSome<T>(
    array: T[],
    callback: (value: T, index: number, a: T[]) => Promise<boolean>
  ): Promise<boolean> {
    for (let i = 0; i < array.length; i++) {
      const result = await callback(array[i], i, array);
      if (result) {
        return result;
      }
    }

    return false;
  }

  static async asyncEvery<T>(
    array: T[],
    callback: (value: T, index: number, a: T[]) => Promise<boolean>
  ): Promise<boolean> {
    for (let i = 0; i < array.length; i++) {
      const result = await callback(array[i], i, array);
      if (!result) {
        return result;
      }
    }

    return true;
  }
}
