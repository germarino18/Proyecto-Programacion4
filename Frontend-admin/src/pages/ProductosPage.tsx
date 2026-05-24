import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getProductos, createProducto, updateProducto, deleteProducto } from '../api/productos';
import { getCategorias } from '../api/categorias';
import { getIngredientes } from '../api/ingredientes';
import { getUnidadesMedida } from '../api/unidadesMedida';
import Modal from '../components/Modal';
import type { Producto, ProductoCreate, ProductoUpdate, Ingrediente, UnidadMedida } from '../types';

export default function ProductosPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  // String state for numeric inputs (evita el bug de leading zeros con inputs controlados)
  const [precioStr, setPrecioStr] = useState('0');
  const [stockStr, setStockStr] = useState('0');

  // Image URL state
  const [imagenUrl, setImagenUrl] = useState('');

  // Ingredient form state: { [ingrediente_id]: { cantidad: string, unidad_medida_id: number, es_removible: boolean } }
  const [ingredientesMap, setIngredientesMap] = useState<Record<number, { cantidad: string; unidad_medida_id: number; es_removible: boolean }>>({});

  const { data: productos, isLoading, isError } = useQuery({
    queryKey: ['productos', search],
    queryFn: () => getProductos({ q: search || undefined }),
  });

  const { data: categorias } = useQuery({
    queryKey: ['categorias'],
    queryFn: () => getCategorias(),
  });

  const { data: ingredientes } = useQuery({
    queryKey: ['ingredientes'],
    queryFn: () => getIngredientes(),
  });

  const { data: unidadesMedida } = useQuery({
    queryKey: ['unidades-medida'],
    queryFn: () => getUnidadesMedida(),
  });

  const createMutation = useMutation({
    mutationFn: (data: ProductoCreate) => createProducto(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      setModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductoUpdate }) => updateProducto(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      setModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProducto(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['productos'] }),
  });

  const [form, setForm] = useState<ProductoCreate>({
    nombre: '',
    precio_base: 0,
    stock_cantidad: 0,
    disponible: true,
    descripcion: '',
    categorias: [],
    ingredientes: [],
  });

  function openCreate() {
    setEditingId(null);
    setPrecioStr('0');
    setStockStr('0');
    setImagenUrl('');
    setIngredientesMap({});
    setForm({
      nombre: '',
      precio_base: 0,
      stock_cantidad: 0,
      disponible: true,
      descripcion: '',
      imagenes_url: [],
      categorias: [],
      ingredientes: [],
    });
    setModalOpen(true);
  }

  function openEdit(p: Producto) {
    if (!p) return;
    setEditingId(p.id);
    setPrecioStr(String(p.precio_base));
    setStockStr(String(p.stock_cantidad));
    setImagenUrl(p.imagenes_url?.[0] ?? '');
    const ingMap: Record<number, { cantidad: string; unidad_medida_id: number; es_removible: boolean }> = {};
    p.ingredientes?.forEach((i) => {
      ingMap[i.ingrediente_id] = {
        cantidad: String(i.cantidad ?? ''),
        unidad_medida_id: i.unidad_medida_id,
        es_removible: i.es_removible ?? false,
      };
    });
    setIngredientesMap(ingMap);
    setForm({
      nombre: p.nombre,
      precio_base: p.precio_base,
      stock_cantidad: p.stock_cantidad,
      disponible: p.disponible,
      descripcion: p.descripcion,
      imagenes_url: p.imagenes_url ?? [],
      categorias: p.categorias?.map((c) => c.categoria_id) ?? [],
      ingredientes: p.ingredientes?.map((i) => ({
        ingrediente_id: i.ingrediente_id,
        cantidad: i.cantidad,
        unidad_medida_id: i.unidad_medida_id,
        es_removible: i.es_removible ?? false,
      })) ?? [],
    });
    setModalOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Construir array de ingredientes desde el map
    const ingredientesArr = Object.entries(ingredientesMap)
      .filter(([_, val]) => val.cantidad !== '' && !isNaN(Number(val.cantidad)) && Number(val.cantidad) > 0)
      .map(([idStr, val]) => ({
        ingrediente_id: Number(idStr),
        cantidad: Number(val.cantidad),
        unidad_medida_id: val.unidad_medida_id,
        es_removible: val.es_removible,
      }));
    const data: ProductoCreate = {
      ...form,
      precio_base: parseFloat(precioStr) || 0,
      stock_cantidad: parseInt(stockStr, 10) || 0,
      imagenes_url: imagenUrl ? [imagenUrl] : [],
      ingredientes: ingredientesArr.length > 0 ? ingredientesArr : [],
    };
    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  }

  function toggleCategoria(catId: number) {
    const current = form.categorias ?? [];
    if (current.includes(catId)) {
      setForm({ ...form, categorias: current.filter((id) => id !== catId) });
    } else {
      setForm({ ...form, categorias: [...current, catId] });
    }
  }

  // Normalizar precio al perder el foco
  const normalizePrecio = useCallback(() => {
    const num = parseFloat(precioStr);
    if (!isNaN(num) && num >= 0) {
      const normalized = num.toFixed(2);
      setPrecioStr(normalized);
      setForm((f) => ({ ...f, precio_base: num }));
    }
  }, [precioStr]);

  // Normalizar stock al perder el foco
  const normalizeStock = useCallback(() => {
    const num = parseInt(stockStr, 10);
    if (!isNaN(num) && num >= 0) {
      setStockStr(String(num));
      setForm((f) => ({ ...f, stock_cantidad: num }));
    }
  }, [stockStr]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <input
          type="text"
          placeholder="Buscar productos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-[#F5E6D3] border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface w-72 font-body text-sm placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary-container"
        />
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary-container text-on-primary rounded-lg px-5 py-2.5 font-body font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Nuevo Producto
        </button>
      </div>

      {isLoading ? (
        <p className="text-on-surface-variant py-8">Cargando productos...</p>
      ) : isError ? (
        <p className="text-error py-8">Error al cargar productos</p>
      ) : (
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-high">
              <tr>
                <th className="px-6 py-4 font-body font-semibold text-sm text-primary uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-4 font-body font-semibold text-sm text-primary uppercase tracking-wider">Precio</th>
                <th className="px-6 py-4 font-body font-semibold text-sm text-primary uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 font-body font-semibold text-sm text-primary uppercase tracking-wider">Disponible</th>
                <th className="px-6 py-4 font-body font-semibold text-sm text-primary uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {productos?.map((p) => (
                <tr key={p.id} className="hover:bg-primary/5 transition-colors">
                  <td className="px-6 py-4">
                    <Link to={`/admin/productos/${p.id}`} className="font-body font-semibold text-primary hover:underline">
                      {p.nombre}
                    </Link>
                  </td>
                  <td className="px-6 py-4 font-body text-on-surface-variant">
                    ${p.precio_base.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-body ${p.stock_cantidad === 0 ? 'text-error font-semibold' : 'text-on-surface-variant'}`}>
                      {p.stock_cantidad}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {p.disponible ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold uppercase tracking-wide">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        Sí
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold uppercase tracking-wide">
                        <span className="material-symbols-outlined text-[14px]">cancel</span>
                        No
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="text-primary hover:text-primary-container transition-colors p-1"
                        title="Editar"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button
                        onClick={() => { if (confirm('¿Eliminar este producto?')) deleteMutation.mutate(p.id); }}
                        className="text-error hover:text-red-400 transition-colors p-1"
                        title="Eliminar"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {productos?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">
                    No hay productos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar Producto' : 'Nuevo Producto'}>
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-body text-sm font-semibold text-on-surface mb-1">Precio Base ($)</label>
              <input
                type="text"
                inputMode="decimal"
                required
                value={precioStr}
                onChange={(e) => setPrecioStr(e.target.value)}
                onBlur={normalizePrecio}
                placeholder="0.00"
                className="w-full bg-[#F5E6D3] border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary-container"
              />
            </div>
            <div>
              <label className="block font-body text-sm font-semibold text-on-surface mb-1">Stock</label>
              <input
                type="text"
                inputMode="numeric"
                value={stockStr}
                onChange={(e) => setStockStr(e.target.value)}
                onBlur={normalizeStock}
                placeholder="0"
                className="w-full bg-[#F5E6D3] border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary-container"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="disponible"
              checked={form.disponible}
              onChange={(e) => setForm({ ...form, disponible: e.target.checked })}
              className="rounded border-outline-variant text-primary-container focus:ring-primary-container"
            />
            <label htmlFor="disponible" className="font-body text-sm text-on-surface">Disponible</label>
            {stockStr !== '' && parseInt(stockStr) === 0 && (
              <span className="text-xs text-error ml-2">(sin stock → no disponible automáticamente)</span>
            )}
          </div>
          <div>
            <label className="block font-body text-sm font-semibold text-on-surface mb-2">Categorías</label>
            {categorias && categorias.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {categorias.map((c) => {
                  const selected = form.categorias?.includes(c.id) ?? false;
                  return (
                    <label
                      key={c.id}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                        selected
                          ? 'bg-primary-container/10 border-primary-container text-primary'
                          : 'bg-[#F5E6D3] border-outline-variant text-on-surface hover:bg-[#efe0cd]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleCategoria(c.id)}
                        className="rounded border-outline-variant text-primary-container focus:ring-primary-container"
                      />
                      <span className="font-body text-sm">{c.nombre}</span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-on-surface-variant">Cargando categorías...</p>
            )}
          </div>
          {/* Imagen */}
          <div>
            <label className="block font-body text-sm font-semibold text-on-surface mb-1">URL de Imagen (opcional)</label>
            <input
              type="text"
              value={imagenUrl}
              onChange={(e) => setImagenUrl(e.target.value)}
              placeholder="https://ejemplo.com/imagen.jpg"
              className="w-full bg-[#F5E6D3] border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary-container"
            />
            {imagenUrl && (
              <div className="mt-2">
                <img
                  src={imagenUrl}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border border-outline-variant"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            )}
          </div>

          {/* Ingredientes */}
          <div>
            <label className="block font-body text-sm font-semibold text-on-surface mb-2">Ingredientes</label>
            {ingredientes && ingredientes.length > 0 && unidadesMedida ? (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {ingredientes.map((ing) => {
                  const selected = ingredientesMap[ing.id] !== undefined;
                  return (
                    <div
                      key={ing.id}
                      className={`rounded-lg border p-3 transition-colors ${
                        selected
                          ? 'bg-primary-container/10 border-primary-container'
                          : 'bg-[#F5E6D3] border-outline-variant'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => {
                            const next = { ...ingredientesMap };
                            if (selected) {
                              delete next[ing.id];
                            } else {
                              const defaultUdM = unidadesMedida.find((u) => u.tipo === 'masa' || u.tipo === 'volumen');
                              next[ing.id] = {
                                cantidad: '',
                                unidad_medida_id: defaultUdM?.id ?? (unidadesMedida[0]?.id ?? 0),
                                es_removible: false,
                              };
                            }
                            setIngredientesMap(next);
                          }}
                          className="rounded border-outline-variant text-primary-container focus:ring-primary-container"
                        />
                        <span className="font-body text-sm text-on-surface">{ing.nombre}</span>
                        {ing.es_alergeno && (
                          <span className="px-2 py-0.5 bg-error-container text-on-error-container rounded-full text-[10px] font-bold uppercase tracking-wider">
                            Alérgeno
                          </span>
                        )}
                      </div>
                      {selected && (
                        <div className="grid grid-cols-3 gap-2 ml-6">
                          <div>
                            <label className="block font-body text-[11px] text-on-surface-variant mb-0.5">Cantidad</label>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={ingredientesMap[ing.id].cantidad}
                              onChange={(e) =>
                                setIngredientesMap((prev) => ({
                                  ...prev,
                                  [ing.id]: { ...prev[ing.id], cantidad: e.target.value },
                                }))
                              }
                              placeholder="0"
                              className="w-full bg-white border border-outline-variant rounded px-2 py-1.5 text-on-surface font-body text-xs focus:outline-none focus:ring-1 focus:ring-primary-container"
                            />
                          </div>
                          <div>
                            <label className="block font-body text-[11px] text-on-surface-variant mb-0.5">Unidad</label>
                            <select
                              value={ingredientesMap[ing.id].unidad_medida_id}
                              onChange={(e) =>
                                setIngredientesMap((prev) => ({
                                  ...prev,
                                  [ing.id]: { ...prev[ing.id], unidad_medida_id: Number(e.target.value) },
                                }))
                              }
                              className="w-full bg-white border border-outline-variant rounded px-2 py-1.5 text-on-surface font-body text-xs focus:outline-none focus:ring-1 focus:ring-primary-container"
                            >
                              {unidadesMedida.map((u) => (
                                <option key={u.id} value={u.id}>
                                  {u.simbolo} ({u.nombre})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex items-end pb-1.5">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={ingredientesMap[ing.id].es_removible}
                                onChange={(e) =>
                                  setIngredientesMap((prev) => ({
                                    ...prev,
                                    [ing.id]: { ...prev[ing.id], es_removible: e.target.checked },
                                  }))
                                }
                                className="rounded border-outline-variant text-primary-container focus:ring-primary-container"
                              />
                              <span className="font-body text-xs text-on-surface-variant">Removible</span>
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-on-surface-variant">Cargando ingredientes...</p>
            )}
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
