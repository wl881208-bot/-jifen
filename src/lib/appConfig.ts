/**
 * Global App Configuration & Public URL Helpers
 * Uses the specified Tencent CloudBase (腾讯云托管) domain:
 * jifen-295865-11-1301488547.sh.run.tcloudbase.com
 */

export const SHARED_PUBLIC_APP_URL = 'https://jifen-295865-11-1301488547.sh.run.tcloudbase.com';

export const getPublicAppUrl = (path: string = ''): string => {
  let baseUrl = SHARED_PUBLIC_APP_URL;

  if (typeof window !== 'undefined' && window.location.origin) {
    const origin = window.location.origin;
    if (origin.includes('tcloudbase.com')) {
      baseUrl = origin;
    } else if (origin.includes('run.app') || origin.includes('ais-dev-')) {
      // When deployed or proxied, prefer the Tencent CloudBase domain for WeChat compatibility
      baseUrl = SHARED_PUBLIC_APP_URL;
    } else if (origin.startsWith('http')) {
      baseUrl = origin;
    }
  }

  const cleanPath = path.startsWith('/') ? path : (path ? `/${path}` : '');
  return `${baseUrl}${cleanPath}`;
};

