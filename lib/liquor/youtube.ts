const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be']);

export function extractYoutubeEmbedId(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  const hostname = parseHostname(url);
  if (!hostname || !YOUTUBE_HOSTS.has(hostname)) return undefined;
  return url.match(/(?:v=|youtu\.be\/)([^&\s]+)/)?.[1];
}

function parseHostname(url: string): string | undefined {
  try {
    return new URL(url).hostname;
  } catch {
    return undefined;
  }
}
