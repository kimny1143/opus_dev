import { prisma } from '@/lib/prisma';

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

// jest.setup.ts
process.env.JWT_SECRET = 'your-test-secret-key';
process.env.JWT_REFRESH_SECRET = 'your-test-refresh-secret-key';
process.env.ACCESS_TOKEN_EXPIRES_IN = '1h';
process.env.REFRESH_TOKEN_EXPIRES_IN = '7d';