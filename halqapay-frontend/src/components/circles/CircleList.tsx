import { useTranslation } from "react-i18next";
import type { CircleResponse } from "../../types";
import { CircleCard } from "./CircleCard";

export function CircleList({
  circles,
  onJoin
}: {
  circles: CircleResponse[];
  onJoin: (circle: CircleResponse) => void;
}) {
  const { t } = useTranslation();
  if (circles.length === 0) {
    return (
      <p className="rounded-card border border-dashed border-outline-variant bg-surface-lowest px-4 py-10 text-center text-on-surface-variant">
        {t("circles.empty")}
      </p>
    );
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {circles.map((c) => (
        <CircleCard key={c.id} circle={c} onJoin={onJoin} />
      ))}
    </div>
  );
}
