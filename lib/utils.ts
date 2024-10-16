 // Start of Selection
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import validator from "validator"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// フォーム入力のバリデーションユーティリティ
export function isValidEmail(email: string): boolean {
  return validator.isEmail(email)
}

export function isValidPhoneNumber(phone: string): boolean {
  return validator.isMobilePhone(phone, 'ja-JP')
}

export function isRequired(value: string): boolean {
  return value.trim().length > 0
}