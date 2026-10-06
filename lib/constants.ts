import type { NavItem } from './types'

export const CLUB_INFO = {
  name: 'Rotary Club of Pashupati Kathmandu',
  shortName: 'RC Pashupati Kathmandu',
  address: '09 Sinamangal, Kathmandu, Nepal',
  email: 'pashupatirotaryclub@gmail.com',
  phone: '+977 9851197327',
  hours: 'Sun - Fri  9:00 - 18:00',
  meeting: 'Wednesday 5:30 PM, Hotel Airport, Airport Gate',
  district: '3292',
  motto: 'Service Above Self',
  founded: '1998',
  rotaryInternational: 'https://www.rotary.org',
} as const

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'Who We Are',
    href: '/about',
    children: [
      { label: 'About Us', href: '/about' },
      { label: 'TRF Contributors', href: '/about/trf-contributors' },
    ],
  },
  {
    label: 'Members',
    href: '/members',
    children: [
      { label: 'Our Members', href: '/members' },
      { label: 'Board Members', href: '/members#board' },
      { label: 'Rotaract Club', href: '/members#rotaract' },
    ],
  },
  { label: 'Projects', href: '/projects' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'News', href: '/news' },
  { label: 'Publications', href: '/publications' },
  { label: 'Calendar', href: '/calendar' },
  { label: 'Contact', href: '/contact' },
]

export const WORKING_AREAS = [
  {
    title: 'Maternal and Child Health',
    description: 'Improving health outcomes for mothers and children across Nepal.',
    icon: 'heart',
    color: '#e74c3c',
    bg: '#fef2f2',
  },
  {
    title: 'Basic Education and Literacy',
    description: 'Empowering communities through quality education and literacy programs.',
    icon: 'book-open',
    color: '#3b82f6',
    bg: '#eff6ff',
  },
  {
    title: 'Economic and Community Development',
    description: 'Creating sustainable livelihoods and building resilient communities.',
    icon: 'trending-up',
    color: '#16a34a',
    bg: '#f0fdf4',
  },
  {
    title: 'Peace and Conflict Prevention',
    description: 'Fostering dialogue, understanding, and peaceful resolution.',
    icon: 'globe',
    color: '#7c3aed',
    bg: '#f5f3ff',
  },
  {
    title: 'Disease Prevention and Treatment',
    description: 'Combating disease and expanding access to healthcare.',
    icon: 'shield',
    color: '#ea580c',
    bg: '#fff7ed',
  },
  {
    title: 'Water and Sanitation',
    description: 'Providing clean water and sanitation to underserved communities.',
    icon: 'droplets',
    color: '#0891b2',
    bg: '#ecfeff',
  },
] as const

export const CORE_VALUES = [
  {
    title: 'Fellowship',
    description: 'We build lasting bonds through shared service, collaborating locally, nationally, and internationally.',
    icon: 'users',
  },
  {
    title: 'Leadership',
    description: 'We empower teams and communities to create a sustainable and prosperous society.',
    icon: 'star',
  },
  {
    title: 'Integrity',
    description: 'We uphold honesty and moral principles in every action, respecting human diversity.',
    icon: 'shield-check',
  },
  {
    title: 'Services',
    description: 'Service above self — built on honesty, morality, and transparency in all we do.',
    icon: 'hand-heart',
  },
] as const

export const PROJECT_CATEGORIES = ['All', 'Maternal and Child Health', 'Basic Education and Literacy', 'Economic and Community Development', 'Peace and Conflict Prevention', 'Disease Prevention and Treatment', 'Water and Sanitation', 'Others'] as const
export const GALLERY_CATEGORIES = ['All', 'Education', 'Health', 'Empowerment', 'Environment', 'General'] as const
export const ARCHIVE_TYPES = ['All', 'meeting', 'event', 'document'] as const

