import { z } from 'zod';

export const boardPostSchema = z.object({
  text: z.string().min(1, 'コメントを入力してください').max(2000, 'コメントは2000文字以内で入力してください'),
  rate: z.number().int().min(1).max(5).optional().nullable(),
  guestName: z.string().max(20, 'ニックネームは20文字以内で入力してください').optional(),
});

export const tagSchema = z.object({
  text: z.string().min(1, 'タグを入力してください').max(30, 'タグは30文字以内で入力してください'),
});

export type BoardPostInput = z.infer<typeof boardPostSchema>;
export type TagInput = z.infer<typeof tagSchema>;
