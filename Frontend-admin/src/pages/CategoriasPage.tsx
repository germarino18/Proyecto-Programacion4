/**
 * CategoriasPage.tsx — CRUD completo de categorías
 *
 * Funcionalidades:
 *   - Tabla con listado de categorías (nombre, descripción, categoría padre)
 *   - Barra de búsqueda para filtrar por nombre
 *   - Modal de creación/edición con nombre, descripción y selector de categoría padre
 *   - Jerarquía: una categoría puede tener una categoría padre
 *   - El selector de padre evita seleccionarse a sí mismo en edición
 *
 * Queries:
 *   - ['categorias', search] → GET /categorias?q=
 *
 * Mutations:
 *   - createCategoria → POST /categorias
 *   - updateCategoria → PATCH /categorias/:id
 *   - deleteCategoria → DELETE /categorias/:id
 *
 * Estados:
 *   - isLoading → "Cargando categorías..."
 *   - isError → "Error al cargar categorías"
 *   - sin datos → "No hay categorías registradas."
 *   - con datos → tabla con filas
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategorias, createCategoria, updateCategoria, deleteCategoria } from '../api/categorias';
import Modal from '../components/Modal';
import type { CategoriaCreate, CategoriaUpdate } from '../types';

/**
 * CategoriasPage — Página principal de gestión de categorías
 *
 * Controla el estado del modal, la búsqueda y los datos del formulario.
 */
export default function CategoriasPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  /** Query: lista de categorías filtrada por búsqueda */
  const { data: categorias, isLoading, isError } = useQuery({
    queryKey: ['categorias', search],
    queryFn: () => getCategorias({ q: search || undefined }),
  });

  /** Mutation: POST /categorias — crea nueva categoría */
  const createMutation = useMutation({
    mutationFn: (data: CategoriaCreate) => createCategoria(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      setModalOpen(false);
    },
  });

  /** Mutation: PATCH /categorias/:id — actualiza categoría existente */
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoriaUpdate }) => updateCategoria(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      setModalOpen(false);
    },
  });

  /** Mutation: DELETE /categorias/:id — elimina categoría */
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCategoria(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categorias'] }),
  });

  /** Estado del formulario del modal */
  const [form, setForm] = useState<CategoriaCreate>({
    nombre: '',
    descripcion: '',
    parent_id: null,
  });

  /** Abre el modal en modo "crear" reseteando el formulario */
  function openCreate() {
    setEditingId(null);
    setForm({ nombre: '', descripcion: '', parent_id: null });
    setModalOpen(true);
  }

  /** Abre el modal en modo "editar" precargando los datos de la categoría */
  function openEdit(item: NonNullable<typeof categorias>[number]) {
    setEditingId(item.id);
    setForm({
      nombre: item.nombre,
      descripcion: item.descripcion ?? '',
      parent_id: item.parent_id,
    });
    setModalOpen(true);
  }

  /** Maneja el submit: construye payload y crea o actualiza según editingId */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: CategoriaCreate = {
      nombre: form.nombre,
      descripcion: form.descripcion || null,
      parent_id: form.parent_id || null,
    };
    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, data: payload as CategoriaUpdate });
    } else {
      createMutation.mutate(payload);
    }
  }

  /** Resuelve el nombre de la categoría padre a partir de su ID */
  function getParentName(parentId: number | null): string {
    if (parentId === null) return '—';
    const parent = categorias?.find((c) => c.id === parentId);
    return parent?.nombre ?? `ID ${parentId}`;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60">
            <span className="material-symbols-outlined text-[18px]">search</span>
          </span>
          <input
            type="text"
            placeholder="Buscar categorías..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#F5E6D3] border border-outline-variant rounded-lg pl-9 pr-4 py-2.5 text-on-surface w-72 font-body text-sm placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary-container"
          />
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary-container text-on-primary rounded-lg px-5 py-2.5 font-body font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Nueva Categoría
        </button>
      </div>

      {isLoading ? (
        <p className="text-on-surface-variant py-8">Cargando categorías...</p>
      ) : isError ? (
        <p className="text-error py-8">Error al cargar categorías</p>
      ) : (
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-high">
              <tr>
                <th className="px-6 py-4 font-body font-semibold text-sm text-primary uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-4 font-body font-semibold text-sm text-primary uppercase tracking-wider">Descripción</th>
                <th className="px-6 py-4 font-body font-semibold text-sm text-primary uppercase tracking-wider">Categoría Padre</th>
                <th className="px-6 py-4 font-body font-semibold text-sm text-primary uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {categorias?.map((item) => (
                <tr key={item.id} className="hover:bg-surface-container-high/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px] text-primary">category</span>
                      </div>
                      <span className="font-body font-semibold text-primary">{item.nombre}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-body text-on-surface-variant">{item.descripcion ?? '—'}</td>
                  <td className="px-6 py-4">
                    {item.parent_id ? (
                      <span className="inline-flex items-center px-2.5 py-1 bg-surface-container-high text-on-surface-variant rounded-full text-xs font-semibold">
                        <span className="material-symbols-outlined text-[14px] mr-1">subdirectory_arrow_right</span>
                        {getParentName(item.parent_id)}
                      </span>
                    ) : (
                      <span className="text-on-surface-variant text-sm">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(item)}
                        className="text-primary hover:text-primary-container transition-colors p-1"
                        title="Editar"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button
                        onClick={() => { if (confirm('¿Eliminar esta categoría?')) deleteMutation.mutate(item.id); }}
                        className="text-error hover:text-red-400 transition-colors p-1"
                        title="Eliminar"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categorias?.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-on-surface-variant">
                    No hay categorías registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar Categoría' : 'Nueva Categoría'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-body text-sm font-semibold text-on-surface mb-1">Nombre</label>
            <input
              type="text"
              required
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="w-full bg-[#F5E6D3] border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary-container"
            />
          </div>
          <div>
            <label className="block font-body text-sm font-semibold text-on-surface mb-1">Descripción</label>
            <textarea
              value={form.descripcion ?? ''}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value || null })}
              rows={3}
              className="w-full bg-[#F5E6D3] border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary-container"
            />
          </div>
          <div>
            <label className="block font-body text-sm font-semibold text-on-surface mb-1">Categoría Padre</label>
            <select
              value={form.parent_id ?? ''}
              onChange={(e) => setForm({ ...form, parent_id: e.target.value ? parseInt(e.target.value) : null })}
              className="w-full bg-[#F5E6D3] border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary-container"
            >
              <option value="">— Ninguna —</option>
              {categorias?.map((c) => (
                <option key={c.id} value={c.id} disabled={c.id === editingId}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-5 py-2.5 rounded-lg border border-outline-variant text-on-surface-variant font-body text-sm font-semibold hover:bg-surface-container-high transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-5 py-2.5 bg-primary-container text-on-primary rounded-lg font-body text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
