import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategorias, createCategoria, updateCategoria, deleteCategoria } from '../api/categorias';
import Modal from '../components/Modal';
import type { CategoriaCreate, CategoriaUpdate } from '../types';

export default function CategoriasPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const { data: categorias, isLoading, isError } = useQuery({
    queryKey: ['categorias', search],
    queryFn: () => getCategorias({ q: search || undefined }),
  });

  const createMutation = useMutation({
    mutationFn: (data: CategoriaCreate) => createCategoria(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      setModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoriaUpdate }) => updateCategoria(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      setModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCategoria(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categorias'] }),
  });

  const [form, setForm] = useState<CategoriaCreate>({
    nombre: '',
    descripcion: '',
    parent_id: null,
  });

  function openCreate() {
    setEditingId(null);
    setForm({ nombre: '', descripcion: '', parent_id: null });
    setModalOpen(true);
  }

  function openEdit(item: NonNullable<typeof categorias>[number]) {
    setEditingId(item.id);
    setForm({
      nombre: item.nombre,
      descripcion: item.descripcion ?? '',
      parent_id: item.parent_id,
    });
    setModalOpen(true);
  }

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

  function getParentName(parentId: number | null): string {
    if (parentId === null) return '—';
    const parent = categorias?.find((c) => c.id === parentId);
    return parent?.nombre ?? `ID ${parentId}`;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <input
          type="text"
          placeholder="Buscar categorías..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-[#F5E6D3] border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface w-72 font-body text-sm placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary-container"
        />
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
                <tr key={item.id} className="hover:bg-primary/5 transition-colors">
                  <td className="px-6 py-4 font-body font-semibold text-primary">{item.nombre}</td>
                  <td className="px-6 py-4 font-body text-on-surface-variant">{item.descripcion ?? '—'}</td>
                  <td className="px-6 py-4 font-body text-on-surface-variant">{getParentName(item.parent_id)}</td>
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
