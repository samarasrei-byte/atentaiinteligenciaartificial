import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  BookOpen,
  ChevronDown,
  HelpCircle,
  Receipt,
  Landmark,
  Percent,
  CircleDollarSign,
  Building2,
} from 'lucide-react';

// Glossário de impostos com explicações intuitivas
const TAX_GLOSSARY = [
  {
    abbr: 'IBS',
    name: 'Imposto sobre Bens e Serviços',
    rate: '17,7%',
    icon: Landmark,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    description: 'Imposto estadual/municipal unificado. Substitui ICMS e ISS. Você paga para o estado e cidade onde opera.',
    example: 'Vendeu R$ 1.000? Paga ~R$ 177 de IBS.',
  },
  {
    abbr: 'CBS',
    name: 'Contribuição sobre Bens e Serviços',
    rate: '8,8%',
    icon: Receipt,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    description: 'Contribuição federal que substitui PIS e COFINS. Vai para a União e financia seguridade social.',
    example: 'Vendeu R$ 1.000? Paga ~R$ 88 de CBS.',
  },
  {
    abbr: 'IRPJ',
    name: 'Imposto de Renda Pessoa Jurídica',
    rate: '15%',
    icon: Building2,
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10',
    description: 'Imposto sobre o lucro da empresa. No Lucro Presumido, incide sobre uma base "presumida" (32% para serviços).',
    example: 'Lucro de R$ 10.000? Paga ~R$ 1.500 de IRPJ.',
  },
  {
    abbr: 'CSLL',
    name: 'Contribuição Social sobre Lucro Líquido',
    rate: '9%',
    icon: CircleDollarSign,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    description: 'Contribuição federal sobre o lucro. Financia a seguridade social (saúde, previdência, assistência).',
    example: 'Lucro de R$ 10.000? Paga ~R$ 900 de CSLL.',
  },
  {
    abbr: 'IVA',
    name: 'Imposto sobre Valor Agregado',
    rate: '26,5%',
    icon: Percent,
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
    description: 'Soma do IBS + CBS. É a alíquota total do novo sistema tributário brasileiro. Incide sobre consumo.',
    example: 'É o "combo" de impostos que você paga em cada venda.',
  },
];

interface TaxGlossaryProps {
  variant?: 'collapsible' | 'full';
  className?: string;
}

export const TaxGlossary: React.FC<TaxGlossaryProps> = ({ variant = 'collapsible', className = '' }) => {
  const content = (
    <div className="space-y-3">
      {TAX_GLOSSARY.map((tax) => {
        const IconComponent = tax.icon;
        return (
          <div 
            key={tax.abbr}
            className={`p-4 rounded-xl border border-border ${tax.bgColor} hover:shadow-md transition-all`}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="p-3 rounded-xl bg-background/80 shadow-sm">
                <IconComponent className={`h-6 w-6 ${tax.color}`} />
              </div>
              
              {/* Content */}
              <div className="flex-1 space-y-2">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Badge className={`${tax.bgColor} ${tax.color} border-0 font-bold text-sm px-3`}>
                      {tax.abbr}
                    </Badge>
                    <span className="font-medium text-foreground text-sm">
                      {tax.name}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs font-bold border-2">
                    {tax.rate}
                  </Badge>
                </div>
                
                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {tax.description}
                </p>
                
                {/* Example */}
                <div className="flex items-center gap-2 p-2 rounded-lg bg-background/60 border border-border/50">
                  <HelpCircle className="h-4 w-4 text-primary flex-shrink-0" />
                  <p className="text-xs text-foreground font-medium">
                    {tax.example}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Summary Card */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-violet-500/10 border-2 border-primary/20">
        <div className="flex items-center gap-3 mb-3">
          <Percent className="h-5 w-5 text-primary" />
          <span className="font-semibold text-foreground">Resumo da Reforma</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-3 rounded-lg bg-background/70">
            <p className="text-2xl font-bold text-primary">26,5%</p>
            <p className="text-xs text-muted-foreground">Alíquota Padrão (IBS+CBS)</p>
          </div>
          <div className="p-3 rounded-lg bg-background/70">
            <p className="text-2xl font-bold text-emerald-600">2033</p>
            <p className="text-xs text-muted-foreground">Transição completa</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3 text-center">
          O novo sistema unifica PIS, COFINS, ICMS e ISS em dois tributos: IBS e CBS.
        </p>
      </div>
    </div>
  );

  if (variant === 'full') {
    return (
      <Card className={`bg-card border-border ${className}`}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Glossário Tributário</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Entenda os impostos da Reforma Tributária
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {content}
        </CardContent>
      </Card>
    );
  }

  return (
    <Collapsible className={className}>
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-500/5 to-slate-500/10 border border-border hover:border-primary/30 transition-all group cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-foreground">Entenda os Impostos</h3>
              <p className="text-xs text-muted-foreground">Glossário completo da Reforma Tributária</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs border-primary/30 text-primary">
              5 impostos
            </Badge>
            <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-all group-data-[state=open]:rotate-180" />
          </div>
        </div>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="mt-4 animate-in slide-in-from-top-2">
        {content}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default TaxGlossary;
