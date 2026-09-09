import { randomUUID } from "node:crypto";

const TOKEN_TTL_MS = 10 * 60_000;

type DownloadRecord = {
  url: string;
  filename: string;
  expiresAt: number;
};

const records = new Map<string, DownloadRecord>();

function purgeExpired(now = Date.now()) {
  records.forEach((record, token) => {
    if (record.expiresAt <= now) records.delete(token);
  });
}

export function createDownloadToken(url: string, filename: string, now = Date.now()) {
  purgeExpired(now);
  const token = randomUUID();
  records.set(token, { url, filename, expiresAt: now + TOKEN_TTL_MS });
  return token;
}

export function consumeDownloadToken(token: string, now = Date.now()) {
  purgeExpired(now);
  const record = records.get(token);
  if (!record || record.expiresAt <= now) return null;
  records.delete(token);
  return record;
}

export const DOWNLOAD_TOKEN_TTL_MS = TOKEN_TTL_MS;
