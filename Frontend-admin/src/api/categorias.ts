import api from './client';
import type { Categoria, CategoriaCreate, CategoriaUpdate } from '../types';

interface GetCategoriasParams {
  q?: string;
  parent_id?: number | null;
}

export async function getCategorias(params?: GetCategoriasParams): Promise<Categoria[]> {
  const query: Record<string, string> = {};
  if (params?.q) query.q = params.q;
  if (params?.parent_id !== undefined && params?.parent_id !== null) query.parent_id = String(params.parent_id);
  const res = await api.get<Categoria[]>('/categorias', { params: query });
  return res.data;
}

export async function getCategoriaById(id: number): Promise<Categoria> {
  const res = await api.get<Categoria>(`/categorias/${id}`);
  return res.data;
}

export async function createCategoria(data: CategoriaCreate): Promise<Categoria> {
  const res = await api.post<Categoria>('/categorias', data);
  return res.data;
}

export async function updateCategoria(id: number, data: CategoriaUpdate): Promise<Categoria> {
  const res = await api.patch<Categoria>(`/categorias/${id}`, data);
  return res.data;
}

export async function deleteCategoria(id: number): Promise<void> {
  await api.delete(`/categorias/${id}`);
}
