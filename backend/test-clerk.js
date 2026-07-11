require('dotenv').config();
const { clerkClient } = require('@clerk/express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log('clerkClient:', !!clerkClient);
  try {
    const userId = 'user_2k7xQzX...'; // Just trying to see if clerkClient is an object that has users
    console.log('users object exists?', !!clerkClient?.users);
  } catch (e) {
    console.error(e);
  }
}
run();
