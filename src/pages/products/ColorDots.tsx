export const ColorDots = ({ colors }: { colors: string[] }) => (
  <>
    {colors.map((color, idx) => (
      <span
        key={idx}
        style={{
          display: "inline-block",
          width: 20,
          height: 20,
          backgroundColor: color,
          borderRadius: "50%",
          border: "1px solid black",
          marginRight: 5,
        }}
      />
    ))}
  </>
);
