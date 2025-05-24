/**
 * Admin Activity Logger
 *
 * Provides a system for logging administrator activities in the application.
 * Stores logs in Firestore for future auditing and analysis.
 */

import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { AdminSection } from "./permissions";

/**
 * Types of admin actions that can be logged
 */
export enum AdminActionType {
  CREATE = "create",
  READ = "read",
  UPDATE = "update",
  DELETE = "delete",
  ENABLE = "enable",
  DISABLE = "disable",
  LOGIN = "login",
  LOGOUT = "logout",
  PASSWORD_RESET = "password_reset",
  ROLE_CHANGE = "role_change",
  SETTINGS_CHANGE = "settings_change",
  EXPORT = "export",
  IMPORT = "import",
  OTHER = "other",
}

/**
 * Severity levels for activity logs
 */
export enum LogSeverity {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
}

/**
 * Interface for activity log entries
 */
export interface ActivityLog {
  id?: string;
  timestamp: Timestamp;
  userEmail: string;
  userName?: string;
  userId: string;
  actionType: AdminActionType;
  section: AdminSection | string;
  description: string;
  details?: any;
  targetId?: string;
  targetType?: string;
  ipAddress?: string;
  severity: LogSeverity;
  status?: "success" | "failure";
}

/**
 * Interface for activity log query filters
 */
export interface ActivityLogFilter {
  userId?: string;
  userEmail?: string;
  actionTypes?: AdminActionType[];
  section?: AdminSection | string;
  startDate?: Date;
  endDate?: Date;
  severity?: LogSeverity;
  status?: "success" | "failure";
  limit?: number;
}

/**
 * Logs an admin activity to Firestore
 *
 * @param userId ID of the user performing the action
 * @param userEmail Email of the user performing the action
 * @param userName Optional display name of the user
 * @param actionType Type of action being performed
 * @param section Admin section where the action occurred
 * @param description Human-readable description of the action
 * @param details Additional details about the action (object)
 * @param targetId Optional ID of the entity being acted upon
 * @param targetType Optional type of the entity being acted upon
 * @param ipAddress Optional IP address of the user
 * @param severity Log severity level (defaults to INFO)
 * @param status Optional success/failure status of the action
 * @returns Promise resolving to the ID of the created log entry
 */
export async function logAdminActivity(
  userId: string,
  userEmail: string,
  actionType: AdminActionType,
  section: AdminSection | string,
  description: string,
  options?: {
    userName?: string;
    details?: any;
    targetId?: string;
    targetType?: string;
    ipAddress?: string;
    severity?: LogSeverity;
    status?: "success" | "failure";
  },
): Promise<string> {
  try {
    const logEntry: Omit<ActivityLog, "id"> = {
      timestamp: Timestamp.now(),
      userId,
      userEmail,
      userName: options?.userName,
      actionType,
      section,
      description,
      details: options?.details,
      targetId: options?.targetId,
      targetType: options?.targetType,
      ipAddress: options?.ipAddress,
      severity: options?.severity || LogSeverity.INFO,
      status: options?.status || "success",
    };

    // Add the log entry to Firestore
    const docRef = await addDoc(
      collection(db, "admin_activity_logs"),
      logEntry,
    );

    console.log(
      `Admin activity logged: ${actionType} in ${section} by ${userEmail}`,
    );
    return docRef.id;
  } catch (error) {
    console.error("Error logging admin activity:", error);
    // Even if logging fails, we don't want to break the application flow
    return "";
  }
}

/**
 * Retrieve activity logs based on filter criteria
 *
 * @param filter Filter criteria for logs
 * @returns Promise resolving to array of matching activity logs
 */
