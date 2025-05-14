/**
 * Permissions system for Oak Structures admin dashboard
 * Provides role-based access control with granular permissions
 */

// Define user roles
export enum UserRole {
  SUPER_ADMIN = "super_admin", // Special role with all permissions
  ADMIN = "admin", // Regular admin
  MANAGER = "manager",
  CUSTOMER = "customer",
  GUEST = "guest", // Not logged in
}

// Permission actions
export enum PermissionAction {
  VIEW = "view",
  CREATE = "create",
  EDIT = "edit",
  DELETE = "delete",
  APPROVE = "approve",
}

// Admin sections that require permissions
export enum AdminSection {
  DASHBOARD = "dashboard",
  ORDERS = "orders",
  PRODUCTS = "products",
  PRODUCTS_PRICES = "products_prices",
  PRODUCTS_PHOTOS = "products_photos",
  PRODUCTS_SPECIAL_DEALS = "products_special_deals",
  CONTENT = "content",
  CONTENT_GALLERY = "content_gallery",
  CONTENT_SEO = "content_seo",
  SETTINGS = "settings",
  SETTINGS_COMPANY = "settings_company",
  SETTINGS_FINANCIAL = "settings_financial",
  SETTINGS_DELIVERY = "settings_delivery",
  SETTINGS_PAYMENTS = "settings_payments",
  SETTINGS_ANALYTICS = "settings_analytics",
  SETTINGS_NOTIFICATIONS = "settings_notifications",
  SETTINGS_ROLES = "settings_roles",
  USERS = "users",
  CRM = "crm",
  CRM_LEADS = "crm_leads",
  TOOLS = "tools",
  TOOLS_EXPORTS = "tools_exports",
}

// Permission object
export type Permission = {
  section: AdminSection;
  action: PermissionAction;
};

// Permission key for efficient lookup
type PermissionKey = `${AdminSection}:${PermissionAction}`;

// Helper to create a permission key
const createPermissionKey = (permission: Permission): PermissionKey => {
  return `${permission.section}:${permission.action}`;
};

