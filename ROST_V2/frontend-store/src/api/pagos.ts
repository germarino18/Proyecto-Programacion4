/**
 * api/pagos.ts — Endpoints del módulo de pagos MercadoPago.
 */

import api from "./axiosInstance";
import type { PagoRead } from "../types";

/**
 * crearPreference — Crea una preferencia de pago en MercadoPago.
 *
 * @param pedido_id - ID del pedido a pagar
 * @returns { preference_id: string, init_point: string }
 */
export const crearPreference = (pedido_id: number) =>
  api
    .post<{ preference_id: string; init_point: string }>("/pagos/crear", {
      pedido_id,
    })
    .then((r) => r.data);

/**
 * getPago — Obtiene el pago asociado a un pedido.
 *
 * @param pedido_id - ID del pedido
 * @returns PagoRead o null si no existe
 */
export const getPago = (pedido_id: number) =>
  api.get<PagoRead>(`/pagos/${pedido_id}`).then((r) => r.data);

/**
 * verificarPago — Consulta a MP directamente el estado real de un pago.
 * Se llama desde SuccessPage después del redirect de MP.
 * NO confía en los query params de la URL.
 *
 * @param payment_id - ID del pago en MercadoPago
 * @returns { status, pago_status, payment_method_id, transaction_amount }
 */
export const verificarPago = (payment_id: number) =>
  api
    .post<{
      status: string;
      pago_status: string;
      payment_method_id?: string;
      transaction_amount?: number;
    }>(`/pagos/verificar/${payment_id}`)
    .then((r) => r.data);
