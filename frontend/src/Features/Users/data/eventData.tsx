export interface AcademicEvent {
  id: number;
  title: string;
  speaker: string;
  date: string;
  time: string;
  venue: string;
  dept: 'All' | 'Computer Science' | 'Software Engineering' | 'Cybersecurity' | 'Digital Media';
  type: 'Workshop' | 'Conference' | 'Exhibition' | 'Seminar' | 'Networking' | 'Hands-on';
  badge: string;
  image: string;
  description: string;
}

export const FIGMA_EVENTS_DATA: AcademicEvent[] = [
  {
    id: 1,
    title: "Seminar Announcement: From Hide to Heal",
    speaker: "Ms. Sotheary Yim",
    date: "Oct 24, 2024",
    time: "09:00 AM",
    venue: "Main Plaza",
    dept: "Software Engineering",
    type: "Workshop",
    badge: "Workshop",
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=600&q=80",
    description: "A deep dive into zero-trust architectures and next-generation threat mitigation strategies."
  },
  {
    id: 2,
    title: "AI Innovation Day 2024",
    speaker: "Dr. Aruna Singh",
    date: "Nov 02, 2024",
    time: "10:30 AM",
    venue: "Auditorium A",
    dept: "Computer Science",
    type: "Conference",
    badge: "Conference",
    image: "https://images.unsplash.com/photo-1591453089816-0fbb971b454c?auto=format&fit=crop&w=600&q=80",
    description: "Exploring the ethics and implementation of Large Language Models in institutional workflows."
  },
  {
    id: 3,
    title: "Digital Media Design Showcase",
    speaker: "Mariya Garcia",
    date: "Nov 15, 2024",
    time: "02:00 PM",
    venue: "Design Lab 4",
    dept: "Digital Media",
    type: "Exhibition",
    badge: "Exhibition",
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=600&q=80",
    description: "An interactive exhibition featuring the capstone projects of our Digital Media and UX Design students."
  },
  {
    id: 4,
    title: "Annual Tech Career Fair",
    speaker: "Various Industry Leads",
    date: "Dec 05, 2024",
    time: "10:00 AM",
    venue: "Main Plaza",
    dept: "All",
    type: "Networking",
    badge: "Networking",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80",
    description: "Connect with over 50 leading technology firms and startups for internship and career opportunities."
  },
  {
    id: 5,
    title: "Big Data & Cloud Analytics",
    speaker: "Cloud Architecture Core",
    date: "Dec 12, 2024",
    time: "01:00 PM",
    venue: "Cloud Lab 2",
    dept: "Computer Science",
    type: "Hands-on",
    badge: "Hands-on",
    image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=600&q=80",
    description: "Practical workshop on processing large-scale datasets using AWS and Google Cloud systems."
  },
  {
    id: 6,
    title: "Tech Leadership for 2025",
    speaker: "Academic Dean Panel",
    date: "Jan 08, 2025",
    time: "11:00 AM",
    venue: "Boardroom 101",
    dept: "Software Engineering",
    type: "Seminar",
    badge: "Seminar",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80",
    description: "A seminar for aspiring team leads and project managers on navigating shifting digital trends."
  }
];