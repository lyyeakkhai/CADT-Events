import scholarship from '../../../assets/images/scholarship.jpg';
import ict from '../../../assets/images/ict.jpg';
import drone from '../../../assets/images/drone.jpg';
import hidetoheal from '../../../assets/images/hidetoheal.jpg';
import plugandplay from '../../../assets/images/plugandplay.jpg';
import digitaltransform from '../../../assets/images/digitaltransform.jpg';
export interface AcademicEvent {
  id: number;
  title: string;
  speaker: string;
  date: string;
  time: string;
  venue: string;
  dept: 'All' | 'Computer Science' | 'Software Engineering' | 'Cybersecurity' | 'Digital Business' | 'Telecommunication & Networking';
  type: 'Workshop' | 'Conference' | 'Exhibition' | 'Seminar' | 'Networking' | 'Hands-on';
  badge: string;
  image: string;
  description: string;
  isFeatured?: boolean;
  _apiId?: string;
  seatsLeft?: number; // demo for home cards
}

export const FIGMA_EVENTS_DATA: AcademicEvent[] = [
  {
    id: 1,
    title: "From Hide to Heal",
    speaker: "Ms. Sotheary Yim",
    date: "Oct 24, 2026",
    time: "09:00 AM",
    venue: "Innovation Center",
    dept: "Software Engineering",
    type: "Seminar",
    badge: "Seminar",
    image: hidetoheal,
    isFeatured: true,
    description: "Exploring personal and organizational healing in the digital age through case studies and reflective practices.",
    seatsLeft: 18
  },
  {
    id: 2,
    title: "The important of ICT",
    speaker: "Mr. So tominaga",
    date: "Nov 02, 2026",
    time: "10:30 AM",
    venue: "A204,IDT",
    dept: "Computer Science",
    type: "Conference",
    badge: "Conference",
    isFeatured: false,
    image: ict,
    description: "Exploring the ethics and implementation of Large Language Models in institutional workflows.",
    seatsLeft: 45
  },
  {
    id: 3,
    title: "Drone contest",
    speaker: "Mariya Garcia",
    date: "Nov 15, 2026",
    time: "02:00 PM",
    venue: "Design Lab 4",
    dept: "Telecommunication & Networking",
    type: "Exhibition",
    badge: "Exhibition",
    image: drone,
     isFeatured: false,
    description: "An interactive exhibition featuring the capstone projects of our Digital Media and UX Design students.",
    seatsLeft: 120
  },
  {
    id: 4,
    title: "Plug & Play",
    speaker: "Ms. Leng Pisey",
    date: "Dec 05, 2026",
    time: "10:00 AM",
    venue: "Main Plaza",
    dept: "All",
    type: "Networking",
    badge: "Networking",
    image: plugandplay,
    isFeatured: true,
    description: "Connect with over 50 leading technology firms and startups for internship and career opportunities.",
    seatsLeft: 32
  },
  {
    id: 5,
    title: "Digital Transformation",
    speaker: "Prof. Guido Gianasso",
    date: "Dec 12, 2026",
    time: "01:00 PM",
    venue: "Cloud Lab 2",
    dept: "Computer Science",
    type: "Hands-on",
    badge: "Hands-on",
    image: digitaltransform,
    isFeatured: true,
    description: "Practical workshop on processing large-scale datasets using AWS and Google Cloud systems.",
    seatsLeft: 12
  },
  {
    id: 6,
    title: "Scholarship to China 2025",
    speaker: "Academic Dean Panel",
    date: "Jan 08, 2027",
    time: "11:00 AM",
    venue: "Boardroom 101",
    dept: "Software Engineering",
    type: "Seminar",
    badge: "Seminar",
    image:scholarship,
     isFeatured: false,
    description: "Information session on fully-funded scholarship opportunities for CADT students at partner universities in China.",
    seatsLeft: 25
  }
];