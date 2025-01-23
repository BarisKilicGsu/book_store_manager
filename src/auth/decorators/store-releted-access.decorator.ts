/**
 * Decorator for store-specific access control
 * Requires 'storeId' parameter in the request URL/query
 * For STORE_MANAGER role: Validates if user has access to the specified store
 * 
 * When applied to a route:
 * - For STORE_MANAGER role: Checks if the user has access to the specific store being accessed
 * - Other roles: No additional store-specific checks are performed
 * 
 * Example usage:
 * @StoreRelatedAccess()
 * @Get('stores/:storeId')
 * getStore(@Param('storeId') storeId: string) {}
 */
import { SetMetadata } from '@nestjs/common';

export const STORE_RELATED_ACCESS_KEY = 'STORE_RELATED_ACCESS';
export const StoreRelatedAccess = () => SetMetadata(STORE_RELATED_ACCESS_KEY, true);