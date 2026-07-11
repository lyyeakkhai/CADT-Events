async function main() {
  const events = [
    {
      title: 'Future of AI in Web Development',
      description: 'Learn how generative AI tools and agents are reshaping the future of software engineering and web development.',
      startTimestamp: '2026-08-15T14:00:00Z',
      endTimestamp: '2026-08-15T16:00:00Z',
      location: 'Innovation Center',
      capacity: 100,
      coverImageUrl: 'https://res.cloudinary.com/dzzxjsyhw/image/upload/v1783667258/events/lm03sexennl424zbc4ol.jpg',
      eventType: 'workshop',
      creditValue: 0,
      isFeatured: true,
      status: 'PUBLISHED'
    },
    {
      title: 'Cybersecurity in the Age of Quantum Computing',
      description: 'An in-depth look at how quantum computing threatens traditional cryptography and what organizations can do to prepare.',
      startTimestamp: '2026-09-10T09:30:00Z',
      endTimestamp: '2026-09-10T12:00:00Z',
      location: 'A204, IDT',
      capacity: 150,
      coverImageUrl: 'https://res.cloudinary.com/dzzxjsyhw/image/upload/v1783667258/events/lm03sexennl424zbc4ol.jpg',
      eventType: 'seminar',
      creditValue: 0,
      isFeatured: true,
      status: 'PUBLISHED'
    },
    {
      title: 'Building Scalable Web3 DApps',
      description: 'A hands-on coding session to build your first decentralized application on Ethereum using React and Solidity.',
      startTimestamp: '2026-10-01T13:00:00Z',
      endTimestamp: '2026-10-01T17:00:00Z',
      location: 'Design Lab 4',
      capacity: 50,
      coverImageUrl: 'https://res.cloudinary.com/dzzxjsyhw/image/upload/v1783667258/events/lm03sexennl424zbc4ol.jpg',
      eventType: 'other',
      creditValue: 0,
      isFeatured: false,
      status: 'PUBLISHED'
    }
  ];

  for (const ev of events) {
    console.log(`Sending API request to create: ${ev.title}`);
    const res = await fetch('http://localhost:4000/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ev)
    });
    
    if (res.ok) {
      const data = await res.json();
      console.log(`Created successfully via API! ID: ${data.data.id}`);
    } else {
      const errorText = await res.text();
      console.error(`Failed to create ${ev.title}. Status: ${res.status}. Error: ${errorText}`);
    }
  }
}

main().catch(console.error);
