import crypto from 'crypto-js';

const ENCRYPTION_KEY = 'S4NT4_S3CR3T_K3Y_T0_ENCRYPT_DATA';

export function encryptData(data: unknown): string {
  const jsonString = JSON.stringify(data);
  return crypto.AES.encrypt(jsonString, ENCRYPTION_KEY).toString();
}

export function generateScoreChecksum(playerName: string, score: number): {
  checksum: string;
  salt: number;
} {
  const salt = Math.floor(Math.random() * 9) + 1;
  const data = `${playerName}-${score}-${salt}`;
  const checksum = crypto.SHA256(data).toString();
  
  return { checksum, salt };
}