import { clerkClient } from "@clerk/express";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from the backend root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function syncUsers() {
  console.log("Fetching users from Clerk API...");
  try {
    const response = await clerkClient.users.getUserList();
    const users = response.data;
    
    console.log(`Found ${users.length} users in Clerk.\n`);

    for (const clerkUser of users) {
      const email = clerkUser.emailAddresses[0]?.emailAddress;
      if (!email) {
        console.log(`Skipping user ${clerkUser.id} because they have no email.`);
        continue;
      }
      
      const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ').trim() || "CADT User";
      
      console.log(`Syncing user: ${email} (ID: ${clerkUser.id})`);
      
      // 1. Sync to UserAccount table (used for booking events)
      await prisma.userAccount.upsert({
        where: { user_id: clerkUser.id },
        update: {
          full_name: name,
          email: email,
        },
        create: {
          user_id: clerkUser.id,
          email: email,
          full_name: name,
          role: 'student',
          password_hash: 'managed-by-clerk',
        }
      });
      console.log(`  -> Saved to UserAccount table.`);
      
      // 2. Sync to Admin table if they have the ADMIN role in Clerk
      if (clerkUser.publicMetadata?.role === 'ADMIN') {
         await prisma.admin.upsert({
           where: { email: email },
           update: { full_name: name },
           create: {
             admin_id: clerkUser.id,
             email: email,
             full_name: name,
             password_hash: 'managed-by-clerk',
             admin_level: 'super_admin'
           }
         });
         console.log(`  -> Saved to Admin table!`);
      }
      console.log('');
    }
    console.log("✅ Successfully synced all Clerk users to Supabase!");
  } catch (error) {
    console.error("❌ Error syncing users:", error);
  } finally {
    await prisma.$disconnect();
  }
}

syncUsers();
