import { z } from 'zod';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export const categorySchema = z.object({
  parentId: z.string().min(1, '親カテゴリを選択してください'),
  name: z
    .string()
    .min(1, 'カテゴリ名は必須です')
    .max(100, 'カテゴリ名は100文字以内で入力してください'),
  description: z.string().max(5000, '説明は5000文字以内で入力してください').optional(),
  image: z
    .instanceof(File)
    .optional()
    .nullable()
    .refine((f) => !f || f.size <= MAX_FILE_SIZE, { message: '画像は2MB以下にしてください' })
    .refine((f) => !f || f.type.startsWith('image/'), {
      message: '画像ファイルを選択してください',
    }),
});

export type CategoryInput = z.infer<typeof categorySchema>;
