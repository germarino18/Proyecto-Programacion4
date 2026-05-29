/**
 * LoginPage.tsx — Pantalla de "sesión cerrada"
 *
 * NO contiene formulario de login. El login se maneja desde la tienda
 * (localhost:5174) porque la sesión se comparte mediante cookie HttpOnly.
 * Esta pantalla solo informa que la sesión está cerrada y redirige a la tienda.
 *
 * Estados:
 *   - Sesión cerrada: muestra logo, icono de logout, mensaje y botón "Ir a iniciar sesión"
 */

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFEDDB]">
      <div className="bg-surface-container-high rounded-lg shadow-[0_10px_20px_-5px_rgba(77,96,128,0.08)] p-10 border border-outline-variant/10 w-full max-w-[440px] text-center">
        <img src="/logo.png" alt="ROST" className="h-14 mx-auto mb-6" />

        <span className="material-symbols-outlined text-5xl text-primary mb-4 block">
          logout
        </span>
        <h2 className="font-headline text-2xl font-bold text-primary mb-2">
          Sesión cerrada
        </h2>
        <p className="font-body text-on-surface-variant text-sm mb-8">
          Iniciá sesión desde la tienda para acceder al panel de administración.
        </p>

        <button
          onClick={() => window.location.href = 'http://localhost:5174/login'}
          className="inline-flex items-center gap-2 bg-primary-container text-on-primary px-6 py-3 rounded-lg font-body font-semibold text-sm hover:opacity-90 transition-opacity cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">login</span>
          Ir a iniciar sesión
        </button>

        <div className="flex items-center gap-3 mt-8">
          <div className="flex-1 h-px bg-outline-variant/30" />
          <span className="font-body text-[11px] text-on-surface-variant/50 uppercase tracking-[0.15em]">
            ROST Admin
          </span>
          <div className="flex-1 h-px bg-outline-variant/30" />
        </div>
      </div>
    </div>
  );
}
