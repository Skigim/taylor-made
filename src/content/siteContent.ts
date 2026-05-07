import type { LandingPageContent } from '../types/content';

export const siteContent: LandingPageContent = {
  brand: {
    name: 'TaylorMade LLC',
    audience: 'Salon and barber focus',
  },
  hero: {
    title: 'Modern infrastructure for service businesses that deserve better systems.',
    description:
      'Web presence, online booking, billing, reminders, and customer flow designed around how your shop actually runs.',
    primaryCta: 'Get a free systems audit',
    secondaryNote: 'For appointment-based local businesses',
  },
  auditScope: ['Online presence', 'Scheduling flow', 'Payments and operations'],
  problem: {
    title: 'Most local shops are running real businesses on a stack of disconnected fixes.',
    points: [
      'Missed calls become missed bookings.',
      'Clients face inconsistent websites and booking tools.',
      'Reminders, intake, billing, and follow-up stay manual.',
    ],
  },
  capabilities: [
    {
      name: 'Presence',
      description: 'Sites, listings, messaging, and visual trust signals.',
    },
    {
      name: 'Operations',
      description: 'Scheduling, reminders, intake, billing, and workflow cleanup.',
    },
    {
      name: 'Retention',
      description: 'Rebooking prompts, follow-up systems, and customer touchpoints.',
    },
  ],
};