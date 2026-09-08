import React from "react";
import type { IconProps } from "../../types";

interface AuditLogIconProps extends IconProps {
  isActive?: boolean;
}

const AuditLogIcon: React.FC<AuditLogIconProps> = ({
  size = 24,
  isActive = false,
  className,
  ...props
}) => {
  const colors = isActive ? { main: "#003240" } : { main: "#A3EBFF" };

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
      <path
        d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z"
        stroke={colors.main}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.75 9H8.25"
        stroke={colors.main}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.75 13H8.25"
        stroke={colors.main}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
      <path
        d="M11 17H8.25"
        stroke={colors.main}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.4"
      />
      <circle
        cx="16"
        cy="17"
        r="1.25"
        fill={colors.main}
      />
    </svg>
  );
};

export default AuditLogIcon;
