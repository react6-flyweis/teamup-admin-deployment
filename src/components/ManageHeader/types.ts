export interface ChooseGameCard {
  id: string;
  title: string;
  image: string;
  link?: string;
}

export interface OtherGameCard {
  id: string;
  title: string;
  image: string;
  bookNowLink?: string;
  learnMoreLink?: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  subtext?: string;
  // Extended fields requested for checklist items
  image?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  subheading?: string;
}


export interface FeaturedEventCard {
  id: string;
  title: string;
  subtitle?: string; // Optional pink subtitle
  description: string;
  button1Text: string;
  button1Link: string;
  button2Text?: string;
  button2Link?: string;
  image: string;
}

export interface StatBlock {
  id: string;
  iconType: 'age' | 'price' | 'time' | string;
  topText: string;
  mainText: string;
  subText?: string;
}

export interface HeaderSubItem {
  id: string;
  name: string;
  icon: string; // URL or icon identifier
  path: string;
  isHidden?: boolean;
  isActive?: boolean;
  // Game Linking / API integration fields
  slug?: string;
  type?: 'game' | string;
  linkedItemId?: string;
  linkedGame?: {
    _id: string;
    name: string;
    slug: string;
    description: string;
    category?: string;
    imageUrl?: string;
    duration?: string;
    priceFrom?: number;
    tags?: string[];
    isActive?: boolean;
  };

  // ─── Choose Game Page Fields ───────────────────────────────
  pageHeadline?: string;
  pageTagline?: string;
  cardDescription?: string; // Description shown on cards (e.g. in Team Parties)
  pageHeroImage?: string;
  pageDetails?: {
    peoplePerMachine: string;
    timeMin: string;
    lanes: string;
    price: string;
    minAge: string;
    wheelchairAccess: boolean;
  };
  otherGames?: OtherGameCard[];

  // ─── Group Activity Page Fields ────────────────────────────
  // pageType helps differentiate rendering on the frontend
  pageType?: 'game' | 'group-activity' | 'team-parties' | 'boom-bundle' | 'queens-night';

  // Hero
  heroBookNowLink?: string;
  heroHighlight?: string; // e.g. "MORE BOOM FOR YOUR BUCK!..."
  heroSubtitle?: string; // e.g. "Get more BOOM for your buck..."

  // What's included section
  sectionHeadline?: string;
  sectionDescription?: string;
  checklistItems?: ChecklistItem[];

  // How to Book section
  howToBookHeadline?: string;
  howToBookBody?: string;
  howToBookLink?: string;
  howToBookEmail?: string;
  howToBookPhone?: string;

  // Featured Event section (e.g., for Team Parties)
  eventsDateHeading?: string;
  featuredEvents?: FeaturedEventCard[];

  // Boom Bundle specific fields
  importantInfoHeading?: string; // "BORING BUT IMPORTANT:"
  importantInfoText?: string;
  bundleCards?: FeaturedEventCard[];

  // Queens Night specific fields
  statsBlocks?: StatBlock[];
  otherGamesHeading?: string; // "OTHER GAMES"
  otherGamesCards?: FeaturedEventCard[];

  // Choose Your Games (ID references to 'Choose Game' category sub-items)
  chooseGamesHeading?: string;
  chooseGameIds?: string[]; // IDs from Choose Game category sub-items
  chooseGameCards?: ChooseGameCard[];
}

export interface HeaderCategory {
  id: string;
  name: string;
  isHidden: boolean;
  subItems: HeaderSubItem[];
}
