import { ArrowLeft, Target, Users, Trophy, Lightbulb, Volume2 } from "lucide-react";
import { useNavigate } from "react-router";
import { GameLayout, UserPill } from "./GameLayout";

const BALL_COLORS: Record<number, { base: string; light: string; dark: string; stripe?: boolean }> = {
  1: { base: "#D4A017", light: "#FFD54F", dark: "#8B6914" },
  2: { base: "#1565C0", light: "#64B5F6", dark: "#0D3B7A" },
  3: { base: "#C62828", light: "#EF5350", dark: "#7B1A1A" },
  4: { base: "#6A1B9A", light: "#AB47BC", dark: "#3E0E5C" },
  5: { base: "#E65100", light: "#FF8A50", dark: "#8B3000" },
  6: { base: "#2E7D32", light: "#66BB6A", dark: "#1A4D1E" },
  7: { base: "#7B1E1E", light: "#C06060", dark: "#4A1010" },
  8: { base: "#212121", light: "#616161", dark: "#000000" },
  9: { base: "#D4A017", light: "#FFD54F", dark: "#8B6914", stripe: true },
};

let ballIdCounter = 0;

function PoolBall({ num, size = 28 }: { num: number; size?: number }) {
  const data = BALL_COLORS[num] || { base: "#888", light: "#BBB", dark: "#555" };
  const uid = `pb${num}_${++ballIdCounter}`;
  const isStripe = data.stripe;

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block" }}>
      <defs>
        <radialGradient id={`${uid}-base`} cx="35%" cy="30%" r="65%" fx="35%" fy="30%">
          <stop offset="0%" stopColor={data.light} />
          <stop offset="50%" stopColor={data.base} />
          <stop offset="100%" stopColor={data.dark} />
        </radialGradient>
        <radialGradient id={`${uid}-cream`} cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#F5EDD8" />
          <stop offset="100%" stopColor="#C8BDA0" />
        </radialGradient>
        <radialGradient id={`${uid}-gloss`} cx="32%" cy="25%" r="28%">
          <stop offset="0%" stopColor="white" stopOpacity="0.85" />
          <stop offset="60%" stopColor="white" stopOpacity="0.2" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        {isStripe && (
          <clipPath id={`${uid}-sclip`}>
            <rect x="0" y="28" width="100" height="44" />
          </clipPath>
        )}
      </defs>
      {isStripe ? (
        <>
          <circle cx="50" cy="50" r="48" fill={`url(#${uid}-cream)`} />
          <circle cx="50" cy="50" r="48" fill={`url(#${uid}-base)`} clipPath={`url(#${uid}-sclip)`} />
        </>
      ) : (
        <circle cx="50" cy="50" r="48" fill={`url(#${uid}-base)`} />
      )}
      <circle cx="50" cy="50" r="48" fill={`url(#${uid}-gloss)`} />
      <ellipse cx="33" cy="28" rx="8" ry="5" fill="white" opacity="0.6" transform="rotate(-20 33 28)" />
      <circle cx="50" cy="50" r="17" fill="#F5EDD8" />
      <text x="50" y="51" textAnchor="middle" dominantBaseline="central" fill="#1A1A1A" fontSize="22" fontWeight="800" fontFamily="Arial, Helvetica, sans-serif">
        {num}
      </text>
    </svg>
  );
}

const rules = [
  {
    icon: Target,
    title: "Mục tiêu",
    desc: (
      <>
        Đưa quả <b style={{ color: "#FF9100" }}>bi số 9</b> vào lỗ bất kể là trong cú đánh trực tiếp hay gián tiếp.
      </>
    ),
  },
  {
    icon: Users,
    title: "Cách đánh",
    desc: (
      <>
        Người chơi phải chạm quả <b style={{ color: "#FF9100" }}>bi có số nhỏ nhất</b> hiện có trên bàn đầu tiên trong mọi cú đánh.
      </>
    ),
  },
  {
    icon: Trophy,
    title: "Cách thắng",
    desc: (
      <>
        Thắng đủ số ván mục tiêu theo quy định của trận đấu (<b style={{ color: "#FF9100" }}>Chạm 3, 5, hoặc 7</b>).
      </>
    ),
  },
];

