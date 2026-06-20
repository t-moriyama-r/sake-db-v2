export function extractYoutubeEmbedId(url: string | null | undefined): string | undefined {
  return url?.match(/(?:v=|youtu\.be\/)([^&\s]+)/)?.[1];
}
