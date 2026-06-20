/**
 * ファイルをBase64文字列に変換する
 */
export function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (event) => reject(event);
    reader.readAsDataURL(file);
  });
}
