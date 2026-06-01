/**
 * ProductCard.tsx — Card de producto para la grilla de la tienda.
 * Muestra:
 * - Imagen del producto (o icono placeholder si no tiene)
 * - Badge de categoría sobre la imagen
 * - Nombre, descripción (2 líneas), precio por unidad
 * - Botón "Agregar al carrito" (deshabilitado si no disponible)
 * - Badges de "Sin stock" o "No disponible" según corresponda
 */

import type { Producto } from "../types";

/**
 * Props del componente ProductCard.
 */
interface Props {
  producto: Producto;       // Datos completos del producto a mostrar
  onAddToCart: (p: Producto) => void;  // Callback al hacer click en +
}

/**
 * ProductCard — Card individual de producto en la grilla.
 * Controla dos estados visuales:
 * - sinStock: stock_cantidad === 0 → badge rojo "Sin stock"
 * - noDisponible: disponible === false → opacidad reducida + badge "No disponible" + botón deshabilitado
 *
 * @param props.producto - Producto a renderizar
 * @param props.onAddToCart - Función que agrega el producto al carrito
 * @returns {JSX.Element} Card con imagen, info y botón de acción
 */
export default function ProductCard({ producto, onAddToCart }: Props) {
  const sinStock = producto.stock_cantidad === 0;
  const noDisponible = !producto.disponible;

  return (
    <div
      className={`group bg-surface-container-high rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl border border-outline-variant/10 ${
        noDisponible ? "opacity-60" : ""
      }`}
    >
      {/* Imagen del producto */}
      <div className="relative h-48 overflow-hidden bg-primary/5">
        {producto.imagenes_url?.[0] ? (
          // Con imagen: la muestra con hover zoom
          <img
            src={producto.imagenes_url[0]}
            alt={producto.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          // Sin imagen: icono placeholder de café
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-primary/30">
              local_cafe
            </span>
          </div>
        )}
        {/* Badge de categoría sobre la imagen */}
        {producto.categorias && producto.categorias.length > 0 && (
          <span className="absolute top-3 left-3 bg-surface/80 text-on-surface-variant text-label-sm px-2.5 py-0.5 rounded-full backdrop-blur-sm">
            {producto.categorias[0].categoria?.nombre || "Café"}
          </span>
        )}
      </div>
      {/* Información del producto */}
      <div className="p-5">
        {/* Categoría como label superior */}
        {producto.categorias && producto.categorias.length > 0 && (
          <p className="font-body text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">
            {producto.categorias[0].categoria?.nombre || "Café"}
          </p>
        )}
        {/* Nombre del producto */}
        <h3 className="font-headline text-headline-sm text-primary leading-tight">
          {producto.nombre}
        </h3>
        {/* Descripción (máx 2 líneas) */}
        {producto.descripcion && (
          <p className="font-body text-body-md text-on-surface-variant line-clamp-2 mt-1">
            {producto.descripcion}
          </p>
        )}
        {/* Precio y botón add to cart */}
        <div className="flex items-center justify-between mt-3">
          <div>
            {/* Precio formateado */}
            <span className="font-headline text-headline-sm text-on-background font-bold">
              ${producto.precio_base.toFixed(2)}
            </span>
            {/* Símbolo de unidad de venta (ej: / 250g) */}
            {producto.unidad_venta && (
              <span className="font-body text-label-sm text-on-surface-variant ml-1">
                / {producto.unidad_venta.simbolo}
              </span>
            )}
          </div>
          {/* Botón agregar al carrito */}
          <button
            onClick={() => onAddToCart(producto)}
            disabled={noDisponible}
            className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-container transition-colors disabled:bg-outline-variant disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            <span className="material-symbols-outlined text-lg">add</span>
          </button>
        </div>
        {/* Badges de estado: sin stock / no disponible */}
        <div className="flex gap-2 mt-2">
          {sinStock && (
            <span className="font-body text-label-sm bg-error-container text-error px-2.5 py-0.5 rounded-full">
              Sin stock
            </span>
          )}
          {noDisponible && !sinStock && (
            <span className="font-body text-label-sm bg-error/10 text-error px-2.5 py-0.5 rounded-full">
              No disponible
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
