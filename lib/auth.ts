// lib/auth.ts

import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export const verifyToken = (token: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      reject(new Error('JWT_SECRETが設定されていません'));
      return;
    }

    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
};

export const getToken = (req: NextRequest): string | undefined => {
  const cookieHeader = req.headers.get('cookie');
  if (!cookieHeader) return undefined;

  const cookies = Object.fromEntries(
    cookieHeader.split('; ').map((v) => v.split('=').map(decodeURIComponent))
  );
  return cookies['auth_token'];
};