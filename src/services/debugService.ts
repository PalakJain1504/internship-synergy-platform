
/**
 * Debug and logging service for application debugging
 */

// Log levels
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

// Current log level
let currentLogLevel: LogLevel = LogLevel.DEBUG;

// Set the log level
export const setLogLevel = (level: LogLevel) => {
  currentLogLevel = level;
};

// Helper function to determine if a log should be displayed
const shouldLog = (level: LogLevel): boolean => {
  const levels = {
    [LogLevel.ERROR]: 0,
    [LogLevel.WARN]: 1,
    [LogLevel.INFO]: 2,
    [LogLevel.DEBUG]: 3,
  };

  return levels[level] <= levels[currentLogLevel];
};

// Log functions
export const logError = (message: string, ...args: any[]) => {
  if (shouldLog(LogLevel.ERROR)) {
    console.error(`🔴 ERROR: ${message}`, ...args);
  }
};

export const logWarn = (message: string, ...args: any[]) => {
  if (shouldLog(LogLevel.WARN)) {
    console.warn(`🟠 WARN: ${message}`, ...args);
  }
};

export const logInfo = (message: string, ...args: any[]) => {
  if (shouldLog(LogLevel.INFO)) {
    console.log(`🔵 INFO: ${message}`, ...args);
  }
};

export const logDebug = (message: string, ...args: any[]) => {
  if (shouldLog(LogLevel.DEBUG)) {
    console.log(`🟢 DEBUG: ${message}`, ...args);
  }
};

// API error handler
export const handleApiError = (error: any, context: string): string => {
  logError(`API Error in ${context}:`, error);
  
  // Extract meaningful error message
  let errorMessage = 'An unexpected error occurred';
  
  if (error?.message) {
    errorMessage = error.message;
  } else if (error?.error_description) {
    errorMessage = error.error_description;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error?.details) {
    errorMessage = error.details;
  }
  
  // Add more information for debugging in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    return `${errorMessage} (${context})`;
  }
  
  return errorMessage;
};

// Function to help diagnose network issues
export const diagnoseNetworkIssue = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      mode: 'no-cors'
    });
    return `Connection to ${url} successful: ${response.status}`;
  } catch (error) {
    return `Connection to ${url} failed: ${error}`;
  }
};

// Function to get detailed browser information for debugging
export const getBrowserInfo = (): Record<string, string> => {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    vendor: navigator.vendor,
    language: navigator.language,
    cookiesEnabled: navigator.cookieEnabled.toString(),
    onLine: navigator.onLine.toString(),
    screenWidth: window.screen.width.toString(),
    screenHeight: window.screen.height.toString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
};

export default {
  logError,
  logWarn,
  logInfo,
  logDebug,
  setLogLevel,
  handleApiError,
  diagnoseNetworkIssue,
  getBrowserInfo,
};
