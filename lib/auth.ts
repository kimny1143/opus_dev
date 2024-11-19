// lib/auth.ts

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_EXPIRES_IN = '1h';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

interface TokenPayload {
  userId: number;
  email: string;
  [key: string]: any;
}

export const generateAccessToken = (payload: TokenPayload) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET が設定されていません');
  }

  return jwt.sign(payload, secret, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
};

export const generateRefreshToken = (payload: TokenPayload) => {
  const refreshSecret = process.env.JWT_REFRESH_SECRET;

  if (!refreshSecret) {
    throw new Error('JWT_REFRESH_SECRET が設定されていません');
  }

  return jwt.sign(payload, refreshSecret, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
};

export const generateTokens = (user: any) => {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return { accessToken, refreshToken };
};

export const verifyToken = (token: string): Promise<TokenPayload> => {
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
        resolve(decoded as TokenPayload);
      }
    });
  });
};

export const verifyRefreshToken = (token: string): Promise<TokenPayload> => {
  return new Promise((resolve, reject) => {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
      reject(new Error('JWT_REFRESH_SECRETが設定されていません'));
      return;
    }

    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded as TokenPayload);
      }
    });
  });
};

export const getToken = (req: NextRequest): string | undefined => {
  const token = req.cookies.get('auth_token')?.value;
  return token;
};

export const getRefreshToken = (req: NextRequest): string | undefined => {
  const token = req.cookies.get('refresh_token')?.value;
  return token;
};

export const setTokens = (res: NextResponse, accessToken: string, refreshToken: string) => {
  res.cookies.set('auth_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600 // 1時間
  });

  res.cookies.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 3600 // 7日間
  });
};