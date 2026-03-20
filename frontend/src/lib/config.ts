/**
 * MITRA Frontend Configuration
 *
 * Centralized configuration for timeouts, intervals, and limits.
 * Update these values to adjust application behavior without modifying service code.
 */

/**
 * API Configuration
 */
export const apiConfig = {
  /** HTTP request timeout in milliseconds */
  requestTimeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '4000'),

  /** API base URL */
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
};

/**
 * Notification Configuration
 */
export const notificationConfig = {
  /** Polling interval for fetching new notifications (milliseconds) */
  pollingInterval: parseInt(
    process.env.NEXT_PUBLIC_NOTIFICATION_POLLING_INTERVAL || '30000',
  ),

  /** Toast message duration (milliseconds) before auto-dismiss */
  toastDuration: parseInt(process.env.NEXT_PUBLIC_TOAST_DURATION || '5000'),

  /** Confirmation message display duration (milliseconds) */
  confirmationDuration: parseInt(
    process.env.NEXT_PUBLIC_CONFIRMATION_DURATION || '4000',
  ),
};

/**
 * UI Configuration
 */
export const uiConfig = {
  /** Maximum unread notifications to display as badge (9 = "9+") */
  maxBadgeCount: 9,

  /** Page size for notification lists */
  notificationsPageSize: 30,
};

/**
 * Time Utilities (milliseconds)
 */
export const timeConfig = {
  /** Milliseconds per day */
  MS_PER_DAY: 86400000,

  /** Milliseconds per hour */
  MS_PER_HOUR: 3600000,

  /** Milliseconds per minute */
  MS_PER_MINUTE: 60000,

  /** Milliseconds per second */
  MS_PER_SECOND: 1000,
};

/**
 * Feature Flags
 */
export const featureConfig = {
  /** Enable notification polling */
  enableNotificationPolling: true,

  /** Enable toast notifications */
  enableToastNotifications: true,

  /** Enable mock API fallback when backend is unavailable */
  enableMockFallback: process.env.NEXT_PUBLIC_USE_MOCK === 'true',
};

/**
 * Logging Configuration
 */
export const loggingConfig = {
  /** Enable debug logging */
  debugMode: process.env.NODE_ENV === 'development',

  /** Log API requests and responses */
  logApiCalls: process.env.NEXT_PUBLIC_LOG_API_CALLS === 'true',
};
