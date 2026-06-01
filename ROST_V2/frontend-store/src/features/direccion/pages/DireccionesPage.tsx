/**
 * DireccionesPage.tsx — Gestión de direcciones de entrega del usuario.
 * - Lista de direcciones guardadas con icono, alias y dirección
 * - Formulario para crear nueva dirección (alias, calle, ciudad, región)
 * - Botón para eliminar dirección (con confirmación directa)
 * - Estados: loading (no manejado explícitamente), empty (sin direcciones), con datos
 *
 * Queries y Mutations de TanStack Query:
 * - GET /direcciones → fetch de todas las direcciones del usuario
 * - POST /direcciones → crear nueva dirección
 * - DELETE /direcciones/:id → eliminar una dirección
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../api/axiosInstance";
import type { DireccionRead, DireccionCreate } from "../../../types";

/**
 * DireccionesPage — Página de administración de direcciones.
 * Incluye listado, formulario de creación y eliminación.
 *
 * @returns {JSX.Element} Gestor de direcciones del usuario
 */
export default function DireccionesPage() {
  const queryClient = useQueryClient();

  // --- Estado del formulario de nueva dirección
  const [showForm, setShowForm] = useState(false);
  const [alias, setAlias] = useState("");
  const [direccion, setDireccion] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [region, setRegion] = useState("");

  /**
   * Query: GET /direcciones
   * Obtiene todas las direcciones del usuario autenticado.
   * Cacheada con queryKey ["direcciones"].
   */
  const { data: direcciones } = useQuery<DireccionRead[]>({
    queryKey: ["direcciones"],
    queryFn: () => api.get("/direcciones").then((r) => r.data),
  });

  /**
   * Mutation: POST /direcciones
   * Crea una nueva dirección de entrega.
   * On success: refresca la lista, cierra el formulario y resetea campos.
   */
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

  /**
   * Mutation: DELETE /direcciones/:id
   * Elimina una dirección por su ID.
   * On success: refresca la lista de direcciones.
   */
  const eliminarMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/direcciones/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["direcciones"] });
    },
  });

  /**
   * handleSubmit — Envía el formulario de nueva dirección.
   *
   * @param e - Evento del formulario
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    crearMutation.mutate({ alias, direccion, ciudad, region });
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* Header: título + botón nueva dirección */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-headline text-headline-md text-primary">Mis Direcciones</h2>
          <p className="font-body text-body-md text-on-surface-variant mt-1">Gestioná tus direcciones de entrega</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-lg font-label-md text-label-md hover:opacity-90 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">{showForm ? 'close' : 'add'}</span>
          {showForm ? 'Cancelar' : 'Nueva Dirección'}
        </button>
      </div>

      {/* Formulario de nueva dirección (toggle con showForm) */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 p-6 mb-8 space-y-4"
        >
          <div>
            <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1.5">Alias</label>
            <input
              type="text"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder="Casa, Trabajo, etc."
              required
              className="w-full bg-[#F5E6D3] border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary-container placeholder:text-on-surface-variant/50"
            />
          </div>
          <div>
            <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1.5">Dirección</label>
            <input
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Calle y número"
              required
              className="w-full bg-[#F5E6D3] border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary-container placeholder:text-on-surface-variant/50"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1.5">Ciudad</label>
              <input
                type="text"
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                required
                className="w-full bg-[#F5E6D3] border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary-container placeholder:text-on-surface-variant/50"
              />
            </div>
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1.5">Región</label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                required
                className="w-full bg-[#F5E6D3] border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary-container placeholder:text-on-surface-variant/50"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={crearMutation.isPending}
            className="w-full bg-primary-container text-on-primary py-3 rounded-lg font-label-md text-label-md hover:opacity-90 transition-all disabled:opacity-50"
          >
            {crearMutation.isPending ? "Guardando..." : "Guardar Dirección"}
          </button>
        </form>
      )}

      {/* Lista de direcciones o mensaje empty */}
      <div className="space-y-3">
        {direcciones && direcciones.length > 0 ? (
          /* Estado CON DATOS: renderiza cada dirección */
          direcciones.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/10 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[20px]">home</span>
                </div>
                <div>
                  <p className="font-body font-semibold text-on-surface">{d.alias}</p>
                  <p className="font-body text-sm text-on-surface-variant">{d.direccion}, {d.ciudad}</p>
                </div>
              </div>
              <button
                onClick={() => eliminarMutation.mutate(d.id)}
                className="flex items-center gap-1 text-on-surface-variant/50 hover:text-error transition-colors font-body text-sm opacity-0 group-hover:opacity-100"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
                Eliminar
              </button>
            </div>
          ))
        ) : (
          /* Estado EMPTY: sin direcciones guardadas */
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-4">map</span>
            <p className="font-body text-body-md text-on-surface-variant">No tenés direcciones guardadas</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-primary font-label-md text-label-md hover:underline inline-flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Agregá tu primera dirección
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
