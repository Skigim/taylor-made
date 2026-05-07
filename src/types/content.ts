export interface HeroContent {
  title: string;
  description: string;
  primaryCta: string;
  secondaryNote: string;
  auditPanelCopy: string;
}

export interface BrandContent {
  name: string;
  audience: string;
}

export interface LandingPageContent {
  brand: BrandContent;
  hero: HeroContent;
}