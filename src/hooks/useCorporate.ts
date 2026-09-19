import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/utils/apiClient';
import type {
  CorporatesData,
  CorporatePackageItem,
  CorporateBookOnlineData,
  CorporatePrivateHireData,
  CorporateOtherGameItem,
  CorporateOtherGamesData,
  HomeResponse,
} from './useHome';

export const DEFAULT_CORPORATES_DATA: CorporatesData = {
  pageUrl: '/corporates',
  heroTitle: 'The Ultimate Team Building Experience',
  heroImageUrl: '',
  packagesTitle: 'CORPORATE PARTY PACKAGES',
  packagesDescription:
    'These are our most popular packages which allow your whole group to enjoy all that BOOM has to offer but we are, if we do say so ourselves, the ULTIMATE party planners and we can work to your group sizes, requests and budgets. So if these packages are not what you are looking for, get in touch so we can create you something bespoke!',
  packages: [
    {
      title: 'JINGLE & MINGLE',
      games: '2 HOURS OF GAMES',
      welcomeBevvy: 'PROSECCO, WINE OR BOTTLED BEER/CIDER/0% ON ARRIVAL',
      bevvies: '2 HOUSE BEVVIES (COCKTAIL UPGRADE AVAILABLE)',
      scran: 'N/A',
      somethingFun: 'N/A',
      price: '£35 PP',
    },
    {
      title: 'MISTLETOE MADNESS',
      games: '2 HOURS OF GAMES',
      welcomeBevvy: 'PROSECCO, WINE OR BOTTLED BEER/CIDER/0% ON ARRIVAL',
      bevvies: '3 HOUSE BEVVIES (COCKTAIL UPGRADE AVAILABLE)',
      scran: 'BOOM BITES - STREET FOOD BUFFET',
      somethingFun: 'FESTIVE GROUP SHOT (SWITCH TO JOE & SEPHS POPCORN TO TAKE HOME)',
      price: '£55 PP',
    },
    {
      title: 'THE CHRISTMAS CRACKER',
      games: '3 HOURS OF GAMES',
      welcomeBevvy: 'PROSECCO, WINE OR BOTTLED BEER/CIDER/0% ON ARRIVAL',
      bevvies: '4 HOUSE BEVVIES (COCKTAIL UPGRADE AVAILABLE)',
      scran: 'BOOM BITES - STREET FOOD BUFFET',
      somethingFun: 'FESTIVE GROUP SHOT (SWITCH TO JOE & SEPHS POPCORN TO TAKE HOME)',
      price: '£70 PP',
    },
    {
      title: 'BUILD YOUR OWN',
      games: 'CHOOSE YOUR GAME TIME',
      welcomeBevvy: 'CHOOSE YOUR WELCOME DRINKS',
      bevvies: 'CHOOSE YOUR DRINKS PACKAGE',
      scran: 'CHOOSE YOUR FOOD PACKAGE',
      somethingFun: 'ADD OPTIONAL EXTRAS',
      price: 'BUILT AROUND YOUR BUDGET',
    },
  ],
  budgetText:
    'Budget a bit tight? Still get in touch, we have got flexible, scalable options available for off-peak times to keep the fun going without breaking the bank!',
  bookOnline: {
    title: 'BOOK ONLINE',
    body: 'Ready to secure your corporate battleground? Our online booking system is quick, easy, and lets you choose the perfect time for your team to shine. Whether it is a small team outing or a larger department celebration, getting started is just a few clicks away.',
    imageUrl: '',
    buttonText: 'BOOK NOW',
    buttonLink: 'https://ecom.roller.app/altitudemanteca/buyapass/en-us/home',
  },
  privateHire: {
    title: 'PRIVATE HIRE',
    body: 'Looking for something truly exclusive? Our venue is available for full or partial private hire, giving your organization the ultimate playground for networking, team building, or celebrating major milestones in style.',
    imageUrl: '',
    buttonText: 'CONTACT US',
    buttonLink: 'https://www.teamuparena.com/contact-us',
  },
  otherGames: {
    title: 'OTHER GAMES',
    items: [
      {
        title: 'KARAOKE DANCE',
        imageUrl: '',
        bookNowLink: 'https://ecom.roller.app/altitudemanteca/buyapass/en-us/home',
        learnMoreLink: 'https://www.teamuparena.com/games/karaoke-dance',
      },
      {
        title: 'AR DARTS',
        imageUrl: '',
        bookNowLink: 'https://ecom.roller.app/altitudemanteca/buyapass/en-us/home',
        learnMoreLink: 'https://www.teamuparena.com/games/ar-darts',
      },
      {
        title: 'AR ARCHERY',
        imageUrl: '',
        bookNowLink: 'https://ecom.roller.app/altitudemanteca/buyapass/en-us/home',
        learnMoreLink: 'https://www.teamuparena.com/games/ar-archery',
      },
      {
        title: 'INDOOR MINI GOLF',
        imageUrl: '',
        bookNowLink: 'https://ecom.roller.app/altitudemanteca/buyapass/en-us/home',
        learnMoreLink: 'https://www.teamuparena.com/games/mini-golf',
      },
      {
        title: 'AXE THROW',
        imageUrl: '',
        bookNowLink: 'https://ecom.roller.app/altitudemanteca/buyapass/en-us/home',
        learnMoreLink: 'https://www.teamuparena.com/games/axe-throw',
      },
      {
        title: 'DUCKPIN BOWLING',
        imageUrl: '',
        bookNowLink: 'https://ecom.roller.app/altitudemanteca/buyapass/en-us/home',
        learnMoreLink: 'https://www.teamuparena.com/games/duckpin-bowling',
      },
    ],
  },
};

export interface UpdateCorporatePayload {
  corporates: CorporatesData;
  locationSlug?: string;
}

export const useCorporateQuery = (locationSlug?: string) => {
  return useQuery<HomeResponse>({
    queryKey: ['home-content', locationSlug],
    queryFn: async () => {
      const queryParam = locationSlug
        ? `?locationSlug=${encodeURIComponent(locationSlug)}`
        : '';
      const response = await apiClient.get(`/site-content/home${queryParam}`);
      return response.data;
    },
  });
};

export const useUpdateCorporateMutation = (locationSlug?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateCorporatePayload) => {
      const slug = payload.locationSlug || locationSlug;
      const queryParam = slug ? `?locationSlug=${encodeURIComponent(slug)}` : '';
      const body = {
        data: {
          corporates: payload.corporates,
        },
      };
      const response = await apiClient.patch(
        `/site-content/home${queryParam}`,
        body
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home-content'] });
    },
  });
};

export type {
  CorporatesData,
  CorporatePackageItem,
  CorporateBookOnlineData,
  CorporatePrivateHireData,
  CorporateOtherGameItem,
  CorporateOtherGamesData,
};
