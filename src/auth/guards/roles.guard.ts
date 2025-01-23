/**
 * Guard that handles role-based access control and store-related access permissions
 * Validates if the authenticated user has the required role and store access rights
 */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLES_KEY } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/common/constants/role.enum';
import { CacheService } from 'src/common/cache/cache.service';
import { STORE_RELATED_ACCESS_KEY } from '../decorators/store-releted-access.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private cacheService: CacheService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    
    // Get the user from the request object
    const user = context.switchToHttp().getRequest().user;

    // Retrieve user data from Redis cache
    const cachedUser = await this.cacheService.getCachedUser(user.id);
    if (!cachedUser) {
      return false; // User not found in Redis
    }
    
    // Get required roles from decorator metadata
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;
  
    // Check if user has any of the required roles
    const hasRequiredRole = requiredRoles.some((role) => cachedUser.role === role);

    // Check if the endpoint requires store-related access validation
    const isStoreRelatedAccess = this.reflector.getAllAndOverride<boolean>(STORE_RELATED_ACCESS_KEY, [
        context.getHandler(),
        context.getClass(),
    ]);

    // Validate store access for store managers
    let hasStoreAccess = true;
    if(isStoreRelatedAccess && cachedUser.role === Role.STORE_MANAGER){
        hasStoreAccess = false;
        // Check if the user has access to the requested store
        cachedUser.storeIds.forEach(storeId => {
            if(storeId === context.switchToHttp().getRequest().params.storeId){
                hasStoreAccess = true;
            }
        });
    }

    // Return true only if user has both required role and store access
    return hasRequiredRole && hasStoreAccess;
  }
}
