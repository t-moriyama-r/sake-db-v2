import Image from 'next/image';

type Props = {
  imageBase64?: string | null;
  imageUrl?: string | null;
  name: string;
};

export function LiquorImage({ imageBase64, imageUrl, name }: Props) {
  if (imageBase64 || imageUrl) {
    return (
      <Image
        src={imageBase64 ?? imageUrl ?? ''}
        alt={name}
        width={192}
        height={192}
        className="h-48 w-48 rounded-lg object-cover"
        unoptimized
      />
    );
  }
  return (
    <div className="flex h-48 w-48 items-center justify-center rounded-lg bg-muted text-6xl">
      🍶
    </div>
  );
}
