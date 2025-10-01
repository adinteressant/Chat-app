import CryptoJS from 'crypto-js'
export function encryptMessage(message: string): string {
  return CryptoJS.AES.encrypt(message, import.meta.env.VITE_SECRET_KEY).toString();
}

export function decryptMessage(ciphertext: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, import.meta.env.VITE_SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}
