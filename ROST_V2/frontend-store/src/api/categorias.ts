/**
 * api/categorias.ts — Endpoints de categorías.
 */

import api from "./axiosInstance";
import type { Categoria } from "../types";

/**
 * getCategorias — Obtiene todas las categorías.
 */
export const getCategorias = () =>
  api.get<Categoria[]>("/categorias").then((r) => r.data);
