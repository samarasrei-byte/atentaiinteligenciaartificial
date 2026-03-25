import { supabase } from '@/integrations/supabase/client';

/**
 * Utility functions for handling service submission flows
 * 
 * REGRA DE NEGÓCIO:
 * - Todo serviço finaliza em CHAT
 * - Cria solicitação → Cria conversa → Dispara notificação → Redireciona para chat
 */

export type ServiceType = 'limpanome' | 'analise-fiscal' | 'bi-contabilidade' | 'abertura-empresa' | 'certidao' | 'ir' | 'emissao-nf';

export interface ServiceRequest {
  serviceType: ServiceType;
  userId?: string;
  fullName: string;
  email: string;
  phone?: string;
  cpf?: string;
  cnpj?: string;
  additionalData?: Record<string, any>;
}

export interface ServiceResponse {
  success: boolean;
  requestId?: string;
  chatUrl: string;
  error?: string;
}

/**
 * Get the responsible person for each service type
 */
export const getResponsiblePerson = (serviceType: ServiceType): 'guilherme' | 'cesar' => {
  switch (serviceType) {
    case 'limpanome':
    case 'analise-fiscal':
    case 'abertura-empresa':
    case 'certidao':
    case 'ir':
      return 'guilherme';
    case 'bi-contabilidade':
      return 'cesar';
    default:
      return 'guilherme';
  }
};

/**
 * Get the chat URL for a service type
 */
export const getChatUrl = (serviceType: ServiceType, requestId?: string): string => {
  const responsible = getResponsiblePerson(serviceType);
  const baseUrl = `/chat/${responsible}?servico=${serviceType}`;
  return requestId ? `${baseUrl}&request=${requestId}` : baseUrl;
};

/**
 * Create notification for user and responsible person
 */
export const createServiceNotifications = async (
  userId: string | undefined,
  serviceType: ServiceType,
  requestId: string,
  userName: string
) => {
  const responsible = getResponsiblePerson(serviceType);
  const serviceName = getServiceDisplayName(serviceType);
  
  // Create notification for the user
  if (userId) {
    await supabase.from('service_notifications').insert({
      user_id: userId,
      title: `🎉 Solicitação Enviada: ${serviceName}`,
      message: `Sua solicitação de ${serviceName} foi recebida! Nosso especialista entrará em contato em breve.`,
      notification_type: 'service_created',
      service_type: serviceType,
      metadata: { requestId, responsible },
    });
  }
  
  // Create notification for admin (Guilherme/César)
  // In production, this would target the actual admin user IDs
  console.log(`[Notification] New ${serviceType} request from ${userName} (ID: ${requestId})`);
};

/**
 * Get display name for a service type
 */
export const getServiceDisplayName = (serviceType: ServiceType): string => {
  const names: Record<ServiceType, string> = {
    'limpanome': 'Limpa Nome',
    'analise-fiscal': 'Análise Fiscal',
    'bi-contabilidade': 'Emissão de NF',
    'abertura-empresa': 'Abertura de Empresa',
    'certidao': 'Emissão de Certidão',
    'ir': 'Declaração de IR',
    'emissao-nf': 'Emissão de NF',
  };
  return names[serviceType] || serviceType;
};

/**
 * Create a Limpa Nome service request and redirect to chat
 */
export const createLimpaNomeRequest = async (
  request: ServiceRequest
): Promise<ServiceResponse> => {
  try {
    const { data, error } = await supabase
      .from('credit_repair_requests')
      .insert({
        user_id: request.userId || null,
        full_name: request.fullName,
        email: request.email,
        phone: request.phone,
        cpf: request.cpf,
        status: 'pending',
        payment_status: 'pending',
        debt_amount_cents: request.additionalData?.debtAmountCents || 0,
        debt_description: request.additionalData?.debtDescription || '',
        bureaus_selected: request.additionalData?.bureausSelected || [],
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Create notifications
    await createServiceNotifications(request.userId, 'limpanome', data.id, request.fullName);
    
    return {
      success: true,
      requestId: data.id,
      chatUrl: getChatUrl('limpanome', data.id),
    };
  } catch (error: any) {
    console.error('Error creating Limpa Nome request:', error);
    return {
      success: false,
      chatUrl: getChatUrl('limpanome'),
      error: error.message,
    };
  }
};

/**
 * Create a Fiscal Analysis service request and redirect to chat
 */
export const createFiscalRequest = async (
  request: ServiceRequest
): Promise<ServiceResponse> => {
  try {
    const { data, error } = await supabase
      .from('fiscal_analysis_requests')
      .insert({
        user_id: request.userId || null,
        full_name: request.fullName,
        email: request.email,
        phone: request.phone,
        cpf: request.cpf,
        company_name: request.additionalData?.companyName || request.fullName,
        cnpj: request.cnpj || '',
        tax_regime: request.additionalData?.taxRegime || 'a_definir',
        annual_revenue_cents: request.additionalData?.annualRevenueCents || 0,
        status: 'pending',
      })
      .select()
      .single();
    
    if (error) throw error;
    
    await createServiceNotifications(request.userId, 'analise-fiscal', data.id, request.fullName);
    
    return {
      success: true,
      requestId: data.id,
      chatUrl: getChatUrl('analise-fiscal', data.id),
    };
  } catch (error: any) {
    console.error('Error creating Fiscal request:', error);
    return {
      success: false,
      chatUrl: getChatUrl('analise-fiscal'),
      error: error.message,
    };
  }
};

/**
 * Create a BI Contabilidade service request and redirect to chat
 */
export const createBIRequest = async (
  request: ServiceRequest
): Promise<ServiceResponse> => {
  try {
    const { data, error } = await supabase
      .from('fiscal_analysis_requests')
      .insert({
        user_id: request.userId || null,
        full_name: request.fullName,
        email: request.email,
        phone: request.phone,
        cpf: request.cpf,
        company_name: request.additionalData?.companyName || request.fullName,
        cnpj: request.cnpj || '',
        tax_regime: request.additionalData?.taxRegime || 'a_definir',
        annual_revenue_cents: request.additionalData?.annualRevenueCents || 0,
        status: 'pending',
        notes: JSON.stringify({
          ...request.additionalData,
          source: 'bi-contabilidade',
        }),
      })
      .select()
      .single();
    
    if (error) throw error;
    
    await createServiceNotifications(request.userId, 'bi-contabilidade', data.id, request.fullName);
    
    return {
      success: true,
      requestId: data.id,
      chatUrl: getChatUrl('bi-contabilidade', data.id),
    };
  } catch (error: any) {
    console.error('Error creating BI request:', error);
    return {
      success: false,
      chatUrl: getChatUrl('bi-contabilidade'),
      error: error.message,
    };
  }
};
