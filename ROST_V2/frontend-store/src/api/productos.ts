/**
 * api/productos.ts — Endpoints de productos.
 */

import api from "./axiosInstance";
import type { Producto } from "../types";

/**
 * getProductos — Obtiene todos los productos disponibles.
 */
export const getProductos = () =>
  api.get<Producto[]>("/productos").then((r) => r.data);
