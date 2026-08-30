export function toJapaneseAuthError(err: unknown, fallback = 'エラーが発生しました'): string {
  const msg = err instanceof Error ? err.message : '';
  if (!msg) return fallback;

  if (msg.includes('Password not long enough')) return 'パスワードは8文字以上で入力してください';
  if (msg.includes('Password must have uppercase characters'))
    return 'パスワードに大文字を含めてください';
  if (msg.includes('Password must have lowercase characters'))
    return 'パスワードに小文字を含めてください';
  if (msg.includes('Password must have numeric characters'))
    return 'パスワードに数字を含めてください';
  if (msg.includes('Password must have symbol characters'))
    return 'パスワードに記号（特殊文字）を含めてください';
  if (msg.includes('Password did not conform with policy'))
    return 'パスワードがポリシーを満たしていません';
  if (msg.includes('UsernameExistsException') || msg.includes('already exists'))
    return 'このメールアドレスはすでに登録されています';
  if (msg.includes('UserNotConfirmedException')) return 'メールアドレスの確認が完了していません';
  if (msg.includes('NotAuthorizedException') || msg.includes('Incorrect username or password'))
    return 'メールアドレスまたはパスワードが正しくありません';
  if (msg.includes('UserNotFoundException') || msg.includes('UserNotFound'))
    return 'アカウントが見つかりません';
  if (msg.includes('CodeMismatchException') || msg.includes('Invalid verification code'))
    return '確認コードが正しくありません';
  if (msg.includes('ExpiredCodeException')) return '確認コードの有効期限が切れています';
  if (msg.includes('LimitExceededException'))
    return '試行回数が上限に達しました。しばらくしてから再試行してください';
  if (msg.includes('TooManyRequestsException') || msg.includes('TooManyFailedAttempts'))
    return 'リクエストが多すぎます。しばらくしてから再試行してください';
  if (msg.includes('InvalidParameterException')) return '入力内容に誤りがあります';
  if (msg.includes('NetworkError') || msg.includes('network'))
    return 'ネットワークエラーが発生しました。接続を確認してください';

  return fallback;
}
