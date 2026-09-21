export interface EventsHeroData {
  title: string;
  subtitle?: string;
  bgMediaUrl: string;
  bgMediaType?: 'image' | 'video';
  pageUrl?: string;
}

export type AgeGroupActionType = 'book_now' | 'contact_us';

export interface AgeGroupCardItem {
  id: string;
  title: string;
  description: string;
  actionType?: AgeGroupActionType;
  aLaCarteMenuLink?: string;
  preselectMenuLink?: string;
  contactLink?: string;
  contactButtonText?: string;
  badge?: string;
  order: number;
  isActive?: boolean;
}

export interface AgeGroupsSectionData {
  sectionTitle: string;
  sectionSubtitle?: string;
  cards: AgeGroupCardItem[];
}

export interface InfoCardItem {
  id: string;
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  buttonText?: string;
  buttonLink?: string;
  order: number;
  isActive?: boolean;
}

export interface InfoCardsSectionData {
  sectionTitle: string;
  sectionSubtitle?: string;
  cards: InfoCardItem[];
}

export interface EventPageData {
  hero: EventsHeroData;
  ageGroups: AgeGroupsSectionData;
  infoCards: InfoCardsSectionData;
}

export const DEFAULT_SOCIAL_EVENTS_DATA: EventPageData = {
  hero: {
    title: 'Epic Social Events & Celebrations',
    subtitle: 'Birthdays, group hangouts, and milestone moments made unforgettable.',
    bgMediaUrl: 'https://teamup-live.s3.us-west-1.amazonaws.com/uploads/1788912627461-07538f99-8b00-4da3-852d-8dc8a36adf58.jpeg',
    bgMediaType: 'image',
    pageUrl: '/social-events',
  },
  ageGroups: {
    sectionTitle: 'Age Groups & Party Packages',
    sectionSubtitle: 'Tailored experiences designed for every squad, from young gamers to late-night party crews.',
    cards: [
      {
        id: 'social-age-1',
        title: 'Kids & Junior Gamers (Under 12)',
        description: 'Action-packed game sessions, party hosts, kid-friendly bites, and unlimited arcade excitement.',
        actionType: 'book_now',
        aLaCarteMenuLink: 'https://ecom.roller.app/altitudemanteca/buyapass/en-us/home',
        preselectMenuLink: 'https://ecom.roller.app/altitudemanteca/buyapass/en-us/home',
        badge: 'Family Favorite',
        order: 1,
        isActive: true,
      },
      {
        id: 'social-age-2',
        title: 'Teens & Squads (Ages 13 - 17)',
        description: 'High-energy VR & sports battles, pizza combos, soda bars, and dedicated gaming zones.',
        actionType: 'book_now',
        aLaCarteMenuLink: 'https://ecom.roller.app/altitudemanteca/buyapass/en-us/home',
        preselectMenuLink: 'https://ecom.roller.app/altitudemanteca/buyapass/en-us/home',
        badge: 'Most Popular',
        order: 2,
        isActive: true,
      },
      {
        id: 'social-age-3',
        title: 'Adults & 21+ Nights Out',
        description: 'Craft cocktails, street food platters, interactive darts, axe throwing, and late-night lounge vibes.',
        actionType: 'book_now',
        aLaCarteMenuLink: 'https://ecom.roller.app/altitudemanteca/buyapass/en-us/home',
        preselectMenuLink: 'https://ecom.roller.app/altitudemanteca/buyapass/en-us/home',
        badge: 'Nightlife',
        order: 3,
        isActive: true,
      },
    ],
  },
  infoCards: {
    sectionTitle: 'Why Celebrate At Team Up?',
    sectionSubtitle: 'Everything you need to host the party of the year without the stress.',
    cards: [
      {
        id: 'social-info-1',
        title: 'Immersive Battlegrounds',
        description: 'State-of-the-art AR darts, archery, duckpin bowling, and karaoke arenas built for friendly rivalry.',
        mediaUrl: 'https://teamup-live.s3.us-west-1.amazonaws.com/uploads/1788900089797-36497f1a-9add-4e58-a3e1-a735e1f140ba.jpeg',
        mediaType: 'image',
        order: 1,
        isActive: true,
      },
      {
        id: 'social-info-2',
        title: 'Bespoke Food & Drink Menus',
        description: 'Handcrafted cocktails, shareable street food sliders, and customized pre-selected feast platters.',
        mediaUrl: 'https://teamup-live.s3.us-west-1.amazonaws.com/uploads/1788912917868-65474686-cca5-478a-b091-f2c1a377e73a.jpeg',
        mediaType: 'image',
        order: 2,
        isActive: true,
      },
      {
        id: 'social-info-3',
        title: 'Dedicated Party Hosts',
        description: 'Sit back and enjoy the hype while our experienced crew manages the tournament schedules and food timing.',
        mediaUrl: 'https://teamup-live.s3.us-west-1.amazonaws.com/uploads/1788913153472-f2b48bd0-1d46-4863-8c68-1c828997a0ab.jpeg',
        mediaType: 'image',
        order: 3,
        isActive: true,
      },
    ],
  },
};

