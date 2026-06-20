import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(1, '名前は必須です').max(50, '名前は50文字以内で入力してください'),
  email: z.string().min(1, 'メールアドレスは必須です').email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上で入力してください'),
});

export const loginSchema = z.object({
  email: z.string().min(1, 'メールアドレスは必須です').email('有効なメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードは必須です'),
});

export const passwordResetSchema = z.object({
  email: z.string().min(1, 'メールアドレスは必須です').email('有効なメールアドレスを入力してください'),
});

export const passwordResetExeSchema = z.object({
  code: z.string().min(1, '確認コードは必須です'),
  password: z.string().min(8, 'パスワードは8文字以上で入力してください'),
  confirmPassword: z.string().min(1, 'パスワード（確認）は必須です'),
}).refine((v) => v.password === v.confirmPassword, {
  message: 'パスワードが一致しません',
  path: ['confirmPassword'],
});

export const userEditSchema = z.object({
  name: z.string().min(1, '名前は必須です').max(50, '名前は50文字以内で入力してください'),
  email: z.string().min(1, 'メールアドレスは必須です').email('有効なメールアドレスを入力してください'),
  password: z.union([
    z.string().length(0),
    z.string().min(8, 'パスワードは8文字以上で入力してください'),
  ]).optional(),
  currentPassword: z.string().optional(),
  profile: z.string().optional(),
}).refine(
  (v) => {
    const hasNewPassword = v.password && v.password.length > 0;
    const hasCurrentPassword = v.currentPassword && v.currentPassword.length > 0;
    return !hasNewPassword || hasCurrentPassword;
  },
  {
    message: '新しいパスワードを設定する場合は現在のパスワードを入力してください',
    path: ['currentPassword'],
  },
);

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
export type PasswordResetExeInput = z.infer<typeof passwordResetExeSchema>;
export type UserEditInput = z.infer<typeof userEditSchema>;
