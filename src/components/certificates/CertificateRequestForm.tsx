import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  FileText, CreditCard, Shield, Clock, 
  Loader2, ExternalLink 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ServicePricePreview } from '@/components/pricing/ServicePricePreview';
import { SUBSCRIBER_DISCOUNTS } from '@/lib/stripe';

const CERTIFICATE_TYPES = [
  { 
    id: 'cnd_federal', 
    name: 'CND Federal', 
    description: 'Certidão Negativa de Débitos Federais',
    delivery: '3-5 dias úteis'
  },
  { 
    id: 'cnd_estadual', 
    name: 'CND Estadual', 
    description: 'Certidão Negativa de Débitos Estaduais',
    delivery: '5-7 dias úteis'
  },
  { 
    id: 'cnd_municipal', 
    name: 'CND Municipal', 
    description: 'Certidão Negativa de Débitos Municipais',
    delivery: '3-5 dias úteis'
  },
  { 
    id: 'cnd_trabalhista', 
    name: 'CNDT', 
    description: 'Certidão Negativa de Débitos Trabalhistas',
    delivery: '1-3 dias úteis'
  },
  { 
    id: 'cnd_fgts', 
    name: 'CRF FGTS', 
    description: 'Certificado de Regularidade do FGTS',
    delivery: '1-2 dias úteis'
  },
  { 
    id: 'certidao_simplificada', 
    name: 'Certidão Simplificada', 
    description: 'Certidão Simplificada da Junta Comercial',
    delivery: '2-4 dias úteis'
  },
];

// Use base price from stripe config
const CERTIFICATE_PRICE_CENTS = SUBSCRIBER_DISCOUNTS.certificate.basePrice;

interface CertificateRequestFormProps {
  onSuccess?: () => void;
}

const CertificateRequestForm: React.FC<CertificateRequestFormProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [observations, setObservations] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const selectedCertificate = CERTIFICATE_TYPES.find(c => c.id === selectedType);

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 14) {
      return numbers
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return value;
  };

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCnpj(formatCNPJ(e.target.value));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para solicitar uma certidão');
      return;
    }

    if (!selectedType || !cnpj || !companyName) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-certificate-payment', {
        body: {
          certificate_type: selectedType,
          metadata: {
            cnpj: cnpj.replace(/\D/g, ''),
            company_name: companyName,
            observations,
          }
        }
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe checkout in new tab
        window.open(data.url, '_blank');
        toast.success('Redirecionando para o pagamento...');
        onSuccess?.();
      }
    } catch (error: any) {
      console.error('Error creating certificate payment:', error);
      toast.error(error.message || 'Erro ao processar solicitação');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Solicitar Certidão</CardTitle>
            <CardDescription>
              Emissão de certidões fiscais por contadores especializados
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Price Preview Component */}
        <ServicePricePreview serviceType="certificate" />

        {/* Certificate Type Selection */}
        <div className="space-y-2">
          <Label>Tipo de Certidão *</Label>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de certidão" />
            </SelectTrigger>
            <SelectContent>
              {CERTIFICATE_TYPES.map((cert) => (
                <SelectItem key={cert.id} value={cert.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{cert.name}</span>
                    <span className="text-xs text-muted-foreground">{cert.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedCertificate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Prazo estimado: {selectedCertificate.delivery}</span>
            </div>
          )}
        </div>

        {/* Company Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>CNPJ *</Label>
            <Input
              value={cnpj}
              onChange={handleCNPJChange}
              placeholder="00.000.000/0001-00"
              maxLength={18}
            />
          </div>
          <div className="space-y-2">
            <Label>Razão Social *</Label>
            <Input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Nome da empresa"
            />
          </div>
        </div>

        {/* Observations */}
        <div className="space-y-2">
          <Label>Observações (opcional)</Label>
          <Textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Informações adicionais para o contador..."
            className="min-h-[80px]"
          />
        </div>

        {/* Security Info */}
        <div className="p-4 bg-muted/50 rounded-lg border border-border">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Pagamento Seguro</p>
              <p className="text-sm text-muted-foreground">
                Processado via Stripe. Seus dados financeiros são protegidos com criptografia de ponta a ponta.
              </p>
            </div>
          </div>
        </div>

        {/* Process Steps */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Como funciona:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                1
              </div>
              <span className="text-sm">Preencha os dados</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                2
              </div>
              <span className="text-sm">Realize o pagamento</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                3
              </div>
              <span className="text-sm">Receba a certidão</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button 
          className="w-full" 
          size="lg"
          onClick={handleSubmit}
          disabled={isLoading || !selectedType || !cnpj || !companyName}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Ir para Pagamento
              <ExternalLink className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CertificateRequestForm;
