import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState, createContext, useContext } from "react";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

const ModalContext = createContext<{
  isModalOpen: boolean;
  setModalOpen: (open: boolean) => void;
}>({
  isModalOpen: false,
  setModalOpen: () => {},
});

export const useModal = () => useContext(ModalContext);

export function Layout() {
  const { pathname } = useLocation();
  const [scrollPct, setScrollPct] = useState(0);
  const [visible, setVisible] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      setScrollPct(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Intersection observer for .reveal elements */
  useEffect(() => {
    const reveal = (el: Element) =>
      (el as HTMLElement).classList.add("reveal-visible");

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) { reveal(entry.target); io.unobserve(entry.target); }
        });
      },
      { threshold: 0.10 }
    );

    const setup = () =>
      document.querySelectorAll(".reveal").forEach((el) => {
        if (!el.classList.contains("reveal-visible")) io.observe(el);
      });
    setup();

    const mo = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        m.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches(".reveal") && !node.classList.contains("reveal-visible")) io.observe(node);
          node.querySelectorAll?.(".reveal:not(.reveal-visible)")?.forEach((el) => io.observe(el));
        });
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => { io.disconnect(); mo.disconnect(); };
  }, [pathname]);

  return (
    <ModalContext.Provider value={{ isModalOpen, setModalOpen }}>
      <div className="flex min-h-screen flex-col">
        {/* Ambient orb blobs (fixed, behind everything) */}
        <div className="ambient-orb ambient-orb-1" aria-hidden="true" />
        <div className="ambient-orb ambient-orb-2" aria-hidden="true" />
        <div className="ambient-orb ambient-orb-3" aria-hidden="true" />
        <div className="ambient-orb ambient-orb-4" aria-hidden="true" />

        {/* Scroll progress bar */}
        <div
          id="scroll-progress"
          style={{ transform: `scaleX(${scrollPct / 100})` }}
          aria-hidden="true"
        />

        {/* ── Fixed navbar overlay — floats over page content ── */}
        <div className="fixed inset-x-0 top-0 z-50 flex justify-center pointer-events-none">
          <div className="pointer-events-auto">
            <Navbar />
          </div>
        </div>

        {/* Page content starts at top-0 (hero backgrounds fill behind the navbar) */}
        <main
          className="relative z-10 flex-1"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 350ms cubic-bezier(0.23,1,0.32,1), transform 350ms cubic-bezier(0.23,1,0.32,1)"
          }}
        >
          <Outlet />
        </main>

        {!pathname.includes('/login') && !pathname.includes('/register') && !isModalOpen && <Footer />}
      </div>
    </ModalContext.Provider>
  );
}
