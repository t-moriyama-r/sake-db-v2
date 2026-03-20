'use client';

import { useRef, useState } from 'react';
import Button from '@/components/ui/Button';

type ImageUploadProps = {
  label?: string;
  currentImageUrl?: string | null;
  currentImageBase64?: string | null;
  onChange: (file: File | null) => void;
  error?: string;
};

export default function ImageUpload({
  label = '画像',
  currentImageUrl,
  currentImageBase64,
  onChange,
  error,
}: ImageUploadProps) {
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
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {displayImage && (
        <img src={displayImage} alt="プレビュー" className="h-32 w-32 rounded-md object-cover border" />
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
        {(preview || currentImageUrl) && (
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
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
