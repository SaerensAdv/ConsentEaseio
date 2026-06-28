export function normalizeHostname(hostname: string): string {
  return hostname
    .toLowerCase()
    .trim()
    .replace(/^www\./, '')
    .replace(/:\d+$/, '');
}

export function normalizeDomain(domain: string): string {
  return domain
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '')
    .replace(/:\d+$/, '');
}

export function isDomainAllowed(
  hostname: string,
  primaryDomain: string,
  allowedDomains?: string[] | null
): boolean {
  const normalizedHost = normalizeHostname(hostname);
  const normalizedPrimary = normalizeDomain(primaryDomain);

  if (!normalizedHost || !normalizedPrimary) return false;

  if (normalizedHost === normalizedPrimary) return true;

  if (normalizedHost.endsWith('.' + normalizedPrimary)) return true;

  if (allowedDomains && allowedDomains.length > 0) {
    for (const allowed of allowedDomains) {
      const normalizedAllowed = normalizeDomain(allowed);
      if (!normalizedAllowed) continue;

      if (normalizedAllowed.startsWith('*.')) {
        const wildcardBase = normalizedAllowed.slice(2);
        if (normalizedHost === wildcardBase || normalizedHost.endsWith('.' + wildcardBase)) {
          return true;
        }
      } else if (normalizedHost === normalizedAllowed) {
        return true;
      }
    }
  }

  return false;
}

export function isLocalhostOrDev(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return (
    h === 'localhost' ||
    h === '127.0.0.1' ||
    h === '0.0.0.0' ||
    h === '::1' ||
    h.endsWith('.localhost') ||
    h.endsWith('.local') ||
    h.endsWith('.test') ||
    h.endsWith('.replit.dev') ||
    h.endsWith('.repl.co')
  );
}

export function extractHostFromOrigin(origin: string | undefined | null): string | null {
  if (!origin) return null;
  try {
    const url = new URL(origin);
    return normalizeHostname(url.hostname);
  } catch {
    return null;
  }
}

export function extractHostFromReferer(referer: string | undefined | null): string | null {
  if (!referer) return null;
  try {
    const url = new URL(referer);
    return normalizeHostname(url.hostname);
  } catch {
    return null;
  }
}

export function getRequestHost(headers: { origin?: string; referer?: string }): string | null {
  return extractHostFromOrigin(headers.origin) || extractHostFromReferer(headers.referer) || null;
}
