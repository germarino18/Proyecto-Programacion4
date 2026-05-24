import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axiosInstance";
import type { DireccionRead, DireccionCreate } from "../types";

export default function DireccionesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [alias, setAlias] = useState("");
  const [direccion, setDireccion] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [region, setRegion] = useState("");

  const { data: direcciones } = useQuery<DireccionRead[]>({
    queryKey: ["direcciones"],
    queryFn: () => api.get("/direcciones").then((r) => r.data),
  });

  const crearMutation = useMutation({
    mutationFn: (data: DireccionCreate) =>
      api.post("/direcciones", data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["direcciones"] });
      setShowForm(false);
      setAlias("");
      setDireccion("");
      setCiudad("");
      setRegion("");
    },
  });

  const eliminarMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/direcciones/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["direcciones"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    crearMutation.mutate({ alias, direccion, ciudad, region });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#354867]">
          Mis Direcciones
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#c8a97e] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#b8966a]"
        >
          {showForm ? "Cancelar" : "+ Nueva"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl p-6 shadow-sm mb-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Alias
            </label>
            <input
              type="text"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder="Casa, Trabajo, etc."
              required
              className="w-full border border-gray-300 rounded-lg p-2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Dirección
            </label>
            <input
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Calle y número"
              required
              className="w-full border border-gray-300 rounded-lg p-2.5"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Ciudad
              </label>
              <input
                type="text"
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg p-2.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Región
              </label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg p-2.5"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={crearMutation.isPending}
            className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300"
          >
            {crearMutation.isPending ? "Guardando..." : "Guardar dirección"}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {direcciones?.map((d) => (
          <div
            key={d.id}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex justify-between items-center"
          >
            <div>
              <p className="font-semibold text-[#354867]">{d.alias}</p>
              <p className="text-sm text-gray-500">
                {d.direccion}, {d.ciudad}
              </p>
            </div>
            <button
              onClick={() => eliminarMutation.mutate(d.id)}
              className="text-red-400 hover:text-red-600 text-sm"
            >
              Eliminar
            </button>
          </div>
        ))}
        {(!direcciones || direcciones.length === 0) && (
          <p className="text-gray-400 text-center py-8">
            No tenés direcciones guardadas
          </p>
        )}
      </div>
    </div>
  );
}
