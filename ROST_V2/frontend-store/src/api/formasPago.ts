/**
 * api/formasPago.ts — Endpoints de formas de pago.
 */

import api from "./axiosInstance";
import type { FormaPago } from "../types";

/**
 * getFormasPago — Obtiene todas las formas de pago disponibles.
 */
export const getFormasPago = () =>
  api.get<FormaPago[]>("/formas-pago").then((r) => r.data);
