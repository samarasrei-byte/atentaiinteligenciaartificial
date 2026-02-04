import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Crown, 
  CreditCard, 
  Calendar, 
  Settings, 
  Users, 
  Plus, 
  Mail, 
  Trash2,
  Loader2,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { STRIPE_PLANS, formatPrice, PlanType } from '@/lib/stripe';
import { InPanelUpgradeModal } from './InPanelUpgradeModal';
import { SubscriptionHistoryCard } from './SubscriptionHistoryCard';

interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'member';
  addedAt: string;
}

export const SubscriptionManagement: React.FC = () => {
  const { user, subscription, session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('premium');
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);
  
  // Mock team members for now (would come from DB in production)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  const currentPlan = subscription.plan;
  const isSubscribed = subscription.subscribed;
  
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

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error('Erro ao abrir portal de assinatura');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = (plan: PlanType) => {
    setSelectedPlan(plan);
    setUpgradeModalOpen(true);
  };

  const handleAddTeamMember = async () => {
    if (!newMemberEmail.trim()) {
      toast.error('Digite um e-mail válido');
      return;
    }

    setIsAddingMember(true);
    
    // Simulate adding team member
    setTimeout(() => {
      const newMember: TeamMember = {
        id: Date.now().toString(),
        email: newMemberEmail,
        name: newMemberEmail.split('@')[0],
        role: 'member',
        addedAt: new Date().toISOString(),
      };
      
      setTeamMembers([...teamMembers, newMember]);
      setNewMemberEmail('');
      setIsAddingMember(false);
      setTeamDialogOpen(false);
      toast.success('Convite enviado com sucesso!');
    }, 1000);
  };

  const handleRemoveMember = (memberId: string) => {
    setTeamMembers(teamMembers.filter(m => m.id !== memberId));
    toast.success('Membro removido');
  };

  const getPlanDetails = () => {
    if (!currentPlan) return null;
    return STRIPE_PLANS[currentPlan];
  };

  const planDetails = getPlanDetails();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Minha Assinatura</h2>
        <p className="text-muted-foreground">Gerencie seu plano, pagamentos e equipe</p>
      </div>

      {/* Current Plan Card */}
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
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Ativo
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
            {isSubscribed && (
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  {planDetails ? formatPrice(planDetails.price) : 'R$ 0'}
                </p>
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

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {isSubscribed ? (
          <>
            <Button onClick={handleManageSubscription} disabled={isLoading} variant="outline">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CreditCard className="h-4 w-4 mr-2" />}
              Gerenciar Pagamento
            </Button>
            <Button onClick={() => handleUpgrade('premium')} variant="default">
              <Sparkles className="h-4 w-4 mr-2" />
              Fazer Upgrade
            </Button>
          </>
        ) : (
          <Button onClick={() => handleUpgrade('premium')} className="bg-primary">
            <Crown className="h-4 w-4 mr-2" />
            Assinar Agora
          </Button>
        )}
      </div>

      <Separator />

      {/* Team Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">Equipe</CardTitle>
                <CardDescription>Adicione membros da sua equipe</CardDescription>
              </div>
            </div>
            <Dialog open={teamDialogOpen} onOpenChange={setTeamDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Membro</DialogTitle>
                  <DialogDescription>
                    Envie um convite para um membro da sua equipe
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="membro@empresa.com"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={handleAddTeamMember} 
                    className="w-full"
                    disabled={isAddingMember}
                  >
                    {isAddingMember ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Mail className="h-4 w-4 mr-2" />
                    )}
                    Enviar Convite
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {teamMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Nenhum membro adicionado ainda</p>
              <p className="text-sm">Adicione membros para compartilhar o acesso</p>
            </div>
          ) : (
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div 
                  key={member.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {member.name[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{member.role === 'admin' ? 'Admin' : 'Membro'}</Badge>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Comparar Planos</CardTitle>
          <CardDescription>Escolha o melhor plano para você</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['simulator', 'autonomo', 'premium', 'contador'] as PlanType[]).map((plan) => {
              const planInfo = STRIPE_PLANS[plan];
              const isCurrentPlan = currentPlan === plan;
              
              return (
                <Card 
                  key={plan}
                  className={`relative ${isCurrentPlan ? 'border-primary border-2' : 'border-border'}`}
                >
                  {isCurrentPlan && (
                    <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary">
                      Seu Plano
                    </Badge>
                  )}
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-lg mb-1">{planInfo.name}</h3>
                    <p className="text-2xl font-bold text-primary mb-2">
                      {formatPrice(planInfo.price)}
                      <span className="text-sm font-normal text-muted-foreground">/mês</span>
                    </p>
                    <ul className="space-y-2 mb-4">
                      {planInfo.features.slice(0, 3).map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-3 w-3 text-primary" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      variant={isCurrentPlan ? 'secondary' : 'default'}
                      size="sm"
                      className="w-full"
                      onClick={() => handleUpgrade(plan)}
                      disabled={isCurrentPlan}
                    >
                      {isCurrentPlan ? 'Plano Atual' : 'Selecionar'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Subscription History */}
      <SubscriptionHistoryCard />

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

export default SubscriptionManagement;
