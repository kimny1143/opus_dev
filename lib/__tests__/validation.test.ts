import { isValidDate, isIssueDateValid, isDueDateValid, isPositiveNumber } from '../validation';

// jest-domをインポート
import '@testing-library/jest-dom';

describe('Validation Functions', () => {
  describe('isValidDate', () => {
    test('有効な日付フォーマット(YYYY-MM-DD)の場合はtrueを返す', () => {
      expect(isValidDate('2023-10-01')).toBe(true);
      expect(isValidDate('2024-02-29')).toBe(true); // うるう年
      expect(isValidDate('2023-12-31')).toBe(true);
      expect(isValidDate('2023-02-28')).toBe(true);
      expect(isValidDate('2023-04-30')).toBe(true);
    });

    test('無効な日付フォーマットの場合はfalseを返す', () => {
      expect(isValidDate('invalid-date')).toBe(false);
      expect(isValidDate('2023/10/01')).toBe(false); // スラッシュ区切りは無効
      expect(isValidDate('2023-13-01')).toBe(false); // 存在しない月
      expect(isValidDate('2023-04-31')).toBe(false); // 存在しない日
      expect(isValidDate('2023-1-1')).toBe(false); // 月日が1桁
      expect(isValidDate('23-10-01')).toBe(false); // 年が2桁
      expect(isValidDate('')).toBe(false);
      expect(isValidDate('2023-02-30')).toBe(false); // 2月の無効な日付
      expect(isValidDate('2023-06-31')).toBe(false); // 30日までの月の無効な日付
      expect(isValidDate('2023-00-01')).toBe(false); // 0月
      expect(isValidDate('2023-01-00')).toBe(false); // 0日
      expect(isValidDate('0000-01-01')).toBe(false); // 0年
    });
  });

  describe('isIssueDateValid', () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastYear = new Date(today);
    lastYear.setFullYear(lastYear.getFullYear() - 1);

    test('過去または今日の日付の場合はtrueを返す', () => {
      expect(isIssueDateValid(yesterday.toISOString().split('T')[0])).toBe(true);
      expect(isIssueDateValid(today.toISOString().split('T')[0])).toBe(true);
      expect(isIssueDateValid(lastMonth.toISOString().split('T')[0])).toBe(true);
      expect(isIssueDateValid(lastYear.toISOString().split('T')[0])).toBe(true);
      expect(isIssueDateValid('2023-01-01')).toBe(true);
    });

    test('未来の日付の場合はfalseを返す', () => {
      expect(isIssueDateValid(tomorrow.toISOString().split('T')[0])).toBe(false);
      expect(isIssueDateValid('2100-01-01')).toBe(false);
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      expect(isIssueDateValid(nextMonth.toISOString().split('T')[0])).toBe(false);
    });

    test('無効な日付形式の場合はfalseを返す', () => {
      expect(isIssueDateValid('invalid-date')).toBe(false);
      expect(isIssueDateValid('')).toBe(false);
    });
  });

  describe('isDueDateValid', () => {
    test('支払期限が発行日より後の場合はtrueを返す', () => {
      expect(isDueDateValid('2023-01-01', '2023-01-02')).toBe(true);
      expect(isDueDateValid('2023-01-01', '2024-01-01')).toBe(true);
      expect(isDueDateValid('2023-12-31', '2024-01-01')).toBe(true);
      expect(isDueDateValid('2023-01-01', '2023-02-01')).toBe(true);
      expect(isDueDateValid('2023-12-31', '2024-12-31')).toBe(true);
    });

    test('支払期限が発行日と同じか前の場合はfalseを返す', () => {
      expect(isDueDateValid('2023-01-01', '2023-01-01')).toBe(false);
      expect(isDueDateValid('2023-01-02', '2023-01-01')).toBe(false);
      expect(isDueDateValid('2024-01-01', '2023-12-31')).toBe(false);
      expect(isDueDateValid('2023-12-31', '2023-12-30')).toBe(false);
      expect(isDueDateValid('2024-01-01', '2023-01-01')).toBe(false);
    });

    test('無効な日付形式の場合はfalseを返す', () => {
      expect(isDueDateValid('invalid-date', '2023-01-01')).toBe(false);
      expect(isDueDateValid('2023-01-01', 'invalid-date')).toBe(false);
      expect(isDueDateValid('', '')).toBe(false);
    });
  });

  describe('isPositiveNumber', () => {
    test('正の数の場合はtrueを返す', () => {
      expect(isPositiveNumber(1)).toBe(true);
      expect(isPositiveNumber(0.1)).toBe(true);
      expect(isPositiveNumber(1000000)).toBe(true);
      expect(isPositiveNumber(Number.MAX_SAFE_INTEGER)).toBe(true);
      expect(isPositiveNumber(Math.PI)).toBe(true);
    });

    test('0または負の数の場合はfalseを返す', () => {
      expect(isPositiveNumber(0)).toBe(false);
      expect(isPositiveNumber(-1)).toBe(false);
      expect(isPositiveNumber(-0.1)).toBe(false);
      expect(isPositiveNumber(-1000000)).toBe(false);
      expect(isPositiveNumber(Number.MIN_SAFE_INTEGER)).toBe(false);
    });

    test('数値以外の入力の場合はfalseを返す', () => {
      expect(isPositiveNumber(NaN)).toBe(false);
      expect(isPositiveNumber(Infinity)).toBe(false);
      expect(isPositiveNumber(-Infinity)).toBe(false);
    });
  });
});
