// =============================================================================
// VALIDAÇÃO E FORMATAÇÃO DE CPF/CNPJ/TELEFONE
// =============================================================================

/**
 * Valida se um CPF é válido usando verificação de dígitos
 */
export function validateCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais (CPFs inválidos conhecidos)
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF[9])) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF[10])) return false;
  
  return true;
}

/**
 * Valida se um CNPJ é válido usando verificação de dígitos
 */
export function validateCNPJ(cnpj: string): boolean {
  // Remove caracteres não numéricos
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  
  // Verifica se tem 14 dígitos
  if (cleanCNPJ.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais (CNPJs inválidos conhecidos)
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;
  
  // Validação do primeiro dígito verificador
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCNPJ[i]) * weights1[i];
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (digit1 !== parseInt(cleanCNPJ[12])) return false;
  
  // Validação do segundo dígito verificador
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleanCNPJ[i]) * weights2[i];
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  if (digit2 !== parseInt(cleanCNPJ[13])) return false;
  
  return true;
}

/**
 * Valida CPF ou CNPJ automaticamente baseado no tamanho
 */
export function validateCPFOrCNPJ(value: string): { valid: boolean; type: 'cpf' | 'cnpj' | null; message?: string } {
  const cleanValue = value.replace(/\D/g, '');
  
  if (cleanValue.length === 0) {
    return { valid: false, type: null, message: 'Informe o CPF ou CNPJ' };
  }
  
  if (cleanValue.length <= 11) {
    if (cleanValue.length < 11) {
      return { valid: false, type: 'cpf', message: 'CPF incompleto' };
    }
    if (!validateCPF(cleanValue)) {
      return { valid: false, type: 'cpf', message: 'CPF inválido' };
    }
    return { valid: true, type: 'cpf' };
  } else {
    if (cleanValue.length < 14) {
      return { valid: false, type: 'cnpj', message: 'CNPJ incompleto' };
    }
    if (cleanValue.length > 14) {
      return { valid: false, type: 'cnpj', message: 'CNPJ com dígitos a mais' };
    }
    if (!validateCNPJ(cleanValue)) {
      return { valid: false, type: 'cnpj', message: 'CNPJ inválido' };
    }
    return { valid: true, type: 'cnpj' };
  }
}

/**
 * Formata CPF: 000.000.000-00
 */
export function formatCPF(value: string): string {
  const cleanValue = value.replace(/\D/g, '').slice(0, 11);
  
  if (cleanValue.length <= 3) return cleanValue;
  if (cleanValue.length <= 6) return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3)}`;
  if (cleanValue.length <= 9) return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3, 6)}.${cleanValue.slice(6)}`;
  return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3, 6)}.${cleanValue.slice(6, 9)}-${cleanValue.slice(9)}`;
}

/**
 * Formata CNPJ: 00.000.000/0001-00
 */
export function formatCNPJ(value: string): string {
  const cleanValue = value.replace(/\D/g, '').slice(0, 14);
  
  if (cleanValue.length <= 2) return cleanValue;
  if (cleanValue.length <= 5) return `${cleanValue.slice(0, 2)}.${cleanValue.slice(2)}`;
  if (cleanValue.length <= 8) return `${cleanValue.slice(0, 2)}.${cleanValue.slice(2, 5)}.${cleanValue.slice(5)}`;
  if (cleanValue.length <= 12) return `${cleanValue.slice(0, 2)}.${cleanValue.slice(2, 5)}.${cleanValue.slice(5, 8)}/${cleanValue.slice(8)}`;
  return `${cleanValue.slice(0, 2)}.${cleanValue.slice(2, 5)}.${cleanValue.slice(5, 8)}/${cleanValue.slice(8, 12)}-${cleanValue.slice(12)}`;
}

/**
 * Formata CPF ou CNPJ automaticamente baseado no tamanho
 */
export function formatCPFOrCNPJ(value: string): string {
  const cleanValue = value.replace(/\D/g, '');
  
  if (cleanValue.length <= 11) {
    return formatCPF(cleanValue);
  }
  return formatCNPJ(cleanValue);
}

/**
 * Formata telefone: (00) 00000-0000 ou (00) 0000-0000
 */
export function formatPhone(value: string): string {
  const cleanValue = value.replace(/\D/g, '').slice(0, 11);
  
  if (cleanValue.length <= 2) return cleanValue.length > 0 ? `(${cleanValue}` : '';
  if (cleanValue.length <= 6) return `(${cleanValue.slice(0, 2)}) ${cleanValue.slice(2)}`;
  if (cleanValue.length <= 10) return `(${cleanValue.slice(0, 2)}) ${cleanValue.slice(2, 6)}-${cleanValue.slice(6)}`;
  return `(${cleanValue.slice(0, 2)}) ${cleanValue.slice(2, 7)}-${cleanValue.slice(7)}`;
}

/**
 * Valida telefone brasileiro
 */
export function validatePhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
}

/**
 * Remove formatação de documento (CPF/CNPJ/Telefone)
 */
export function cleanDocument(value: string): string {
  return value.replace(/\D/g, '');
}
