import React, { useEffect, useRef, useState } from "react";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  activeColor?: string;
  inactiveColor?: string;
  activeText?: string;
  inactiveText?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  activeColor = "#10A200",
  inactiveColor = "#EC221F",
  activeText,
  inactiveText,
  loading = false,
  disabled = false,
  className = "",
}) => {
  const activeRef = useRef<HTMLSpanElement>(null);
  const inactiveRef = useRef<HTMLSpanElement>(null);
  const [activeWidth, setActiveWidth] = useState(0);
  const [inactiveWidth, setInactiveWidth] = useState(0);

  useEffect(() => {
    if (activeRef.current) {
      setActiveWidth(activeRef.current.clientWidth);
    }
    if (inactiveRef.current) {
      setInactiveWidth(inactiveRef.current.clientWidth);
    }
  }, [activeText, inactiveText]);

  // Sizing constants
  const paddingX = 8;
  const gap = 10;
  const knobSize = 18;
  const containerHeight = 32;
  const minWidth = 56; // Minimum width for no-text case
  const knobTop = (containerHeight - knobSize) / 2;
  const textTop = (containerHeight - 20) / 2;

  const activeHasText = !!activeText;
  const inactiveHasText = !!inactiveText;

  const activeContainerWidth =
    paddingX * 2 + knobSize + (activeHasText ? gap + activeWidth : 0);
  const inactiveContainerWidth =
    paddingX * 2 + knobSize + (inactiveHasText ? gap + inactiveWidth : 0);

  const currentContainerWidth = checked
    ? activeContainerWidth
    : inactiveContainerWidth;

  const knobLeft = checked
    ? paddingX
    : Math.max(currentContainerWidth, minWidth) - paddingX - knobSize;

  const activeTextLeft = paddingX + knobSize + (activeHasText ? gap : 0);
  const inactiveTextLeft = paddingX;

  return (
    <>
      <div className="absolute left-[-9999px]">
        <span
          ref={activeRef}
          className="text-sm font-medium text-white"
          style={{
            fontFamily: "Roboto",
            fontStyle: "normal",
            fontWeight: 500,
            fontSize: "14px",
            lineHeight: "20px",
            letterSpacing: "0.1px",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          {activeText}
        </span>
      </div>
      <div className="absolute left-[-9999px] ">
        <span
          ref={inactiveRef}
          className="text-sm font-medium text-white"
          style={{
            fontFamily: "Roboto",
            fontStyle: "normal",
            fontWeight: 500,
            fontSize: "14px",
            lineHeight: "20px",
            letterSpacing: "0.1px",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          {inactiveText}
        </span>
      </div>
      <label
        className={`inline-flex relative items-center select-none ${
          disabled ? "cursor-not-allowed opacity-60" : loading ? "cursor-wait" : "cursor-pointer"
        } ${className}`}
      >
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          disabled={disabled || loading}
          onChange={(e) => {
            if (!disabled && !loading) {
              onChange(e.target.checked);
            }
          }}
        />
        <div
          className="relative overflow-hidden rounded-3xl"
          style={{
            width: `${Math.max(currentContainerWidth, minWidth)}px`,
            height: `${containerHeight}px`,
            backgroundColor: checked ? activeColor : inactiveColor,
            transition: "background-color 0.5s, width 0.5s",
          }}
        >
          <div
            className="absolute bg-white rounded-[10px] flex items-center justify-center shadow-sm"
            style={{
              width: `${knobSize}px`,
              height: `${knobSize}px`,
              left: `${knobLeft}px`,
              top: `${knobTop}px`,
              transition: "left 0.5s",
            }}
          >
            {loading && (
              <div
                className="w-2.5 h-2.5 rounded-full animate-spin border-2 border-solid"
                style={{
                  borderColor: "rgba(0, 0, 0, 0.15)",
                  borderTopColor: checked ? activeColor : inactiveColor,
                }}
              />
            )}
          </div>
          {activeHasText && (
            <span
              className="absolute text-sm font-medium text-white"
              style={{
                left: `${activeTextLeft}px`,
                top: `${textTop}px`,
                opacity: checked ? 1 : 0,
                fontFamily: "Roboto",
                fontStyle: "normal",
                fontWeight: 500,
                fontSize: "14px",
                lineHeight: "20px",
                letterSpacing: "0.1px",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                textAlign: "center",
                transition: "opacity 0.5s",
              }}
            >
              {activeText}
            </span>
          )}
          {inactiveHasText && (
            <span
              className="absolute text-sm font-medium text-white"
              style={{
                left: `${inactiveTextLeft}px`,
                top: `${textTop}px`,
                opacity: checked ? 0 : 1,
                fontFamily: "Roboto",
                fontStyle: "normal",
                fontWeight: 500,
                fontSize: "14px",
                lineHeight: "20px",
                letterSpacing: "0.1px",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                textAlign: "center",
                transition: "opacity 0.5s",
              }}
            >
              {inactiveText}
            </span>
          )}
        </div>
      </label>
    </>
  );
};

export default Toggle;
