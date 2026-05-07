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
  process: [
    {
      title: 'Audit',
      description:
        'A free review of your current presence, booking flow, and day-to-day operations — no pressure, no pitch.',
    },
    {
      title: 'Plan',
      description:
        'A plain-English roadmap showing exactly what to fix first and why, based on your actual shop.',
    },
    {
      title: 'Build',
      description:
        'We implement the changes for you — site, booking, billing, reminders, and everything in between.',
    },
    {
      title: 'Support',
      description:
        'Ongoing check-ins so your systems keep working as your business grows.',
    },
  ],
  closingCta: {
    title: 'Ready to stop patching and start building?',
    description:
      'The audit is free, the roadmap is yours to keep, and there is no obligation. Most shops see the first win within two weeks.',
    cta: 'Book your free audit',
  },
};