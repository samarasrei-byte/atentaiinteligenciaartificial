import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Link2, Copy, Check, Mail, Send } from 'lucide-react';

interface PartnerInviteButtonProps {
  partnerId: string;
  partnerName: string;
}

export function PartnerInviteButton({ partnerId, partnerName }: PartnerInviteButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerateInvite = async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('partner_invitations')
        .insert({
          partner_id: partnerId,
          invited_by: user.id,
          email: email || null
        })
        .select('invitation_token')
        .single();

      if (error) {
        toast({ title: 'Erro ao gerar convite', description: error.message, variant: 'destructive' });
        return;
      }

      const link = `${window.location.origin}/partner/invite/${data.invitation_token}`;
      setInviteLink(link);
      toast({ title: 'Link de convite gerado!' });
    } catch (err) {
      console.error('Error generating invite:', err);
      toast({ title: 'Erro ao gerar convite', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!inviteLink) return;

    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast({ title: 'Link copiado!' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Erro ao copiar', variant: 'destructive' });
    }
  };

  const handleClose = () => {
    setShowDialog(false);
    setInviteLink(null);
    setEmail('');
    setCopied(false);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowDialog(true)}
        className="gap-2"
      >
        <Send className="h-4 w-4" />
        Convidar
      </Button>

      <Dialog open={showDialog} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              Convidar para {partnerName}
            </DialogTitle>
            <DialogDescription>
              Gere um link de convite para novos usuários do parceiro. O link expira em 7 dias.
            </DialogDescription>
          </DialogHeader>

          {!inviteLink ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email do convidado (opcional)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="invite-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  O email será pré-preenchido no formulário de cadastro.
                </p>
              </div>

              <Button
                onClick={handleGenerateInvite}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Link2 className="h-4 w-4 mr-2" />
                )}
                Gerar Link de Convite
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Link de convite</Label>
                <div className="flex gap-2">
                  <Input
                    value={inviteLink}
                    readOnly
                    className="text-xs"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleCopyLink}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Envie este link para o usuário que deseja convidar. Válido por 7 dias.
                </p>
              </div>

              <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                <p className="text-sm text-success">
                  ✓ Link gerado com sucesso! Copie e envie para o parceiro.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
