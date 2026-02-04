import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Crown, CreditCard, Calendar, Users, Plus, Mail, Trash2,
  Loader2, ExternalLink, CheckCircle, Sparkles, User, Phone,
  Save, Edit, Shield, Check
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { STRIPE_PLANS, formatPrice, PlanType } from '@/lib/stripe';
import { InPanelUpgradeModal } from '@/components/subscription/InPanelUpgradeModal';
import { SubscriptionHistoryCard } from '@/components/subscription/SubscriptionHistoryCard';

interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'pending' | 'active';
  addedAt: Date;
}

export const UnifiedSettingsPage: React.FC = () => {
  const { user, profile, subscription, session } = useAuth();
  
  // Profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
  });

  // Subscription state
  const [isLoading, setIsLoading] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('control');

  // Team state
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'admin' | 'editor' | 'viewer'>('viewer');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  const currentPlan = subscription.plan;
  const isSubscribed = subscription.subscribed;
  const planDetails = currentPlan ? STRIPE_PLANS[currentPlan] : null;

  // --- Profile ---
  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSavingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('Perfil atualizado!');
      setIsEditingProfile(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // --- Subscription ---
  const handleManageSubscription = async () => {
    if (!session) {
      toast.error('Você precisa estar logado');
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (error: any) {
      toast.error('Erro ao abrir portal de assinatura');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = (plan: PlanType) => {
    setSelectedPlan(plan);
    setUpgradeModalOpen(true);
  };

  // --- Team ---
  const handleAddTeamMember = async () => {
    if (!newMemberEmail.trim() || !newMemberEmail.includes('@')) {
      toast.error('Informe um e-mail válido');
      return;
    }
    setIsAddingMember(true);
    // Simulate invite (replace with real API)
    setTimeout(() => {
      const newMember: TeamMember = {
        id: `temp-${Date.now()}`,
        email: newMemberEmail,
        name: newMemberEmail.split('@')[0],
        role: newMemberRole,
        status: 'pending',
        addedAt: new Date(),
      };
      setTeamMembers(prev => [...prev, newMember]);
      setNewMemberEmail('');
      setNewMemberRole('viewer');
      setIsAddingMember(false);
      setTeamDialogOpen(false);
      toast.success(`Convite enviado para ${newMemberEmail}`);
    }, 1000);
  };

  const handleRemoveMember = (memberId: string) => {
    setTeamMembers(prev => prev.filter(m => m.id !== memberId));
    toast.success('Membro removido');
  };

  const getRoleBadge = (role: TeamMember['role']) => {
    const config = {
      admin: { label: 'Admin', className: 'bg-primary text-primary-foreground' },
      editor: { label: 'Editor', className: 'bg-blue-500/20 text-blue-600' },
      viewer: { label: 'Visualizador', className: 'bg-muted text-muted-foreground' },
    };
    const { label, className } = config[role];
    return <Badge className={className}>{label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Configurações</h2>
        <p className="text-muted-foreground">Gerencie seu perfil, assinatura e equipe</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="subscription">Assinatura</TabsTrigger>
          <TabsTrigger value="team">Equipe</TabsTrigger>
        </TabsList>

        {/* ========== PROFILE TAB ========== */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Meu Perfil</CardTitle>
                    <CardDescription>Suas informações pessoais</CardDescription>
                  </div>
                </div>
                <Button
                  variant={isEditingProfile ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => isEditingProfile ? handleSaveProfile() : setIsEditingProfile(true)}
                  disabled={isSavingProfile}
                >
                  {isSavingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : isEditingProfile ? (
                    <><Save className="h-4 w-4 mr-2" />Salvar</>
                  ) : (
                    <><Edit className="h-4 w-4 mr-2" />Editar</>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-white">
                    {formData.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{formData.full_name || 'Usuário'}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" />Nome Completo</Label>
                  {isEditingProfile ? (
                    <Input
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="Seu nome completo"
                    />
                  ) : (
                    <p className="text-foreground bg-muted/50 px-3 py-2 rounded-md">{formData.full_name || 'Não informado'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" />E-mail</Label>
                  <div className="flex items-center gap-2">
                    <p className="text-foreground bg-muted/50 px-3 py-2 rounded-md flex-1">{user?.email}</p>
                    <Badge variant="outline" className="border-emerald-500/50 text-emerald-600"><Check className="h-3 w-3 mr-1" />Verificado</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">O e-mail não pode ser alterado</p>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" />Telefone</Label>
                  {isEditingProfile ? (
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(11) 99999-9999"
                    />
                  ) : (
                    <p className="text-foreground bg-muted/50 px-3 py-2 rounded-md">{formData.phone || 'Não informado'}</p>
                  )}
                </div>
              </div>

              {isEditingProfile && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => { setIsEditingProfile(false); setFormData({ full_name: profile?.full_name || '', phone: profile?.phone || '' }); }}>
                    Cancelar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <Shield className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Segurança</CardTitle>
                  <CardDescription>Configurações de segurança da conta</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <p className="font-medium text-foreground">Autenticação</p>
                  <p className="text-sm text-muted-foreground">Login via e-mail e senha</p>
                </div>
                <Badge variant="outline" className="border-emerald-500/50 text-emerald-600"><Check className="h-3 w-3 mr-1" />Ativo</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== SUBSCRIPTION TAB ========== */}
        <TabsContent value="subscription" className="space-y-4">
          {/* Current Plan */}
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary/20">
                    <Crown className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {planDetails?.name || 'Sem Plano'}
                      {isSubscribed && (
                        <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30">
                          <CheckCircle className="h-3 w-3 mr-1" />Ativo
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {isSubscribed 
                        ? `Renovação em ${new Date(subscription.subscriptionEnd || '').toLocaleDateString('pt-BR')}`
                        : 'Você ainda não possui uma assinatura ativa'
                      }
                    </CardDescription>
                  </div>
                </div>
                {isSubscribed && planDetails && (
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{formatPrice(planDetails.price)}</p>
                    <p className="text-sm text-muted-foreground">/mês</p>
                  </div>
                )}
              </div>
            </CardHeader>
            {planDetails && (
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {planDetails.features.slice(0, 4).map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {isSubscribed ? (
              <>
                <Button onClick={handleManageSubscription} disabled={isLoading} variant="outline">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CreditCard className="h-4 w-4 mr-2" />}
                  Gerenciar Pagamento
                </Button>
                <Button onClick={() => handleUpgrade('control')} variant="default">
                  <Sparkles className="h-4 w-4 mr-2" />Fazer Upgrade
                </Button>
              </>
            ) : (
              <Button onClick={() => handleUpgrade('control')} className="bg-primary">
                <Crown className="h-4 w-4 mr-2" />Assinar Agora
              </Button>
            )}
          </div>

          {/* Plan Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Comparar Planos</CardTitle>
              <CardDescription>Escolha o melhor plano para você</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['clarity', 'control', 'performance'] as PlanType[]).map((plan) => {
                  const planInfo = STRIPE_PLANS[plan];
                  const isCurrentPlan = currentPlan === plan;
                  return (
                    <Card key={plan} className={`relative ${isCurrentPlan ? 'border-primary border-2' : 'border-border'}`}>
                      {isCurrentPlan && <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary">Seu Plano</Badge>}
                      <CardContent className="pt-6">
                        <h3 className="font-semibold text-lg mb-1">{planInfo.name}</h3>
                        <p className="text-2xl font-bold text-primary mb-2">{formatPrice(planInfo.price)}<span className="text-sm font-normal text-muted-foreground">/mês</span></p>
                        <ul className="space-y-2 mb-4">
                          {planInfo.features.slice(0, 3).map((feature, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-3 w-3 text-primary" />
                              <span className="text-muted-foreground">{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <Button variant={isCurrentPlan ? 'secondary' : 'default'} size="sm" className="w-full" onClick={() => handleUpgrade(plan)} disabled={isCurrentPlan}>
                          {isCurrentPlan ? 'Plano Atual' : 'Selecionar'}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <SubscriptionHistoryCard />
        </TabsContent>

        {/* ========== TEAM TAB ========== */}
        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-info/10">
                    <Users className="h-5 w-5 text-info" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Equipe</CardTitle>
                    <CardDescription>Adicione membros e defina permissões</CardDescription>
                  </div>
                </div>
                <Dialog open={teamDialogOpen} onOpenChange={setTeamDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-2" />Adicionar</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Membro</DialogTitle>
                      <DialogDescription>Envie um convite para um membro da sua equipe</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input id="email" type="email" placeholder="membro@empresa.com" value={newMemberEmail} onChange={(e) => setNewMemberEmail(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Permissão</Label>
                        <Select value={newMemberRole} onValueChange={(v) => setNewMemberRole(v as any)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin (acesso total)</SelectItem>
                            <SelectItem value="editor">Editor (pode editar)</SelectItem>
                            <SelectItem value="viewer">Visualizador (somente leitura)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleAddTeamMember} className="w-full" disabled={isAddingMember}>
                        {isAddingMember ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
                        Enviar Convite
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current User as Owner */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{formData.full_name?.[0]?.toUpperCase() || 'U'}</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{formData.full_name || 'Você'}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <Badge className="bg-primary text-primary-foreground"><Crown className="h-3 w-3 mr-1" />Proprietário</Badge>
              </div>

              <Separator />

              {/* Team Members */}
              {teamMembers.length > 0 ? (
                <div className="space-y-2">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/20 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-sm font-bold text-muted-foreground">{member.name[0]?.toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {member.status === 'pending' && <Badge variant="outline" className="border-amber-500/50 text-amber-600">Pendente</Badge>}
                        {getRoleBadge(member.role)}
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveMember(member.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhum membro adicionado ainda</p>
                  <p className="text-sm">Convide pessoas para colaborar com você</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upgrade Modal */}
      <InPanelUpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        upgradeType="subscription"
        planType={selectedPlan}
        onSuccess={() => setUpgradeModalOpen(false)}
      />
    </div>
  );
};

export default UnifiedSettingsPage;
