import type { LandingPageContent } from '../types/content';

export const siteContent: LandingPageContent = {
  brand: {
    name: 'TaylorMade LLC',
    audience: 'Appointment-based focus',
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
  process: [
    {
      title: 'Audit',
      description:
        'A free review of your current presence, booking flow, and day-to-day operations — no pressure, no pitch.',
    },
    {
      title: 'Prioritize',
      description:
        'A plain-English order of improvements so you know what to fix first and why.',
    },
    {
      title: 'Build',
      description:
        'TaylorMade implements the right-fit infrastructure across presence, operations, and retention.',
    },
  ],
  closingCta: {
    title: 'Get a free systems audit',
    description:
      'A free business systems audit for salons and barbers who are tired of piecing together websites, booking tools, payments, and follow-up by hand.',
    cta: 'Get a free systems audit',
  },
};