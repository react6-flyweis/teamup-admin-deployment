import React from 'react';
import type { IconProps } from '../../types';

interface SocialEventsIconProps extends IconProps {
  isActive?: boolean;
}

const SocialEventsIcon: React.FC<SocialEventsIconProps> = ({
  size = 24,
  isActive = false,
  className = '',
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Party Cone */}
      <path
        d="M3 21L8.5 6L18 15.5L3 21Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={isActive ? 'currentColor' : 'none'}
        fillOpacity={isActive ? 0.15 : 0}
      />
      {/* Party streamers / confetti */}
      <path
        d="M17 3L18 5M21 7L19 8M14 6L14.5 4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="20" cy="3" r="1" fill="currentColor" />
      <circle cx="13" cy="2" r="0.8" fill="currentColor" />
      {/* Ribbons */}
      <path
        d="M6 18L10 14M9 19.5L14.5 14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default SocialEventsIcon;
