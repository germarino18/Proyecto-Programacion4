/**
 * AuthContext.tsx — Contexto de autenticación global.
 * Provee el usuario autenticado, funciones login/logout y verificación de roles.
 * Al montar, restaura la sesión llamando a GET /auth/me con la cookie actual.
 *
 * Funciones expuestas via useAuth():
 * - usuario: datos del usuario o null si no está autenticado
 * - isLoading: true mientras se verifica la sesión inicial
 * - login(email, password): autentica y actualiza el usuario
 * - logout(): cierra sesión y limpia usuario
 * - hasRole(rol): verifica si el usuario tiene un rol específico
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../api/axiosInstance';
import type { UsuarioAuth } from '../types';

// --- Tipo del contexto: define qué expone AuthProvider
interface AuthContextType {
  usuario: UsuarioAuth | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (rol: string) => boolean;
}

// --- Contexto inicializado como null (se valida en useAuth)
const AuthContext = createContext<AuthContextType | null>(null);

/**
 * AuthProvider — Proveedor del contexto de autenticación.
 * Al montarse, intenta restaurar la sesión llamando GET /auth/me.
 * Si falla (401), el usuario sigue siendo null (no autenticado).
 *
 * @param children - Componentes hijos que tendrán acceso al contexto.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioAuth | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Efecto de montaje: restaura sesión.
   * Llama a GET /auth/me con la cookie de sesión (enviada automáticamente).
   * - Éxito (200): usuario autenticado → setUsuario(data)
   * - Error (401): no hay sesión → setUsuario(null)
   * - finally: isLoading = false
   */
  useEffect(() => {
    api
      .get<UsuarioAuth>('/auth/me')                    // GET /api/v1/auth/me
      .then((res) => setUsuario(res.data))
      .catch(() => setUsuario(null))
      .finally(() => setIsLoading(false));
  }, []);

  /**
   * login — Autentica al usuario.
   * 1. POST /auth/login con email + password (crea sesión en backend)
   * 2. GET /auth/me para obtener datos del usuario autenticado
   *
   * @param email - Email del usuario
   * @param password - Contraseña del usuario
   */
  const login = async (email: string, password: string) => {
    await api.post('/auth/login', { email, password });  // POST /api/v1/auth/login
    const { data } = await api.get<UsuarioAuth>('/auth/me');  // GET /api/v1/auth/me
    setUsuario(data);
  };

  /**
   * logout — Cierra sesión.
   * POST /auth/logout (destruye sesión en backend) y limpia el estado local.
   */
  const logout = async () => {
    await api.post('/auth/logout');  // POST /api/v1/auth/logout
    setUsuario(null);
  };

  /**
   * hasRole — Verifica si el usuario tiene un rol específico.
   *
   * @param rol - Código del rol a verificar (ej: "ADMIN", "STOCK")
   * @returns true si el usuario tiene ese rol, false si no o si no hay usuario
   */
  const hasRole = (rol: string) =>
    usuario?.roles?.some((ur) => ur.rol_codigo === rol) ?? false;

  return (
    <AuthContext.Provider value={{ usuario, isLoading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth — Hook para acceder al contexto de autenticación.
 * Debe usarse dentro de un <AuthProvider>.
 *
 * @returns {AuthContextType} Objeto con usuario, isLoading, login, logout, hasRole
 * @throws Error si se usa fuera de AuthProvider
 */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};
