import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { 
  LayoutDashboard, 
  FileText, 
  History, 
  Shield,
  RefreshCw,
  Download,
  ShieldCheck
} from 'lucide-react';
import { AuditOverviewCards } from './AuditOverviewCards';
import { AuditServiceTable, AuditServiceRecord } from './AuditServiceTable';
import { AuditActionHistory } from './AuditActionHistory';
import { AuditDocumentGovernance } from './AuditDocumentGovernance';

interface ServiceStats {
  limpaNome: { total: number; pending: number; completed: number; revenue: number };
  analiseFiscal: { total: number; pending: number; completed: number; revenue: number };
  bi: { total: number; pending: number; completed: number; revenue: number };
  ir: { total: number; pending: number; completed: number; revenue: number };
  certificates: { total: number; pending: number; completed: number; revenue: number };
  companyOpening: { total: number; pending: number; completed: number; revenue: number };
}

export const AdminAuditPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ServiceStats>({
    limpaNome: { total: 0, pending: 0, completed: 0, revenue: 0 },
    analiseFiscal: { total: 0, pending: 0, completed: 0, revenue: 0 },
    bi: { total: 0, pending: 0, completed: 0, revenue: 0 },
    ir: { total: 0, pending: 0, completed: 0, revenue: 0 },
    certificates: { total: 0, pending: 0, completed: 0, revenue: 0 },
    companyOpening: { total: 0, pending: 0, completed: 0, revenue: 0 },
  });
  const [totalPayments, setTotalPayments] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [serviceRecords, setServiceRecords] = useState<AuditServiceRecord[]>([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch all service requests
      const [creditRepair, fiscal, ir, certificates, companyOpening, payments] = await Promise.all([
        supabase.from('credit_repair_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('fiscal_analysis_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('ir_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('certificate_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('company_opening_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('payments').select('amount_cents, status').eq('status', 'completed'),
      ]);

      // Calculate stats for each service
      const limpaNomeData = creditRepair.data || [];
      const fiscalData = fiscal.data || [];
      const irData = ir.data || [];
      const certData = certificates.data || [];
      const companyData = companyOpening.data || [];

      setStats({
        limpaNome: {
          total: limpaNomeData.length,
          pending: limpaNomeData.filter(r => r.status === 'pending').length,
          completed: limpaNomeData.filter(r => r.status === 'completed').length,
          revenue: limpaNomeData.filter(r => r.payment_status === 'paid').reduce((sum, r) => sum + (r.final_price_cents || 0), 0),
        },
        analiseFiscal: {
          total: fiscalData.length,
          pending: fiscalData.filter(r => r.status === 'pending').length,
          completed: fiscalData.filter(r => r.status === 'completed').length,
          revenue: fiscalData.filter(r => r.payment_status === 'paid').reduce((sum, r) => sum + (r.service_fee_cents || 0), 0),
        },
        bi: { total: 0, pending: 0, completed: 0, revenue: 0 }, // BI is tracked differently
        ir: {
          total: irData.length,
          pending: irData.filter(r => r.status === 'pending').length,
          completed: irData.filter(r => r.status === 'completed').length,
          revenue: irData.filter(r => r.payment_status === 'paid').reduce((sum, r) => sum + (r.base_price_cents || 0), 0),
        },
        certificates: {
          total: certData.length,
          pending: certData.filter(r => r.status === 'pending').length,
          completed: certData.filter(r => r.status === 'completed').length,
          revenue: certData.filter(r => r.payment_status === 'paid').reduce((sum, r) => sum + (r.amount_cents || 0), 0),
        },
        companyOpening: {
          total: companyData.length,
          pending: companyData.filter(r => r.status === 'pending').length,
          completed: companyData.filter(r => r.status === 'completed').length,
          revenue: companyData.filter(r => r.payment_status === 'paid').reduce((sum, r) => sum + (r.service_price_cents || 0), 0),
        },
      });

      // Calculate totals
      const paymentsData = payments.data || [];
      setTotalPayments(paymentsData.length);
      setTotalRevenue(paymentsData.reduce((sum, p) => sum + p.amount_cents, 0));

      // Build service records for table
      const records: AuditServiceRecord[] = [
        ...limpaNomeData.map(r => ({
          id: r.id,
          service_label: '[LIMPA_NOME]' as const,
          service_type: 'credit_repair',
          client_name: r.full_name || 'N/A',
          client_email: r.email || 'N/A',
          status: r.status,
          payment_status: r.payment_status,
          amount_cents: r.final_price_cents || 0,
          created_at: r.created_at,
          completed_at: r.completed_at,
          responsible: 'Guilherme Mesquita',
        })),
        ...fiscalData.map(r => ({
          id: r.id,
          service_label: '[ANALISE_FISCAL]' as const,
          service_type: 'fiscal_analysis',
          client_name: r.full_name || 'N/A',
          client_email: r.email || 'N/A',
          status: r.status,
          payment_status: r.payment_status,
          amount_cents: r.service_fee_cents || 0,
          created_at: r.created_at,
          completed_at: null,
          responsible: 'Guilherme Barros',
        })),
        ...irData.map(r => ({
          id: r.id,
          service_label: '[IR]' as const,
          service_type: 'ir',
          client_name: r.full_name || 'N/A',
          client_email: r.email || 'N/A',
          status: r.status,
          payment_status: r.payment_status,
          amount_cents: r.base_price_cents || 0,
          created_at: r.created_at,
          completed_at: null,
          responsible: 'Guilherme Barros',
        })),
        ...certData.map(r => ({
          id: r.id,
          service_label: '[CERTIDAO]' as const,
          service_type: 'certificate',
          client_name: 'Cliente',
          client_email: 'N/A',
          status: r.status,
          payment_status: r.payment_status,
          amount_cents: r.amount_cents || 0,
          created_at: r.created_at,
          completed_at: r.processed_at,
          responsible: 'Guilherme Barros',
        })),
        ...companyData.map(r => ({
          id: r.id,
          service_label: '[ABERTURA]' as const,
          service_type: 'company_opening',
          client_name: r.full_name || 'N/A',
          client_email: r.email || 'N/A',
          status: r.status,
          payment_status: r.payment_status || 'pending',
          amount_cents: r.service_price_cents || 0,
          created_at: r.created_at,
          completed_at: null,
          responsible: 'Guilherme Barros',
        })),
      ];

      // Sort by date
      records.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setServiceRecords(records);

    } catch (error) {
      console.error('Error fetching audit data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Create CSV export
    const headers = ['Etiqueta', 'Cliente', 'Email', 'Status', 'Pagamento', 'Valor', 'Data', 'Responsável'];
    const rows = serviceRecords.map(r => [
      r.service_label,
      r.client_name,
      r.client_email,
      r.status,
      r.payment_status,
      (r.amount_cents / 100).toFixed(2),
      r.created_at,
      r.responsible
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditoria-servicos-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-emerald-500/10 rounded-2xl p-6 border border-indigo-500/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              Página de Auditoria
            </h1>
            <p className="text-muted-foreground mt-1">
              Controle total • Rastreabilidade completa • Governança de documentos
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 py-1.5 px-3">
              <Shield className="h-4 w-4 mr-2" />
              Super Admin
            </Badge>
            <Button variant="outline" onClick={fetchAllData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 p-1 h-auto flex-wrap">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="services" className="data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
            <FileText className="h-4 w-4" />
            Serviços Executados
          </TabsTrigger>
          <TabsTrigger value="actions" className="data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
            <History className="h-4 w-4" />
            Histórico de Ações
          </TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
            <Shield className="h-4 w-4" />
            Governança Docs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <AuditOverviewCards 
            stats={stats}
            totalPayments={totalPayments}
            totalRevenue={totalRevenue}
          />
        </TabsContent>

        <TabsContent value="services">
          <AuditServiceTable 
            records={serviceRecords}
            loading={loading}
            onExport={handleExport}
          />
        </TabsContent>

        <TabsContent value="actions">
          <AuditActionHistory />
        </TabsContent>

        <TabsContent value="documents">
          <AuditDocumentGovernance />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAuditPage;
