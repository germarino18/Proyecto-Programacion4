import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axiosInstance";
import ProductCard from "../components/ProductCard";
import { useCartStore } from "../store/cartStore";
import type { Producto } from "../types";

export default function HomePage() {
  const addItem = useCartStore((s) => s.addItem);
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
        <p className="text-gray-500 text-lg">Cargando productos...</p>
      </div>
    );
  }

  const handleAddToCart = (producto: Producto) => {
    addItem(producto);
  };

  // Filtrar productos por categoría seleccionada
  const productosFiltrados = selectedCategoriaId
    ? productos?.filter((p) =>
        p.categorias?.some((c) => c.categoria_id === selectedCategoriaId)
      )
    : productos;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Hero */}
      <div className="text-center py-10 mb-8">
        <h1 className="text-4xl font-bold text-[#354867] mb-2">
          Nuestro Café
        </h1>
        <p className="text-gray-500 text-lg">
          Seleccioná tus productos y armá tu pedido
        </p>
      </div>

      {/* Categorías */}
      {categorias && Array.isArray(categorias) && categorias.length > 0 && (
        <div className="flex gap-2 mb-8 flex-wrap">
          <span className="text-sm font-medium text-gray-500 py-1">
            Categorías:
          </span>
          <button
            onClick={() => setSelectedCategoriaId(null)}
            className={`text-sm px-3 py-1 rounded-full transition-colors ${
              selectedCategoriaId === null
                ? "bg-[#c8a97e] text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:border-[#c8a97e]"
            }`}
          >
            Todas
          </button>
          {categorias.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoriaId(cat.id)}
              className={`text-sm px-3 py-1 rounded-full transition-colors ${
                selectedCategoriaId === cat.id
                  ? "bg-[#c8a97e] text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-[#c8a97e]"
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      )}

      {/* Grid de productos */}
      {productosFiltrados && productosFiltrados.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
          <p className="text-gray-400 text-lg">No hay productos disponibles</p>
        </div>
      )}
    </div>
  );
}
