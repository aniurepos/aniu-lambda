import React from "react";

interface TriangleIconProps {
  size?: number;
  color?: string;
}

/**
 * A 3D triangle (tetrahedron) icon.
 * Renders an isometric 3D triangle using SVG paths with gradient fills.
 */
export default function TriangleIcon({ size = 48, color = "#1677ff" }: TriangleIconProps) {
  // Lighter and darker variants of the base color for 3D shading
  const lightColor = color + "80"; // 50% opacity for lighter face
  const darkColor = color; // full color for darker face
  const midColor = color + "cc"; // 80% opacity for mid face

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      {/* Back face (darker) */}
      <polygon
        points="50,10 15,75 85,75"
        fill={darkColor}
        opacity="0.6"
      />
      {/* Left face */}
      <polygon
        points="50,10 15,75 50,85"
        fill={midColor}
        opacity="0.85"
      />
      {/* Right face */}
      <polygon
        points="50,10 85,75 50,85"
        fill={lightColor}
        opacity="0.7"
      />
      {/* Bottom face */}
      <polygon
        points="15,75 85,75 50,85"
        fill={darkColor}
        opacity="0.5"
      />
      {/* Edges for definition */}
      <line x1="50" y1="10" x2="15" y2="75" stroke={darkColor} strokeWidth="1.5" />
      <line x1="50" y1="10" x2="85" y2="75" stroke={darkColor} strokeWidth="1.5" />
      <line x1="50" y1="10" x2="50" y2="85" stroke={darkColor} strokeWidth="1.5" />
      <line x1="15" y1="75" x2="85" y2="75" stroke={darkColor} strokeWidth="1.5" />
      <line x1="15" y1="75" x2="50" y2="85" stroke={darkColor} strokeWidth="1.5" />
      <line x1="85" y1="75" x2="50" y2="85" stroke={darkColor} strokeWidth="1.5" />
    </svg>
  );
}
