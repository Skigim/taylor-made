export interface HeroContent {
  title: string;
  description: string;
  primaryCta: string;
  secondaryNote: string;
}

export interface BrandContent {
  name: string;
  audience: string;
}

export interface Capability {
  name: string;
  description: string;
}

export interface ProblemContent {
  title: string;
  points: string[];
}

export interface ProcessStep {
  title: string;
  description: string;
}

export interface ClosingCta {
  title: string;
  description: string;
  cta: string;
}

export interface LandingPageContent {
  brand: BrandContent;
  hero: HeroContent;
  auditScope: string[];
  problem: ProblemContent;
  capabilities: Capability[];
  process: ProcessStep[];
  closingCta: ClosingCta;
}

export type BusinessType = 'Salon' | 'Barber Shop' | 'Other';
export type TeamSize = 'Just me' | '2–5' | '6–10' | '10+';
export type ReferralSource = 'Google' | 'Referral' | 'Social media' | 'Other';

export interface AuditFormData {
  fullName: string;
  email: string;
  businessName: string;
  businessType: BusinessType;
  phone: string;
  city: string;
  painPoints?: string;
  teamSize?: TeamSize;
  referralSource?: ReferralSource;
}