export const DEFAULT_CORPORATE_EVENTS_DATA: EventPageData = {
  hero: {
    title: 'The Ultimate Corporate & Team Building Experience',
    subtitle: 'Ditch the boring boardroom. Unleash competitive energy, connection, and celebration.',
    bgMediaUrl: 'https://teamup-live.s3.us-west-1.amazonaws.com/uploads/1789604667975-01443072-ac8f-4db5-baa1-6ecb3d34131a.jpeg',
    bgMediaType: 'image',
    pageUrl: '/corporate-events',
  },
  ageGroups: {
    sectionTitle: 'Corporate Team Packages',
    sectionSubtitle: 'Curated packages tailored for team sizes and company celebration goals.',
    cards: [
      {
        id: 'corp-age-1',
        title: 'Squad Social (Small Teams 10-25)',
        description: '2 hours of gameplay, 2 welcome drinks per guest, plus delicious appetizer platters.',
        actionType: 'book_now',
        aLaCarteMenuLink: 'https://ecom.roller.app/altitudemanteca/buyapass/en-us/home',
        preselectMenuLink: 'https://ecom.roller.app/altitudemanteca/buyapass/en-us/home',
        badge: 'Small Teams',
        order: 1,
        isActive: true,
      },
      {
        id: 'corp-age-2',
        title: 'Department Showdown (25-75 Guests)',
        description: 'Dedicated private zone, tournament organizer, 3 drink tickets, and full street-food buffet.',
        actionType: 'book_now',
        aLaCarteMenuLink: 'https://ecom.roller.app/altitudemanteca/buyapass/en-us/home',
        preselectMenuLink: 'https://ecom.roller.app/altitudemanteca/buyapass/en-us/home',
        badge: 'Most Popular',
        order: 2,
        isActive: true,
      },
      {
        id: 'corp-age-3',
        title: 'Full Venue Buyout (75+ Guests)',
        description: 'Complete exclusive access to all games, private bar service, AV equipment, and bespoke catering.',
        actionType: 'contact_us',
        contactLink: 'https://www.teamuparena.com/contact-us',
        contactButtonText: 'Contact Us',
        badge: 'VIP Exclusive',
        order: 3,
        isActive: true,
      },
    ],
  },
  infoCards: {
    sectionTitle: 'Why Companies Choose Team Up',
    sectionSubtitle: 'Seamless event planning with premium hospitality and interactive team gaming.',
    cards: [
      {
        id: 'corp-info-1',
        title: 'Zero Boring Icebreakers',
        description: 'Fast-paced friendly competition that genuinely gets teams talking, laughing, and collaborating.',
        mediaUrl: 'https://teamup-live.s3.us-west-1.amazonaws.com/uploads/1789603811030-e84f3aa8-4e01-4acb-84c1-7165db227848.jpeg',
        mediaType: 'image',
        order: 1,
        isActive: true,
      },
      {
        id: 'corp-info-2',
        title: 'Scalable Catering & Premium Bar',
        description: 'From casual slider buffets to craft mixology and dietary-customized feasts.',
        mediaUrl: 'https://teamup-live.s3.us-west-1.amazonaws.com/uploads/1789604575515-75cf31da-2bed-45f5-a55d-f05bfb0d1548.jpeg',
        mediaType: 'image',
        order: 2,
        isActive: true,
      },
      {
        id: 'corp-info-3',
        title: 'Hassle-Free Event Coordinators',
        description: 'Your dedicated event manager takes care of timing, check-ins, scoreboards, and tab management.',
        mediaUrl: 'https://teamup-live.s3.us-west-1.amazonaws.com/uploads/1788909185223-5f5a0134-2a1c-4c65-80b6-5095e2e31a0f.jpeg',
        mediaType: 'image',
        order: 3,
        isActive: true,
      },
    ],
  },
};