export async function getActivityLogs(
  filter: ActivityLogFilter = {},
): Promise<ActivityLog[]> {
  try {
    let q = query(
      collection(db, "admin_activity_logs"),
      orderBy("timestamp", "desc"),
    );

    // Apply filters
    if (filter.userId) {
      q = query(q, where("userId", "==", filter.userId));
    }

    if (filter.userEmail) {
      q = query(q, where("userEmail", "==", filter.userEmail));
    }

    if (filter.section) {
      q = query(q, where("section", "==", filter.section));
    }

    if (filter.severity) {
      q = query(q, where("severity", "==", filter.severity));
    }

    if (filter.status) {
      q = query(q, where("status", "==", filter.status));
    }

    // Note: You cannot use multiple "array-contains" clauses in a query
    // If actionTypes is specified, we'll need to filter in memory

    // Apply date range filters if specified
    if (filter.startDate) {
      q = query(
        q,
        where("timestamp", ">=", Timestamp.fromDate(filter.startDate)),
      );
    }

    if (filter.endDate) {
      q = query(
        q,
        where("timestamp", "<=", Timestamp.fromDate(filter.endDate)),
      );
    }

    // Apply limit if specified
    if (filter.limit) {
      q = query(q, limit(filter.limit));
    } else {
      // Default to 100 most recent logs
      q = query(q, limit(100));
    }

    const querySnapshot = await getDocs(q);

    // Convert the query snapshot to an array of activity logs
    const logs: ActivityLog[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Omit<ActivityLog, "id">;
      logs.push({
        id: doc.id,
        ...data,
      });
    });

    // If actionTypes filter is specified, filter in memory
    if (filter.actionTypes && filter.actionTypes.length > 0) {
      return logs.filter((log) => filter.actionTypes!.includes(log.actionType));
    }

    return logs;
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    return [];
  }
}

/**
 * Helper function to log user actions
 */
export const adminLogger = {
  /**
   * Log a resource creation action
   */
  create: async (
    user: { uid: string; email: string | null; displayName?: string | null },
    section: AdminSection | string,
    description: string,
    options?: {
      details?: any;
      targetId?: string;
      targetType?: string;
    },
  ) => {
    return logAdminActivity(
      user.uid,
      user.email || "unknown@email.com",
      AdminActionType.CREATE,
      section,
      description,
      {
        userName: user.displayName || undefined,
        ...options,
      },
    );
  },

  /**
   * Log a resource update action
   */
  update: async (
    user: { uid: string; email: string | null; displayName?: string | null },
    section: AdminSection | string,
    description: string,
    options?: {
      details?: any;
      targetId?: string;
      targetType?: string;
    },
  ) => {
    return logAdminActivity(
      user.uid,
      user.email || "unknown@email.com",
      AdminActionType.UPDATE,
      section,
      description,
      {
        userName: user.displayName || undefined,
        ...options,
      },
    );
  },

  /**
   * Log a resource deletion action
   */
  delete: async (
    user: { uid: string; email: string | null; displayName?: string | null },
    section: AdminSection | string,
    description: string,
    options?: {
      details?: any;
      targetId?: string;
      targetType?: string;
    },
  ) => {
    return logAdminActivity(
      user.uid,
      user.email || "unknown@email.com",
      AdminActionType.DELETE,
      section,
      description,
      {
        userName: user.displayName || undefined,
        severity: LogSeverity.WARNING,
        ...options,
      },
    );
  },

  /**
   * Log a user permission/role change
   */
  roleChange: async (
    user: { uid: string; email: string | null; displayName?: string | null },
    targetUserId: string,
    targetUserEmail: string,
    oldRole: string,
    newRole: string,
  ) => {
    return logAdminActivity(
      user.uid,
      user.email || "unknown@email.com",
      AdminActionType.ROLE_CHANGE,
      AdminSection.SETTINGS_ROLES,
      `Changed role for user ${targetUserEmail} from ${oldRole} to ${newRole}`,
      {
        userName: user.displayName || undefined,
        targetId: targetUserId,
        targetType: "user",
        details: { oldRole, newRole },
        severity: LogSeverity.WARNING,
      },
    );
  },

  /**
   * Log a settings change
   */
  settingsChange: async (
    user: { uid: string; email: string | null; displayName?: string | null },
    settingSection: AdminSection,
    description: string,
    changes: Record<string, { old: any; new: any }>,
  ) => {
    return logAdminActivity(
      user.uid,
      user.email || "unknown@email.com",
      AdminActionType.SETTINGS_CHANGE,
      settingSection,
      description,
      {
        userName: user.displayName || undefined,
        details: changes,
      },
    );
  },

  /**
   * Log an error that occurred during an admin action
   */
  error: async (
    user: { uid: string; email: string | null; displayName?: string | null },
    section: AdminSection | string,
    description: string,
    error: any,
  ) => {
    return logAdminActivity(
      user.uid,
      user.email || "unknown@email.com",
      AdminActionType.OTHER,
      section,
      description,
      {
        userName: user.displayName || undefined,
        details: { error: error?.message || String(error) },
        severity: LogSeverity.ERROR,
        status: "failure",
      },
    );
  },
};
