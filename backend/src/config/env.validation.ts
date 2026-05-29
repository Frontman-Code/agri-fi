import { ConfigFactory } from '@nestjs/config';

export const validateEnvironment: ConfigFactory = () => {
  const jwtSecret = process.env.JWT_SECRET?.trim();

  if (!jwtSecret) {
    throw new Error('JWT_SECRET is required for backend startup.');
  }

  return {
    JWT_SECRET: jwtSecret,
  };
};
