import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import api from "../api/axios";
import { LoadingSpinner } from "../components/shared/LoadingSpinner";
import { ErrorBanner } from "../components/shared/ErrorBanner";

export function AdminKycPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: pending, isLoading, isError, error } = useQuery({
    queryKey: ["admin", "kyc-pending"],
    queryFn: async () => {
      const res = await api.get("/admin/kyc-pending");
      return res.data;
    }
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: "VERIFIED" | "REJECTED" }) => {
      await api.post(`/admin/kyc-verify/${userId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "kyc-pending"] });
    }
  });

  if (isLoading) return <LoadingSpinner label={t("admin.loading")} />;
  if (isError) return <ErrorBanner message={t("common.error")} />;

  return (
    <main className="mx-auto max-w-containerMax px-gutter py-10">
      <h1 className="text-3xl font-black text-primary">{t("admin.kycTitle")}</h1>
      <p className="mt-2 text-on-surface-variant">{t("admin.kycSubtitle")}</p>

      <div className="mt-8 overflow-x-auto rounded-card border border-outline-variant bg-surface-lowest">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-low text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              <th className="px-6 py-4">{t("admin.colUser")}</th>
              <th className="px-6 py-4">{t("admin.colSalary")}</th>
              <th className="px-6 py-4">{t("admin.colDoc")}</th>
              <th className="px-6 py-4 text-center">{t("admin.colActions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30">
            {pending?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-on-surface-variant">
                  {t("admin.noPending")}
                </td>
              </tr>
            )}
            {pending?.map((u: any) => (
              <tr key={u.userId} className="text-sm">
                <td className="px-6 py-4">
                  <div className="font-bold text-primary">{u.fullName}</div>
                  <div className="text-xs text-on-surface-variant">{u.email}</div>
                </td>
                <td className="px-6 py-4 font-mono font-bold text-secondary">
                  {u.salary}
                </td>
                <td className="px-6 py-4">
                  <a
                    href={u.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline hover:opacity-80"
                  >
                    {t("admin.viewDoc")}
                  </a>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => verifyMutation.mutate({ userId: u.userId, status: "VERIFIED" })}
                      disabled={verifyMutation.isPending}
                      className="rounded-lg bg-success-container px-3 py-1.5 text-xs font-bold text-success-on hover:brightness-95 disabled:opacity-50"
                    >
                      {t("admin.approve")}
                    </button>
                    <button
                      onClick={() => verifyMutation.mutate({ userId: u.userId, status: "REJECTED" })}
                      disabled={verifyMutation.isPending}
                      className="rounded-lg bg-danger-container px-3 py-1.5 text-xs font-bold text-danger-on hover:brightness-95 disabled:opacity-50"
                    >
                      {t("admin.reject")}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
