import { z } from 'zod';

const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}(&.*)?$/;

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export const liquorSchema = z.object({
  categoryId: z.string().min(1, 'カテゴリは必須です'),
  name: z
    .string()
    .min(1, 'お酒の名前は必須です')
    .max(100, 'お酒の名前は100文字以内で入力してください'),
  description: z.string().max(5000, '説明は5000文字以内で入力してください').optional(),
  youtube: z
    .string()
    .optional()
    .refine((v) => !v || youtubeRegex.test(v), { message: '有効なYouTube URLを入力してください' }),
  image: z
    .instanceof(File)
    .optional()
    .nullable()
    .refine((f) => !f || f.size <= MAX_FILE_SIZE, { message: '画像は2MB以下にしてください' })
    .refine((f) => !f || f.type.startsWith('image/'), {
      message: '画像ファイルを選択してください',
    }),
});

export type LiquorInput = z.infer<typeof liquorSchema>;
