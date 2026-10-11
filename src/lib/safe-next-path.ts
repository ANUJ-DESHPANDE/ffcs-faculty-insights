export function safeNextPath(value: string | null): string {
  if (!value?.startsWith('/') || value.startsWith('//') || value.includes('\\'))
    return '/contribute';
  try {
    const base = 'https://local.invalid';
    const url = new URL(value, base);
    return url.origin === base ? `${url.pathname}${url.search}${url.hash}` : '/contribute';
  } catch {
    return '/contribute';
  }
}
