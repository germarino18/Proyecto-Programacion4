import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import api from "../api/axiosInstance";
import ProductCard from "../components/ProductCard";
import { useCartStore } from "../store/cartStore";
import type { Producto } from "../types";

export default function HomePage() {
  const addItem = useCartStore((s) => s.addItem);
  const [selectedCategoriaId, setSelectedCategoriaId] = useState<number | null>(null);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") ?? "";

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

  // Filtrar productos por categoría seleccionada y/o búsqueda
  let productosFiltrados = productos;
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
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-20 text-center">
          <img src="/logo2.png" alt="ROST" className="h-20 md:h-24 mx-auto mb-6" />
          <h1 className="font-headline text-headline-lg text-primary font-bold mb-4 max-w-3xl mx-auto">
            El ritual del café, elevado a su máxima expresión
          </h1>
          <p className="font-body text-body-md text-on-surface-variant max-w-xl mx-auto">
            Seleccioná tus productos y armá tu pedido
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
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
