import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import { useAuthStore } from "../../store/authStore";
import { CurrencyDisplay } from "../shared/CurrencyDisplay";
import { LanguageSwitcher } from "../shared/LanguageSwitcher";
import { NotificationInbox } from "../shared/NotificationInbox";

const linkClass =
  "rounded-full px-2 py-2 text-sm font-semibold text-white/85 transition-colors hover:bg-white/15 hover:text-white whitespace-nowrap";
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
      className={`sticky top-0 z-50 mx-auto mt-2 flex w-max max-w-[calc(100%-1.25rem)] items-center justify-center gap-4 rounded-full border px-6 text-white shadow-cardLg backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] will-change-[width,transform] ${compact ? "h-11 translate-y-1 scale-95 opacity-95" : "h-16 translate-y-0 scale-100 opacity-100"
        } ${scrolled
          ? "border-white/20 bg-primary/80"
          : "border-primary-container/30 bg-primary/90"
        }`}
    >
      <Link
        to="/"
        className="flex shrink-0 items-center gap-4 text-lg font-black tracking-tight text-white md:text-xl"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 shadow-inner">
          <img src="/halqapay.png" alt={t("nav.logoAlt")} className="h-6 w-6 object-contain" />
        </div>
        {!compact && <span>HalqaPay</span>}
      </Link>

      {!compact && (
        <nav className="hidden items-center gap-4 md:flex">
        {token && (
          <>
            <NavLink
              to="/circles"
              className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}
            >
              {t("nav.circles")}
            </NavLink>
            <NavLink
              to="/circles/new"
              className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}
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
        )}
        <NavLink
          to="/how-it-works"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          {t("nav.howItWorks")}
        </NavLink>
        <NavLink
          to="/about"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          {t("nav.about")}
        </NavLink>
      </nav>
      )}

      <div className="flex shrink-0 items-center gap-4">
        {!compact && <LanguageSwitcher />}
        <NavLink
          to="/contact"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""} flex items-center justify-center`
          }
          title={t("nav.contact")}
        >
          <span className="material-symbols-outlined text-[20px]">mail</span>
        </NavLink>
        {token && (
          <div className="flex items-center justify-center">
            <NotificationInbox />
          </div>
        )}
        {user && !compact && (
          <div className="hidden text-end text-sm sm:block">
            <div className="font-bold text-white leading-none mb-1">{user.fullName}</div>
            <div className="text-white/60 text-[10px] font-black uppercase tracking-widest">
              <CurrencyDisplay
                amount={user.walletBalance}
                currency={user.currency}
              />
            </div>
          </div>
        )}
        {token ? (
          <button
            type="button"
            onClick={() => void signOut()}
            className={`btn-ieee rounded-full border border-white/25 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:bg-white/15 ${compact ? "px-2 py-1" : ""}`}
          >
            {compact ? t("nav.logoutCompact") : t("nav.logout")}
          </button>
        ) : (
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className={`rounded-full px-3 py-2 text-sm font-semibold text-white/90 hover:bg-white/15 ${compact ? "hidden" : ""}`}
            >
              {t("nav.login")}
            </Link>
            <Link
              to="/register"
              className={`btn-ieee rounded-full bg-accent px-5 py-2 text-sm font-bold text-primary shadow-sm hover:brightness-105 ${compact ? "px-5 py-1.5" : ""}`}
            >
              {compact ? t("nav.getStartedCompact") : t("nav.getStarted")}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