// Real figures: 16 board + 47 members in the members table; 20 active projects;
// chartered 01 April 1998; beneficiaries summed from each project's impact metric.
export const STATS = [
  { label: 'Active Members', value: 63, suffix: '' },
  { label: 'Projects Completed', value: 20, suffix: '' },
  { label: 'Years of Service', value: 28, suffix: '' },
  { label: 'Lives Impacted', value: 3142, suffix: '+' },
] as const

export const SAMPLE_TESTIMONIALS = [
  {
    name: 'PP Juliya',
    role: 'Past President',
    quote: 'We are focused on Service to Humanity. Every project we undertake brings us closer to the world we envision — one where no one is left behind.',
    photo_url: null,
  },
  {
    name: 'Rtr. Jenny Bhattarai',
    role: 'President',
    quote: 'Leading this club has been the greatest honor. Together, we make lasting change in our community every single day.',
    photo_url: null,
  },
  {
    name: 'Rtr. Umesh Sitaula',
    role: 'Secretary',
    quote: 'The bonds we form through service are stronger than anything. Rotary has given me a second family and a higher purpose.',
    photo_url: null,
  },
  {
    name: 'Rtr. Anjan Dangal',
    role: 'SAP Director',
    quote: 'Every act of service, no matter how small, creates ripples of positive change across our community and beyond.',
    photo_url: null,
  },
] as const

export const SITE_CONTENT_DEFAULTS: Record<string, string> = {
  hero_title: 'Service Above Self',
  hero_subtitle: 'Rotary Club of Pashupati Kathmandu — A global network of neighbors, friends, leaders, and problem-solvers committed to lasting change.',
  hero_cta_primary: 'Our Projects',
  hero_cta_secondary: 'About Us',
  about_mission: "The mission of Rotary International is to provide services to others, promote integrity, and advance world understanding, goodwill, and peace through the fellowship of business, professional, and community leaders.",
  about_description: "Rotary is a global network of 1.2 million neighbors, friends, leaders, and problem-solvers who see a world where people unite and take action to create lasting change — across the globe, in our communities, and in ourselves. For more than 110 years we have been committed to sustainable projects that address literacy, peace, water, health, and many other issues facing our world.",
  stats_members: '63',
  stats_projects: '20',
  stats_years: '28',
  stats_lives: '3,142+',
}

// Real club milestones, not awards. Figures from the members/projects tables and
// the district site's club record (chartered 01 April 1998, club id 51038).
export const ACHIEVEMENTS = [
  {
    id: 1,
    title: '20 Service Projects',
    year: '2025\u201326',
    org: 'Across 8 Areas of Focus',
    description: 'Twenty community service projects delivered in a single Rotary year, spanning disease prevention, maternal and child health, water and sanitation, education and the environment.',
    icon: 'trophy',
  },
  {
    id: 2,
    title: 'NPR 22,05,371 Contributed',
    year: '2025\u201326',
    org: 'Club Service Fund',
    description: 'Raised and spent on community service by club members and donors \u2014 from the NPR 500,000 Humla health camp to the KJ Baral Rotary Food Bank.',
    icon: 'award',
  },
  {
    id: 3,
    title: '28 Years of Service',
    year: 'Since 1998',
    org: 'Chartered 01 April 1998',
    description: 'Chartered under Charter President Rtn. Ganesh Bahadur Thapa and serving the Kathmandu community without interruption ever since.',
    icon: 'star',
  },
  {
    id: 4,
    title: '3,142 Lives Touched',
    year: 'Recorded to date',
    org: 'Verified Beneficiaries',
    description: 'Counted from the recorded beneficiaries of each completed project \u2014 patients screened, students supported, families fed and households given clean water.',
    icon: 'medal',
  },
  {
    id: 5,
    title: '63 Rotarians, 35 Rotaractors',
    year: '2026\u201327',
    org: 'Club Membership',
    description: 'A club of 63 Rotarians supported by 35 Rotaractors across the Rotaract Club of Pashupati Kathmandu and the Rotaract Club of Pashupati Nepal Law Campus.',
    icon: 'leaf',
  },
] as const

