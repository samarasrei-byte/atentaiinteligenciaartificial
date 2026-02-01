import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, Building2, FileText, AlertTriangle, CheckCircle2, 
  XCircle, Clock, Eye, DollarSign, Loader2, Send, Ban, 
  TrendingUp, FileCheck
} from "lucide-react";
import { MaskedInput } from "@/components/ui/masked-input";
import { ServiceDocuments } from "./documents/ServiceDocuments";

type FiscalRequest = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  cpf: string | null;
  cnpj: string;
  company_name: string;
  tax_regime: string;
  cnae_code: string | null;
  annual_revenue_cents: number;
  guide_type: string | null;
  guide_value_cents: number;
  guide_document_url: string | null;
  analysis_period_start: string | null;
  analysis_period_end: string | null;
  notes: string | null;
  status: string;
  risk_detected: boolean;
  risk_description: string | null;
  identified_value_cents: number;
  service_fee_cents: number;
  report_url: string | null;
  new_guide_url: string | null;
  payment_status: string;
  created_at: string;
  partner_id: string | null;
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<any> }> = {
  pending: { label: "Pendente", color: "bg-yellow-500", icon: Clock },
  analyzing: { label: "Em Análise", color: "bg-blue-500", icon: Eye },
  risk_detected: { label: "Risco Detectado", color: "bg-red-500", icon: AlertTriangle },
  approved: { label: "Aprovado", color: "bg-green-500", icon: CheckCircle2 },
  report_ready: { label: "Relatório Pronto", color: "bg-purple-500", icon: FileCheck },
  payment_pending: { label: "Aguardando Pagamento", color: "bg-orange-500", icon: DollarSign },
  completed: { label: "Concluído", color: "bg-emerald-500", icon: TrendingUp },
  cancelled: { label: "Cancelado", color: "bg-gray-500", icon: XCircle },
};

const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
};

const formatCNPJ = (cnpj: string) => {
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
};

