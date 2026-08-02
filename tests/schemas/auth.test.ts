import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  loginSchema,
  passwordResetSchema,
  passwordResetExeSchema,
  userEditSchema,
} from '@/schemas/auth';

describe('registerSchema', () => {
  it('有効な値でパースできる', () => {
    const result = registerSchema.safeParse({
      name: 'テストユーザー',
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('名前が空のときエラー', () => {
    const result = registerSchema.safeParse({
      name: '',
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('名前は必須です');
    }
  });

  it('名前が51文字のときエラー', () => {
    const result = registerSchema.safeParse({
      name: 'a'.repeat(51),
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('名前は50文字以内で入力してください');
    }
  });

  it('メールアドレスが空のときエラー', () => {
    const result = registerSchema.safeParse({
      name: 'テスト',
      email: '',
      password: 'password123',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('メールアドレスは必須です');
    }
  });

  it('メールアドレスの形式が不正のときエラー', () => {
    const result = registerSchema.safeParse({
      name: 'テスト',
      email: 'invalid-email',
      password: 'password123',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('有効なメールアドレスを入力してください');
    }
  });

  it('パスワードが7文字のときエラー', () => {
    const result = registerSchema.safeParse({
      name: 'テスト',
      email: 'test@example.com',
      password: 'pass123',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('パスワードは8文字以上で入力してください');
    }
  });
});

describe('loginSchema', () => {
  it('有効な値でパースできる', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('メールアドレスが空のときエラー', () => {
    const result = loginSchema.safeParse({
      email: '',
      password: 'password123',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('メールアドレスは必須です');
    }
  });

  it('パスワードが空のときエラー', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('パスワードは必須です');
    }
  });
});

describe('passwordResetSchema', () => {
  it('有効なメールアドレスでパースできる', () => {
    const result = passwordResetSchema.safeParse({ email: 'test@example.com' });
    expect(result.success).toBe(true);
  });

  it('メールアドレスが空のときエラー', () => {
    const result = passwordResetSchema.safeParse({ email: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('メールアドレスは必須です');
    }
  });

  it('メールアドレスの形式が不正のときエラー', () => {
    const result = passwordResetSchema.safeParse({ email: 'not-an-email' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('有効なメールアドレスを入力してください');
    }
  });
});

describe('passwordResetExeSchema', () => {
  it('有効な値でパースできる', () => {
    const result = passwordResetExeSchema.safeParse({
      code: '123456',
      password: 'NewPass123',
      confirmPassword: 'NewPass123',
    });
    expect(result.success).toBe(true);
  });

  it('確認コードが空のときエラー', () => {
    const result = passwordResetExeSchema.safeParse({
      code: '',
      password: 'NewPass123',
      confirmPassword: 'NewPass123',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('確認コードは必須です');
    }
  });

  it('パスワードが7文字のときエラー', () => {
    const result = passwordResetExeSchema.safeParse({
      code: '123456',
      password: 'pass123',
      confirmPassword: 'pass123',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('パスワードは8文字以上で入力してください');
    }
  });

  it('パスワードが一致しないときエラー', () => {
    const result = passwordResetExeSchema.safeParse({
      code: '123456',
      password: 'NewPass123',
      confirmPassword: 'DifferentPass123',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const confirmError = result.error.issues.find((i) => i.path.includes('confirmPassword'));
      expect(confirmError?.message).toBe('パスワードが一致しません');
    }
  });
});

describe('userEditSchema', () => {
  it('有効な値（パスワード変更なし）でパースできる', () => {
    const result = userEditSchema.safeParse({
      name: 'テスト',
      email: 'test@example.com',
    });
    expect(result.success).toBe(true);
  });

  it('新しいパスワードと現在のパスワード両方入力でパースできる', () => {
    const result = userEditSchema.safeParse({
      name: 'テスト',
      email: 'test@example.com',
      password: 'NewPass123',
      currentPassword: 'OldPass123',
    });
    expect(result.success).toBe(true);
  });

  it('新しいパスワードのみ入力で現在のパスワード未入力のときエラー', () => {
    const result = userEditSchema.safeParse({
      name: 'テスト',
      email: 'test@example.com',
      password: 'NewPass123',
      currentPassword: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const currentPasswordError = result.error.issues.find((i) =>
        i.path.includes('currentPassword')
      );
      expect(currentPasswordError?.message).toBe(
        '新しいパスワードを設定する場合は現在のパスワードを入力してください'
      );
    }
  });

  it('名前が空のときエラー', () => {
    const result = userEditSchema.safeParse({
      name: '',
      email: 'test@example.com',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('名前は必須です');
    }
  });

  it('名前が51文字のときエラー', () => {
    const result = userEditSchema.safeParse({
      name: 'a'.repeat(51),
      email: 'test@example.com',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('名前は50文字以内で入力してください');
    }
  });
});
