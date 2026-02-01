import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, Mail, Phone, Save, Loader2, Edit, 
  Users, UserPlus, Trash2, Settings, Shield,
  Check, X, Crown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'pending' | 'active';
  addedAt: Date;
}

export const UserSettings: React.FC = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
  });
  
  // Team Management State
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsSaving(true);
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

      toast({
        title: 'Perfil atualizado!',
        description: 'Suas informações foram salvas com sucesso.',
      });
      setIsEditing(false);
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

  const handleAddTeamMember = async () => {
    if (!newMemberEmail.trim()) {
      toast({
        title: 'E-mail obrigatório',
        description: 'Informe o e-mail do membro.',
        variant: 'destructive',
      });
      return;
    }

    if (!newMemberEmail.includes('@')) {
      toast({
        title: 'E-mail inválido',
        description: 'Informe um e-mail válido.',
        variant: 'destructive',
      });
      return;
    }

    setIsAddingMember(true);
    
    // Simulate adding member (in real implementation, this would call an API)
    setTimeout(() => {
      const newMember: TeamMember = {
        id: `temp-${Date.now()}`,
        email: newMemberEmail,
        name: newMemberEmail.split('@')[0],
        role: 'viewer',
        status: 'pending',
        addedAt: new Date(),
      };
      
      setTeamMembers(prev => [...prev, newMember]);
      setNewMemberEmail('');
      setIsAddingMember(false);
      
      toast({
        title: 'Convite enviado!',
        description: `Um convite foi enviado para ${newMemberEmail}`,
      });
    }, 1000);
  };

  const handleRemoveMember = (memberId: string) => {
    setTeamMembers(prev => prev.filter(m => m.id !== memberId));
    toast({
      title: 'Membro removido',
      description: 'O membro foi removido da equipe.',
    });
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
        <p className="text-muted-foreground">Gerencie seu perfil e sua equipe</p>
      </div>

      {/* Profile Section */}
      <Card className="bg-card border-border shadow-soft">
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
              variant={isEditing ? 'default' : 'outline'}
              size="sm"
              onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isEditing ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 mb-6">
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
              <Label className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Nome Completo
              </Label>
              {isEditing ? (
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Seu nome completo"
                />
              ) : (
                <p className="text-foreground bg-muted/50 px-3 py-2 rounded-md">
                  {formData.full_name || 'Não informado'}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                E-mail
              </Label>
              <div className="flex items-center gap-2">
                <p className="text-foreground bg-muted/50 px-3 py-2 rounded-md flex-1">
                  {user?.email}
                </p>
                <Badge variant="outline" className="border-emerald-500/50 text-emerald-600">
                  <Check className="h-3 w-3 mr-1" />
                  Verificado
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">O e-mail não pode ser alterado</p>
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                Telefone
              </Label>
              {isEditing ? (
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              ) : (
                <p className="text-foreground bg-muted/50 px-3 py-2 rounded-md">
                  {formData.phone || 'Não informado'}
                </p>
              )}
            </div>
          </div>
          
          {isEditing && (
            <div className="flex gap-2 pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    full_name: profile?.full_name || '',
                    phone: profile?.phone || '',
                  });
                }}
              >
                Cancelar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team Management Section */}
      <Card className="bg-card border-border shadow-soft">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-info/10">
              <Users className="h-5 w-5 text-info" />
            </div>
            <div>
              <CardTitle className="text-lg">Equipe</CardTitle>
              <CardDescription>Gerencie os membros da sua equipe</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Member Form */}
          <div className="flex gap-2">
            <Input
              placeholder="E-mail do membro"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              type="email"
              className="flex-1"
            />
            <Button 
              onClick={handleAddTeamMember}
              disabled={isAddingMember}
            >
              {isAddingMember ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Convidar
                </>
              )}
            </Button>
          </div>

          <Separator />

          {/* Current User as Admin */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {formData.full_name?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <p className="font-medium text-foreground">{formData.full_name || 'Você'}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-primary text-primary-foreground">
                <Crown className="h-3 w-3 mr-1" />
                Proprietário
              </Badge>
            </div>
          </div>

          {/* Team Members List */}
          {teamMembers.length > 0 ? (
            <div className="space-y-2">
              {teamMembers.map((member) => (
                <div 
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-sm font-bold text-muted-foreground">
                        {member.name[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.status === 'pending' && (
                      <Badge variant="outline" className="border-amber-500/50 text-amber-600">
                        Pendente
                      </Badge>
                    )}
                    {getRoleBadge(member.role)}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveMember(member.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum membro adicionado ainda</p>
              <p className="text-xs">Convide pessoas para colaborar com você</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Section */}
      <Card className="bg-card border-border shadow-soft">
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
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div>
              <p className="font-medium text-foreground">Autenticação</p>
              <p className="text-sm text-muted-foreground">Login via e-mail e senha</p>
            </div>
            <Badge variant="outline" className="border-emerald-500/50 text-emerald-600">
              <Check className="h-3 w-3 mr-1" />
              Ativo
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div>
              <p className="font-medium text-foreground">Última sessão</p>
              <p className="text-sm text-muted-foreground">Dispositivo atual</p>
            </div>
            <p className="text-sm text-muted-foreground">Agora</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserSettings;
