import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProductoById } from '../api/productos';

export default function ProductoDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productoId = parseInt(id ?? '0', 10);

  const { data: producto, isLoading, isError } = useQuery({
    queryKey: ['producto', productoId],
    queryFn: () => getProductoById(productoId),
    enabled: !isNaN(productoId) && productoId > 0,
  });

  if (isLoading) return <p className="text-on-surface-variant">Cargando producto...</p>;
  if (isError || !producto) return <p className="text-error">Error al cargar el producto</p>;

  return (
    <div className="max-w-3xl">
      <button
        onClick={() => navigate('/admin/productos')}
        className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-6 font-body"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Volver a productos
      </button>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="font-headline text-2xl font-bold text-primary">{producto.nombre}</h2>
            {producto.descripcion && (
              <p className="font-body text-on-surface-variant mt-2">{producto.descripcion}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {producto.disponible ? (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold uppercase tracking-wide">
                Disponible
              </span>
            ) : (
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold uppercase tracking-wide">
                No disponible
              </span>
            )}
            {producto.stock_cantidad === 0 && (
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold uppercase tracking-wide">
                Sin stock
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-surface-container-high rounded-lg p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">Precio Base</p>
            <p className="font-headline text-xl font-bold text-primary">${producto.precio_base.toFixed(2)}</p>
          </div>
          <div className="bg-surface-container-high rounded-lg p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">Stock</p>
            <p className="font-headline text-xl font-bold text-primary">{producto.stock_cantidad} unid.</p>
          </div>
        </div>

        {producto.imagenes_url && producto.imagenes_url.length > 0 && (
          <div className="mb-8">
            <img
              src={producto.imagenes_url[0]}
              alt={producto.nombre}
              className="w-full max-h-80 object-cover rounded-lg"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        )}

        {producto.categorias && producto.categorias.length > 0 && (
          <div className="mb-8">
            <h3 className="font-body font-semibold text-sm text-on-surface mb-3">Categorías</h3>
            <div className="flex flex-wrap gap-2">
              {producto.categorias.map((pc) => (
                <span key={pc.categoria_id} className="px-3 py-1 bg-primary-fixed text-primary rounded-full text-xs font-semibold">
                  {pc.categoria?.nombre ?? `Categoría #${pc.categoria_id}`}
                  {pc.es_principal && <span className="ml-1 opacity-70">(principal)</span>}
                </span>
              ))}
            </div>
          </div>
        )}

        {producto.ingredientes && producto.ingredientes.length > 0 && (
          <div>
            <h3 className="font-body font-semibold text-sm text-on-surface mb-3">Ingredientes</h3>
            <div className="space-y-2">
              {producto.ingredientes.map((pi) => (
                <div key={pi.ingrediente_id} className="flex items-center justify-between bg-surface-container-high rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-body text-sm text-on-surface">
                      {pi.ingrediente?.nombre ?? `Ingrediente #${pi.ingrediente_id}`}
                    </span>
                    {pi.ingrediente?.es_alergeno && (
                      <span className="px-2 py-0.5 bg-error-container text-on-error-container rounded-full text-[10px] font-bold uppercase tracking-wider">
                        Alérgeno
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-body text-sm text-on-surface-variant">
                      {pi.cantidad} {pi.unidad_medida?.simbolo ?? ''}
                    </span>
                    {pi.es_removible && (
                      <span className="text-xs text-on-surface-variant italic">removible</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
