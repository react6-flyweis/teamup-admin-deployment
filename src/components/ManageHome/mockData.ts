import type { HomePageData } from './types';


export const mockHomePageData: HomePageData = {
  hero: {
    topBannerText: 'TIPSY THRILLS - SIPS & THRILLS FRI 15TH AUG',
    isTopBannerActive: true,
    title: 'GEAR UP - GAME ON',
    subtitle: 'Folsom, CA',
    backgroundMediaUrl: 'https://images.unsplash.com/photo-1518118014377-ce9fb28e7e37?q=80&w=2000&auto=format&fit=crop',
    buttons: {
      primaryText: 'BOOK GAMES',
      primaryLink: '/book-games',
      secondaryText: 'BOOK TABLES',
      secondaryLink: '/book-tables',
    },
  },
  bundles: [
    {
      id: '1',
      title: 'BOOM BUNDLES',
      description: 'Maximize your fun with our Boom Bundles. Combining the best games, food, and drinks into one epic package for you and your crew.',
      imageUrl: 'https://images.unsplash.com/photo-1563514986791-0428f7d934bb?q=80&w=800&auto=format&fit=crop',
      buttonText: 'BOOK MY BUNDLE',
      buttonLink: '/bundles',
      isActive: true,
    },
    {
      id: '2',
      title: 'PARTY BUNDLES',
      description: 'The ultimate party experience with extra games and exclusive drinks.',
      imageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=800&auto=format&fit=crop',
      buttonText: 'VIEW OPTIONS',
      buttonLink: '/parties',
      isActive: true,
    }
  ],
  location: {
    address: '13405 Folsom Blvd, Folsom, CA 95630, USA',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3113.840742146316!2d-121.1648714240751!3d38.64098936657984!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x809ae5cf34f66dbb%3A0x6b4470c1e878e1b1!2s13405%20Folsom%20Blvd%2C%20Folsom%2C%20CA%2095630!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus',
    hours: [
      { id: '1', day: 'MONDAY', openTime: '11:00 AM', closeTime: '12:00 AM' },
      { id: '2', day: 'TUESDAY', openTime: '11:00 AM', closeTime: '12:00 AM' },
      { id: '3', day: 'WEDNESDAY', openTime: '11:00 AM', closeTime: '12:00 AM' },
      { id: '4', day: 'THURSDAY', openTime: '11:00 AM', closeTime: '12:00 AM' },
      { id: '5', day: 'FRIDAY', openTime: '10:00 AM', closeTime: '2:00 AM' },
      { id: '6', day: 'SATURDAY', openTime: '10:00 AM', closeTime: '2:00 AM' },
      { id: '7', day: 'SUNDAY', openTime: '10:00 AM', closeTime: '12:00 AM' },
    ]
  },
  games: [
    {
      id: '1',
      name: 'INDOOR MINI GOLF',
      imageUrl: 'https://images.unsplash.com/photo-1587304419519-866440263690?q=80&w=600&auto=format&fit=crop',
      bookNowLink: '/book/golf',
      learnMoreLink: '/games/golf',
      isActive: true,
    },
    {
      id: '2',
      name: 'DUCKPIN BOWLING',
      imageUrl: 'https://images.unsplash.com/photo-1543884846-9d62d2948651?q=80&w=600&auto=format&fit=crop',
      bookNowLink: '/book/bowling',
      learnMoreLink: '/games/bowling',
      isActive: true,
    },
    {
      id: '3',
      name: 'AXE THROW',
      imageUrl: 'https://images.unsplash.com/photo-1596765798931-e1293a383d0c?q=80&w=600&auto=format&fit=crop',
      bookNowLink: '/book/axe',
      learnMoreLink: '/games/axe',
      isActive: true,
    },
    {
      id: '4',
      name: 'AR ARCHERY',
      imageUrl: 'https://images.unsplash.com/photo-1563810141662-79354e3d1dd5?q=80&w=600&auto=format&fit=crop',
      bookNowLink: '/book/archery',
      learnMoreLink: '/games/archery',
      isActive: true,
    },
    {
      id: '5',
      name: 'AR DARTS',
      imageUrl: 'https://images.unsplash.com/photo-1550974862-23c2a6136eab?q=80&w=600&auto=format&fit=crop',
      bookNowLink: '/book/darts',
      learnMoreLink: '/games/darts',
      isActive: true,
    },
    {
      id: '6',
      name: 'KARAOKE DANCE',
      imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop',
      bookNowLink: '/book/karaoke',
      learnMoreLink: '/games/karaoke',
      isActive: true,
    }
  ],
  bites: {
    bitesTitle: 'BITES',
    bitesImageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto=format&fit=crop',
    bitesMenuLink: '/menu/bites',
    drinksTitle: 'DRINKS & COCKTAILS',
    drinksImageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800&auto=format&fit=crop',
    drinksMenuLink: '/menu/drinks',
  },
  nightsOut: {
    title: 'NIGHTS OUT',
    subtitle: 'THE ULTIMATE PARTY DESTINATION',
    description: 'From Birthdays and Team Socials to Kings & Queens Dos, we\'ve got your night covered with epic games, food, and drinks.',
    backgroundMediaUrl: 'https://images.unsplash.com/photo-1545128485-c400e7702796?q=80&w=2000&auto=format&fit=crop',
    buttonText: 'EXPLORE EVENTS',
    buttonLink: '/events',
  },
  newsletter: {
    heading: 'SIGN UP OR SHUFF UP',
    subheading: 'NO FOMO NEEDED. BE THE FIRST TO RECEIVE NEWS AND UPDATES ABOUT BOOM BATTLE BAR OXFORD STREET.',
    backgroundImageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=2000&auto=format&fit=crop',
    inputPlaceholder: 'Your email address*',
    buttonText: 'SIGN UP',
    disclaimerText: 'By signing up you will be added to our mailing list and receive news, offers and promotions from BOOM BATTLE BAR and our sister brand Escape Hunt by email & SMS. Your information will be used in accordance with our Privacy Policy.',
    isActive: true,
  }
};
