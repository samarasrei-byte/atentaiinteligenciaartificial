import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calculator, 
  Cigarette, 
  Wine, 
  Car, 
  Sparkles,
  AlertTriangle,
  Info,
  TrendingUp
} from 'lucide-react';

// Alíquotas do Imposto Seletivo conforme LC 214/2025
// Nota: Valores estimados baseados em diretrizes da reforma tributária
const SELECTIVE_TAX_CATEGORIES = {
  cigarros: {
    name: 'Cigarros e Produtos de Tabaco',
    icon: Cigarette,
    baseRate: 0.30, // 30% adicional
    description: 'Tabaco, cigarros, charutos e derivados',
    examples: ['Cigarros', 'Charutos', 'Cigarrilhas', 'Tabaco para cachimbo'],
    healthImpact: 'Alto impacto na saúde pública',
    color: 'text-red-500'
  },
  bebidas_alcoolicas: {
    name: 'Bebidas Alcoólicas',
    icon: Wine,
    baseRate: 0.20, // 20% adicional
    description: 'Cerveja, vinho, destilados e similares',
    examples: ['Cerveja', 'Vinho', 'Cachaça', 'Whisky', 'Vodka'],
    healthImpact: 'Impacto moderado a alto',
    color: 'text-amber-500'
  },
  bebidas_acucaradas: {
    name: 'Bebidas Açucaradas',
    icon: Sparkles,
    baseRate: 0.15, // 15% adicional (estimativa)
    description: 'Refrigerantes, sucos com açúcar adicionado',
    examples: ['Refrigerantes', 'Sucos industrializados', 'Energéticos', 'Chás prontos'],
    healthImpact: 'Contribui para obesidade e diabetes',
    color: 'text-orange-500'
  },
  veiculos_poluentes: {
    name: 'Veículos Poluentes',
    icon: Car,
    baseRate: 0.25, // 25% adicional (baseado na emissão)
    description: 'Veículos com alta emissão de CO2',
    examples: ['Veículos a combustão', 'Motos de alta cilindrada', 'Jet-skis', 'Lanchas'],
    healthImpact: 'Impacto ambiental significativo',
    color: 'text-gray-500'
  },
};

type CategoryKey = keyof typeof SELECTIVE_TAX_CATEGORIES;

interface SimulationResult {
  category: CategoryKey;
  productValue: number;
  cbsValue: number; // 8.8%
  ibsValue: number; // 17.7%
  selectiveTaxValue: number;
  totalTax: number;
  effectiveRate: number;
  finalPrice: number;
}

export function SelectiveTaxCalculator() {
  const [category, setCategory] = useState<CategoryKey>('bebidas_alcoolicas');
  const [productValue, setProductValue] = useState<string>('');
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const CBS_RATE = 0.088; // 8.8%
  const IBS_RATE = 0.177; // 17.7%

  const parseValue = (value: string): number => {
    return parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleSimulate = () => {
    const value = parseValue(productValue);
    if (value <= 0) return;

    setIsSimulating(true);

    setTimeout(() => {
      const categoryData = SELECTIVE_TAX_CATEGORIES[category];
      
      const cbsValue = value * CBS_RATE;
      const ibsValue = value * IBS_RATE;
      const selectiveTaxValue = value * categoryData.baseRate;
      const totalTax = cbsValue + ibsValue + selectiveTaxValue;
      const effectiveRate = totalTax / value;
      const finalPrice = value + totalTax;

      setResult({
        category,
        productValue: value,
        cbsValue,
        ibsValue,
        selectiveTaxValue,
        totalTax,
        effectiveRate,
        finalPrice,
      });

      setIsSimulating(false);
    }, 500);
  };

  const selectedCategory = SELECTIVE_TAX_CATEGORIES[category];
  const CategoryIcon = selectedCategory.icon;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Calculadora de Imposto Seletivo (IS)
          </CardTitle>
          <CardDescription>
            Simule o Imposto Seletivo conforme LC 214/2025 para produtos prejudiciais à saúde e ao meio ambiente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Info Banner */}
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-primary mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-foreground mb-1">O que é o Imposto Seletivo?</p>
                <p className="text-muted-foreground">
                  O IS é um tributo adicional criado pela Reforma Tributária (LC 214/2025) que incide sobre 
                  produtos prejudiciais à saúde ou ao meio ambiente, com objetivo de desestimular o consumo 
                  e financiar políticas públicas.
                </p>
              </div>
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label>Categoria do Produto</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as CategoryKey)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SELECTIVE_TAX_CATEGORIES).map(([key, data]) => {
                  const Icon = data.icon;
                  return (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${data.color}`} />
                        <span>{data.name}</span>
                        <Badge variant="outline" className="ml-2">
                          +{(data.baseRate * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Category Details */}
          <div className="p-4 rounded-lg bg-muted/50 border">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg bg-background ${selectedCategory.color}`}>
                <CategoryIcon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-foreground">{selectedCategory.name}</h4>
                <p className="text-sm text-muted-foreground mb-2">{selectedCategory.description}</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedCategory.examples.map((ex, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{ex}</Badge>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <AlertTriangle className="h-3 w-3" />
                  {selectedCategory.healthImpact}
                </div>
              </div>
            </div>
          </div>

          {/* Value Input */}
          <div className="space-y-2">
            <Label htmlFor="productValue">Valor do Produto (R$)</Label>
            <Input
              id="productValue"
              value={productValue}
              onChange={(e) => setProductValue(e.target.value)}
              placeholder="Ex: 100,00"
            />
          </div>

          <Button 
            onClick={handleSimulate} 
            className="w-full"
            disabled={!productValue || isSimulating}
          >
            {isSimulating ? 'Calculando...' : 'Calcular Imposto Seletivo'}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Resultado da Simulação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Valor do Produto</p>
                <p className="text-2xl font-bold">{formatCurrency(result.productValue)}</p>
              </div>
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-muted-foreground">Preço Final (com impostos)</p>
                <p className="text-2xl font-bold text-destructive">{formatCurrency(result.finalPrice)}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Composição Tributária</h4>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div>
                    <p className="font-medium">CBS (Contribuição sobre Bens)</p>
                    <p className="text-sm text-muted-foreground">Alíquota: 8,8%</p>
                  </div>
                  <span className="font-bold">{formatCurrency(result.cbsValue)}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <div>
                    <p className="font-medium">IBS (Imposto sobre Bens)</p>
                    <p className="text-sm text-muted-foreground">Alíquota: 17,7%</p>
                  </div>
                  <span className="font-bold">{formatCurrency(result.ibsValue)}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div>
                    <p className="font-medium">Imposto Seletivo (IS)</p>
                    <p className="text-sm text-muted-foreground">
                      Alíquota: {(SELECTIVE_TAX_CATEGORIES[result.category].baseRate * 100).toFixed(0)}%
                    </p>
                  </div>
                  <span className="font-bold text-destructive">{formatCurrency(result.selectiveTaxValue)}</span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg">Total de Impostos</p>
                    <p className="text-sm text-muted-foreground">
                      Carga tributária efetiva: {(result.effectiveRate * 100).toFixed(1)}%
                    </p>
                  </div>
                  <span className="text-2xl font-bold text-primary">{formatCurrency(result.totalTax)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-foreground">Objetivo do Imposto Seletivo</p>
                  <p className="text-muted-foreground">
                    Este imposto visa desestimular o consumo de produtos nocivos e gerar recursos para 
                    políticas de saúde pública e proteção ambiental. A arrecadação é destinada a fundos 
                    específicos de saúde e meio ambiente.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
