// src/views/admin/modules/quotes/QuotesPage.tsx
import { useCallback, useState } from "react";
import QuotesView from "../../../../components/quotes/QuotesView";
import QuoteForm from "./Form";
import Toast, { type ToastType } from "../../../../components/alerts/Toast";
import {
  createQuote,
  deleteQuote,
  getQuoteById,
  getQuoteErrorMessage,
  updateQuote,
  updateQuoteStatus,
} from "../../../../services/quoteService";
import type {
  CreateQuotePayload,
  Quote,
  QuoteStatus,
  UpdateQuotePayload,
} from "../../../../types/quote";

export default function QuotesPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  const showToast = useCallback((type: ToastType, message: string) => {
    setToast({ type, message });
  }, []);

  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  const handleCloseForm = useCallback(() => {
    setFormOpen(false);
    setEditingQuote(null);
    setIsLoadingDetail(false);
  }, []);

  const handleNewQuote = useCallback(() => {
    setEditingQuote(null);
    setIsLoadingDetail(false);
    setFormOpen(true);
  }, []);

  const handleEditQuote = useCallback(
    async (quote: Quote) => {
      setEditingQuote(quote);
      setFormOpen(true);
      setIsLoadingDetail(true);

      try {
        const { data } = await getQuoteById(quote.id);
        setEditingQuote(data);
      } catch (error) {
        showToast(
          "error",
          getQuoteErrorMessage(
            error,
            "No se pudo cargar el detalle completo de la cotización.",
          ),
        );
      } finally {
        setIsLoadingDetail(false);
      }
    },
    [showToast],
  );

  const handleSaveQuote = useCallback(
    async (payload: CreateQuotePayload | UpdateQuotePayload) => {
      try {
        if (editingQuote) {
          await updateQuote(editingQuote.id, payload as UpdateQuotePayload);
          showToast("success", "Cotización actualizada con éxito.");
        } else {
          await createQuote(payload as CreateQuotePayload);
          showToast("success", "Cotización registrada con éxito.");
        }

        handleCloseForm();
        setReloadKey((current) => current + 1);
      } catch (error) {
        showToast(
          "error",
          getQuoteErrorMessage(error, "No se pudo guardar la cotización."),
        );
        throw error;
      }
    },
    [editingQuote, handleCloseForm, showToast],
  );

  const handleStatusChange = useCallback(
    async (quoteId: number | string, status: QuoteStatus) => {
      try {
        await updateQuoteStatus(quoteId, status);
        showToast(
          "success",
          status === "paid"
            ? "Cotización marcada como pagada."
            : "Cotización marcada como pendiente.",
        );
        setReloadKey((current) => current + 1);
      } catch (error) {
        showToast(
          "error",
          getQuoteErrorMessage(
            error,
            "No se pudo actualizar el estado de la cotización.",
          ),
        );
      }
    },
    [showToast],
  );

  const handleDeleteQuote = useCallback(
    async (quoteId: number | string) => {
      try {
        await deleteQuote(quoteId);
        showToast("success", "Cotización eliminada con éxito.");
        setReloadKey((current) => current + 1);
      } catch (error) {
        showToast(
          "error",
          getQuoteErrorMessage(error, "No se pudo eliminar la cotización."),
        );
      }
    },
    [showToast],
  );

  const toastElement = (
    <Toast
      type={toast?.type ?? "info"}
      message={toast?.message ?? ""}
      isOpen={toast !== null}
      onClose={closeToast}
    />
  );

  if (formOpen) {
    return (
      <>
        <QuoteForm
          key={editingQuote ? `edit-${editingQuote.id}` : "new"}
          initialData={editingQuote}
          isLoadingInitial={isLoadingDetail}
          onClose={handleCloseForm}
          onSave={handleSaveQuote}
        />
        {toastElement}
      </>
    );
  }

  return (
    <>
      <QuotesView
        key={reloadKey}
        onNewQuote={handleNewQuote}
        onEditQuote={(quote) => void handleEditQuote(quote)}
        onChangeStatus={handleStatusChange}
        onDeleteQuote={handleDeleteQuote}
      />
      {toastElement}
    </>
  );
}
