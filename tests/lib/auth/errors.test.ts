import { describe, it, expect } from 'vitest';
import { toJapaneseAuthError } from '@/lib/auth/errors';

describe('toJapaneseAuthError', () => {
  it('Error でないとき fallback を返す', () => {
    expect(toJapaneseAuthError('some string')).toBe('エラーが発生しました');
  });

  it('メッセージが空の Error のとき fallback を返す', () => {
    expect(toJapaneseAuthError(new Error(''))).toBe('エラーが発生しました');
  });

  it('カスタム fallback を返す', () => {
    expect(toJapaneseAuthError(new Error(''), 'カスタムエラー')).toBe('カスタムエラー');
  });

  it('Password not long enough → パスワードは8文字以上', () => {
    expect(toJapaneseAuthError(new Error('Password not long enough'))).toBe(
      'パスワードは8文字以上で入力してください'
    );
  });

  it('Password must have uppercase characters → 大文字を含めてください', () => {
    expect(toJapaneseAuthError(new Error('Password must have uppercase characters'))).toBe(
      'パスワードに大文字を含めてください'
    );
  });

  it('Password must have lowercase characters → 小文字を含めてください', () => {
    expect(toJapaneseAuthError(new Error('Password must have lowercase characters'))).toBe(
      'パスワードに小文字を含めてください'
    );
  });

  it('Password must have numeric characters → 数字を含めてください', () => {
    expect(toJapaneseAuthError(new Error('Password must have numeric characters'))).toBe(
      'パスワードに数字を含めてください'
    );
  });

  it('Password must have symbol characters → 記号を含めてください', () => {
    expect(toJapaneseAuthError(new Error('Password must have symbol characters'))).toBe(
      'パスワードに記号（特殊文字）を含めてください'
    );
  });

  it('Password did not conform with policy → ポリシーを満たしていません', () => {
    expect(toJapaneseAuthError(new Error('Password did not conform with policy'))).toBe(
      'パスワードがポリシーを満たしていません'
    );
  });

  it('UsernameExistsException → すでに登録されています', () => {
    expect(toJapaneseAuthError(new Error('UsernameExistsException'))).toBe(
      'このメールアドレスはすでに登録されています'
    );
  });

  it('already exists → すでに登録されています', () => {
    expect(toJapaneseAuthError(new Error('User already exists'))).toBe(
      'このメールアドレスはすでに登録されています'
    );
  });

  it('UserNotConfirmedException → メールアドレスの確認が完了していません', () => {
    expect(toJapaneseAuthError(new Error('UserNotConfirmedException'))).toBe(
      'メールアドレスの確認が完了していません'
    );
  });

  it('NotAuthorizedException → メールアドレスまたはパスワードが正しくありません', () => {
    expect(toJapaneseAuthError(new Error('NotAuthorizedException'))).toBe(
      'メールアドレスまたはパスワードが正しくありません'
    );
  });

  it('Incorrect username or password → メールアドレスまたはパスワードが正しくありません', () => {
    expect(toJapaneseAuthError(new Error('Incorrect username or password'))).toBe(
      'メールアドレスまたはパスワードが正しくありません'
    );
  });

  it('UserNotFoundException → アカウントが見つかりません', () => {
    expect(toJapaneseAuthError(new Error('UserNotFoundException'))).toBe(
      'アカウントが見つかりません'
    );
  });

  it('CodeMismatchException → 確認コードが正しくありません', () => {
    expect(toJapaneseAuthError(new Error('CodeMismatchException'))).toBe(
      '確認コードが正しくありません'
    );
  });

  it('ExpiredCodeException → 確認コードの有効期限が切れています', () => {
    expect(toJapaneseAuthError(new Error('ExpiredCodeException'))).toBe(
      '確認コードの有効期限が切れています'
    );
  });

  it('LimitExceededException → 試行回数が上限に達しました', () => {
    expect(toJapaneseAuthError(new Error('LimitExceededException'))).toBe(
      '試行回数が上限に達しました。しばらくしてから再試行してください'
    );
  });

  it('TooManyRequestsException → リクエストが多すぎます', () => {
    expect(toJapaneseAuthError(new Error('TooManyRequestsException'))).toBe(
      'リクエストが多すぎます。しばらくしてから再試行してください'
    );
  });

  it('InvalidParameterException → 入力内容に誤りがあります', () => {
    expect(toJapaneseAuthError(new Error('InvalidParameterException'))).toBe(
      '入力内容に誤りがあります'
    );
  });

  it('NetworkError → ネットワークエラー', () => {
    expect(toJapaneseAuthError(new Error('NetworkError occurred'))).toBe(
      'ネットワークエラーが発生しました。接続を確認してください'
    );
  });

  it('未知のエラーメッセージのとき fallback を返す', () => {
    expect(toJapaneseAuthError(new Error('Some unknown error'))).toBe('エラーが発生しました');
  });
});
