import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, User, Mail, Phone, Lock } from 'lucide-react';

interface GuestInfoFormProps {
  serviceName: string;
  onSubmit: (data: { name: string; email: string; phone: string }) => void;
  onCancel: () => void;
}

export function GuestInfoForm({ serviceName, onSubmit, onCancel }: GuestInfoFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || name.trim().length < 3) return;
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    if (!phone || phone.replace(/\D/g, '').length < 10) return;

    onSubmit({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.replace(/\D/g, ''),
    });
  };

  const isValid = name.trim().length >= 3 
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) 
    && phone.replace(/\D/g, '').length >= 10;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-muted-foreground text-center mb-2">
        Preencha seus dados para continuar com o pagamento
      </p>

      <div className="space-y-3">
        <div>
          <Label htmlFor="guest-name" className="text-sm font-medium flex items-center gap-2 mb-1.5">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            Nome completo
          </Label>
          <Input
            id="guest-name"
            placeholder="Seu nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={3}
            maxLength={100}
          />
        </div>

        <div>
          <Label htmlFor="guest-email" className="text-sm font-medium flex items-center gap-2 mb-1.5">
            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
            E-mail
          </Label>
          <Input
            id="guest-email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            maxLength={255}
          />
        </div>

        <div>
          <Label htmlFor="guest-phone" className="text-sm font-medium flex items-center gap-2 mb-1.5">
            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
            WhatsApp
          </Label>
          <Input
            id="guest-phone"
            type="tel"
            placeholder="(11) 99999-9999"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            maxLength={20}
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={!isValid}
        className="w-full h-12 font-semibold text-base"
      >
        Continuar para pagamento
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>

      <div className="flex items-center justify-center text-xs text-muted-foreground gap-1.5">
        <Lock className="h-3 w-3" />
        Seus dados estão protegidos
      </div>
    </form>
  );
}
