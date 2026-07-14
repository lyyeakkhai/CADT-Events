import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding tech events...');

  const techEvents = [
    {
      event_id: crypto.randomUUID().substring(0, 50),
      event_title: 'Future of AI in Web Development',
      description: 'Learn how generative AI tools and agents are reshaping the future of software engineering and web development.',
      event_type: 'workshop' as const,
      status: 'published' as const,
      start_time: new Date('2026-08-15T14:00:00Z'),
      end_time: new Date('2026-08-15T16:00:00Z'),
      cover_image_url: 'https://res.cloudinary.com/dzzxjsyhw/image/upload/v1783667258/events/lm03sexennl424zbc4ol.jpg', // Reusing available cover image
      badge: 'Hot Topic',
      is_featured: true,
      capacity: 100,
      location: 'Innovation Center',
    },
    {
      event_id: crypto.randomUUID().substring(0, 50),
      event_title: 'Cybersecurity in the Age of Quantum Computing',
      description: 'An in-depth look at how quantum computing threatens traditional cryptography and what organizations can do to prepare.',
      event_type: 'seminar' as const,
      status: 'published' as const,
      start_time: new Date('2026-09-10T09:30:00Z'),
      end_time: new Date('2026-09-10T12:00:00Z'),
      cover_image_url: 'https://res.cloudinary.com/dzzxjsyhw/image/upload/v1783667258/events/lm03sexennl424zbc4ol.jpg',
      badge: 'Trending',
      is_featured: true,
      capacity: 150,
      location: 'A204, IDT',
    },
    {
      event_id: crypto.randomUUID().substring(0, 50),
      event_title: 'Building Scalable Web3 DApps',
      description: 'A hands-on coding session to build your first decentralized application on Ethereum using React and Solidity.',
      event_type: 'other' as const,
      status: 'published' as const,
      start_time: new Date('2026-10-01T13:00:00Z'),
      end_time: new Date('2026-10-01T17:00:00Z'),
      cover_image_url: 'https://res.cloudinary.com/dzzxjsyhw/image/upload/v1783667258/events/lm03sexennl424zbc4ol.jpg',
      badge: 'Hands-on',
      is_featured: false,
      capacity: 50,
      location: 'Design Lab 4',
    }
  ];

  for (const event of techEvents) {
    await prisma.event.create({
      data: event
    });
    console.log(`Created event: ${event.event_title}`);
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
