/**
 * MITRA Backend Configuration
 *
 * Centralized configuration for timeouts, rate limits, and thresholds.
 * Update these values to adjust application behavior without modifying service code.
 */

export const appConfig = {
  /**
   * API & Request Configuration
   */
  api: {
    /** Maximum number of requests per minute from a single client */
    maxRequestsPerMinute: parseInt(
      process.env.API_MAX_REQUESTS_PER_MINUTE || '30',
    ),

    /** Throttle window in milliseconds */
    throttleWindowMs: parseInt(process.env.API_THROTTLE_WINDOW_MS || '60000'),

    /** Request timeout in milliseconds */
    requestTimeoutMs: parseInt(process.env.API_REQUEST_TIMEOUT_MS || '30000'),
  },

  /**
   * User & Account Configuration
   */
  users: {
    /** Maximum number of pets per tutor (FREE tier) */
    maxPetsPerTutorFree: parseInt(
      process.env.MAX_PETS_PER_TUTOR_FREE || '2',
    ),

    /** Maximum number of pets per tutor (PREMIUM tier) */
    maxPetsPerTutorPremium: parseInt(
      process.env.MAX_PETS_PER_TUTOR_PREMIUM || '100',
    ),

    /** Password minimum length */
    passwordMinLength: parseInt(process.env.PASSWORD_MIN_LENGTH || '8'),

    /** Verification token expiration in hours */
    verificationTokenExpirationHours: parseInt(
      process.env.VERIFICATION_TOKEN_EXPIRATION_HOURS || '24',
    ),
  },

  /**
   * Pet & Health Configuration
   */
  pets: {
    /** Image loading timeout in milliseconds */
    imageTimeoutMs: parseInt(process.env.IMAGE_TIMEOUT_MS || '4000'),

    /** Maximum file size for pet photos in bytes (10MB) */
    maxPhotoSizeBytes: parseInt(
      process.env.MAX_PHOTO_SIZE_BYTES || '10485760',
    ),

    /** Microchip validation regex pattern */
    microchipPattern: process.env.MICROCHIP_PATTERN || '^[0-9A-F]{16}$',
  },

  /**
   * Notification Configuration
   */
  notifications: {
    /** Email provider (resend, sendgrid, ses) */
    emailProvider: process.env.NOTIFICATION_EMAIL_PROVIDER || 'resend',

    /** Max notifications to return in list endpoint */
    maxNotificationsList: parseInt(
      process.env.MAX_NOTIFICATIONS_LIST || '30',
    ),

    /** Notification retention period in days */
    notificationRetentionDays: parseInt(
      process.env.NOTIFICATION_RETENTION_DAYS || '90',
    ),

    /** Email resend retry attempts */
    emailRetryAttempts: parseInt(
      process.env.EMAIL_RETRY_ATTEMPTS || '3',
    ),
  },

  /**
   * Custody & Governance Configuration
   */
  governance: {
    /** Minimum tutors principal required for shared decisions */
    minTutoresPrincipal: parseInt(
      process.env.MIN_TUTORES_PRINCIPAL || '2',
    ),

    /** Minimum tutors emergencia required for shared decisions */
    minTutoresEmergencia: parseInt(
      process.env.MIN_TUTORES_EMERGENCIA || '2',
    ),

    /** Custody request expiration in days */
    custodyRequestExpirationDays: parseInt(
      process.env.CUSTODY_REQUEST_EXPIRATION_DAYS || '30',
    ),

    /** Vote timeout in hours */
    voteTimeoutHours: parseInt(process.env.VOTE_TIMEOUT_HOURS || '48'),
  },

  /**
   * Token & JWT Configuration
   */
  jwt: {
    /** Access token expiration (e.g., '15m', '1h') */
    accessTokenExpiration:
      process.env.JWT_EXPIRATION || '15m',

    /** Refresh token expiration (e.g., '7d', '30d') */
    refreshTokenExpiration:
      process.env.JWT_REFRESH_EXPIRATION || '7d',

    /** JWT secret (CRITICAL: change in production) */
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',

    /** JWT refresh secret (CRITICAL: change in production) */
    refreshSecret:
      process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production',
  },

  /**
   * Rate Limiting Configuration
   */
  rateLimit: {
    /** Enable rate limiting */
    enabled: process.env.RATE_LIMIT_ENABLED !== 'false',

    /** TTL for rate limit window in seconds */
    ttl: parseInt(process.env.THROTTLE_TTL || '60'),

    /** Maximum requests per TTL window */
    limit: parseInt(process.env.THROTTLE_LIMIT || '30'),
  },

  /**
   * Database Configuration
   */
  database: {
    /** Database URL (PostgreSQL connection string) */
    url: process.env.DATABASE_URL,

    /** Connection pool size */
    poolSize: parseInt(process.env.DATABASE_POOL_SIZE || '10'),

    /** Query timeout in milliseconds */
    queryTimeoutMs: parseInt(process.env.DATABASE_QUERY_TIMEOUT_MS || '30000'),
  },

  /**
   * Logging Configuration
   */
  logging: {
    /** Log level (error, warn, info, debug) */
    level: process.env.LOG_LEVEL || 'info',

    /** Enable detailed request logging */
    logRequests: process.env.LOG_REQUESTS !== 'false',

    /** Enable database query logging */
    logQueries: process.env.LOG_QUERIES === 'true',
  },

  /**
   * Feature Flags
   */
  features: {
    /** Enable email notifications */
    emailNotifications: process.env.FEATURE_EMAIL_NOTIFICATIONS !== 'false',

    /** Enable push notifications (if implemented) */
    pushNotifications: process.env.FEATURE_PUSH_NOTIFICATIONS === 'true',

    /** Enable SMS notifications (if implemented) */
    smsNotifications: process.env.FEATURE_SMS_NOTIFICATIONS === 'true',

    /** Enable audit logging */
    auditLogging: process.env.FEATURE_AUDIT_LOGGING !== 'false',

    /** Enable soft deletes */
    softDeletes: process.env.FEATURE_SOFT_DELETES !== 'false',
  },
};

/**
 * Runtime Configuration Validation
 * Throws error if critical configuration is missing
 */
export function validateConfig(): void {
  const criticalVars = ['DATABASE_URL', 'JWT_SECRET'];

  const missing = criticalVars.filter(
    (key) => !process.env[key],
  );

  if (missing.length > 0) {
    console.warn(
      `[CONFIG] Missing critical environment variables: ${missing.join(', ')}`,
    );
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        `Missing required environment variables: ${missing.join(', ')}`,
      );
    }
  }
}
