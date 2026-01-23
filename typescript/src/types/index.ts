/**
 * Website configuration from websites.json
 */
export interface Website {
  name: string;
  url: string;
}

/**
 * Websites configuration file structure
 */
export interface WebsitesConfig {
  websites: Website[];
}

/**
 * Result of checking a single website
 */
export interface WebsiteCheckResult {
  name: string;
  url: string;
  success: boolean;
  statusCode: number;
  error?: string;
}

/**
 * Raw check result (without name)
 */
export interface RawCheckResult {
  success: boolean;
  statusCode: number;
  url: string;
  error?: string;
}

/**
 * Email alert parameters
 */
export interface AlertParams {
  from: string;
  to: string;
  subject: string;
  body: string;
}

/**
 * Send alert response
 */
export interface SendAlertResponse {
  success: boolean;
  messageId?: string;
}

/**
 * Lambda response structure
 */
export interface LambdaResponse {
  statusCode: number;
  body: string;
}

/**
 * Website checker success response body
 */
export interface CheckerSuccessResponse {
  message: string;
  checked: number;
  successful: number;
  failed: number;
  duration: number;
  results: WebsiteCheckResult[];
}

/**
 * Website checker error response body
 */
export interface CheckerErrorResponse {
  message: string;
  error: string;
}

/**
 * Empty check response body
 */
export interface EmptyCheckResponse {
  message: string;
  checked: number;
  failed: number;
}
