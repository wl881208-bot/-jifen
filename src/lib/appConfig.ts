/**
 * Global App Configuration & Public URL Helpers
 * Uses the custom production domain:
 * https://test.skycloud.zone
 */

export const SHARED_PUBLIC_APP_URL = 'https://test.skycloud.zone';

export const getPublicAppUrl = (path: string = ''): string => {
  let baseUrl = SHARED_PUBLIC_APP_URL;

  if (typeof window !== 'undefined' && window.location.origin) {
    const origin = window.location.origin;
    if (origin.includes('skycloud.zone') || origin.includes('tcloudbase.com')) {
      baseUrl = origin;
    } else if (origin.includes('run.app') || origin.includes('ais-dev-')) {
      // When deployed or proxied, prefer the custom WeChat OAuth domain for WeChat compatibility
      baseUrl = SHARED_PUBLIC_APP_URL;
    } else if (origin.startsWith('http')) {
      baseUrl = origin;
    }
  }

  const cleanPath = path.startsWith('/') ? path : (path ? `/${path}` : '');
  return `${baseUrl}${cleanPath}`;
};

