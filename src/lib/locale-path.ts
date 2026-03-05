import { Locale, defaultLocale, isLocale } from '@/locales';

export function detectLocaleFromPathname(pathname: string): Locale {
  const firstSegment = pathname.split('/').filter(Boolean)[0] ?? '';
  return isLocale(firstSegment) ? firstSegment : defaultLocale;
}

export function stripLocalePrefix(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return '/';

  if (isLocale(segments[0])) {
    const rest = segments.slice(1).join('/');
    return rest ? `/${rest}` : '/';
  }

  return pathname.startsWith('/') ? pathname : `/${pathname}`;
}

export function localizePath(path: string, locale: Locale): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (locale === defaultLocale) return normalizedPath;
  return normalizedPath === '/' ? `/${locale}` : `/${locale}${normalizedPath}`;
}

export function switchLocalePath(pathname: string, locale: Locale): string {
  const basePath = stripLocalePrefix(pathname);
  return localizePath(basePath, locale);
}
