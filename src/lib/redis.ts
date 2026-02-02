// src/lib/redis.ts
// Mock Redis implementation for when ioredis is not available

interface RedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, expiryMode?: string, time?: number | string): Promise<'OK' | null>;
  del(key: string): Promise<number>;
  exists(key: string): Promise<number>;
  quit(): Promise<void>;
}

// Create a mock Redis client that stores data in memory
class MockRedis implements RedisClient {
  private store: Map<string, string> = new Map();

  async get(key: string): Promise<string | null> {
    return this.store.get(key) || null;
  }

  async set(key: string, value: string, expiryMode?: string, time?: number | string): Promise<'OK' | null> {
    this.store.set(key, value);
    return 'OK';
  }

  async del(key: string): Promise<number> {
    const existed = this.store.has(key);
    this.store.delete(key);
    return existed ? 1 : 0;
  }

  async exists(key: string): Promise<number> {
    return this.store.has(key) ? 1 : 0;
  }

  async quit(): Promise<void> {
    // No-op for mock
  }
}

if (!process.env.REDIS_URL) {
  console.warn('Redis not configured, using fallback storage')
}

let redis: RedisClient | null = null;

if (process.env.REDIS_URL) {
  try {
    // Dynamically import ioredis if available
    const RedisModule = require('ioredis');
    const Redis = RedisModule.default || RedisModule;
    redis = new Redis(process.env.REDIS_URL, {
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
    });
  } catch (error) {
    console.warn('ioredis not available, using mock Redis implementation');
    redis = new MockRedis();
  }
} else {
  redis = new MockRedis();
}

export default redis