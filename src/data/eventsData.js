import bgEvents from "../assets/events/bg-events.png";
import catCultural from "../assets/events/cat-cultural.png";
import catSports from "../assets/events/cat-sports.png";
import catTechnical from "../assets/events/cat-technical.png";
import evChess from "../assets/events/ev-chess.png";
import evCricket from "../assets/events/ev-cricket.png";
import evDance from "../assets/events/ev-dance.png";
import evDrama from "../assets/events/ev-drama.png";
import evFootball from "../assets/events/ev-football.png";
import evHackathon from "../assets/events/ev-hackathon.png";
import evMusic from "../assets/events/ev-music.png";
import evQuiz from "../assets/events/ev-quiz.png";
import evRobotics from "../assets/events/ev-robotics.png";

export const eventsBackground = bgEvents;

export const categories = [
  {
    slug: 'cultural',
    name: 'Cultural',
    sanskrit: 'संस्कृति',
    tagline: 'The Order of Expression',
    description: 'Dance, music and theatre — stories told through rhythm, voice and stagecraft.',
    image: catCultural,
  },
  {
    slug: 'sports',
    name: 'Sports',
    sanskrit: 'क्षात्र',
    tagline: 'The Order of Valour',
    description: 'Contests of strength, strategy and spirit across field, court and board.',
    image: catSports,
  },
  {
    slug: 'technical',
    name: 'Technical',
    sanskrit: 'प्रज्ञा',
    tagline: 'The Order of Wisdom',
    description: 'Code, circuits and curiosity — where ancient ingenuity meets modern engineering.',
    image: catTechnical,
  },
]

const defaultPassSteps = [
  'Open the Registrations page and sign in with your college email.',
  'Select this event and add your team members (if applicable).',
  'Pay the entry fee via UPI or card — your digital pass is emailed instantly.',
  'Show the QR pass along with your college ID at the venue help desk.',
]

