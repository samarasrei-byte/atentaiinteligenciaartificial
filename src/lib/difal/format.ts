/** Formatação e validação brasileiras do módulo DIFAL. */

export const brl = (cents: number | null | undefined) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((cents ?? 0) / 100);

export const perc = (v: number | null | undefined) =>
  `${(v ?? 0).toFixed(2).replace('.', ',')}%`;

export const dateBR = (iso?: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso.length <= 10 ? `${iso}T12:00:00` : iso);
  return d.toLocaleDateString('pt-BR');
};

export const dateTimeBR = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString('pt-BR') : '—';

/** Converte texto digitado ("1.234,56") em centavos. */
export function parseCents(value: string): number {
  const clean = value.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
  const n = Number(clean);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

export function isValidCNPJ(raw: string): boolean {
  const cnpj = raw.replace(/\D/g, '');
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;
  const calc = (len: number) => {
    let sum = 0;
    let pos = len - 7;
    for (let i = 0; i < len; i++) {
      sum += Number(cnpj[i]) * pos--;
      if (pos < 2) pos = 9;
    }
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };
  return calc(12) === Number(cnpj[12]) && calc(13) === Number(cnpj[13]);
}

export function formatCNPJ(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 14);
  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

export const isValidNCM = (ncm: string) => /^\d{8}$/.test(ncm.replace(/\D/g, ''));
