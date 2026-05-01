import { useTranslation } from "react-i18next";
import type { CircleResponse } from "../../types";
import { CircleCard } from "./CircleCard";

export function CircleList({
  circles,
  onJoin,
  joinedCircleIds = new Set()
}: {
  circles: CircleResponse[];
  onJoin: (circle: CircleResponse) => void;
  joinedCircleIds?: Set<string>;
}) {
  const { t } = useTranslation();

  if (circles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-primary/[0.06] animate-pulse-slow">
          <span className="material-symbols-outlined text-4xl text-primary/25">savings</span>
        </div>
        <p className="text-lg font-black text-primary/35">{t("circles.empty")}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {circles.map((c, idx) => (
        <div
          key={c.id}
          className="reveal reveal-up"
          style={{ "--reveal-delay": `${idx * 80}ms` } as React.CSSProperties}
        >
          <CircleCard
            circle={c}
            onJoin={onJoin}
            isJoined={joinedCircleIds.has(String(c.id))}
          />
        </div>
      ))}
    </div>
  );
}
