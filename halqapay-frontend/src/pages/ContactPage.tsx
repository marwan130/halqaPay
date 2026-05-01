import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

export function ContactPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    setSent(true);
  }

  return (
    <main className={`mx-auto max-w-containerMax px-gutter pt-24 pb-16 transition-opacity duration-700 ${isVisible ? "opacity-100" : "opacity-0"}`}>
      <div className="flex flex-col space-y-12">
        <div className="animate-fade-in-up space-y-4">
          <h1 className="text-4xl font-black text-primary md:text-5xl">{t("contact.title")}</h1>
          <p className="text-xl text-on-surface-variant max-w-2xl">{t("contact.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 items-start">
          {/* Left Side: Info Boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 lg:col-span-1">
            {[
              { icon: "email", label: t("contact.emailLabel"), value: t("contact.emailValue") },
              { icon: "call", label: t("contact.phoneLabel"), value: t("contact.phoneValue") },
              { icon: "schedule", label: t("contact.hoursLabel"), value: t("contact.hoursValue") },
              { icon: "location_on", label: t("contact.locationTitle"), value: t("contact.locationAddress") }
            ].map((item, i) => (
              <div key={i} className={`animate-fade-in-up delay-${(i + 1) * 100} flex items-start gap-4 p-6 rounded-2xl border border-outline-variant bg-surface-lowest shadow-sm`}>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-secondary-container">
                  <span className="material-symbols-outlined">{item.icon}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-primary">{item.label}</p>
                  <p className="text-lg text-on-surface">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right Side: Form Box */}
          <div className="animate-fade-in-up delay-300 lg:col-span-2 rounded-modal border border-outline-variant bg-white p-8 shadow-cardLg h-full">
            {sent ? (
              <div className="flex h-full min-h-[400px] flex-col items-center justify-center space-y-6 text-center">
                <div className="animate-scale-in flex h-20 w-20 items-center justify-center rounded-full bg-success-container text-success-on">
                  <span className="material-symbols-outlined text-5xl">check_circle</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-primary">{t("contact.form.success")}</h2>
                </div>
                <button
                  onClick={() => setSent(false)}
                  className="rounded-xl border border-outline-variant px-8 py-3 font-bold text-primary transition-colors hover:bg-surface-low"
                >
                  {t("contact.form.sendAnother")}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-primary">{t("contact.form.name")}</label>
                    <input
                      type="text"
                      required
                      placeholder={t("contact.form.placeholderName")}
                      className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-3 transition-colors focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-primary">{t("contact.form.email")}</label>
                    <input
                      type="email"
                      required
                      placeholder={t("contact.form.placeholderEmail")}
                      className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-3 transition-colors focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-primary">{t("contact.form.subject")}</label>
                  <input
                    type="text"
                    required
                    placeholder={t("contact.form.placeholderSubject")}
                    className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-3 transition-colors focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-primary">{t("contact.form.message")}</label>
                  <textarea
                    required
                    rows={6}
                    className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-3 transition-colors focus:border-primary focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full overflow-hidden rounded-xl bg-primary py-4 text-lg font-bold text-primary-on shadow-card transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  <span className="relative z-10">{loading ? t("contact.form.sending") : t("contact.form.send")}</span>
                  <div className="absolute inset-0 translate-y-full bg-white/10 transition-transform group-hover:translate-y-0" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
