import { z } from 'zod';

export const agentSchema = z.object({
  id: z.string(),
  name: z.string(),
  activeLeadCount: z.number(),
});
export type Agent = z.infer<typeof agentSchema>;

export const listingSchema = z.object({
  id: z.string(),
  address: z.string(),
  price: z.number(),
  status: z.enum(['active', 'pending', 'closed']),
  beds: z.number(),
  sqft: z.number(),
  agentId: z.string(),
  photos: z.array(z.string()),
});
export type Listing = z.infer<typeof listingSchema>;

export const leadSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  listingId: z.string().optional(),
  status: z.enum(['new', 'contacted', 'showing', 'offer', 'closed', 'lost']),
  assignedAgentId: z.string().optional(),
  createdAt: z.string(),
  lastActivityAt: z.string(),
  lostReason: z.string().optional(),
});
export type Lead = z.infer<typeof leadSchema>;

export const showingSchema = z.object({
  id: z.string(),
  leadId: z.string(),
  listingId: z.string(),
  scheduledTime: z.string(),
  status: z.enum(['confirmed', 'completed', 'cancelled']),
});
export type Showing = z.infer<typeof showingSchema>;
