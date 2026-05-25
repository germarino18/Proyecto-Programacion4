export interface UnidadMedida {
  id: number;
  nombre: string;
  simbolo: string;
  tipo: string;
}

export interface Categoria {
  id: number;
  parent_id: number | null;
  nombre: string;
  descripcion: string | null;
  hijos?: Categoria[];
}

export interface Ingrediente {
  id: number;
  nombre: string;
  descripcion: string | null;
  es_alergeno: boolean;
}

export interface ProductoCategoria {
  producto_id: number;
  categoria_id: number;
  es_principal: boolean;
  categoria?: Categoria;
}

export interface ProductoIngrediente {
  producto_id: number;
  ingrediente_id: number;
  cantidad: number;
  unidad_medida_id: number;
  es_removible: boolean;
  ingrediente?: Ingrediente;
}

export interface Producto {
  id: number;
  unidad_venta_id: number | null;
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  imagenes_url: string[] | null;
  stock_cantidad: number;
  disponible: boolean;
  categorias?: ProductoCategoria[];
  ingredientes?: ProductoIngrediente[];
  unidad_venta?: UnidadMedida;
}

export interface PedidoCreate {
  direccion_id: number;
  forma_pago_id: number;
  items: { producto_id: number; cantidad: number }[];
}

export interface DetallePedidoRead {
  id: number;
  producto_id: number;
  cantidad: number;
  precio_snapshot: number;
  nombre_snapshot: string;
}

export interface PedidoRead {
  id: number;
  usuario_id: number;
  direccion_entrega_id: number | null;
  forma_pago_id: number | null;
  estado_actual: string;
  total: number | null;
  created_at: string;
  detalles: DetallePedidoRead[];
  historial: HistorialEstadoRead[];
}

export interface HistorialEstadoRead {
  id: number;
  estado: string;
  fecha: string;
}

export interface DireccionRead {
  id: number;
  alias: string;
  direccion: string;
  ciudad: string;
}

export interface DireccionCreate {
  alias: string;
  direccion: string;
  ciudad: string;
  region: string;
  codigo_postal?: string;
}

export interface FormaPago {
  id: number;
  nombre: string;
}

export interface UsuarioAuth {
  id: number;
  email: string;
  nombre: string;
  activo: boolean;
  roles?: { rol_codigo: string; rol?: { codigo: string; descripcion: string } }[];
}