export function HowToPlay() {
  const navigate = useNavigate();

  return (
    <GameLayout>
      {/* Top bar */}
      <div className="relative z-20 flex items-center justify-between px-5 pt-4">
        <button
          className="text-white/25 hover:text-white/60 cursor-pointer"
          style={{ transition: "all 200ms ease-in-out" }}
        >
          <Volume2 size={18} strokeWidth={1.5} />
        </button>
        <p
          className="uppercase"
          style={{
            fontFamily: "'Lexend', sans-serif",
            fontStyle: "italic",
            fontWeight: 900,
            fontSize: "14px",
            color: "#FF9100",
            letterSpacing: "0.05em",
          }}
        >
          9 Ball by Group 17
        </p>
        <UserPill />
      </div>

      {/* Content */}
      <div className="relative z-20 flex-1 overflow-y-auto">
        <div className="max-w-[900px] mx-auto px-6 py-6">
          {/* Back button */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 cursor-pointer mb-6"
            style={{
              color: "#FF9100",
              fontWeight: 700,
              fontSize: "13px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              background: "none",
              border: "none",
            }}
          >
            <ArrowLeft size={16} />
            Quay lại
          </button>

          {/* Layout: left decoration + right content */}
          <div className="flex gap-8">
            {/* Left side decoration */}
            <div className="hidden md:flex flex-col items-start pt-4" style={{ width: "140px", flexShrink: 0 }}>
              <p
                className="uppercase"
                style={{
                  fontWeight: 900,
                  fontSize: "36px",
                  lineHeight: 1,
                  color: "rgba(255,255,255,0.06)",
                  fontStyle: "italic",
                }}
              >
                How to<br />Play
              </p>
              <div
                className="mt-6 rounded-xl px-4 py-3"
                style={{
                  backgroundColor: "rgba(255,145,0,0.08)",
                  borderLeft: "3px solid #FF9100",
                }}
              >
                <p
                  style={{
                    fontSize: "11px",
                    color: "#94A3B8",
                    fontStyle: "italic",
                    lineHeight: 1.5,
                    fontWeight: 500,
                  }}
                >
                  "Độ chính xác là chìa khóa của thành công trên bàn 9 bi."
                </p>
              </div>
            </div>

            {/* Right content */}
            <div className="flex-1">
              <h1
                className="mb-6"
                style={{
                  fontFamily: "'Lexend', sans-serif",
                  fontStyle: "italic",
                  fontWeight: 900,
                  fontSize: "clamp(28px, 5vw, 44px)",
                  color: "#FF9100",
                  textShadow: "0 2px 6px rgba(0,0,0,0.5)",
                }}
              >
                HƯỚNG DẪN CHƠI
              </h1>

              {/* 3 Rule cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                {rules.map((rule) => (
                  <div
                    key={rule.title}
                    className="rounded-2xl p-5 flex flex-col"
                    style={{
                      backgroundColor: "rgba(26,29,31,0.85)",
                      border: "1px solid rgba(60,65,72,0.5)",
                    }}
                  >
                    <div
                      className="rounded-full flex items-center justify-center mb-3"
                      style={{
                        width: "40px",
                        height: "40px",
                        backgroundColor: "rgba(255,145,0,0.12)",
                      }}
                    >
                      <rule.icon size={20} style={{ color: "#FF9100" }} />
                    </div>
                    <h3
                      style={{
                        fontWeight: 700,
                        fontSize: "16px",
                        color: "#FFFFFF",
                        marginBottom: "8px",
                      }}
                    >
                      {rule.title}
                    </h3>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#94A3B8",
                        lineHeight: 1.6,
                        fontWeight: 400,
                      }}
                    >
                      {rule.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Pro tip card */}
              <div
                className="rounded-2xl p-5 flex gap-5 items-start"
                style={{
                  backgroundColor: "rgba(26,29,31,0.85)",
                  border: "1px solid rgba(60,65,72,0.5)",
                }}
              >
                <div
                  className="hidden sm:flex items-center justify-center rounded-xl flex-shrink-0"
                  style={{
                    width: "150px",
                    height: "120px",
                    backgroundColor: "rgba(30,80,60,0.3)",
                    border: "1px solid rgba(60,65,72,0.3)",
                  }}
                >
                  <div className="flex flex-col items-center" style={{ gap: "2px" }}>
                    <div className="flex" style={{ gap: "2px" }}><PoolBall num={1} size={28} /></div>
                    <div className="flex" style={{ gap: "2px" }}><PoolBall num={2} size={28} /><PoolBall num={3} size={28} /></div>
                    <div className="flex" style={{ gap: "2px" }}><PoolBall num={4} size={28} /><PoolBall num={9} size={28} /><PoolBall num={5} size={28} /></div>
                    <div className="flex" style={{ gap: "2px" }}><PoolBall num={6} size={28} /><PoolBall num={7} size={28} /></div>
                    <div className="flex" style={{ gap: "2px" }}><PoolBall num={8} size={28} /></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb size={16} style={{ color: "#FF9100" }} />
                    <h3
                      className="uppercase"
                      style={{
                        fontWeight: 700,
                        fontSize: "14px",
                        color: "#FF9100",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Mẹo chuyên nghiệp
                    </h3>
                  </div>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#94A3B8",
                      lineHeight: 1.6,
                      fontWeight: 400,
                    }}
                  >
                    Việc điều bi sau cú đánh đầu tiên là vô cùng quan trọng. Hãy luôn tính toán vị trí của bi cái cho cú đánh tiếp theo dựa trên thứ tự các số.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
