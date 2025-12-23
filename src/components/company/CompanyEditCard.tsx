import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Building2,
  Edit,
  Save,
  X,
  Loader2,
  MapPin,
  TrendingUp,
  FileText,
  Users,
  Calendar,
} from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type CompanyType = Database['public']['Enums']['company_type'];
type TaxRegime = Database['public']['Enums']['tax_regime'];
type CompanySector = Database['public']['Enums']['company_sector'];

interface Company {
  id: string;
  company_name: string;
  trade_name: string | null;
  company_type: string;
  tax_regime: string;
  sector: string;
  monthly_revenue_cents: number;
  annual_revenue_cents: number;
  employee_count: number;
  state: string | null;
  city: string | null;
  cnpj: string | null;
  main_activity: string | null;
}

const COMPANY_TYPES = [
  { value: 'mei', label: 'MEI' },
  { value: 'me', label: 'ME' },
  { value: 'epp', label: 'EPP' },
  { value: 'ltda', label: 'LTDA' },
  { value: 'eireli', label: 'EIRELI' },
  { value: 'sa_fechada', label: 'S.A. Fechada' },
  { value: 'sa_aberta', label: 'S.A. Aberta' },
  { value: 'cooperativa', label: 'Cooperativa' },
];

const TAX_REGIMES = [
  { value: 'simples_nacional', label: 'Simples Nacional' },
  { value: 'lucro_presumido', label: 'Lucro Presumido' },
  { value: 'lucro_real', label: 'Lucro Real' },
  { value: 'lucro_arbitrado', label: 'Lucro Arbitrado' },
];

const SECTORS = [
  { value: 'comercio', label: 'Comércio' },
  { value: 'servicos', label: 'Serviços' },
  { value: 'industria', label: 'Indústria' },
  { value: 'agronegocio', label: 'Agronegócio' },
  { value: 'tecnologia', label: 'Tecnologia' },
  { value: 'saude', label: 'Saúde' },
  { value: 'educacao', label: 'Educação' },
  { value: 'construcao', label: 'Construção' },
  { value: 'transporte', label: 'Transporte' },
  { value: 'alimentacao', label: 'Alimentação' },
  { value: 'outro', label: 'Outro' },
];

const STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

interface CompanyEditCardProps {
  company: Company | null;
  onUpdate: () => void;
}

export const CompanyEditCard: React.FC<CompanyEditCardProps> = ({ company, onUpdate }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    trade_name: '',
    company_type: 'mei',
    tax_regime: 'simples_nacional',
    sector: 'servicos',
    monthly_revenue: '',
    employee_count: '0',
    state: '',
    city: '',
    cnpj: '',
    main_activity: '',
  });

  useEffect(() => {
    if (company) {
      setFormData({
        company_name: company.company_name || '',
        trade_name: company.trade_name || '',
        company_type: company.company_type,
        tax_regime: company.tax_regime,
        sector: company.sector,
        monthly_revenue: (company.monthly_revenue_cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        employee_count: String(company.employee_count || 0),
        state: company.state || '',
        city: company.city || '',
        cnpj: company.cnpj || '',
        main_activity: company.main_activity || '',
      });
    }
  }, [company]);

  const parseCurrency = (value: string): number => {
    const cleaned = value.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  };

  const handleRevenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const numValue = parseInt(value) / 100;
    if (value) {
      setFormData({ ...formData, monthly_revenue: numValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) });
    } else {
      setFormData({ ...formData, monthly_revenue: '' });
    }
  };

  const handleSave = async () => {
    if (!user || !company) return;
    
    setIsSaving(true);
    try {
      const monthlyRevenue = parseCurrency(formData.monthly_revenue);
      
      const { error } = await supabase
        .from('companies')
        .update({
          company_name: formData.company_name,
          trade_name: formData.trade_name || null,
          company_type: formData.company_type as CompanyType,
          tax_regime: formData.tax_regime as TaxRegime,
          sector: formData.sector as CompanySector,
          monthly_revenue_cents: Math.round(monthlyRevenue * 100),
          annual_revenue_cents: Math.round(monthlyRevenue * 12 * 100),
          employee_count: parseInt(formData.employee_count) || 0,
          state: formData.state || null,
          city: formData.city || null,
          cnpj: formData.cnpj || null,
          main_activity: formData.main_activity || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', company.id);

      if (error) throw error;

      toast({
        title: 'Dados atualizados!',
        description: 'As informações da empresa foram salvas.',
      });
      setIsEditing(false);
      onUpdate();
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
  };

  const getCompanyTypeLabel = (type: string) => COMPANY_TYPES.find(t => t.value === type)?.label || type;
  const getTaxRegimeLabel = (regime: string) => TAX_REGIMES.find(r => r.value === regime)?.label || regime;
  const getSectorLabel = (sector: string) => SECTORS.find(s => s.value === sector)?.label || sector;

  if (!company) return null;

  return (
    <Card className="bg-card border-border shadow-soft overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
      
      <CardHeader className="relative pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{company.company_name}</CardTitle>
              {company.trade_name && (
                <CardDescription>{company.trade_name}</CardDescription>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1" />
                      Salvar
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative space-y-4">
        {isEditing ? (
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Razão Social</Label>
                <Input
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Nome Fantasia</Label>
                <Input
                  value={formData.trade_name}
                  onChange={(e) => setFormData({ ...formData, trade_name: e.target.value })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Empresa</Label>
                <Select value={formData.company_type} onValueChange={(v) => setFormData({ ...formData, company_type: v as CompanyType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COMPANY_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Regime Tributário</Label>
                <Select value={formData.tax_regime} onValueChange={(v) => setFormData({ ...formData, tax_regime: v as TaxRegime })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TAX_REGIMES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Setor</Label>
                <Select value={formData.sector} onValueChange={(v) => setFormData({ ...formData, sector: v as CompanySector })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SECTORS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Faturamento Mensal</Label>
                <Input
                  value={formData.monthly_revenue}
                  onChange={handleRevenueChange}
                  placeholder="R$ 0,00"
                />
              </div>
              <div className="space-y-2">
                <Label>Funcionários</Label>
                <Input
                  type="number"
                  value={formData.employee_count}
                  onChange={(e) => setFormData({ ...formData, employee_count: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>CNPJ</Label>
                <Input
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  placeholder="00.000.000/0001-00"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={formData.state} onValueChange={(v) => setFormData({ ...formData, state: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Cidade</Label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Atividade Principal</Label>
              <Input
                value={formData.main_activity}
                onChange={(e) => setFormData({ ...formData, main_activity: e.target.value })}
                placeholder="Ex: Desenvolvimento de Software"
              />
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-primary/50 text-primary">
                  {getCompanyTypeLabel(company.company_type)}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="h-4 w-4 text-info" />
                <span className="text-sm">{getTaxRegimeLabel(company.tax_regime)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-sm">{formatCurrency(company.monthly_revenue_cents)}/mês</span>
              </div>
              {company.state && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-accent" />
                  <span className="text-sm">{company.city ? `${company.city}/${company.state}` : company.state}</span>
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Setor: <span className="text-foreground">{getSectorLabel(company.sector)}</span>
                {company.employee_count > 0 && (
                  <> • <Users className="h-3 w-3 inline" /> {company.employee_count} funcionário{company.employee_count > 1 ? 's' : ''}</>
                )}
                {company.cnpj && (
                  <> • CNPJ: {company.cnpj}</>
                )}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CompanyEditCard;
