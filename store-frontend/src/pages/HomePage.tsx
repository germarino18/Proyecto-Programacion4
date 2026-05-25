import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import api from "../api/axiosInstance";
import ProductCard from "../components/ProductCard";
import { useCartStore } from "../store/cartStore";
import type { Producto } from "../types";

export default function HomePage() {
  const addItem = useCartStore((s) => s.addItem);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") ?? "";
  const [selectedCategoriaId, setSelectedCategoriaId] = useState<number | null>(null);

  const { data: productos, isLoading } = useQuery<Producto[]>({
    queryKey: ["productos"],
    queryFn: () => api.get("/productos").then((r) => r.data),
  });

  const { data: categorias } = useQuery({
    queryKey: ["categorias"],
    queryFn: () => api.get("/categorias").then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="font-body text-body-md text-on-surface-variant">Cargando productos...</p>
      </div>
    );
  }

  const handleAddToCart = (producto: Producto) => {
    addItem(producto);
  };

  // Filtrar productos: solo disponibles + por categoría y/o búsqueda
  let productosFiltrados = productos?.filter((p) => p.disponible);
  if (selectedCategoriaId) {
    productosFiltrados = productosFiltrados?.filter((p) =>
      p.categorias?.some((c) => c.categoria_id === selectedCategoriaId)
    );
  }
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    productosFiltrados = productosFiltrados?.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        p.descripcion?.toLowerCase().includes(q)
    );
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-surface-container overflow-hidden">
        <img src="public/banner.png" alt="ROSTBanner"/>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search bar mobile */}
        <div className="relative w-full md:hidden mb-6">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              const value = e.target.value;
              if (value.trim()) {
                setSearchParams({ search: value.trim() }, { replace: true });
              } else {
                setSearchParams({}, { replace: true });
              }
            }}
            placeholder="Buscar productos..."
            className="w-full bg-surface-container-low rounded-lg pl-10 pr-10 py-2.5 font-body text-body-md text-on-surface placeholder:text-on-surface-variant/60 border-none outline-none focus:ring-2 focus:ring-primary/30"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchParams({}, { replace: true })}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-on-surface transition-colors p-1"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          )}
        </div>

        {/* Categorías */}
        {categorias && Array.isArray(categorias) && categorias.length > 0 && (
          <div className="flex gap-2 mb-8 flex-wrap">
            <button
              onClick={() => setSelectedCategoriaId(null)}
              className={`font-label-md px-4 py-2 rounded-full transition-all ${
                selectedCategoriaId === null && !searchQuery
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-high text-on-surface-variant hover:bg-primary-container/20"
              }`}
            >
              Todas
            </button>
            {categorias.map((cat: any) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoriaId(cat.id)}
                className={`font-label-md px-4 py-2 rounded-full transition-all ${
                  selectedCategoriaId === cat.id
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-high text-on-surface-variant hover:bg-primary-container/20"
                }`}
              >
                {cat.nombre}
              </button>
            ))}
          </div>
        )}

        {/* Resultado de búsqueda */}
        {searchQuery && (
          <p className="font-body text-body-md text-on-surface-variant mb-6">
            Resultados para: <strong className="text-primary">"{searchQuery}"</strong>
            {productosFiltrados && (
              <span className="ml-2">({productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''})</span>
            )}
          </p>
        )}

        {/* Grid de productos */}
        {productosFiltrados && productosFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
            {productosFiltrados.map((p) => (
              <ProductCard
                key={p.id}
                producto={p}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-4">
              {searchQuery ? "search_off" : "inventory_2"}
            </span>
            <p className="font-body text-body-md text-on-surface-variant">
              {searchQuery
                ? `No hay resultados para "${searchQuery}"`
                : "No hay productos disponibles"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
