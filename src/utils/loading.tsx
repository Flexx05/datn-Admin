const LoadingShoes = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "256px",
          height: "96px",
        }}
      >
        {/* Road */}
        <div
          style={{
            position: "absolute",
            bottom: "0",
            width: "100%",
            height: "32px",
            backgroundColor: "#4b5563",
            borderTopLeftRadius: "8px",
            borderTopRightRadius: "8px",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "4px",
              backgroundColor: "#facc15",
              top: "50%",
              transform: "translateY(-50%)",
              animation: "roadStripes 0.5s linear infinite",
              backgroundImage:
                "linear-gradient(90deg, transparent 0%, transparent 40%, white 40%, white 60%, transparent 60%, transparent 100%)",
              backgroundSize: "60px 4px",
            }}
          ></div>
        </div>

        {/* Shoes */}
        <div
          style={{
            position: "absolute",
            left: "0",
            bottom: "32px",
            width: "48px",
            height: "32px",
            backgroundColor: "#ef4444",
            borderRadius: "8px",
            animation: "shoeMove 1.5s infinite",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "16px",
              height: "8px",
              backgroundColor: "#ffffff",
              borderRadius: "9999px",
              top: "-4px",
              left: "8px",
            }}
          ></div>
        </div>
        <div
          style={{
            position: "absolute",
            left: "32px",
            bottom: "32px",
            width: "48px",
            height: "32px",
            backgroundColor: "#3b82f6",
            borderRadius: "8px",
            animation: "shoeMove 1.5s infinite 0.2s",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "16px",
              height: "8px",
              backgroundColor: "#ffffff",
              borderRadius: "9999px",
              top: "-4px",
              left: "8px",
            }}
          ></div>
        </div>
      </div>
      <style jsx>{`
        @keyframes shoeMove {
          0% {
            transform: translateX(0) rotate(0deg);
          }
          25% {
            transform: translateX(20px) rotate(10deg);
          }
          50% {
            transform: translateX(40px) rotate(0deg);
          }
          75% {
            transform: translateX(20px) rotate(-10deg);
          }
          100% {
            transform: translateX(0) rotate(0deg);
          }
        }

        @keyframes roadStripes {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 60px 0;
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingShoes;
