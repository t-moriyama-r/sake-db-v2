import { z } from 'zod';

const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}(&.*)?$/;

export const boardPostSchema = z.object({
  text: z.string().min(1, 'コメントを入力してください').max(2000, 'コメントは2000文字以内で入力してください'),
  rate: z.number().int().min(1).max(5).optional().nullable(),
  youtube: z
    .string()
    .optional()
    .refine(
      (v) => !v || youtubeRegex.test(v),
      { message: '有効なYouTube URLを入力してください' }
    ),
});

export const tagSchema = z.object({
  text: z.string().min(1, 'タグを入力してください').max(30, 'タグは30文字以内で入力してください'),
});

export type BoardPostInput = z.infer<typeof boardPostSchema>;
export type TagInput = z.infer<typeof tagSchema>;
