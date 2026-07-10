import { Webhook } from 'svix';
import { Router } from 'express';
import bodyParser from 'body-parser';
import { prisma } from '@/lib/prisma';
import { clerkClient } from '@clerk/express';

export const clerkWebhookRouter = Router();

clerkWebhookRouter.post('/', bodyParser.raw({ type: 'application/json' }), async (req: any, res: any) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SECRET in environment variables');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  const svix_id = req.headers['svix-id'] as string;
  const svix_timestamp = req.headers['svix-timestamp'] as string;
  const svix_signature = req.headers['svix-signature'] as string;

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: 'Error occurred -- no svix headers' });
  }

  const payload = req.body;
  const body = payload.toString('utf8');

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: any;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return res.status(400).json({ error: 'Error verifying webhook' });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const email = evt.data.email_addresses?.[0]?.email_address;
    const name = `${evt.data.first_name || ''} ${evt.data.last_name || ''}`.trim();
    
    // Explicitly define the admin email whitelist
    let role = 'STUDENT';
    const adminEmails = ['admin123@stuff.cadt.edu.kh'];
    
    if (email && adminEmails.includes(email.toLowerCase())) {
      role = 'ADMIN';
    }

    try {
      await prisma.userAccount.upsert({
        where: { email: email },
        update: {
          user_id: id,
          full_name: name || 'User',
          role: 'student',
        },
        create: {
          user_id: id,
          email: email,
          full_name: name || 'User',
          role: 'student',
          password_hash: 'managed-by-clerk',
        }
      });
      
      // Update Clerk so the frontend immediately knows their role without a DB query
      await clerkClient.users.updateUserMetadata(id, {
        publicMetadata: {
          role: role,
        },
      });
      
      console.log(`User ${id} processed successfully as ${role}.`);
    } catch (dbErr) {
      console.error('Error syncing user to DB or Clerk:', dbErr);
      return res.status(500).json({ error: 'Database or Clerk error' });
    }
  }

  return res.status(200).json({ success: true });
});
