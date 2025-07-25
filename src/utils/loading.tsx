import React from "react";

const LoadingShoes: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "260px",
          height: "120px",
        }}
      >
        {/* Con đường */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
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

        {/* Giày đỏ */}
        <div
          style={{
            position: "absolute",
            left: 0,
            bottom: "32px",
            width: "48px",
            height: "32px",
            backgroundColor: "#ef4444",
            borderRadius: "8px",
            animation: "shoeStepAlternate 1.5s infinite",
            transformOrigin: "center bottom",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "16px",
              height: "8px",
              backgroundColor: "#ffdf99",
              borderRadius: "9999px",
              top: "-4px",
              left: "8px",
            }}
          ></div>
        </div>

        {/* Giày xanh */}
        <div
          style={{
            position: "absolute",
            left: "32px",
            bottom: "32px",
            width: "48px",
            height: "32px",
            backgroundColor: "#3b82f6",
            borderRadius: "8px",
            animation: "shoeStepAlternate 1.5s infinite",
            animationDelay: "0.75s",
            transformOrigin: "center bottom",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "16px",
              height: "8px",
              backgroundColor: "#ffdf99",
              borderRadius: "9999px",
              top: "-4px",
              left: "8px",
            }}
          ></div>
        </div>
      </div>

      {/* Text loading */}
      <p
        style={{
          marginTop: "24px",
          color: "#4b5563",
          fontSize: "18px",
          animation: "pulse 2s infinite",
        }}
      >
        Đang chuẩn bị cho chuyến hành trình...
      </p>

      <style>{`
        @keyframes shoeStepAlternate {
          0% {
            transform: translateX(0) translateY(0) rotate(0deg);
          }
          20% {
            transform: translateX(10px) translateY(-10px) rotate(8deg);
          }
          40% {
            transform: translateX(20px) translateY(0) rotate(0deg);
          }
          60% {
            transform: translateX(30px) translateY(-8px) rotate(-8deg);
          }
          80% {
            transform: translateX(40px) translateY(0) rotate(0deg);
          }
          100% {
            transform: translateX(0) translateY(0) rotate(0deg);
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

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingShoes;
