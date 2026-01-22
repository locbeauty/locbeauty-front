import { SYSTEM_MODULES } from "@/utils/@types/access";
import { ROUTES } from "@/utils/routes";

type ModuleRouteMap = {
  module: SYSTEM_MODULES;
  route: string;
};

// Map modules to their corresponding routes in priority order
const MODULE_ROUTE_PRIORITY: ModuleRouteMap[] = [
  { module: SYSTEM_MODULES.DASHBOARD, route: ROUTES.DASHBOARD },
  { module: SYSTEM_MODULES.CUSTOMERS, route: ROUTES.CUSTOMERS },
  { module: SYSTEM_MODULES.BOOKINGS, route: ROUTES.BOOKING_TABLE },
  { module: SYSTEM_MODULES.CALENDAR, route: ROUTES.CALENDAR },
  { module: SYSTEM_MODULES.GEARS, route: ROUTES.GEARS },
  { module: SYSTEM_MODULES.FILIALS, route: ROUTES.FILIALS },
  { module: SYSTEM_MODULES.EMPLOYEES, route: ROUTES.EMPLOYEES },
  { module: SYSTEM_MODULES.GOALS, route: ROUTES.GOALS },
  { module: SYSTEM_MODULES.TRAININGS, route: ROUTES.TRAININGS },
  { module: SYSTEM_MODULES.BIRTHDAYS, route: ROUTES.BIRTHDAYS },
  { module: SYSTEM_MODULES.NOTICES, route: ROUTES.NOTICES },
];

export type UserAccess = {
  module: SYSTEM_MODULES;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
};

/**
 * Determines the first accessible route for a user based on their permissions
 * @param accesses - Array of user's access permissions
 * @returns The first route the user has view access to, or a fallback route
 */
export function getFirstAccessibleRoute(accesses: UserAccess[]): string {
  // Check each module in priority order
  for (const { module, route } of MODULE_ROUTE_PRIORITY) {
    const hasAccess = accesses.some(
      (access) => access.module === module && access.canView,
    );

    if (hasAccess) {
      return route;
    }
  }

  // Fallback to notices page if no access to any module
  // Notices should typically be accessible to all authenticated users
  return ROUTES.NOTICES;
}
