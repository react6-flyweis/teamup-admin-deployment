import type { IconProps, } from '@/types';
import HomeIcon from '@/assets/icons/HomeIcon';
import GameIcon from '@/assets/icons/GameIcon';
import BiteIcon from '@/assets/icons/BiteIcon';
// import DashboardIcon from '@/assets/icons/DashboardIcon';
// import BookingIcon from '@/assets/icons/BookingIcon';
// import PaymentIcon from '@/assets/icons/PaymentIcon';
// import PromotionIcon from '@/assets/icons/PromotionIcon';
// import CustomerIcon from '@/assets/icons/CustomerIcon';
// import StaffIcon from '@/assets/icons/StaffIcon';
// import AlertIcon from '@/assets/icons/AlertIcon';
// import InsightIcon from '@/assets/icons/InsightIcon';
// import SecurityIcon from '@/assets/icons/SecurityIcon';
import VenuesIcon from '@/assets/icons/VenuesIcon';
import HeaderIcon from '@/assets/icons/HeaderIcon';
import SocialReviewsIcon from '@/assets/icons/SocailReviewsIcon';
import FooterIcon from '@/assets/icons/FooterIcon';
import EnquiriesIcon from '@/assets/icons/EnquiriesIcon';



export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<IconProps & { isActive?: boolean }>;
  path: string;
}

export const navigationItems: NavigationItem[] = [
  // {
  //   id: 'dashboard',
  //   label: 'Dashboard',
  //   icon: DashboardIcon,
  //   path: '/',
  // },
  {
    id: 'manage-home',
    label: 'Manage Home',
    icon: HomeIcon,
    path: '/manage-home',
  },
  {
    id: 'manage-header',
    label: 'Manage Header',
    icon: HeaderIcon,
    path: '/manage-header',
  },
  {
    id: 'manage-footer',
    label: 'Manage Footer',
    icon: FooterIcon,
    path: '/manage-footer',
  },
  {
    id: 'game-venue',
    label: 'Game & Venue',
    icon: GameIcon,
    path: '/game-venue',
  },
  {
    id: 'food-drinks',
    label: 'Bites & Drinks',
    icon: BiteIcon,
    path: '/food-drinks',
  },
  // {
  //   id: 'bookings',
  //   label: 'Bookings',
  //   icon: BookingIcon,
  //   path: '/bookings',
  // },
  // {
  //   id: 'payments',
  //   label: 'Payments',
  //   icon: PaymentIcon,
  //   path: '/payments',
  // },
  // {
  //   id: 'promotion',
  //   label: 'Promotion',
  //   icon: PromotionIcon,
  //   path: '/promotion',
  // },
  // {
  //   id: 'customers',
  //   label: 'Customers',
  //   icon: CustomerIcon,
  //   path: '/customers',
  // },
  // {
  //   id: 'staff-roles',
  //   label: 'Staff & Roles',
  //   icon: StaffIcon,
  //   path: '/staff-roles',
  // },
  // {
  //   id: 'alerts',
  //   label: 'Alerts',
  //   icon: AlertIcon,
  //   path: '/alerts',
  // },
  {
    id: 'social-reviews',
    label: 'Social & Reviews',
    icon: SocialReviewsIcon,
    path: '/social-reviews',
  },
  {
    id: 'venues',
    label: 'Venues',
    icon: VenuesIcon,
    path: '/venues',
  },
  {
    id: 'enquiries',
    label: 'Enquiries',
    icon: EnquiriesIcon,
    path: '/enquiries',
  },

  // {
  //   id: 'insight',
  //   label: 'Insight',
  //   icon: InsightIcon,
  //   path: '/insight',
  // },
  // {
  //   id: 'security',
  //   label: 'Security',
  //   icon: SecurityIcon,
  //   path: '/security',
  // },
];
