import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Sparkles, 
  Copy, 
  RefreshCw, 
  Send,
  MessageSquare,
  Gift,
  HelpCircle,
  AlertTriangle,
  Check
} from 'lucide-react';

interface AIChurnMessageGeneratorProps {
  userName?: string;
  userEmail?: string;
  daysInactive?: number;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  onMessageGenerated?: (message: string, subject: string) => void;
}

const messageTypes = [
  { id: 'retention', label: 'Retenção', icon: MessageSquare, description: 'Mensagem empática para reconquistar' },
  { id: 'offer', label: 'Oferta Especial', icon: Gift, description: 'Desconto exclusivo para retorno' },
  { id: 'feedback', label: 'Solicitar Feedback', icon: HelpCircle, description: 'Entender motivo do afastamento' },
  { id: 'lastChance', label: 'Última Chance', icon: AlertTriangle, description: 'Urgente para risco crítico' },
];

export const AIChurnMessageGenerator: React.FC<AIChurnMessageGeneratorProps> = ({
  userName = '',
  userEmail = '',
  daysInactive = 14,
  riskLevel = 'medium',
  onMessageGenerated
}) => {
  const [selectedType, setSelectedType] = useState('retention');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [generatedSubject, setGeneratedSubject] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editedMessage, setEditedMessage] = useState('');
  const [editedSubject, setEditedSubject] = useState('');

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Sessão expirada. Faça login novamente.');
        return;
      }

      const response = await supabase.functions.invoke('generate-churn-message', {
        body: {
          userName,
          userEmail,
          daysInactive,
          riskLevel,
          messageType: selectedType
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { message, subject } = response.data;
      setGeneratedMessage(message);
      setGeneratedSubject(subject);
      setEditedMessage(message);
      setEditedSubject(subject);
      
      toast.success('Mensagem gerada com sucesso!');
    } catch (error) {
      console.error('Error generating message:', error);
      toast.error('Erro ao gerar mensagem. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedMessage);
      setCopied(true);
      toast.success('Mensagem copiada!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  const handleUseMessage = () => {
    if (onMessageGenerated) {
      onMessageGenerated(editedMessage, editedSubject);
      toast.success('Mensagem aplicada!');
    }
  };

  const getRiskBadge = () => {
    const colors = {
      low: 'bg-info/20 text-info',
      medium: 'bg-warning/20 text-warning',
      high: 'bg-orange-500/20 text-orange-500',
      critical: 'bg-destructive/20 text-destructive'
    };
    const labels = { low: 'Baixo', medium: 'Médio', high: 'Alto', critical: 'Crítico' };
    return <Badge className={colors[riskLevel]}>{labels[riskLevel]}</Badge>;
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Gerador de Mensagens com IA
        </CardTitle>
        <CardDescription>
          Crie mensagens personalizadas de retenção usando inteligência artificial
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Context */}
        {(userName || daysInactive) && (
          <div className="flex flex-wrap items-center gap-3 p-3 bg-muted/30 rounded-lg">
            {userName && (
              <Badge variant="outline">
                👤 {userName}
              </Badge>
            )}
            {daysInactive && (
              <Badge variant="outline">
                📅 {daysInactive} dias inativo
              </Badge>
            )}
            {getRiskBadge()}
          </div>
        )}

        {/* Message Type Selection */}
        <div className="space-y-2">
          <Label>Tipo de Mensagem</Label>
          <div className="grid grid-cols-2 gap-2">
            {messageTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedType === type.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`h-4 w-4 ${selectedType === type.id ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="font-medium text-sm">{type.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{type.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Generate Button */}
        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-primary to-primary/80"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Gerando com IA...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Gerar Mensagem com IA
            </>
          )}
        </Button>

        {/* Generated Content */}
        {generatedMessage && (
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="space-y-2">
              <Label>Assunto</Label>
              <Input
                value={editedSubject}
                onChange={(e) => setEditedSubject(e.target.value)}
                placeholder="Assunto do email"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Mensagem Gerada</Label>
                <Badge variant="outline" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Gerado por IA
                </Badge>
              </div>
              <Textarea
                value={editedMessage}
                onChange={(e) => setEditedMessage(e.target.value)}
                rows={8}
                className="resize-none"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCopy}
                className="flex-1"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar
                  </>
                )}
              </Button>
              
              {onMessageGenerated && (
                <Button
                  onClick={handleUseMessage}
                  className="flex-1"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Usar Mensagem
                </Button>
              )}

              <Button
                variant="ghost"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIChurnMessageGenerator;
