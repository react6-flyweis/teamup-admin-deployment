import type { IconProps, PermissionKey, Role } from '@/types';
import { ROLES } from '@/types';
import HomeIcon from '@/assets/icons/HomeIcon';
import GameIcon from '@/assets/icons/GameIcon';
import BiteIcon from '@/assets/icons/BiteIcon';
// import BookingIcon from '@/assets/icons/BookingIcon';
// import StaffIcon from '@/assets/icons/StaffIcon';
import VenuesIcon from '@/assets/icons/VenuesIcon';
import HeaderIcon from '@/assets/icons/HeaderIcon';
import SocialReviewsIcon from '@/assets/icons/SocailReviewsIcon';
import FooterIcon from '@/assets/icons/FooterIcon';
import EnquiriesIcon from '@/assets/icons/EnquiriesIcon';
import SecurityIcon from '@/assets/icons/SecurityIcon';
import UserIcon from '@/assets/icons/UserIcon';
import AuditLogIcon from '@/assets/icons/AuditLogIcon';

export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<IconProps & { isActive?: boolean }>;
  path: string;
  permission?: PermissionKey;
  tabId?: string;
  roles?: Role[];
}

export const navigationItems: NavigationItem[] = [
  {
    id: 'manage-home',
    label: 'Manage Home',
    icon: HomeIcon,
    path: '/manage-home',
    permission: 'manage_home',
    tabId: 'manage_home',
  },
  {
    id: 'manage-header',
    label: 'Manage Header',
    icon: HeaderIcon,
    path: '/manage-header',
    permission: 'manage_header',
    tabId: 'manage_header',
  },
  {
    id: 'manage-footer',
    label: 'Manage Footer',
    icon: FooterIcon,
    path: '/manage-footer',
    permission: 'manage_footer',
    tabId: 'manage_footer',
  },
  {
    id: 'game-venue',
    label: 'Game & Venue',
    icon: GameIcon,
    path: '/game-venue',
    permission: 'game_venue',
    tabId: 'game_venue',
  },
  {
    id: 'food-drinks',
    label: 'Bites & Drinks',
    icon: BiteIcon,
    path: '/food-drinks',
    permission: 'bites_drinks',
    tabId: 'bites_drinks',
  },
  // {
  //   id: 'bookings',
  //   label: 'Bookings',
  //   icon: BookingIcon,
  //   path: '/bookings',
  //   permission: 'bookings',
  //   tabId: 'bookings',
  // },
  {
    id: 'social-reviews',
    label: 'Social & Reviews',
    icon: SocialReviewsIcon,
    path: '/social-reviews',
    permission: 'social_reviews',
    tabId: 'social_reviews',
  },
  {
    id: 'venues',
    label: 'Venues',
    icon: VenuesIcon,
    path: '/venues',
    permission: 'venues',
    tabId: 'venues',
  },
  {
    id: 'enquiries',
    label: 'Enquiries',
    icon: EnquiriesIcon,
    path: '/enquiries',
    permission: 'enquiries',
    tabId: 'enquiries',
  },
  // {
  //   id: 'staff-roles',
  //   label: 'Staff & Roles',
  //   icon: StaffIcon,
  //   path: '/staff-roles',
  //   permission: 'users',
  //   tabId: 'users',
  // },
  {
    id: 'admin-users',
    label: 'Admin Users',
    icon: UserIcon,
    path: '/admin-users',
    roles: [ROLES.SUPER_ADMIN],
  },
  {
    id: 'roles-permissions',
    label: 'Roles & Permissions',
    icon: SecurityIcon,
    path: '/roles-permissions',
    roles: [ROLES.SUPER_ADMIN],
  },
  {
    id: 'audit-logs',
    label: 'Audit Logs',
    icon: AuditLogIcon,
    path: '/audit-logs',
    roles: [ROLES.SUPER_ADMIN],
  },
];