export function FiscalAnalysisManagement() {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<FiscalRequest | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [identifiedValue, setIdentifiedValue] = useState("");
  const [riskDescription, setRiskDescription] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const { data: requests, isLoading } = useQuery({
    queryKey: ["fiscal-analysis-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fiscal_analysis_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as FiscalRequest[];
    },
  });

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel("fiscal-requests-admin")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "fiscal_analysis_requests" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["fiscal-analysis-requests"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<FiscalRequest>;
    }) => {
      const { error } = await supabase
        .from("fiscal_analysis_requests")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fiscal-analysis-requests"] });
      toast.success("Solicitação atualizada com sucesso!");
      setShowUpdateDialog(false);
      setSelectedRequest(null);
    },
    onError: (error) => {
      toast.error("Erro ao atualizar: " + error.message);
    },
  });

  const handleUpdateStatus = () => {
    if (!selectedRequest || !newStatus) return;

    const updates: Partial<FiscalRequest> = {
      status: newStatus,
    };

    if (newStatus === "risk_detected") {
      updates.risk_detected = true;
      updates.risk_description = riskDescription;
    }

    if (newStatus === "approved" || newStatus === "report_ready") {
      const identifiedCents = Math.round(parseFloat(identifiedValue.replace(/[^\d,]/g, "").replace(",", ".")) * 100) || 0;
      updates.identified_value_cents = identifiedCents;
      updates.service_fee_cents = Math.round(identifiedCents * 0.5); // 50% success fee
    }

    if (newStatus === "completed") {
      updates.payment_status = "paid";
    }

    updateMutation.mutate({ id: selectedRequest.id, updates });
  };

  const openUpdateDialog = (request: FiscalRequest) => {
    setSelectedRequest(request);
    setNewStatus(request.status);
    setIdentifiedValue(request.identified_value_cents ? (request.identified_value_cents / 100).toFixed(2).replace(".", ",") : "");
    setRiskDescription(request.risk_description || "");
    setShowUpdateDialog(true);
  };

  const filteredRequests = requests?.filter((r) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return r.status === "pending";
    if (activeTab === "analyzing") return r.status === "analyzing";
    if (activeTab === "risk") return r.risk_detected;
    if (activeTab === "approved") return ["approved", "report_ready", "payment_pending"].includes(r.status);
    if (activeTab === "completed") return r.status === "completed";
    return true;
  });

  const stats = {
    total: requests?.length || 0,
    pending: requests?.filter((r) => r.status === "pending").length || 0,
    analyzing: requests?.filter((r) => r.status === "analyzing").length || 0,
    riskDetected: requests?.filter((r) => r.risk_detected).length || 0,
    completed: requests?.filter((r) => r.status === "completed").length || 0,
    totalFees: requests?.reduce((acc, r) => acc + (r.payment_status === "paid" ? r.service_fee_cents : 0), 0) || 0,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Tabs defaultValue="requests" className="space-y-6">
      <TabsList className="mb-4">
        <TabsTrigger value="requests">Solicitações</TabsTrigger>
        <TabsTrigger value="documents">Documentos</TabsTrigger>
      </TabsList>

      <TabsContent value="documents">
        <ServiceDocuments 
          serviceType="fiscal" 
          serviceName="Análise Fiscal" 
          serviceColor="violet" 
        />
      </TabsContent>

      <TabsContent value="requests" className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total</CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pendentes</CardDescription>
            <CardTitle className="text-2xl text-yellow-500">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Em Análise</CardDescription>
            <CardTitle className="text-2xl text-blue-500">{stats.analyzing}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Risco Detectado</CardDescription>
            <CardTitle className="text-2xl text-red-500">{stats.riskDetected}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Concluídos</CardDescription>
            <CardTitle className="text-2xl text-green-500">{stats.completed}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardDescription>Receita Total</CardDescription>
            <CardTitle className="text-xl text-primary">{formatCurrency(stats.totalFees)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Solicitações de Análise Fiscal
              </CardTitle>
              <CardDescription>Gerencie as solicitações do Módulo Fiscal Avançado</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
            <TabsList>
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="pending">Pendentes</TabsTrigger>
              <TabsTrigger value="analyzing">Em Análise</TabsTrigger>
              <TabsTrigger value="risk">Com Risco</TabsTrigger>
              <TabsTrigger value="approved">Aprovadas</TabsTrigger>
              <TabsTrigger value="completed">Concluídas</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Regime</TableHead>
                  <TableHead>Valor Guia</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valor Identificado</TableHead>
                  <TableHead>Fee (50%)</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests?.map((request) => {
                  const status = statusConfig[request.status] || statusConfig.pending;
                  const StatusIcon = status.icon;
                  
                  return (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{request.company_name}</p>
                          <p className="text-xs text-muted-foreground">{request.full_name}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {formatCNPJ(request.cnpj)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {request.tax_regime.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(request.guide_value_cents)}</TableCell>
                      <TableCell>
                        <Badge className={`${status.color} text-white`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {request.identified_value_cents > 0 
                          ? formatCurrency(request.identified_value_cents) 
                          : "-"}
                      </TableCell>
                      <TableCell className="text-primary font-medium">
                        {request.service_fee_cents > 0 
                          ? formatCurrency(request.service_fee_cents) 
                          : "-"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(request.created_at).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowDetailsDialog(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openUpdateDialog(request)}
                          >
                            Atualizar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Detalhes da Solicitação
            </DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Empresa</Label>
                  <p className="font-medium">{selectedRequest.company_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">CNPJ</Label>
                  <p className="font-mono">{formatCNPJ(selectedRequest.cnpj)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Responsável</Label>
                  <p>{selectedRequest.full_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p>{selectedRequest.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Regime</Label>
                  <p className="capitalize">{selectedRequest.tax_regime.replace("_", " ")}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">CNAE</Label>
                  <p>{selectedRequest.cnae_code || "Não informado"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Faturamento Anual</Label>
                  <p>{formatCurrency(selectedRequest.annual_revenue_cents)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tipo de Guia</Label>
                  <p className="uppercase">{selectedRequest.guide_type || "Não informado"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Valor da Guia</Label>
                  <p className="font-medium">{formatCurrency(selectedRequest.guide_value_cents)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Período</Label>
                  <p>
                    {selectedRequest.analysis_period_start 
                      ? `${new Date(selectedRequest.analysis_period_start).toLocaleDateString("pt-BR")} - ${new Date(selectedRequest.analysis_period_end || "").toLocaleDateString("pt-BR")}`
                      : "Não informado"}
                  </p>
                </div>
              </div>

              {selectedRequest.notes && (
                <div>
                  <Label className="text-muted-foreground">Observações</Label>
                  <p className="mt-1 p-3 bg-muted rounded-lg text-sm">{selectedRequest.notes}</p>
                </div>
              )}

              {selectedRequest.risk_detected && (
                <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                  <div className="flex items-center gap-2 text-destructive font-medium mb-2">
                    <AlertTriangle className="h-5 w-5" />
                    Risco Detectado
                  </div>
                  <p className="text-sm">{selectedRequest.risk_description}</p>
                </div>
              )}

              {selectedRequest.identified_value_cents > 0 && (
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 text-primary font-medium mb-2">
                    <TrendingUp className="h-5 w-5" />
                    Resultado
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Valor Identificado:</span>
                      <p className="font-bold text-lg">{formatCurrency(selectedRequest.identified_value_cents)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Success Fee (50%):</span>
                      <p className="font-bold text-lg text-primary">{formatCurrency(selectedRequest.service_fee_cents)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atualizar Solicitação</DialogTitle>
            <DialogDescription>
              Atualize o status e os valores da análise fiscal.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="analyzing">Em Análise</SelectItem>
                  <SelectItem value="risk_detected">Risco Detectado</SelectItem>
                  <SelectItem value="approved">Aprovado</SelectItem>
                  <SelectItem value="report_ready">Relatório Pronto</SelectItem>
                  <SelectItem value="payment_pending">Aguardando Pagamento</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newStatus === "risk_detected" && (
              <div>
                <Label>Descrição do Risco</Label>
                <Textarea
                  value={riskDescription}
                  onChange={(e) => setRiskDescription(e.target.value)}
                  placeholder="Descreva o risco identificado..."
                />
              </div>
            )}

            {["approved", "report_ready", "payment_pending", "completed"].includes(newStatus) && (
              <div>
                <Label>Valor Identificado</Label>
                <Input
                  value={identifiedValue}
                  onChange={(e) => setIdentifiedValue(e.target.value)}
                  placeholder="R$ 0,00"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Success Fee será calculado automaticamente (50%)
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpdateDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateStatus} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </TabsContent>
    </Tabs>
  );
}
