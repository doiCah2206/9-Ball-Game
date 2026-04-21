import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { GameLayout, UserPill } from "./GameLayout";

const modes = [
  {
    id: 3,
    label: "CHẠM 3",
    desc: "Trận đấu nhanh chóng, thắng ngay sau 3 ván.",
  },
  {
    id: 5,
    label: "CHẠM 5",
    desc: "Chế độ tiêu chuẩn, đòi hỏi sự bền bỉ và kỹ năng.",
    popular: true,
  },
  {
    id: 7,
    label: "CHẠM 7",
    desc: "Đỉnh cao so tài, chỉ dành cho các cơ thủ chuyên nghiệp.",
  },
];

export function ChooseMode() {
  const [selected, setSelected] = useState(5);
  const navigate = useNavigate();

  return (
    <GameLayout>
      {/* Top bar */}
      <div className="relative z-20 flex items-center justify-between px-5 pt-4">
        <button
          onClick={() => navigate("/")}
          className="flex items-center justify-center rounded-full cursor-pointer"
          style={{
            width: "42px",
            height: "42px",
            backgroundColor: "rgba(0,0,0,0.45)",
            border: "1px solid rgba(60,65,72,0.6)",
            transition: "all 200ms ease-in-out",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#FF9100";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(60,65,72,0.6)";
          }}
        >
          <ArrowLeft size={18} className="text-white" />
        </button>
        <UserPill />
      </div>

      {/* Content */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-4">
        {/* Title */}
        <h1
          className="text-center mb-10"
          style={{
            fontFamily: "'Lexend', sans-serif",
            fontStyle: "italic",
            fontWeight: 900,
            fontSize: "clamp(36px, 6vw, 56px)",
            color: "#FFFFFF",
            textShadow: "0 3px 8px rgba(0,0,0,0.5)",
          }}
        >
          CHỌN CHẾ ĐỘ CHƠI
        </h1>

        {/* Mode cards */}
        <div className="flex items-center justify-center gap-4" style={{ maxWidth: "90vw" }}>
          {modes.map((mode) => {
            const isSelected = selected === mode.id;
            return (
              <div
                key={mode.id}
                onClick={() => setSelected(mode.id)}
                className="relative flex flex-col items-center cursor-pointer"
                style={{
                  width: isSelected ? "240px" : "180px",
                  minHeight: isSelected ? "280px" : "220px",
                  backgroundColor: isSelected
                    ? "#FF9100"
                    : "rgba(26,29,31,0.85)",
                  border: isSelected
                    ? "2px solid #FF9100"
                    : "1px solid rgba(60,65,72,0.6)",
                  borderRadius: "16px",
                  padding: isSelected ? "28px 20px" : "24px 16px",
                  color: isSelected ? "#000" : "#FFF",
                  transition: "all 200ms ease-in-out",
                }}
              >
                {/* Popular badge */}
                {mode.popular && isSelected && (
                  <div
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 uppercase"
                    style={{
                      backgroundColor: "#1A1D1F",
                      color: "#FF9100",
                      fontSize: "10px",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      border: "1px solid #FF9100",
                    }}
                  >
                    Phổ biến
                  </div>
                )}

                {/* Number */}
                <span
                  style={{
                    fontWeight: 900,
                    fontSize: isSelected ? "64px" : "48px",
                    lineHeight: 1,
                    fontStyle: "italic",
                    opacity: isSelected ? 1 : 0.7,
                    color: isSelected ? "#000" : "#FF9100",
                  }}
                >
                  {mode.id}
                </span>

                {/* Label */}
                <span
                  className="uppercase mt-1"
                  style={{
                    fontWeight: 700,
                    fontSize: isSelected ? "18px" : "16px",
                  }}
                >
                  {mode.label}
                </span>

                {/* Description */}
                <p
                  className="text-center mt-2"
                  style={{
                    fontSize: "12px",
                    fontWeight: 500,
                    opacity: 0.7,
                    lineHeight: 1.4,
                  }}
                >
                  {mode.desc}
                </p>

                {/* Enter button */}
                {isSelected && (
                  <button
                    className="mt-4 uppercase rounded-full cursor-pointer"
                    style={{
                      backgroundColor: "#1A1D1F",
                      color: "#FF9100",
                      fontWeight: 700,
                      fontSize: "13px",
                      letterSpacing: "0.1em",
                      padding: "10px 28px",
                      border: "none",
                      transition: "all 200ms ease-in-out",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#000";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#1A1D1F";
                    }}
                    onClick={() => navigate("/game", { state: { winsNeeded: mode.id } })}
                  >
                    Vào phòng
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom text */}
        <p
          className="text-center mt-8 uppercase"
          style={{
            fontSize: "11px",
            color: "#94A3B8",
            fontWeight: 500,
            letterSpacing: "0.1em",
            maxWidth: "600px",
          }}
        >
          Chọn số ván thắng cần thiết để kết thúc trận đấu và giành chiến thắng
          chung cuộc
        </p>
      </div>
    </GameLayout>
  );
}