// Define role-based permissions
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: [], // Empty array means all permissions (special case)

  [UserRole.ADMIN]: [
    // Dashboard
    { section: AdminSection.DASHBOARD, action: PermissionAction.VIEW },

    // Orders
    { section: AdminSection.ORDERS, action: PermissionAction.VIEW },
    { section: AdminSection.ORDERS, action: PermissionAction.EDIT },
    { section: AdminSection.ORDERS, action: PermissionAction.APPROVE },

    // Products
    { section: AdminSection.PRODUCTS, action: PermissionAction.VIEW },
    { section: AdminSection.PRODUCTS, action: PermissionAction.CREATE },
    { section: AdminSection.PRODUCTS, action: PermissionAction.EDIT },
    { section: AdminSection.PRODUCTS, action: PermissionAction.DELETE },
    { section: AdminSection.PRODUCTS_PRICES, action: PermissionAction.VIEW },
    { section: AdminSection.PRODUCTS_PRICES, action: PermissionAction.EDIT },
    { section: AdminSection.PRODUCTS_PHOTOS, action: PermissionAction.VIEW },
    { section: AdminSection.PRODUCTS_PHOTOS, action: PermissionAction.CREATE },
    { section: AdminSection.PRODUCTS_PHOTOS, action: PermissionAction.EDIT },
    { section: AdminSection.PRODUCTS_PHOTOS, action: PermissionAction.DELETE },
    {
      section: AdminSection.PRODUCTS_SPECIAL_DEALS,
      action: PermissionAction.VIEW,
    },
    {
      section: AdminSection.PRODUCTS_SPECIAL_DEALS,
      action: PermissionAction.CREATE,
    },
    {
      section: AdminSection.PRODUCTS_SPECIAL_DEALS,
      action: PermissionAction.EDIT,
    },
    {
      section: AdminSection.PRODUCTS_SPECIAL_DEALS,
      action: PermissionAction.DELETE,
    },

    // Content
    { section: AdminSection.CONTENT, action: PermissionAction.VIEW },
    { section: AdminSection.CONTENT, action: PermissionAction.EDIT },
    { section: AdminSection.CONTENT_GALLERY, action: PermissionAction.VIEW },
    { section: AdminSection.CONTENT_GALLERY, action: PermissionAction.CREATE },
    { section: AdminSection.CONTENT_GALLERY, action: PermissionAction.EDIT },
    { section: AdminSection.CONTENT_GALLERY, action: PermissionAction.DELETE },
    { section: AdminSection.CONTENT_SEO, action: PermissionAction.VIEW },
    { section: AdminSection.CONTENT_SEO, action: PermissionAction.EDIT },

    // Settings
    { section: AdminSection.SETTINGS, action: PermissionAction.VIEW },
    { section: AdminSection.SETTINGS_COMPANY, action: PermissionAction.VIEW },
    { section: AdminSection.SETTINGS_COMPANY, action: PermissionAction.EDIT },
    { section: AdminSection.SETTINGS_FINANCIAL, action: PermissionAction.VIEW },
    { section: AdminSection.SETTINGS_FINANCIAL, action: PermissionAction.EDIT },
    { section: AdminSection.SETTINGS_DELIVERY, action: PermissionAction.VIEW },
    { section: AdminSection.SETTINGS_DELIVERY, action: PermissionAction.EDIT },
    { section: AdminSection.SETTINGS_PAYMENTS, action: PermissionAction.VIEW },
    { section: AdminSection.SETTINGS_PAYMENTS, action: PermissionAction.EDIT },
    { section: AdminSection.SETTINGS_ANALYTICS, action: PermissionAction.VIEW },
    { section: AdminSection.SETTINGS_ANALYTICS, action: PermissionAction.EDIT },
    {
      section: AdminSection.SETTINGS_NOTIFICATIONS,
      action: PermissionAction.VIEW,
    },
    {
      section: AdminSection.SETTINGS_NOTIFICATIONS,
      action: PermissionAction.EDIT,
    },

    // Tools
    { section: AdminSection.TOOLS, action: PermissionAction.VIEW },
    { section: AdminSection.TOOLS_EXPORTS, action: PermissionAction.VIEW },
    { section: AdminSection.TOOLS_EXPORTS, action: PermissionAction.CREATE },

    // Users
    { section: AdminSection.USERS, action: PermissionAction.VIEW },

    // CRM
    { section: AdminSection.CRM, action: PermissionAction.VIEW },
    { section: AdminSection.CRM, action: PermissionAction.CREATE },
    { section: AdminSection.CRM, action: PermissionAction.EDIT },
    { section: AdminSection.CRM_LEADS, action: PermissionAction.VIEW },
    { section: AdminSection.CRM_LEADS, action: PermissionAction.CREATE },
    { section: AdminSection.CRM_LEADS, action: PermissionAction.EDIT },
  ],

  [UserRole.MANAGER]: [
    // Dashboard
    { section: AdminSection.DASHBOARD, action: PermissionAction.VIEW },

    // Orders
    { section: AdminSection.ORDERS, action: PermissionAction.VIEW },
    { section: AdminSection.ORDERS, action: PermissionAction.EDIT },

    // Products
    { section: AdminSection.PRODUCTS, action: PermissionAction.VIEW },
    { section: AdminSection.PRODUCTS_PHOTOS, action: PermissionAction.VIEW },
    { section: AdminSection.PRODUCTS_PHOTOS, action: PermissionAction.CREATE },
    { section: AdminSection.PRODUCTS_PHOTOS, action: PermissionAction.EDIT },
    {
      section: AdminSection.PRODUCTS_SPECIAL_DEALS,
      action: PermissionAction.VIEW,
    },

    // Content
    { section: AdminSection.CONTENT, action: PermissionAction.VIEW },
    { section: AdminSection.CONTENT_GALLERY, action: PermissionAction.VIEW },
    { section: AdminSection.CONTENT_GALLERY, action: PermissionAction.CREATE },
    { section: AdminSection.CONTENT_GALLERY, action: PermissionAction.EDIT },

    // CRM
    { section: AdminSection.CRM, action: PermissionAction.VIEW },
    { section: AdminSection.CRM_LEADS, action: PermissionAction.VIEW },
    { section: AdminSection.CRM_LEADS, action: PermissionAction.EDIT },
  ],

  [UserRole.CUSTOMER]: [
    // Customers can only view public pages, no admin access
  ],

  [UserRole.GUEST]: [
    // Guests can only view public pages, no admin access
  ],
};

