/**
 * api/pedidos.ts — Endpoints de pedidos.
 */

import api from "./axiosInstance";
import type { PedidoRead, PedidoCreate } from "../types";

/**
 * getPedidos — Obtiene todos los pedidos del usuario autenticado.
 */
export const getPedidos = () =>
  api.get<PedidoRead[]>("/pedidos").then((r) => r.data);

/**
 * createPedido — Crea un nuevo pedido.
 *
 * @param data - Datos del pedido (dirección, forma de pago, items)
 */
export const createPedido = (data: PedidoCreate) =>
  api.post("/pedidos", data).then((r) => r.data);

/**
 * cancelarPedido — Cancela un pedido por ID (si está PENDIENTE o CONFIRMADO).
 *
 * @param id - ID del pedido a cancelar
 */
export const cancelarPedido = (id: number) =>
  api.patch(`/pedidos/${id}/cancelar`);
