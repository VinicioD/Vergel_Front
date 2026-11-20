// src/services/transactionService.ts
import { api } from "./api";
import type {
  TransactionQueryParams,
  PaginatedTransactionsResponse,
  TransactionDetailResponse,
} from "../types/transaction";

// 1. Listar y filtrar historial de transacciones (GET /transactions)
export const getTransactions = async (
  params?: TransactionQueryParams,
): Promise<PaginatedTransactionsResponse> => {
  const response = await api.get<PaginatedTransactionsResponse>(
    "/transactions",
    {
      params,
    },
  );
  return response.data;
};

// 2. Obtener el detalle de una transacción histórica por ID (GET /transactions/{id})
export const getTransactionById = async (
  id: number | string,
): Promise<TransactionDetailResponse> => {
  const response = await api.get<TransactionDetailResponse>(
    `/transactions/${id}`,
  );
  return response.data;
};
