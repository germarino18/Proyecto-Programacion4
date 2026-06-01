/**
 * api/auth.ts — Endpoints de autenticación.
 * Proporciona funciones para login, logout y obtención del usuario actual.
 */

import api from "./axiosInstance";
import type { UsuarioAuth } from "../types";

/**
 * login — Inicia sesión con email y password.
 * El backend establece una cookie HttpOnly de sesión.
 *
 * @param email - Email del usuario
 * @param password - Contraseña del usuario
 */
export const login = (email: string, password: string) =>
  api.post("/auth/login", { email, password });

/**
 * logout — Cierra la sesión actual.
 * El backend destruye la cookie de sesión.
 */
export const logout = () => api.post("/auth/logout");

/**
 * getMe — Obtiene los datos del usuario autenticado.
 * Usa la cookie de sesión enviada automáticamente.
 *
 * @returns UsuarioAuth con datos del usuario
 */
export const getMe = () =>
  api.get<UsuarioAuth>("/auth/me").then((r) => r.data);

/**
 * register — Registra un nuevo usuario.
 *
 * @param data - Datos de registro (nombre, email, password)
 */
export const register = (data: { nombre: string; email: string; password: string }) =>
  api.post("/auth/register", data).then((r) => r.data);
