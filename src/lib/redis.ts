import { Redis } from '@upstash/redis';
import { config } from './config';

export const redis = new Redis({
  url: config.REDIS_URL || process.env.UPSTASH_REDIS_URL || '',
  token: process.env.UPSTASH_REDIS_TOKEN || '',
});
