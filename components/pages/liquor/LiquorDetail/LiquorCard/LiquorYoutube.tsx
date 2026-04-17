type Props = {
  youtubeEmbedId: string;
  title: string;
};

export function LiquorYoutube({ youtubeEmbedId, title }: Props) {
  return (
    <div className="mt-6">
      <iframe
        className="aspect-video w-full rounded-lg"
        src={`https://www.youtube.com/embed/${youtubeEmbedId}`}
        allowFullScreen
        title={title}
      />
    </div>
  );
}

