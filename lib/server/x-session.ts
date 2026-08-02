import crypto from 'crypto';

type XSessionPayload = {
  username: string;
  xUserId: string;
  xName: string;
  expiresAt: number;
};

/**
 * AES-256-GCM でペイロードを暗号化してBase64url文字列を返す。
 * 環境変数 X_SESSION_SECRET（32バイト以上）を鍵材料として使用する。
 */
export function encryptXSession(payload: XSessionPayload): string {
  const key = getXSessionSecret();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const plaintext = JSON.stringify(payload);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64url');
}

/**
 * encryptXSession で暗号化したトークンを復号して返す。
 * 期限切れまたは復号失敗の場合は null を返す。
 */
export function decryptXSession(token: string): XSessionPayload | null {
  try {
    const key = getXSessionSecret();
    const buf = Buffer.from(token, 'base64url');
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const encrypted = buf.subarray(28);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    const plaintext = decipher.update(encrypted).toString('utf8') + decipher.final('utf8');
    const payload: XSessionPayload = JSON.parse(plaintext);
    if (payload.expiresAt < Date.now()) return null;
    return payload;
  } catch (e: unknown) {
    console.error('decryptXSession: 復号に失敗しました:', e instanceof Error ? e.message : String(e));
    return null;
  }
}

function getXSessionSecret(): Buffer {
  const secret = process.env.X_SESSION_SECRET;
  if (!secret) throw new Error('X_SESSION_SECRET 環境変数が設定されていません');
  return crypto.scryptSync(secret, 'x-session-salt', 32);
}
