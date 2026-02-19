import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Mail, Lock } from 'lucide-react';

interface GuestEmailCaptureProps {
  serviceName: string;
  onSubmit: (email: string) => void;
}

export function GuestEmailCapture({ serviceName, onSubmit }: GuestEmailCaptureProps) {
  const [email, setEmail] = useState('');

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onSubmit(email.trim().toLowerCase());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-foreground">
          Informe seu e-mail para continuar
        </p>
        <p className="text-xs text-muted-foreground">
          Sua conta será criada automaticamente após o pagamento
        </p>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-9"
            autoFocus
            required
            maxLength={255}
          />
        </div>
        <Button type="submit" disabled={!isValid} size="default">
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center justify-center text-xs text-muted-foreground gap-1.5">
        <Lock className="h-3 w-3" />
        Pagamento seguro · Conta criada automaticamente
      </div>
    </form>
  );
}
