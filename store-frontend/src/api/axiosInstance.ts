/**
 * axiosInstance.ts — Cliente Axios preconfigurado.
 * - baseURL: apunta a "/api/v1" (el proxy de Vite redirige al backend real).
 * - withCredentials: true (envía cookies HttpOnly de sesión automáticamente).
 * - Interceptor 401: si el backend responde con no autorizado, redirige a /login.
 */

import axios from "axios";

// --- Instancia Axios con configuración base
const api = axios.create({
  baseURL: "/api/v1",        // Todas las requests van a /api/v1/*
  withCredentials: true,     // Envía cookies de sesión en cada request
});

// --- Interceptor de respuesta: captura errores 401 (sesión expirada / no autenticado)
api.interceptors.response.use(
  (response) => response,                                          // OK: pasa la respuesta
  (error) => {
    // Si el backend devuelve 401 y NO estamos ya en /login, redirige
    if (error.response?.status === 401 && !window.location.pathname.startsWith("/login")) {
      window.location.href = "/login";
    }
    return Promise.reject(error);  // Rechaza para que el caller maneje el error si quiere
  }
);

export default api;
