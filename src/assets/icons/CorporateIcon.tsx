import React from 'react';
import type { IconProps } from '../../types';

interface CorporateIconProps extends IconProps {
  isActive?: boolean;
}

const CorporateIcon: React.FC<CorporateIconProps> = ({
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
      {/* Briefcase handle */}
      <path
        d="M9 6V5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Briefcase body */}
      <rect
        x="3"
        y="6"
        width="18"
        height="14"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.75"
        fill={isActive ? 'currentColor' : 'none'}
        fillOpacity={isActive ? 0.15 : 0}
      />
      {/* Center lock & strap line */}
      <path
        d="M3 11H21"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M10 11V13.5C10 14.0523 10.4477 14.5 11 14.5H13C13.5523 14.5 14 14.0523 14 13.5V11"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CorporateIcon;
