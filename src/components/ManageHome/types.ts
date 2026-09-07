export interface HeroSection {
  topBannerText: string;
  isTopBannerActive: boolean;
  title: string;
  subtitle: string;
  backgroundMediaUrl: string;
  buttons: {
    primaryText: string;
    primaryLink: string;
    secondaryText: string;
    secondaryLink: string;
  };
}

export interface BoomBundle {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
  isActive: boolean;
}

export interface OperatingHours {
  id: string;
  day: string;
  openTime: string;
  closeTime: string;
}

export interface LocationInfo {
  address: string;
  mapEmbedUrl: string;
  hours: OperatingHours[];
}

export interface GameItem {
  id: string;
  name: string;
  imageUrl: string;
  bookNowLink: string;
  learnMoreLink: string;
  isActive: boolean;
}

export interface BitesAndDrinks {
  bitesTitle: string;
  bitesImageUrl: string;
  bitesMenuLink: string;
  drinksTitle: string;
  drinksImageUrl: string;
  drinksMenuLink: string;
}

export interface NightsOut {
  title: string;
  subtitle: string;
  description: string;
  backgroundMediaUrl: string;
  buttonText: string;
  buttonLink: string;
}

export interface NewsletterSection {
  heading: string;
  subheading: string;
  backgroundImageUrl: string;
  inputPlaceholder: string;
  buttonText: string;
  disclaimerText: string;
  isActive: boolean;
}

export interface HomePageData {
  hero: HeroSection;
  bundles: BoomBundle[];
  location: LocationInfo;
  games: GameItem[];
  bites: BitesAndDrinks;
  nightsOut: NightsOut;
  newsletter?: NewsletterSection;
}
