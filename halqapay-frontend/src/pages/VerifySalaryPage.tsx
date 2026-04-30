import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export function VerifySalaryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [docUrl, setDocUrl] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!docUrl.trim()) return;

    setLoading(true);
    setError("");
    try {
      await api.post("/users/me/verify-salary", { documentUrl: docUrl });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || t("common.error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-lg px-gutter py-12">
      <h1 className="text-3xl font-black text-primary">{t("kyc.uploadTitle")}</h1>
      <p className="mt-2 text-on-surface-variant">{t("kyc.uploadSubtitle")}</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="rounded-card border border-outline-variant bg-surface-low p-6">
          <label className="block text-sm font-bold text-primary">
            {t("kyc.documentUrlLabel")}
          </label>
          <input
            type="url"
            required
            value={docUrl}
            onChange={(e) => setDocUrl(e.target.value)}
            placeholder="https://example.com/my-salary-slip.pdf"
            className="mt-2 w-full rounded-lg border border-outline-variant bg-surface-lowest px-4 py-3 focus:border-primary focus:outline-none"
          />
          <p className="mt-4 text-xs text-on-surface-variant leading-relaxed">
            {t("kyc.uploadHint")}
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-danger-container p-3 text-sm text-danger-on">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !docUrl.trim()}
          className="w-full rounded-xl bg-primary py-4 text-lg font-bold text-primary-on shadow-card hover:opacity-95 disabled:opacity-50"
        >
          {loading ? t("kyc.submitting") : t("kyc.submit")}
        </button>
      </form>
    </main>
  );
}
