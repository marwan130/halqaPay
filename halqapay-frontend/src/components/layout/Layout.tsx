import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

export function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // IEEE IntersectionObserver Logic
  useEffect(() => {
    const reveal = (el: Element) => (el as HTMLElement).classList.add('reveal-visible');

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          reveal(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    const setupObservers = () => {
      document.querySelectorAll('.reveal').forEach(el => {
        if (!el.classList.contains('reveal-visible')) {
          io.observe(el);
        }
      });
    };

    setupObservers();

    const mo = new MutationObserver((mutations) => {
      mutations.forEach(m => {
        m.addedNodes.forEach(node => {
          if (!(node instanceof Element)) return;
          if (node.matches('.reveal') && !node.classList.contains('reveal-visible')) io.observe(node);
          node.querySelectorAll?.('.reveal:not(.reveal-visible)')?.forEach(el => io.observe(el));
        });
      });
    });

    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
