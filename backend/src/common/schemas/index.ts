import { z } from 'zod';

const QuestionSchema = z.object({
  questionText: z.string().min(1),
  questionType: z.enum(['text', 'textarea', 'multiple_choice', 'checkboxes']),
  options: z.array(z.string()).optional(),
  isRequired: z.boolean().default(false),
  orderIndex: z.number().int().default(0),
});

export const CreateEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  // Accept ISO strings from clients (with or without ms / offset)
  startTimestamp: z.string().min(1, 'Start date/time is required'),
  endTimestamp: z.string().min(1, 'End date/time is required'),
  location: z.string().min(2, 'Location is required'),
  capacity: z.number().int().positive().optional(),
  coverImageUrl: z.string().url().optional().or(z.literal('')),
  eventType: z.string().optional(),
  creditValue: z.number().int().min(0).default(0),
  isFeatured: z.boolean().default(false),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
  questions: z.array(QuestionSchema).optional(),
  reminderSchedules: z.array(z.number()).optional(),
});

export type CreateEventInput = z.infer<typeof CreateEventSchema>;

export const UpdateEventSchema = CreateEventSchema.partial();
export type UpdateEventInput = z.infer<typeof UpdateEventSchema>;

// ── Bookings ────────────────────────────────────────────────────────────────
export const CreateBookingSchema = z.object({
  eventId: z.string().uuid('Invalid event ID'),
  // Seat map labels e.g. A1, B10 — optional for capacity-only bookings
  seatLabel: z
    .string()
    .trim()
    .regex(/^[A-Za-z][0-9]{1,2}$/, 'Invalid seat label')
    .transform((s) => s.toUpperCase())
    .optional(),
  answers: z.record(z.string(), z.string()).optional(),
});

export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;