export const events = [
  {
    slug: 'nritya-sangam',
    category: 'cultural',
    name: 'Nritya Sangam',
    summary: 'Group dance face-off spanning classical, folk and contemporary forms.',
    description:
      'Nritya Sangam brings together the finest dance crews to tell a story through movement. Teams may blend classical, folk, hip-hop or contemporary styles, and are judged on choreography, synchronisation, expression and costume.',
    image: evDance,
    date: '14 Feb 2027',
    time: '6:00 PM – 9:30 PM',
    venue: 'Open Air Theatre',
    teamSize: '6 – 15 members',
    entryFee: '₹600 per team',
    prizePool: '₹40,000',
    passSteps: defaultPassSteps,
    rules: [
      'Performance duration: 6–8 minutes including setup.',
      'Music tracks must be submitted in MP3 format 24 hours before the event.',
      'Use of fire, water or hazardous props is strictly prohibited.',
    ],
    coordinators: [
      { name: 'Ananya Rao', phone: '+91 98200 11223' },
      { name: 'Kabir Shah', phone: '+91 98200 44556' },
    ],
  },
  {
    slug: 'swar-taal',
    category: 'cultural',
    name: 'Swar Taal',
    summary: 'Battle of the bands — from Indian classical fusion to rock.',
    description:
      'Swar Taal is the stage for bands and solo musicians to prove their sound. Fusion, rock, indie or classical — every genre is welcome. Judging is based on musicality, originality, stage presence and crowd response.',
    image: evMusic,
    date: '15 Feb 2027',
    time: '5:00 PM – 10:00 PM',
    venue: 'Main Auditorium',
    teamSize: '1 – 8 members',
    entryFee: '₹500 per band',
    prizePool: '₹50,000',
    passSteps: defaultPassSteps,
    rules: [
      'Each band gets 15 minutes including sound check.',
      'Drum kit and amplifiers are provided; bring your own instruments.',
      'At least one original composition earns bonus points.',
    ],
    coordinators: [
      { name: 'Riya Menon', phone: '+91 98200 77889' },
      { name: 'Arjun Iyer', phone: '+91 98200 99001' },
    ],
  },
  {
    slug: 'rangmanch',
    category: 'cultural',
    name: 'Rangmanch',
    summary: 'Stage play competition celebrating the art of theatre.',
    description:
      'Rangmanch invites theatre groups to perform original or adapted plays. Teams are judged on script, acting, direction, use of stage and overall impact. Plays may be in English, Hindi or Marathi.',
    image: evDrama,
    date: '16 Feb 2027',
    time: '11:00 AM – 4:00 PM',
    venue: 'Seminar Hall A',
    teamSize: '5 – 20 members',
    entryFee: '₹400 per team',
    prizePool: '₹30,000',
    passSteps: defaultPassSteps,
    rules: [
      'Maximum performance time is 25 minutes.',
      'Scripts must be submitted for approval one week prior.',
      'Basic lighting and sound are provided by the organisers.',
    ],
    coordinators: [{ name: 'Ishaan Kulkarni', phone: '+91 98200 12345' }],
  },
  {
    slug: 'kick-off',
    category: 'sports',
    name: 'Kick Off',
    summary: 'Inter-college 7-a-side football tournament under the floodlights.',
    description:
      'Kick Off is a knockout 7-a-side football tournament played over two days. Fast, fierce and played under floodlights — only one squad lifts the Trinity cup.',
    image: evFootball,
    date: '14 – 15 Feb 2027',
    time: '8:00 AM onwards',
    venue: 'College Turf Ground',
    teamSize: '7 + 3 substitutes',
    entryFee: '₹1,200 per team',
    prizePool: '₹35,000',
    passSteps: defaultPassSteps,
    rules: [
      'Matches are 20 minutes (10 each half).',
      'Studs are allowed; metal studs are not.',
      'Referee decisions are final and binding.',
    ],
    coordinators: [
      { name: 'Rohan Desai', phone: '+91 98200 22334' },
      { name: 'Sameer Khan', phone: '+91 98200 55667' },
    ],
  },
  {
    slug: 'box-cricket',
    category: 'sports',
    name: 'Box Cricket',
    summary: 'Quick-fire 6-over box cricket with big hits and tight finishes.',
    description:
      'Box Cricket is a fast-paced, short-format tournament played in a netted arena. Six overs a side, special rules for boundaries and a lot of noise from the stands.',
    image: evCricket,
    date: '15 Feb 2027',
    time: '9:00 AM – 6:00 PM',
    venue: 'Box Cricket Arena',
    teamSize: '8 members',
    entryFee: '₹800 per team',
    prizePool: '₹25,000',
    passSteps: defaultPassSteps,
    rules: [
      'Each innings is 6 overs; one bowler may bowl a maximum of 2 overs.',
      'Hitting the roof net directly counts as out.',
      'Tennis ball will be used for all matches.',
    ],
    coordinators: [{ name: 'Aditya Joshi', phone: '+91 98200 88990' }],
  },
  {
    slug: 'chaturanga',
    category: 'sports',
    name: 'Chaturanga',
    summary: 'Rapid chess championship — the ancient game of kings.',
    description:
      'Named after the ancient Indian ancestor of chess, Chaturanga is a Swiss-format rapid tournament. Sharpen your openings and keep an eye on the clock.',
    image: evChess,
    date: '16 Feb 2027',
    time: '10:00 AM – 3:00 PM',
    venue: 'Library Hall',
    teamSize: 'Individual',
    entryFee: '₹150 per player',
    prizePool: '₹15,000',
    passSteps: defaultPassSteps,
    rules: [
      '7 rounds Swiss format, 10 + 5 time control.',
      'FIDE laws of chess apply.',
      'Mobile phones must be switched off inside the hall.',
    ],
    coordinators: [{ name: 'Meera Pillai', phone: '+91 98200 33445' }],
  },
  {
    slug: 'code-yatra',
    category: 'technical',
    name: 'Code Yatra',
    summary: '24-hour hackathon to build solutions for real-world problems.',
    description:
      'Code Yatra is a 24-hour overnight hackathon. Teams pick a problem statement at kickoff and build a working prototype by morning. Mentors, food and caffeine are on us.',
    image: evHackathon,
    date: '14 – 15 Feb 2027',
    time: '10:00 AM (24 hrs)',
    venue: 'Computer Centre, Block C',
    teamSize: '2 – 4 members',
    entryFee: '₹400 per team',
    prizePool: '₹75,000',
    passSteps: defaultPassSteps,
    rules: [
      'All code must be written during the hackathon.',
      'Open-source libraries and APIs are allowed.',
      'Final demo is 5 minutes followed by 3 minutes of Q&A.',
    ],
    coordinators: [
      { name: 'Neha Verma', phone: '+91 98200 66778' },
      { name: 'Siddharth Nair', phone: '+91 98200 11009' },
    ],
  },
  {
    slug: 'robo-yuddh',
    category: 'technical',
    name: 'Robo Yuddh',
    summary: 'Combat robotics — build it, drive it, break the other one.',
    description:
      'Robo Yuddh pits remote-controlled combat robots against each other in a protected arena. The last bot moving — or the one with the most points — advances.',
    image: evRobotics,
    date: '15 Feb 2027',
    time: '12:00 PM – 6:00 PM',
    venue: 'Mechanical Workshop Arena',
    teamSize: '2 – 5 members',
    entryFee: '₹700 per team',
    prizePool: '₹60,000',
    passSteps: defaultPassSteps,
    rules: [
      'Maximum robot weight: 8 kg; dimensions within 60 × 60 × 60 cm.',
      'Wireless control only; no flamethrowers or liquids.',
      'Each bout lasts 3 minutes.',
    ],
    coordinators: [{ name: 'Varun Patil', phone: '+91 98200 44112' }],
  },
  {
    slug: 'jigyasa',
    category: 'technical',
    name: 'Jigyasa',
    summary: 'Tech and general quiz — from algorithms to ancient astronomy.',
    description:
      'Jigyasa is a multi-round quiz covering technology, science, history and pop culture. A written prelim filters the top six teams for an on-stage buzzer finale.',
    image: evQuiz,
    date: '16 Feb 2027',
    time: '2:00 PM – 5:00 PM',
    venue: 'Seminar Hall B',
    teamSize: '2 members',
    entryFee: '₹100 per team',
    prizePool: '₹12,000',
    passSteps: defaultPassSteps,
    rules: [
      'Prelims are a 30-minute written round.',
      'No electronic devices allowed during any round.',
      'Quizmaster decisions are final.',
    ],
    coordinators: [{ name: 'Tanvi Gokhale', phone: '+91 98200 77001' }],
  },
]

export function getCategory(slug) {
  return categories.find((c) => c.slug === slug)
}

export function getEventsByCategory(slug) {
  return events.filter((e) => e.category === slug)
}

export function getEvent(category, slug) {
  return events.find((e) => e.category === category && e.slug === slug)
}