// Build permission lookup map for efficient permission checking
const buildPermissionLookup = (): Record<UserRole, Set<PermissionKey>> => {
  const lookup: Record<UserRole, Set<PermissionKey>> = {
    [UserRole.SUPER_ADMIN]: new Set(), // Will be filled with all permissions
    [UserRole.ADMIN]: new Set(),
    [UserRole.MANAGER]: new Set(),
    [UserRole.CUSTOMER]: new Set(),
    [UserRole.GUEST]: new Set(),
  };

  // First collect all possible permissions
  const allPermissions = new Set<PermissionKey>();

  // Add all permissions from role definitions
  Object.values(ROLE_PERMISSIONS).forEach((permissions) => {
    permissions.forEach((permission) => {
      allPermissions.add(createPermissionKey(permission));
    });
  });

  // Super admin gets all permissions
  lookup[UserRole.SUPER_ADMIN] = new Set(allPermissions);

  // Add role-specific permissions
  Object.entries(ROLE_PERMISSIONS).forEach(([role, permissions]) => {
    if (role === UserRole.SUPER_ADMIN) return; // Already handled

    permissions.forEach((permission) => {
      lookup[role as UserRole].add(createPermissionKey(permission));
    });
  });

  return lookup;
};

// Permission lookup map
const PERMISSION_LOOKUP = buildPermissionLookup();

/**
 * Check if a role has a specific permission
 * @param role User role
 * @param section Admin section
 * @param action Permission action
 * @returns boolean indicating if the role has the permission
 */
export const hasPermission = (
  role: UserRole | string | undefined,
  section: AdminSection,
  action: PermissionAction,
): boolean => {
  // Handle undefined role (not authenticated)
  if (!role) {
    console.log(
      `[PERMISSIONS] No role provided, denying access to ${section}:${action}`,
    );
    return false;
  }

  // Convert string role to enum if needed
  const userRole = typeof role === "string" ? (role as UserRole) : role;

  // Super admin has all permissions
  if (userRole === UserRole.SUPER_ADMIN) {
    console.log(
      `[PERMISSIONS] Super admin access granted to ${section}:${action}`,
    );
    return true;
  }

  // Lookup permission
  const permissionKey = createPermissionKey({ section, action });
  const hasAccess = PERMISSION_LOOKUP[userRole]?.has(permissionKey) || false;

  console.log(
    `[PERMISSIONS] Role ${userRole} ${hasAccess ? "has" : "lacks"} permission for ${section}:${action}`,
  );

  return hasAccess;
};

/**
 * Check if a user has access to a specific admin section for viewing
 * @param role User role
 * @param section Admin section
 * @returns boolean indicating if the user can view the section
 */
export const canViewSection = (
  role: UserRole | string | undefined,
  section: AdminSection,
): boolean => {
  return hasPermission(role, section, PermissionAction.VIEW);
};

/**
 * Map from user's email to a specific role override
 * This allows hardcoding specific users to have certain roles
 * regardless of their database-stored role
 */
export const EMAIL_ROLE_OVERRIDES: Record<string, UserRole> = {
  "luke@mcconversions.uk": UserRole.SUPER_ADMIN,
  "admin@timberline.com": UserRole.SUPER_ADMIN,
};

/**
 * Get a user's effective role, considering overrides
 * @param email User's email
 * @param databaseRole Role stored in the database
 * @returns The effective UserRole
 */
export const getEffectiveRole = (
  email: string | null | undefined,
  databaseRole: string | null | undefined,
): UserRole => {
  // Check for role override by email
  if (email && EMAIL_ROLE_OVERRIDES[email]) {
    console.log(
      `[PERMISSIONS] Role override for ${email}: ${EMAIL_ROLE_OVERRIDES[email]}`,
    );
    return EMAIL_ROLE_OVERRIDES[email];
  }

  // Use database role if valid
  if (
    databaseRole &&
    Object.values(UserRole).includes(databaseRole as UserRole)
  ) {
    return databaseRole as UserRole;
  }

  // Special handling for compatibility with previous role system
  if (databaseRole === "admin") {
    return UserRole.ADMIN;
  }

  // Default to customer for authenticated users
  return email ? UserRole.CUSTOMER : UserRole.GUEST;
};

/**
 * Get all sections a role can access
 * @param role User role
 * @returns Array of accessible AdminSections
 */
export const getAccessibleSections = (
  role: UserRole | string | undefined,
): AdminSection[] => {
  if (!role) return [];

  const userRole = typeof role === "string" ? (role as UserRole) : role;

  // Super admin can access all sections
  if (userRole === UserRole.SUPER_ADMIN) {
    return Object.values(AdminSection);
  }

  // Find all sections this role can view
  const viewablePermissions = Array.from(PERMISSION_LOOKUP[userRole] || [])
    .filter((key) => key.endsWith(`:${PermissionAction.VIEW}`))
    .map((key) => key.split(":")[0] as AdminSection);

  return viewablePermissions;
};
