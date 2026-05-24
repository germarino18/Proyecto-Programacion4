import api from './client';
import type { Ingrediente, IngredienteCreate, IngredienteUpdate } from '../types';

interface GetIngredientesParams {
  q?: string;
  es_alergeno?: boolean;
}

export async function getIngredientes(params?: GetIngredientesParams): Promise<Ingrediente[]> {
  const query: Record<string, string> = {};
  if (params?.q) query.q = params.q;
  if (params?.es_alergeno !== undefined) query.es_alergeno = String(params.es_alergeno);
  const res = await api.get<Ingrediente[]>('/ingredientes', { params: query });
  return res.data;
}

export async function getIngredienteById(id: number): Promise<Ingrediente> {
  const res = await api.get<Ingrediente>(`/ingredientes/${id}`);
  return res.data;
}

export async function createIngrediente(data: IngredienteCreate): Promise<Ingrediente> {
  const res = await api.post<Ingrediente>('/ingredientes', data);
  return res.data;
}

export async function updateIngrediente(id: number, data: IngredienteUpdate): Promise<Ingrediente> {
  const res = await api.patch<Ingrediente>(`/ingredientes/${id}`, data);
  return res.data;
}

export async function deleteIngrediente(id: number): Promise<void> {
  await api.delete(`/ingredientes/${id}`);
}
