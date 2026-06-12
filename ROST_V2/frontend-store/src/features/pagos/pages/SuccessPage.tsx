/**
 * SuccessPage.tsx — Pantalla de resultado de pago con MercadoPago.
 *
 * MP redirige aquí después del pago vía back_urls.success con query params:
 *   /pago-exitoso?payment_id=123&status=approved&external_reference=xyz
 *
 * ⚠️ NO confiamos en los query params — consultamos a MercadoPago DIRECTAMENTE
 *    vía POST /api/v1/pagos/verificar/{payment_id} para obtener el estado REAL.
 *
 * Estados:
 * - loading:   Verificando el pago con MP
 * - approved:  ✅ Pago aprobado + mensaje "esperá tu pedido"
 * - rejected:  ❌ Pago rechazado + opción de reintentar
 * - pending:   ⏳ Pago pendiente + mensaje de espera
 * - error:     ⚠️ Error de conexión o pago no encontrado
 */

import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verificarPago } from "../../../api/pagos";

type PagoEstado = "loading" | "approved" | "rejected" | "pending" | "error";

interface VerificarResponse {
  status: string;
  pago_status?: string;
  payment_method_id?: string;
  transaction_amount?: number;
  detail?: string;
}

export default function SuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  /** ID del pago que MP envía en la URL de redirect */
  const paymentId = searchParams.get("payment_id");

  const [estado, setEstado] = useState<PagoEstado>("loading");
  const [detalle, setDetalle] = useState("");
  const [monto, setMonto] = useState(0);
  const [metodoPago, setMetodoPago] = useState("");

  useEffect(() => {
    if (!paymentId) {
      setEstado("error");
      setDetalle("No se recibió información del pago. Si ya realizaste el pago, revisá tus pedidos.");
      return;
    }

    /** Consulta el estado REAL del pago contra MP API (no confía en URL) */
    verificarPago(Number(paymentId))
      .then((res: VerificarResponse) => {
        if (res.status === "ok" && res.pago_status) {
          setEstado(res.pago_status as PagoEstado);
          setMonto(res.transaction_amount || 0);
          setMetodoPago(res.payment_method_id || "");
        } else if (res.status === "not_found") {
          setEstado("error");
          setDetalle("No encontramos este pago en el sistema. Contactanos si el problema persiste.");
        } else {
          setEstado("error");
          setDetalle(res.detail || "No pudimos verificar el pago.");
        }
      })
      .catch(() => {
        setEstado("error");
        setDetalle("Error de conexión al verificar el pago. Revisá tus pedidos para ver el estado.");
      });
  }, [paymentId]);

  // =========================================================================
  // RENDER DE CADA ESTADO
  // =========================================================================

  /** Estado: Verificando con MP */
  if (estado === "loading") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          {/* Spinner animado */}
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-6" />
          <h2 className="font-headline text-headline-lg text-on-surface font-bold mb-2">
            Verificando pago
          </h2>
          <p className="font-body text-body-md text-on-surface-variant">
            Estamos consultando el estado de tu pago con MercadoPago...
          </p>
        </div>
      </div>
    );
  }

  /** Estado: Pago aprobado exitosamente */
  if (estado === "approved") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto bg-surface-container-high rounded-2xl p-10 shadow-sm border border-outline-variant/10">
          {/* Icono de éxito */}
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-5xl text-primary">
              check_circle
            </span>
          </div>

          <h2 className="font-headline text-headline-xl text-primary font-bold mb-3">
            ¡Pago aprobado!
          </h2>
          <p className="font-body text-body-lg text-on-surface mb-2">
            Gracias por tu compra
          </p>

          {/* Detalle del pago */}
          <div className="bg-surface-container-lowest rounded-xl p-4 my-6 text-left space-y-2">
            {monto > 0 && (
              <div className="flex justify-between">
                <span className="font-body text-body-md text-on-surface-variant">Monto</span>
                <span className="font-body text-body-md text-on-surface font-semibold">
                  ${monto.toFixed(2)}
                </span>
              </div>
            )}
            {metodoPago && (
              <div className="flex justify-between">
                <span className="font-body text-body-md text-on-surface-variant">Método de pago</span>
                <span className="font-body text-body-md text-on-surface font-semibold capitalize">
                  {metodoPago.replace("_", " ")}
                </span>
              </div>
            )}
          </div>

          {/* Mensaje de espera */}
          <div className="bg-surface-warning/10 rounded-xl p-4 mb-6 flex items-start gap-3">
            <span className="material-symbols-outlined text-warning shrink-0">
              schedule
            </span>
            <p className="font-body text-body-md text-on-surface text-left">
              <strong>Esperá tu pedido</strong> — Te vamos a notificar cuando
              esté en camino. Mientras tanto podés seguir el estado desde
              "Mis pedidos".
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/mis-pedidos")}
              className="flex-1 bg-primary text-on-primary py-3 px-6 rounded-lg font-body text-body-md font-bold hover:brightness-110 transition-all"
            >
              Ver mis pedidos
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex-1 bg-surface-container-lowest text-primary border border-primary/30 py-3 px-6 rounded-lg font-body text-body-md font-bold hover:bg-primary/5 transition-all"
            >
              Volver a la tienda
            </button>
          </div>
        </div>
      </div>
    );
  }

  /** Estado: Pago rechazado */
  if (estado === "rejected") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto bg-surface-container-high rounded-2xl p-10 shadow-sm border border-outline-variant/10">
          <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-5xl text-error">
              cancel
            </span>
          </div>

          <h2 className="font-headline text-headline-lg text-error font-bold mb-3">
            Pago rechazado
          </h2>
          <p className="font-body text-body-md text-on-surface-variant mb-8">
            El pago no pudo ser procesado. Probá con otro medio de pago
            o intentá de nuevo.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/carrito")}
              className="flex-1 bg-primary text-on-primary py-3 px-6 rounded-lg font-body text-body-md font-bold hover:brightness-110 transition-all"
            >
              Volver al carrito
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex-1 bg-surface-container-lowest text-primary border border-primary/30 py-3 px-6 rounded-lg font-body text-body-md font-bold hover:bg-primary/5 transition-all"
            >
              Ir a la tienda
            </button>
          </div>
        </div>
      </div>
    );
  }

  /** Estado: Pago pendiente */
  if (estado === "pending") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto bg-surface-container-high rounded-2xl p-10 shadow-sm border border-outline-variant/10">
          <div className="w-20 h-20 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-5xl text-warning">
              hourglass_top
            </span>
          </div>

          <h2 className="font-headline text-headline-lg text-warning font-bold mb-3">
            Pago pendiente
          </h2>
          <p className="font-body text-body-md text-on-surface-variant mb-8">
            El pago está siendo procesado. Te notificaremos cuando
            se acredite. Podés revisar el estado en "Mis pedidos".
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/mis-pedidos")}
              className="flex-1 bg-primary text-on-primary py-3 px-6 rounded-lg font-body text-body-md font-bold hover:brightness-110 transition-all"
            >
              Ver mis pedidos
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex-1 bg-surface-container-lowest text-primary border border-primary/30 py-3 px-6 rounded-lg font-body text-body-md font-bold hover:bg-primary/5 transition-all"
            >
              Ir a la tienda
            </button>
          </div>
        </div>
      </div>
    );
  }

  /** Estado: Error (por defecto) */
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto bg-surface-container-high rounded-2xl p-10 shadow-sm border border-outline-variant/10">
        <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-5xl text-error">
            error_outline
          </span>
        </div>

        <h2 className="font-headline text-headline-lg text-error font-bold mb-3">
          Algo salió mal
        </h2>
        <p className="font-body text-body-md text-on-surface-variant mb-8">
          {detalle || "Ocurrió un error inesperado."}
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate("/mis-pedidos")}
            className="flex-1 bg-primary text-on-primary py-3 px-6 rounded-lg font-body text-body-md font-bold hover:brightness-110 transition-all"
          >
            Ver mis pedidos
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex-1 bg-surface-container-lowest text-primary border border-primary/30 py-3 px-6 rounded-lg font-body text-body-md font-bold hover:bg-primary/5 transition-all"
          >
            Volver a la tienda
          </button>
        </div>
      </div>
    </div>
  );
}
