import { Music, Gamepad2, Users, Zap, CircleHelp } from "lucide-react";
import { useNavigate } from "react-router";
import { GameLayout, UserPill } from "./GameLayout";

const menuItems = [
  { label: "Chơi với máy", icon: Gamepad2, path: "/choose-mode", mode: "vs-ai" as const },
  { label: "Chơi với người", icon: Users, path: "/choose-mode", mode: "vs-player" as const },
  { label: "Luyện tập", icon: Zap, path: null, mode: null },
  { label: "Hướng dẫn chơi", icon: CircleHelp, path: "/how-to-play", mode: null },
];

export function MainMenu() {
  const navigate = useNavigate();

  return (
    <GameLayout>
      {/* Top bar */}
      <div className="relative z-20 flex items-center justify-between px-5 pt-4">
        <button
          className="text-white/25 hover:text-white/60 cursor-pointer"
          style={{ transition: "all 200ms ease-in-out" }}
        >
          <Music size={18} strokeWidth={1.5} />
        </button>
        <UserPill />
      </div>

      {/* Main content */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 -mt-4">
        {/* Title */}
        <div className="text-center mb-8">
          <h1
            style={{
              fontFamily: "'Lexend', sans-serif",
              fontStyle: "italic",
              fontWeight: 900,
              fontSize: "clamp(70px, 10vw, 120px)",
              lineHeight: 1,
              color: "#FF9100",
              textShadow:
                "0 3px 8px rgba(0,0,0,0.5), 0 0 40px rgba(255,145,0,0.15)",
            }}
          >
            9 BALL
          </h1>
          <div className="flex items-center justify-center gap-3 mt-2">
            <span className="w-8 h-[1px]" style={{ backgroundColor: "rgba(255,145,0,0.4)" }} />
            <p
              className="uppercase"
              style={{
                fontWeight: 700,
                fontSize: "14px",
                letterSpacing: "0.25em",
                color: "#FF9100",
                opacity: 0.7,
              }}
            >
              By Nhóm 17
            </p>
            <span className="w-8 h-[1px]" style={{ backgroundColor: "rgba(255,145,0,0.4)" }} />
          </div>
        </div>

        {/* Menu buttons */}
        <div className="flex flex-col gap-2.5" style={{ width: "380px", maxWidth: "85vw" }}>
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => item.path && navigate(item.path, { state: { mode: item.mode } })}
              className="w-full flex items-center px-6 rounded-full cursor-pointer"
              style={{
                height: "58px",
                backgroundColor: "rgba(26,29,31,0.8)",
                border: "1px solid rgba(60,65,72,0.6)",
                color: "#FFFFFF",
                transition: "all 200ms ease-in-out",
                fontFamily: "'Lexend', sans-serif",
                fontWeight: 700,
                fontSize: "17px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#FF9100";
                e.currentTarget.style.borderColor = "#FF9100";
                e.currentTarget.style.color = "#000000";
                e.currentTarget.style.boxShadow = "0 0 20px rgba(255,145,0,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(26,29,31,0.8)";
                e.currentTarget.style.borderColor = "rgba(60,65,72,0.6)";
                e.currentTarget.style.color = "#FFFFFF";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <span className="flex-1 text-center">{item.label}</span>
              <item.icon size={20} className="ml-2 opacity-50" />
            </button>
          ))}
        </div>
      </div>
    </GameLayout>
  );
}