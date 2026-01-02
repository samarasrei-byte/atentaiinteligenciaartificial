import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, UserPlus, Trash2, Shield, Building2, 
  Loader2, Mail, Search, Crown
} from 'lucide-react';

interface Partner {
  id: string;
  company_name: string;
  trade_name: string | null;
}

interface PartnerUser {
  id: string;
  partner_id: string;
  user_id: string;
  role: string;
  is_primary: boolean;
  created_at: string;
  user_email?: string;
  user_name?: string;
  partner?: Partner;
}

export function PartnerUserManagement() {
  const { toast } = useToast();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [partnerUsers, setPartnerUsers] = useState<PartnerUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPartnerFilter, setSelectedPartnerFilter] = useState<string>('all');

  // Form state for adding new user
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [userRole, setUserRole] = useState('operator');
  const [isPrimary, setIsPrimary] = useState(false);

  // Form state for linking existing user
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [existingUserEmail, setExistingUserEmail] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch partners
      const { data: partnersData, error: partnersError } = await supabase
        .from('credit_repair_partners')
        .select('id, company_name, trade_name')
        .order('company_name');

      if (partnersError) throw partnersError;
      setPartners(partnersData || []);

      // Fetch partner users with profiles
      const { data: usersData, error: usersError } = await supabase
        .from('credit_repair_partner_users')
        .select(`
          *,
          partner:credit_repair_partners(id, company_name, trade_name)
        `)
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Fetch user profiles for emails
      const userIds = usersData?.map(u => u.user_id) || [];
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, email, full_name')
          .in('user_id', userIds);

        const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);
        
        const enrichedUsers = usersData?.map(u => ({
          ...u,
          user_email: profilesMap.get(u.user_id)?.email || 'N/A',
          user_name: profilesMap.get(u.user_id)?.full_name || 'N/A',
        })) || [];

        setPartnerUsers(enrichedUsers);
      } else {
        setPartnerUsers([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao carregar dados',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUserEmail || !newUserPassword || !selectedPartnerId || !newUserName) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create user via edge function
      const { data, error } = await supabase.functions.invoke('create-partner-user', {
        body: {
          email: newUserEmail,
          password: newUserPassword,
          full_name: newUserName,
          partner_id: selectedPartnerId,
          role: userRole,
          is_primary: isPrimary,
        },
      });

      if (error) throw error;

      toast({
        title: 'Sucesso!',
        description: 'Usuário criado e vinculado ao parceiro',
      });

      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao criar usuário',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLinkExistingUser = async () => {
    if (!existingUserEmail || !selectedPartnerId) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Find user by email
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', existingUserEmail)
        .single();

      if (profileError || !profileData) {
        throw new Error('Usuário não encontrado com este email');
      }

      // Link user to partner
      const { error: linkError } = await supabase
        .from('credit_repair_partner_users')
        .insert({
          partner_id: selectedPartnerId,
          user_id: profileData.user_id,
          role: userRole,
          is_primary: isPrimary,
        });

      if (linkError) throw linkError;

      toast({
        title: 'Sucesso!',
        description: 'Usuário vinculado ao parceiro',
      });

      setLinkDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Error linking user:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao vincular usuário',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveUser = async (userId: string, partnerId: string) => {
    if (!confirm('Tem certeza que deseja remover este usuário do parceiro?')) return;

    try {
      const { error } = await supabase
        .from('credit_repair_partner_users')
        .delete()
        .eq('user_id', userId)
        .eq('partner_id', partnerId);

      if (error) throw error;

      toast({
        title: 'Sucesso!',
        description: 'Usuário removido do parceiro',
      });

      fetchData();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao remover usuário',
      });
    }
  };

  const resetForm = () => {
    setNewUserEmail('');
    setNewUserPassword('');
    setNewUserName('');
    setSelectedPartnerId('');
    setUserRole('operator');
    setIsPrimary(false);
    setExistingUserEmail('');
  };

  const filteredUsers = partnerUsers.filter(user => {
    const matchesSearch = 
      user.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.partner?.company_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPartner = selectedPartnerFilter === 'all' || user.partner_id === selectedPartnerFilter;

    return matchesSearch && matchesPartner;
  });

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Usuários de Parceiros
            </CardTitle>
            <CardDescription>
              Gerencie os usuários vinculados às empresas parceiras
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Shield className="h-4 w-4 mr-2" />
                  Vincular Existente
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle>Vincular Usuário Existente</DialogTitle>
                  <DialogDescription>
                    Vincule um usuário já cadastrado a um parceiro
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Email do Usuário *</Label>
                    <Input
                      type="email"
                      value={existingUserEmail}
                      onChange={(e) => setExistingUserEmail(e.target.value)}
                      placeholder="usuario@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Parceiro *</Label>
                    <Select value={selectedPartnerId} onValueChange={setSelectedPartnerId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o parceiro" />
                      </SelectTrigger>
                      <SelectContent>
                        {partners.map((partner) => (
                          <SelectItem key={partner.id} value={partner.id}>
                            {partner.company_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Função</Label>
                    <Select value={userRole} onValueChange={setUserRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="operator">Operador</SelectItem>
                        <SelectItem value="viewer">Visualizador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isPrimaryLink"
                      checked={isPrimary}
                      onChange={(e) => setIsPrimary(e.target.checked)}
                      className="rounded border-border"
                    />
                    <Label htmlFor="isPrimaryLink" className="text-sm">
                      Usuário principal do parceiro
                    </Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleLinkExistingUser} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Shield className="h-4 w-4 mr-2" />
                    )}
                    Vincular
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Criar Novo Usuário
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle>Criar Usuário para Parceiro</DialogTitle>
                  <DialogDescription>
                    Crie um novo usuário com credenciais de acesso
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Nome Completo *</Label>
                    <Input
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      placeholder="Nome do usuário"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="usuario@empresa.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Senha *</Label>
                    <Input
                      type="password"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      placeholder="Senha de acesso"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Parceiro *</Label>
                    <Select value={selectedPartnerId} onValueChange={setSelectedPartnerId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o parceiro" />
                      </SelectTrigger>
                      <SelectContent>
                        {partners.map((partner) => (
                          <SelectItem key={partner.id} value={partner.id}>
                            {partner.company_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Função</Label>
                    <Select value={userRole} onValueChange={setUserRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="operator">Operador</SelectItem>
                        <SelectItem value="viewer">Visualizador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isPrimary"
                      checked={isPrimary}
                      onChange={(e) => setIsPrimary(e.target.checked)}
                      className="rounded border-border"
                    />
                    <Label htmlFor="isPrimary" className="text-sm">
                      Usuário principal do parceiro
                    </Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateUser} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <UserPlus className="h-4 w-4 mr-2" />
                    )}
                    Criar Usuário
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por email, nome ou parceiro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedPartnerFilter} onValueChange={setSelectedPartnerFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por parceiro" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os parceiros</SelectItem>
              {partners.map((partner) => (
                <SelectItem key={partner.id} value={partner.id}>
                  {partner.company_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum usuário encontrado</p>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Usuário</TableHead>
                  <TableHead>Parceiro</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Mail className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{user.user_name || 'N/A'}</p>
                          <p className="text-sm text-muted-foreground">{user.user_email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {user.partner?.company_name || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {user.role === 'admin' ? 'Administrador' : 
                         user.role === 'operator' ? 'Operador' : 'Visualizador'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.is_primary ? (
                        <Badge className="bg-amber-500/20 text-amber-600 border-amber-300">
                          <Crown className="h-3 w-3 mr-1" />
                          Principal
                        </Badge>
                      ) : (
                        <Badge variant="outline">Membro</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemoveUser(user.user_id, user.partner_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
