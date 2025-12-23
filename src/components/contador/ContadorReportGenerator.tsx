import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { generateContadorMonthlyReport } from '@/lib/exportContadorReport';
import { FileDown, Loader2, Calendar } from 'lucide-react';

interface Consultation {
  id: string;
  status: string;
  scheduled_at: string | null;
  price_cents: number;
  platform_fee_cents: number;
  created_at: string;
  completed_at: string | null;
  rating: number | null;
}

interface ContadorProfile {
  crc_number: string;
  specialty: string;
  rating: number;
  total_consultations: number;
}

interface ContadorReportGeneratorProps {
  contadorName: string;
  contadorEmail: string;
  profile: ContadorProfile;
  consultations: Consultation[];
}

export const ContadorReportGenerator: React.FC<ContadorReportGeneratorProps> = ({
  contadorName,
  contadorEmail,
  profile,
  consultations,
}) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(
    (new Date().getMonth() + 1).toString().padStart(2, '0')
  );
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const months = [
    { value: '01', label: 'Janeiro' },
    { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' },
    { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
  ];

  const years = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: year.toString(), label: year.toString() };
  });

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      generateContadorMonthlyReport({
        contadorName,
        contadorEmail,
        profile,
        consultations,
        period: {
          month: selectedMonth,
          year: selectedYear,
        },
      });

      toast({
        title: 'Relatório gerado!',
        description: 'O download foi iniciado automaticamente',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao gerar relatório',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Count consultations for selected period
  const periodConsultations = consultations.filter((c) => {
    const date = new Date(c.created_at);
    return (
      date.getMonth() === parseInt(selectedMonth) - 1 &&
      date.getFullYear() === parseInt(selectedYear)
    );
  });

  return (
    <Card className="bg-card border-border shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileDown className="h-5 w-5 text-blue-500" />
          Relatório Mensal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Mês</label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="bg-muted/30 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Ano</label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="bg-muted/30 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year.value} value={year.value}>
                    {year.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-muted/30 rounded-lg p-3 border border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{periodConsultations.length} consultas no período selecionado</span>
          </div>
        </div>

        <Button
          className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
          onClick={handleGenerateReport}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <FileDown className="h-4 w-4 mr-2" />
          )}
          Baixar Relatório PDF
        </Button>
      </CardContent>
    </Card>
  );
};
