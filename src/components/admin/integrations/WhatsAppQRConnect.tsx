import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageSquare, 
  QrCode, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Smartphone,
  Loader2,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WhatsAppInstance {
  id: string;
  name: string;
  phone: string;
  instanceId: string;
  status: 'connected' | 'disconnected' | 'pending' | 'scanning';
  color: string;
  bgColor: string;
  services: string[];
}

interface WhatsAppQRConnectProps {
  instance: WhatsAppInstance;
  onStatusChange?: (instanceId: string, status: WhatsAppInstance['status']) => void;
}

export const WhatsAppQRConnect: React.FC<WhatsAppQRConnectProps> = ({ 
  instance, 
  onStatusChange 
}) => {
  const { toast } = useToast();
  const [showQR, setShowQR] = useState(false);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [qrCode, setQrCode] = useState<boolean[] | null>(null);
  const [connectionStatus, setConnectionStatus] = useState(instance.status);

  // Simulated QR code generation (replace with actual WhatsApp API)
  const generateQRCode = async () => {
    setIsGeneratingQR(true);
    setShowQR(true);
    setConnectionStatus('scanning');
    
    // Simulate API call to get QR code
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // This would be the actual QR code from WhatsApp Business API
    // For now, we'll use a placeholder SVG pattern
    const qrSvg = generateQRSVG(instance.instanceId);
    setQrCode(qrSvg);
    setIsGeneratingQR(false);
    
    toast({
      title: 'QR Code gerado!',
      description: 'Escaneie com o WhatsApp Business no seu celular',
    });

    // Simulate connection after 30 seconds (in real app, this would be a webhook)
    // setTimeout(() => {
    //   handleConnectionSuccess();
    // }, 30000);
  };

  const handleConnectionSuccess = () => {
    setConnectionStatus('connected');
    setShowQR(false);
    setQrCode(null);
    onStatusChange?.(instance.id, 'connected');
    
    toast({
      title: 'WhatsApp conectado! 🎉',
      description: `Instância ${instance.name} conectada com sucesso`,
    });
  };

  const handleDisconnect = () => {
    setConnectionStatus('disconnected');
    onStatusChange?.(instance.id, 'disconnected');
    
    toast({
      title: 'WhatsApp desconectado',
      description: 'Você pode reconectar a qualquer momento',
      variant: 'destructive',
    });
  };

  const refreshQR = () => {
    setQrCode(null);
    generateQRCode();
  };

  // Mock QR Code SVG generator
  const generateQRSVG = (seed: string) => {
    const hash = seed.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
    const pattern = [];
    for (let i = 0; i < 625; i++) {
      const shouldFill = ((hash * (i + 1)) % 7) < 3;
      pattern.push(shouldFill);
    }
    return pattern;
  };

  const getStatusConfig = (status: WhatsAppInstance['status']) => {
    switch (status) {
      case 'connected':
        return { icon: CheckCircle, label: 'Conectado', class: 'bg-emerald-100 text-emerald-700 border-emerald-300' };
      case 'disconnected':
        return { icon: WifiOff, label: 'Desconectado', class: 'bg-red-100 text-red-700 border-red-300' };
      case 'scanning':
        return { icon: QrCode, label: 'Aguardando scan', class: 'bg-amber-100 text-amber-700 border-amber-300' };
      case 'pending':
        return { icon: AlertCircle, label: 'Pendente', class: 'bg-yellow-100 text-yellow-700 border-yellow-300' };
      default:
        return { icon: AlertCircle, label: 'Desconhecido', class: 'bg-gray-100 text-gray-700 border-gray-300' };
    }
  };

  const statusConfig = getStatusConfig(connectionStatus);
  const StatusIcon = statusConfig.icon;

  return (
    <Card className={cn('border-2', `border-${instance.color}-200`, `bg-gradient-to-br from-${instance.color}-50/50 to-transparent`)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('h-14 w-14 rounded-full flex items-center justify-center', instance.bgColor)}>
              <span className="text-white font-bold text-xl">{instance.name.charAt(0)}</span>
            </div>
            <div>
              <CardTitle className="text-lg">{instance.name}</CardTitle>
              <CardDescription>{instance.services.join(' • ')}</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className={cn('gap-1', statusConfig.class)}>
            <StatusIcon className="h-3 w-3" />
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Phone Info */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Smartphone className="h-4 w-4" />
          <span>{instance.phone || 'Número não configurado'}</span>
        </div>

        {/* QR Code Section */}
        {showQR && (
          <div className="flex flex-col items-center p-6 bg-white rounded-xl border-2 border-dashed border-gray-200">
            {isGeneratingQR ? (
              <div className="flex flex-col items-center gap-3 py-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Gerando QR Code...</p>
              </div>
            ) : qrCode ? (
              <>
                <div className="bg-white p-4 rounded-lg shadow-inner">
                  {/* QR Code Display */}
                  <div className="grid gap-0" style={{ width: '200px', height: '200px', gridTemplateColumns: 'repeat(25, 1fr)' }}>
                    {qrCode.map((filled, i) => (
                      <div
                        key={i}
                        className={cn(
                          'w-2 h-2',
                          filled ? 'bg-gray-900' : 'bg-white'
                        )}
                      />
                    ))}
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm font-medium">Escaneie com o WhatsApp Business</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Abra o WhatsApp {'>'} Configurações {'>'} Dispositivos conectados {'>'} Conectar dispositivo
                  </p>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={refreshQR}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Gerar novo QR
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowQR(false)}>
                    Cancelar
                  </Button>
                </div>
                {/* Simulate connection button for demo */}
                <Button 
                  variant="default" 
                  size="sm" 
                  className="mt-2"
                  onClick={handleConnectionSuccess}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Simular Conexão (Demo)
                </Button>
              </>
            ) : null}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {connectionStatus === 'connected' ? (
            <>
              <Button variant="outline" className="flex-1 gap-2 text-emerald-600 border-emerald-300">
                <Wifi className="h-4 w-4" />
                Online
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleDisconnect}
              >
                Desconectar
              </Button>
            </>
          ) : connectionStatus === 'scanning' ? (
            <Button variant="outline" className="w-full gap-2" disabled>
              <Loader2 className="h-4 w-4 animate-spin" />
              Aguardando escaneamento...
            </Button>
          ) : (
            <Button 
              className="w-full gap-2"
              onClick={generateQRCode}
            >
              <QrCode className="h-4 w-4" />
              Conectar via QR Code
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WhatsAppQRConnect;
