import {
  IMiddleware,
  IMidwayApplication,
  Inject,
  Middleware,
  NextFunction,
  Config,
} from '@midwayjs/core';
import { JwtService } from '@midwayjs/jwt';
import { AuthInfo } from '@modelcontextprotocol/sdk/server/auth/types.js';

@Middleware()
export class MCPAuthInfoMiddleware implements IMiddleware<any, NextFunction> {
  @Inject()
  private jwtService: JwtService;

  @Config('mcp.jwtAuthCustomPayloadTransformer')
  private jwtAuthCustomPayloadTransformer: (
    payload: any,
    token: string
  ) => AuthInfo;

  resolve(app: IMidwayApplication) {
    if (app.getNamespace() === 'express') {
      return async (req: any, res: any, next: NextFunction) => {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.substring(7);

          try {
            // Verify and parse JWT token
            const payload = (await this.jwtService.verify(token)) as any;

            // Transform JWT payload to MCP AuthInfo format
            // Set auth info on request object for MCP framework to read
            req.auth = this.jwtAuthCustomPayloadTransformer
              ? this.jwtAuthCustomPayloadTransformer.call(this, payload, token)
              : this.defaultTransform(payload, token);
          } catch (jwtError) {
            res.status(401).json({
              error: 'invalid_token',
              error_description: 'JWT verification failed',
            });
            return;
          }
        }

        return await next();
      };
    } else {
      // Koa/Egg middleware
      return async (ctx: any, next: NextFunction) => {
        const authHeader = ctx.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.substring(7);

          try {
            // Verify and parse JWT token
            const payload = (await this.jwtService.verify(token)) as any;

            // Transform JWT payload to MCP AuthInfo format
            // Set auth info on request object for MCP framework to read
            ctx.req.auth = this.jwtAuthCustomPayloadTransformer
              ? this.jwtAuthCustomPayloadTransformer.call(this, payload, token)
              : this.defaultTransform(payload, token);
          } catch (jwtError) {
            ctx.status = 401;
            ctx.body = {
              error: 'invalid_token',
              error_description: 'JWT verification failed',
            };
            return;
          }
        }

        return await next();
      };
    }
  }

  /**
   * Default JWT payload transformation logic using standard JWT fields
   */
  private defaultTransform(payload: any, token: string): AuthInfo {
    // Extract standard JWT fields that need special handling
    const { aud, client_id, scope, resource, ...extra } = payload;

    const authInfo: AuthInfo = {
      token,
      // Ensure required fields have values
      clientId: aud || client_id || 'unknown',
      scopes: scope ? scope.split(' ') : [],
    };

    // Handle optional fields
    if (payload.exp) {
      authInfo.expiresAt = payload.exp;
    }

    if (resource) {
      try {
        authInfo.resource = new URL(resource);
      } catch (error) {
        console.warn('Invalid resource URL in JWT:', resource);
      }
    }

    // Put all other fields into extra
    if (Object.keys(extra).length > 0) {
      authInfo.extra = extra;
    }

    return authInfo;
  }
}
