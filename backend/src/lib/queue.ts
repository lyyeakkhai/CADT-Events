import { Queue, Worker, QueueEvents } from 'bullmq';
import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Shared Redis connection for BullMQ
export const redisConnection = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null, // Required by BullMQ
});

/**
 * Creates a BullMQ Queue
 * @param queueName - The name of the queue
 * @returns Queue instance
 */
export function createQueue(queueName: string) {
  return new Queue(queueName, { connection: redisConnection as any });
}

/**
 * Creates a BullMQ Worker
 * @param queueName - The name of the queue
 * @param processor - The async function to process jobs
 * @returns Worker instance
 */
export function createWorker(
  queueName: string,
  processor: (job: any) => Promise<any>
) {
  const worker = new Worker(queueName, processor, { connection: redisConnection as any });

  worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed successfully in queue ${queueName}`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed in queue ${queueName}:`, err);
  });

  return worker;
}

/**
 * Creates a BullMQ QueueEvents listener for tracking global events
 * @param queueName - The name of the queue
 * @returns QueueEvents instance
 */
export function createQueueEvents(queueName: string) {
  return new QueueEvents(queueName, { connection: redisConnection as any });
}
