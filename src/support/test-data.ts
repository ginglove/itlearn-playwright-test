import { randomBytes, randomInt } from 'node:crypto';

export const SANDBOX_BASE_URL = 'https://training-car.netlify.app';
export const SANDBOX_HOSTNAME = 'car-training.netlify.app';
export const DEFAULT_SANDBOX_OTP = '888888';

export interface CustomerAccount {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  otp: string;
}

export function createUniqueCustomerAccount(): CustomerAccount {
  const timestamp = Date.now().toString(36);
  const randomToken = randomBytes(4).toString('hex');
  const suffix = `${timestamp}${randomToken}`;
  const phone = `09${randomInt(10_000_000, 100_000_000)}`;

  return {
    fullName: `Playwright Customer ${randomToken.slice(0, 6)}`,
    email: `playwright.${suffix}@gmail.com`,
    phone,
    password: `Pw!${suffix}a9`,
    otp: process.env.SANDBOX_OTP?.trim() || DEFAULT_SANDBOX_OTP,
  };
}

export function isDepositSubmissionConfirmed(): boolean {
  return process.env.CONFIRM_SANDBOX_DEPOSIT === 'true';
}

export function assertDepositTargetIsApproved(baseURL: string): void {
  const parsed = new URL(baseURL);
  if (parsed.protocol !== 'https:' || parsed.hostname !== SANDBOX_HOSTNAME) {
    throw new Error(
      `Deposit submission is blocked for unapproved target ${parsed.origin}.`,
    );
  }
}
