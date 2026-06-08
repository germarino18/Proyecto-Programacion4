/**
 * types/index.ts — Interfaces de dominio del proyecto.
 * Define los tipos TypeScript que representan las entidades del backend:
 * - Productos, categorías, ingredientes y unidades de medida
 * - Pedidos, detalles e historial de estados
 * - Direcciones y formas de pago
 * - Usuario autenticado con roles
 */

/**
 * UnidadMedida — Unidad de medida de ingredientes / productos.
 * Ej: "Gramo" / "g", "Unidad" / "ud"
 */
export interface UnidadMedida {
  id: number;
  nombre: string;
  simbolo: string;
  tipo: string;
}

/**
 * Categoria — Categoría de producto, puede tener categorías hijas (subcategorías).
 * parent_id: null significa que es categoría raíz.
 */
export interface Categoria {
  id: number;
  parent_id: number | null;
  nombre: string;
  descripcion: string | null;
  hijos?: Categoria[];
}

/**
 * Ingrediente — Ingrediente de un producto.
 * es_alergeno indica si debe mostrarse como alerta.
 */
export interface Ingrediente {
  id: number;
  nombre: string;
  descripcion: string | null;
  es_alergeno: boolean;
}

/**
 * ProductoCategoria — Relación muchos-a-muchos entre producto y categoría.
 * es_principal: true si es la categoría principal del producto.
 */
export interface ProductoCategoria {
  producto_id: number;
  categoria_id: number;
  es_principal: boolean;
  categoria?: Categoria;
}

/**
 * ProductoIngrediente — Relación muchos-a-muchos entre producto e ingrediente.
 * cantidad + unidad_medida_id definen cuánto de ese ingrediente lleva.
 * es_removible: si el cliente puede quitarlo del producto.
 */
export interface ProductoIngrediente {
  producto_id: number;
  ingrediente_id: number;
  cantidad: number;
  unidad_medida_id: number;
  es_removible: boolean;
  ingrediente?: Ingrediente;
}

/**
 * Producto — Producto principal de la tienda.
 * stock_cantidad: unidades disponibles en inventario.
 * disponible: si el producto está activo para la venta.
 * categorias/ingredientes/unidad_venta: relaciones populadas por la API.
 */
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

/**
 * PedidoCreate — Payload para crear un nuevo pedido (POST /pedidos).
 */
export interface PedidoCreate {
  direccion_id: number;
  forma_pago_id: number;
  items: { producto_id: number; cantidad: number }[];
}

/**
 * DetallePedidoRead — Item individual dentro de un pedido.
 * precio_snapshot y nombre_snapshot: copia del producto al momento de la compra.
 */
export interface DetallePedidoRead {
  id: number;
  producto_id: number;
  cantidad: number;
  precio_snapshot: number;
  nombre_snapshot: string;
}

/**
 * PedidoRead — Pedido completo devuelto por la API.
 * Incluye detalles (productos comprados) e historial (línea de tiempo de estados).
 */
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

/**
 * HistorialEstadoRead — Cambio de estado en el historial del pedido.
 * fecha: timestamp del cambio.
 */
export interface HistorialEstadoRead {
  id: number;
  estado: string;
  fecha: string;
}

/**
 * DireccionRead — Dirección de entrega del usuario.
 */
export interface DireccionRead {
  id: number;
  alias: string;
  direccion: string;
  ciudad: string;
}

/**
 * DireccionCreate — Payload para crear una nueva dirección (POST /direcciones).
 */
export interface DireccionCreate {
  alias: string;
  direccion: string;
  ciudad: string;
  region: string;
  codigo_postal?: string;
}

/**
 * FormaPago — Método de pago disponible.
 * Ej: "Efectivo", "Mercado Pago", "Transferencia"
 */
export interface FormaPago {
  id: number;
  nombre: string;
}

/**
 * UsuarioAuth — Usuario autenticado devuelto por GET /auth/me.
 * rol: rol único del usuario con código y descripción.
 */
export interface UsuarioAuth {
  id: number;
  email: string;
  nombre: string;
  activo: boolean;
  rol?: { codigo: string; descripcion: string } | null;
}
