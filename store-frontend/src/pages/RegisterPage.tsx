import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";

export default function RegisterPage() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const registerMutation = useMutation({
    mutationFn: (data: {
      nombre: string;
      email: string;
      password: string;
    }) => api.post("/auth/register", data).then((r) => r.data),
    onSuccess: () => {
      navigate("/login");
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#ffeddb]">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/logo2.png" alt="ROST" className="h-12 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#354867]">Crear cuenta</h2>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            registerMutation.mutate({ nombre, email, password });
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Nombre
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#c8a97e]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#c8a97e]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#c8a97e]"
            />
          </div>
          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full bg-[#c8a97e] text-white py-2.5 rounded-lg font-medium hover:bg-[#b8966a] transition-colors disabled:bg-gray-300"
          >
            {registerMutation.isPending ? "Registrando..." : "Registrarse"}
          </button>
          {registerMutation.isError && (
            <p className="text-red-500 text-sm text-center">
              Error al registrarse. El email podría ya estar en uso.
            </p>
          )}
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿Ya tenés cuenta?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-[#c8a97e] underline"
          >
            Iniciá sesión
          </button>
        </p>
      </div>
    </div>
  );
}
