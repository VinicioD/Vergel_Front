// src/views/admin/modules/quotes/QuotesPage.tsx
import { useCallback, useState } from "react";
import QuotesView from "../../../../components/quotes/QuotesView";
import QuoteForm from "./Form";
import Toast, { type ToastType } from "../../../../components/alerts/Toast";

export default function QuotesPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const handleSave = useCallback(() => {
    setReloadKey((current) => current + 1);
    setToast({ message: "Cotización registrada con éxito.", type: "success" });
  }, []);

  return (
    <>
      <QuotesView
        key={reloadKey}
        onNewQuote={() => setFormOpen(true)}
      />
      {formOpen && (
        <QuoteForm
          onClose={() => setFormOpen(false)}
          onSaved={handleSave}
        />
      )}
      <Toast
        type={toast?.type ?? "info"}
        message={toast?.message ?? ""}
        isOpen={toast !== null}
        onClose={() => setToast(null)}
      />
    </>
  );
}
