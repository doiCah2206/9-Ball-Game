import { ReactNode } from "react";
import { Settings } from "lucide-react";
import bgImage from "../../imports/image-1.png";

export function GameLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col"
      style={{ backgroundColor: "#0C0E10", fontFamily: "'Lexend', sans-serif" }}>
      <img src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.5) 55%, rgba(0,0,0,0.85) 100%)" }} />
      {children}
    </div>
  );
}

export function UserPill() {
  return (
    <div className="flex items-center gap-2.5 rounded-full pr-1 pl-3.5"
      style={{ height: "42px", backgroundColor: "rgba(0,0,0,0.45)" }}>
      <div className="text-right">
        <p className="uppercase" style={{ fontSize: "8px", color: "#94A3B8", fontWeight: 500, letterSpacing: "0.12em", lineHeight: 1.2 }}>Chào mừng</p>
        <p style={{ fontSize: "13px", fontWeight: 700, color: "#FFF", lineHeight: 1.2 }}>Nhom17</p>
      </div>
      <div className="rounded-full flex items-center justify-center"
        style={{ width: "34px", height: "34px", backgroundColor: "#1A1D1F", border: "2px solid #555" }}>
        <Settings size={16} className="text-white/50" />
      </div>
    </div>
  );
}
