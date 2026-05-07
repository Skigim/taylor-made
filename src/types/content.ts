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

export interface LandingPageContent {
  brand: BrandContent;
  hero: HeroContent;
  auditScope: string[];
  problem: ProblemContent;
  capabilities: Capability[];
}