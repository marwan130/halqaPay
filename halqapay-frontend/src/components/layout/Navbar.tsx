import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import { useAuthStore } from "../../store/authStore";
import { CurrencyDisplay } from "../shared/CurrencyDisplay";
import { LanguageSwitcher } from "../shared/LanguageSwitcher";
import { NotificationInbox } from "../shared/NotificationInbox";

const linkBase =
  "relative rounded-full px-3 py-2 text-sm font-semibold text-white/85 hover:bg-white/15 hover:text-white whitespace-nowrap";
const activeClass = "bg-white/20 text-white";

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `${linkBase} ${isActive ? activeClass : ""}`}
    >
      {({ isActive }) => (
        <>
          {label}
          {isActive && <span className="nav-active-dot" />}
        </>
      )}
    </NavLink>
  );
}

export function Navbar() {
  const { t } = useTranslation();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const { signOut } = useAuth();

  // Use refs to track values without triggering re-renders on every scroll tick.
  // Only call setState when the value actually changes.
  const [compact,  setCompact]  = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const compactRef  = useRef(false);
  const scrolledRef = useRef(false);
  const rafRef      = useRef<number | null>(null);
  const lastYRef    = useRef(0);

  useEffect(() => {
    lastYRef.current = window.scrollY;

    const handleScroll = () => {
      // Skip if a frame is already queued – keeps the handler O(1) per frame
      if (rafRef.current !== null) return;

      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;

        const currentY = window.scrollY;
        const lastY    = lastYRef.current;

        // ── scrolled state (glass blur intensifies) ──
        const nowScrolled = currentY > 6;
        if (nowScrolled !== scrolledRef.current) {
          scrolledRef.current = nowScrolled;
          setScrolled(nowScrolled);
        }

        // ── compact state (pill shrinks on scroll-down, expands on scroll-up) ──
        if (!compactRef.current && currentY > lastY + 10 && currentY > 80) {
          compactRef.current = true;
          setCompact(true);
        } else if (compactRef.current && (currentY < lastY - 10 || currentY < 40)) {
          compactRef.current = false;
          setCompact(false);
        }

        lastYRef.current = currentY;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <header
      className={[
        "mt-2",
        "flex w-max max-w-[calc(100vw-1.25rem)] items-center justify-center gap-4",
        "rounded-full border px-6 text-white shadow-cardLg backdrop-blur-md",
        "transition-[height,opacity,transform,box-shadow,background-color,border-color]",
        "duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
        compact
          ? "h-11 translate-y-0.5 scale-[0.97] opacity-95"
          : "h-16 translate-y-0 scale-100 opacity-100",
        scrolled
          ? "border-white/15 bg-primary/85 shadow-[0_8px_32px_-8px_rgba(0,38,69,0.35)]"
          : "border-primary-container/30 bg-primary/90",
      ].join(" ")}
    >
      {/* Logo */}
      <Link
        to="/"
        className="group flex shrink-0 items-center gap-2.5 text-lg font-black tracking-tight text-white md:text-xl"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 shadow-inner ring-1 ring-white/10 transition-[transform,box-shadow] duration-300 group-hover:scale-110 group-hover:bg-white/25 group-hover:shadow-[0_0_20px_rgba(254,214,91,0.3)]">
          <img
            src="/halqapay.png"
            alt={t("nav.logoAlt")}
            className="h-7 w-7 object-contain transition-transform duration-500 group-hover:rotate-12"
          />
        </div>
        {!compact && (
          <span className="transition-colors duration-200 group-hover:text-accent">
            HalqaPay
          </span>
        )}
      </Link>

      {/* Nav links */}
      {!compact && (
        <nav className="hidden items-center gap-1 md:flex">
          {token && (
            <>
              <NavItem to="/circles"      label={t("nav.circles")} />
              <NavItem to="/circles/new"  label={t("nav.newCircle")} />
              <NavItem to="/dashboard"    label={t("nav.dashboard")} />
              <NavItem to="/transactions" label={t("nav.activity")} />
            </>
          )}
          <NavItem to="/how-it-works" label={t("nav.howItWorks")} />
          <NavItem to="/about"        label={t("nav.about")} />
        </nav>
      )}

      {/* Right cluster */}
      <div className="flex shrink-0 items-center gap-3">
        {!compact && <LanguageSwitcher />}

        <NavLink
          to="/contact"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? activeClass : ""} flex items-center justify-center`
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
            <div className="font-bold leading-none text-white mb-0.5">
              {user.fullName}
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-accent/90">
              <CurrencyDisplay amount={user.walletBalance} currency={user.currency} />
            </div>
          </div>
        )}

        {token ? (
          <button
            type="button"
            onClick={() => void signOut()}
            className={`btn-ieee rounded-full border border-white/25 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-white hover:bg-white/15 hover:border-white/40 ${compact ? "px-2 py-1" : ""}`}
          >
            {compact ? t("nav.logoutCompact") : t("nav.logout")}
          </button>
        ) : (
          <div className="flex items-center gap-3">
            {!compact && (
              <Link
                to="/login"
                className="rounded-full px-3 py-2 text-sm font-semibold text-white/90 hover:bg-white/15 hover:text-white"
              >
                {t("nav.login")}
              </Link>
            )}
            <Link
              to="/register"
              className={`btn-ieee btn-shimmer rounded-full bg-accent font-bold text-primary shadow-sm hover:brightness-105 ${compact ? "px-4 py-1.5 text-xs" : "px-5 py-2 text-sm"}`}
            >
              {compact ? t("nav.getStartedCompact") : t("nav.getStarted")}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
