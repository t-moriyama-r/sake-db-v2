const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be']);

export function extractYoutubeEmbedId(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  const parsed = parseUrl(url);
  if (!parsed || !YOUTUBE_HOSTS.has(parsed.hostname)) return undefined;
  return parsed.hostname === 'youtu.be'
    ? parsed.pathname.split('/').filter(Boolean)[0]
    : (parsed.searchParams.get('v') ?? undefined);
}

function parseUrl(url: string): URL | undefined {
  try {
    return new URL(url);
  } catch {
    return undefined;
  }
}
