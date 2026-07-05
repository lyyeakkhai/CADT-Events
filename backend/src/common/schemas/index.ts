import { z } from 'zod';

// ── Events ─────────────────────────────────────────────────────────────────
export const CreateEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  startTimestamp: z.string().datetime({ message: 'Invalid start date/time' }),
  endTimestamp: z.string().datetime({ message: 'Invalid end date/time' }),
  location: z.string().min(2, 'Location is required'),
  capacity: z.number().int().positive().optional(),
  coverImageUrl: z.string().url().optional().or(z.literal('')),
  eventType: z.string().optional(),
  creditValue: z.number().int().min(0).default(0),
  isFeatured: z.boolean().default(false),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
});

export type CreateEventInput = z.infer<typeof CreateEventSchema>;

export const UpdateEventSchema = CreateEventSchema.partial();
export type UpdateEventInput = z.infer<typeof UpdateEventSchema>;

// ── Bookings ────────────────────────────────────────────────────────────────
export const CreateBookingSchema = z.object({
  eventId: z.string().uuid('Invalid event ID'),
});

export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;
