import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ar from "./locales/ar.json";
import en from "./locales/en.json";

const STORAGE_KEY = "halqapay-lang";

function readStoredLanguage(): "ar" | "en" {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "en" || v === "ar") return v;
  } catch {
    /* ignore */
  }
  return "ar";
}

function applyDocumentLanguage(lng: string) {
  const isAr = lng === "ar" || lng.startsWith("ar");
  document.documentElement.setAttribute("lang", isAr ? "ar" : "en");
  document.documentElement.setAttribute("dir", isAr ? "rtl" : "ltr");
}

void i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
    en: { translation: en }
  },
  lng: readStoredLanguage(),
  fallbackLng: "en",
  interpolation: { escapeValue: false }
});

i18n.on("languageChanged", (lng) => {
  try {
    localStorage.setItem(STORAGE_KEY, lng === "en" ? "en" : "ar");
  } catch {
    /* ignore */
  }
  applyDocumentLanguage(lng);
});

applyDocumentLanguage(i18n.language);

export function setLocale(next: "ar" | "en") {
  void i18n.changeLanguage(next);
}

export default i18n;
