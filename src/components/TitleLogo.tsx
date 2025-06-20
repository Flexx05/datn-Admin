import { useContext, CSSProperties } from "react";
import { ColorModeContext } from "../contexts/color-mode";

interface TitleLogoProps {
  collapsed: boolean;
  style?: CSSProperties;
}

export const TitleLogo = ({ collapsed, style }: TitleLogoProps) => {
  const { mode } = useContext(ColorModeContext);
  const inovaColor = mode === "light" ? "#222" : "#fff";
  if (collapsed) {
    return (
      <div
        style={{
          color: "#8BC34A",
          fontWeight: 700,
          fontSize: 32,
          cursor: "pointer",
          ...style,
        }}
      >
        B
      </div>
    );
  }
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        fontSize: 32,
        fontWeight: 600,
        fontFamily: "inherit",
        ...style,
      }}
    >
      <span style={{ color: "#8BC34A", fontWeight: 700 }}>B</span>
      <span style={{ color: inovaColor, fontWeight: 400 }}>inova</span>
      <span
        style={{
          color: "#8BC34A",
          fontWeight: 700,
          marginLeft: 2,
          fontSize: 40,
          lineHeight: 0.7,
        }}
      >
        .
      </span>
    </div>
  );
};
