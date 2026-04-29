import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import { useAuthStore } from "../../store/authStore";
import { CurrencyDisplay } from "../shared/CurrencyDisplay";
import { LanguageSwitcher } from "../shared/LanguageSwitcher";

const linkClass =
  "rounded-full px-3 py-2 text-sm font-semibold text-white/85 transition-colors hover:bg-white/15 hover:text-white";
const activeClass = "bg-white/20 text-white";

export function Navbar() {
  const { t } = useTranslation();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const { signOut } = useAuth();
  const [compact, setCompact] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 6);
      if (currentY > lastY + 8 && currentY > 80) {
        setCompact(true);
      } else if (currentY < lastY - 8 || currentY < 40) {
        setCompact(false);
      }
      lastY = currentY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 mx-auto mt-2 flex w-[calc(100%-1.25rem)] max-w-containerMax items-center justify-between gap-3 rounded-full border px-4 text-primary-on shadow-cardLg backdrop-blur-md transition-all duration-300 md:px-7 ${
        compact ? "h-12" : "h-16"
      } ${
        scrolled
          ? "border-white/20 bg-primary/80"
          : "border-primary-container/30 bg-primary/90"
      }`}
    >
      <div className="flex min-w-0 items-center gap-6">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 text-lg font-black tracking-tight text-primary-on md:text-xl"
        >
          <img src="/halqapay.png" alt="HalqaPay logo" className="h-8 w-8 rounded-md object-contain" />
          HalqaPay
        </Link>
        <nav className="hidden flex-wrap items-center gap-1 md:flex">
          {token ? (
            <>
              <NavLink
                to="/circles"
                className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}
              >
                {t("nav.circles")}
              </NavLink>
              <NavLink
                to="/circles/new"
                className={({ isActive }) =>
                  `${linkClass} ${isActive ? activeClass : ""}`
                }
              >
                {t("nav.newCircle")}
              </NavLink>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `${linkClass} ${isActive ? activeClass : ""}`
                }
              >
                {t("nav.dashboard")}
              </NavLink>
              <NavLink
                to="/transactions"
                className={({ isActive }) =>
                  `${linkClass} ${isActive ? activeClass : ""}`
                }
              >
                {t("nav.activity")}
              </NavLink>
            </>
          ) : null}
        </nav>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <LanguageSwitcher />
        {user ? (
          <div className="hidden text-end text-sm sm:block">
            <div className="font-bold text-white">{user.fullName}</div>
            <div className="text-white/75">
              <CurrencyDisplay
                amount={user.walletBalance}
                currency={user.currency}
              />
            </div>
          </div>
        ) : null}
        {token ? (
          <button
            type="button"
            onClick={() => void signOut()}
            className="rounded-full border border-white/25 px-3 py-2 text-sm font-bold text-white hover:bg-white/15"
          >
            {t("nav.logout")}
          </button>
        ) : (
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              to="/login"
              className="rounded-full px-2 py-2 text-sm font-semibold text-white/90 hover:bg-white/15 sm:px-3"
            >
              {t("nav.login")}
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-secondary-container px-3 py-2 text-sm font-bold text-on-secondary-container shadow-sm hover:brightness-95"
            >
              {t("nav.getStarted")}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
