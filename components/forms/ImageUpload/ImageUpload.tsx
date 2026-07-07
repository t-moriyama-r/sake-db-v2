'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button/Button';

type Props = {
  label?: string;
  currentImageUrl?: string | null;
  currentImageBase64?: string | null;
  onChange: (file: File | null) => void;
  error?: string;
};

export const ImageUpload = ({
  label = '画像',
  currentImageUrl,
  currentImageBase64,
  onChange,
  error,
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    onChange(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const displayImage = preview ?? currentImageBase64 ?? currentImageUrl;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-foreground-secondary">{label}</span>
      {displayImage && (
        <Image
          src={displayImage}
          alt="プレビュー"
          width={128}
          height={128}
          className="h-32 w-32 rounded-md object-cover border border-border"
          unoptimized
        />
      )}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => inputRef.current?.click()}
        >
          画像を選択
        </Button>
        {(preview || currentImageUrl || currentImageBase64) && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => { onChange(null); setPreview(null); if (inputRef.current) inputRef.current.value = ''; }}
          >
            削除
          </Button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
