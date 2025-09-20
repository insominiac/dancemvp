import { NextRequest } from 'next/server';
import crypto from 'crypto';

interface DeviceInfo {
  deviceId: string;
  deviceInfo: string;
  ipAddress: string;
  userAgent: string;
}

/**
 * Generate a unique device fingerprint based on browser and network characteristics
 */
export function generateDeviceFingerprint(request: NextRequest): DeviceInfo {
  // Get IP address from various headers (supporting proxies and load balancers)
  const getClientIP = (req: NextRequest): string => {
    const forwarded = req.headers.get('x-forwarded-for');
    const realIP = req.headers.get('x-real-ip');
    const cfConnectingIP = req.headers.get('cf-connecting-ip'); // Cloudflare
    
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    if (realIP) {
      return realIP;
    }
    
    if (cfConnectingIP) {
      return cfConnectingIP;
    }
    
    // Fallback to connection remote address (may not be available in all environments)
    return req.ip || 'unknown';
  };

  const ipAddress = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || '';
  
  // Extract key components for fingerprinting
  const acceptLanguage = request.headers.get('accept-language') || '';
  const acceptEncoding = request.headers.get('accept-encoding') || '';
  const accept = request.headers.get('accept') || '';
  
  // Create device fingerprint components
  const fingerPrintComponents = [
    userAgent,
    acceptLanguage,
    acceptEncoding,
    accept,
    ipAddress
  ];

  // Generate stable device ID
  const deviceId = crypto
    .createHash('sha256')
    .update(fingerPrintComponents.join('|'))
    .digest('hex')
    .substring(0, 32); // Use first 32 chars for shorter ID

  // Parse user agent for readable device info
  const deviceInfo = parseUserAgent(userAgent);

  return {
    deviceId,
    deviceInfo,
    ipAddress,
    userAgent
  };
}

/**
 * Parse user agent string to extract readable device information
 */
function parseUserAgent(userAgent: string): string {
  if (!userAgent) {
    return 'Unknown Device';
  }

  const ua = userAgent.toLowerCase();
  
  // Mobile devices
  if (ua.includes('mobile') || ua.includes('android')) {
    if (ua.includes('iphone')) {
      return 'iPhone';
    } else if (ua.includes('ipad')) {
      return 'iPad';
    } else if (ua.includes('android')) {
      return 'Android Mobile';
    }
    return 'Mobile Device';
  }
  
  // Desktop browsers
  if (ua.includes('chrome')) {
    if (ua.includes('mac')) {
      return 'Chrome on Mac';
    } else if (ua.includes('windows')) {
      return 'Chrome on Windows';
    } else if (ua.includes('linux')) {
      return 'Chrome on Linux';
    }
    return 'Chrome Browser';
  }
  
  if (ua.includes('firefox')) {
    if (ua.includes('mac')) {
      return 'Firefox on Mac';
    } else if (ua.includes('windows')) {
      return 'Firefox on Windows';
    } else if (ua.includes('linux')) {
      return 'Firefox on Linux';
    }
    return 'Firefox Browser';
  }
  
  if (ua.includes('safari') && !ua.includes('chrome')) {
    if (ua.includes('mac')) {
      return 'Safari on Mac';
    }
    return 'Safari Browser';
  }
  
  if (ua.includes('edge')) {
    return 'Edge Browser';
  }
  
  // Operating systems
  if (ua.includes('mac')) {
    return 'Mac Desktop';
  } else if (ua.includes('windows')) {
    return 'Windows Desktop';
  } else if (ua.includes('linux')) {
    return 'Linux Desktop';
  }
  
  return 'Desktop Browser';
}

/**
 * Client-side device fingerprinting (for use in React components)
 */
export function getClientDeviceInfo() {
  if (typeof window === 'undefined') {
    return {
      deviceId: '',
      deviceInfo: 'Server-side',
      screenResolution: '',
      timezone: '',
      language: ''
    };
  }

  const screen = window.screen;
  const navigator = window.navigator;
  
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.platform
  ];

  const deviceId = components.join('|');
  const hashedDeviceId = btoa(deviceId).substring(0, 32);

  return {
    deviceId: hashedDeviceId,
    deviceInfo: parseUserAgent(navigator.userAgent),
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language
  };
}

/**
 * Validate if two device IDs are from the same device
 * (accounts for minor variations in fingerprinting)
 */
export function isSameDevice(deviceId1: string, deviceId2: string): boolean {
  if (!deviceId1 || !deviceId2) return false;
  
  // Direct match
  if (deviceId1 === deviceId2) return true;
  
  // For now, we require exact match, but this could be enhanced
  // to allow for minor variations in fingerprinting components
  return false;
}

/**
 * Generate session token
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash session token for storage
 */
export function hashSessionToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}