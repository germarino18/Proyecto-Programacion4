/**
 * authStore.ts — Estado global de autenticación con Zustand.
 * Reemplaza el antiguo AuthContext (React Context) por un store Zustand.
 *
 * Ventajas sobre Context:
 * 1. No requiere Provider en el árbol de componentes
 * 2. Selectores evitan rerenders innecesarios
 * 3. Mismo patrón que cartStore (consistencia)
 *
 * Funciones expuestas via useAuthStore():
 * - usuario: UsuarioAuth | null
 * - isLoading: boolean (true mientras se verifica la sesión inicial)
 * - login(email, password): autentica y actualiza el usuario
 * - logout(): cierra sesión y limpia usuario
 * - checkSession(): llama a GET /auth/me para restaurar sesión
 * - hasRole(rol): verifica si el usuario tiene un rol específico
 */

import { create } from "zustand";
import type { UsuarioAuth } from "../../../types";
import * as authApi from "../../../api/auth";

// --- Tipo del store de autenticación
interface AuthState {
  usuario: UsuarioAuth | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  hasRole: (rol: string) => boolean;
}

/**
 * useAuthStore — Store Zustand para la autenticación.
 * Se usa como hook: const { usuario, login } = useAuthStore()
 * O con selector: const usuario = useAuthStore(s => s.usuario)
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  usuario: null,
  isLoading: true,  // Comienza cargando hasta que se verifique la sesión

  /**
   * login — Autentica al usuario.
   * 1. POST /auth/login con email + password (crea sesión en backend)
   * 2. GET /auth/me para obtener datos del usuario autenticado
   *
   * @param email - Email del usuario
   * @param password - Contraseña del usuario
   */
  login: async (email: string, password: string) => {
    await authApi.login(email, password);
    const usuario = await authApi.getMe();
    set({ usuario });
  },

  /**
   * logout — Cierra sesión.
   * POST /auth/logout (destruye sesión en backend) y limpia el estado local.
   */
  logout: async () => {
    await authApi.logout();
    set({ usuario: null });
  },

  /**
   * checkSession — Restaura la sesión al iniciar la app.
   * Llama a GET /auth/me con la cookie de sesión.
   * - Éxito (200): usuario autenticado → set usuario
   * - Error (401): no hay sesión → set usuario null
   * - finally: isLoading = false
   */
  checkSession: async () => {
    try {
      const usuario = await authApi.getMe();
      set({ usuario, isLoading: false });
    } catch {
      set({ usuario: null, isLoading: false });
    }
  },

  /**
   * hasRole — Verifica si el usuario tiene un rol específico.
   *
   * @param rol - Código del rol a verificar (ej: "ADMIN", "STOCK")
   * @returns true si el usuario tiene ese rol, false si no o si no hay usuario
   */
  hasRole: (rol: string) =>
    get().usuario?.rol?.codigo === rol ?? false,
}));
