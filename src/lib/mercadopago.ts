/**
 * MERCADO PAGO CONFIGURATION
 * Public key for frontend SDK tokenization
 */
export const MP_PUBLIC_KEY = "TEST-3c00d3f3-5871-4d12-a6ca-830e8cdf3c8a";

/**
 * Load MercadoPago SDK dynamically
 */
let mpInstance: any = null;

export async function loadMercadoPago(): Promise<any> {
  if (mpInstance) return mpInstance;

  return new Promise((resolve, reject) => {
    if ((window as any).MercadoPago) {
      mpInstance = new (window as any).MercadoPago(MP_PUBLIC_KEY, { locale: "pt-BR" });
      return resolve(mpInstance);
    }

    const script = document.createElement("script");
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.async = true;
    script.onload = () => {
      mpInstance = new (window as any).MercadoPago(MP_PUBLIC_KEY, { locale: "pt-BR" });
      resolve(mpInstance);
    };
    script.onerror = () => reject(new Error("Failed to load MercadoPago SDK"));
    document.head.appendChild(script);
  });
}

/**
 * Payment status mapping
 */
export const MP_STATUS_MAP: Record<string, { label: string; color: string; icon: string }> = {
  approved: { label: "Aprovado", color: "text-green-600", icon: "✅" },
  pending: { label: "Pendente", color: "text-yellow-600", icon: "⏳" },
  authorized: { label: "Autorizado", color: "text-blue-600", icon: "🔵" },
  in_process: { label: "Em processamento", color: "text-blue-500", icon: "🔄" },
  in_mediation: { label: "Em mediação", color: "text-orange-500", icon: "⚖️" },
  rejected: { label: "Rejeitado", color: "text-red-600", icon: "❌" },
  cancelled: { label: "Cancelado", color: "text-gray-500", icon: "🚫" },
  refunded: { label: "Devolvido", color: "text-gray-600", icon: "↩️" },
  charged_back: { label: "Estornado", color: "text-red-500", icon: "⚠️" },
};
