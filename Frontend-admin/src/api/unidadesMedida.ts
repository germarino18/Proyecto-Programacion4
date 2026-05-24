import api from './client';
import type { UnidadMedida, UnidadMedidaCreate, UnidadMedidaUpdate } from '../types';

interface GetUnidadesParams {
  tipo?: string;
}

export async function getUnidadesMedida(params?: GetUnidadesParams): Promise<UnidadMedida[]> {
  const query: Record<string, string> = {};
  if (params?.tipo) query.tipo = params.tipo;
  const res = await api.get<UnidadMedida[]>('/unidades-medida', { params: query });
  return res.data;
}

export async function getUnidadMedidaById(id: number): Promise<UnidadMedida> {
  const res = await api.get<UnidadMedida>(`/unidades-medida/${id}`);
  return res.data;
}

export async function createUnidadMedida(data: UnidadMedidaCreate): Promise<UnidadMedida> {
  const res = await api.post<UnidadMedida>('/unidades-medida', data);
  return res.data;
}

export async function updateUnidadMedida(id: number, data: UnidadMedidaUpdate): Promise<UnidadMedida> {
  const res = await api.patch<UnidadMedida>(`/unidades-medida/${id}`, data);
  return res.data;
}

export async function deleteUnidadMedida(id: number): Promise<void> {
  await api.delete(`/unidades-medida/${id}`);
}
