/**
 * Role-based access control decorator
 * Sets metadata for required roles on a route
 * 
 * Example usage:
 * @Roles(Role.ADMIN, Role.STORE_MANAGER)
 * @Get('stores/:storeId')
 * getStore(@Param('storeId') storeId: string) {}
 */
import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/common/constants/role.enum';

export const ROLES_KEY = 'roles';
// Type [Role, ...Role[]] ensures at least one role is provided and all values are unique
export const Roles = (...roles:  [Role, ...Role[]]) => SetMetadata(ROLES_KEY, roles); 