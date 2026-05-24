import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      api.post("/auth/login", data).then((r) => r.data),
    onSuccess: () => {
      navigate("/");
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#ffeddb]">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/logo2.png" alt="ROST" className="h-12 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#354867]">Iniciar sesión</h2>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            loginMutation.mutate({ email, password });
          }}
          className="space-y-4"
        >
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
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#c8a97e]"
            />
          </div>
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full bg-[#c8a97e] text-white py-2.5 rounded-lg font-medium hover:bg-[#b8966a] transition-colors disabled:bg-gray-300"
          >
            {loginMutation.isPending ? "Ingresando..." : "Ingresar"}
          </button>
          {loginMutation.isError && (
            <p className="text-red-500 text-sm text-center">
              Email o contraseña incorrectos
            </p>
          )}
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿No tenés cuenta?{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-[#c8a97e] underline"
          >
            Registrate
          </button>
        </p>
      </div>
    </div>
  );
}
