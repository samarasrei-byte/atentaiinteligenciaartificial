import { CheckCircle2, ArrowRight, ClipboardList, MessageCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface SummaryRow {
  label: string;
  value: string;
}

interface Step {
  title: string;
  description: string;
}

interface QuizConfirmationProps {
  headline: string;
  subline?: string;
  protocol?: string | null;
  highlight?: { label: string; value: string };
  summary: SummaryRow[];
  nextSteps: Step[];
  trackingHref?: string;
  chatHref?: string;
}

export default function QuizConfirmation({
  headline,
  subline,
  protocol,
  highlight,
  summary,
  nextSteps,
  trackingHref = "/minhas-solicitacoes",
  chatHref,
}: QuizConfirmationProps) {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500/10">
          <CheckCircle2 className="h-9 w-9 text-emerald-500" />
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">{headline}</h2>
        {subline && <p className="mt-2 text-sm text-muted-foreground sm:text-base">{subline}</p>}
        {protocol && (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs">
            <ClipboardList className="h-3.5 w-3.5 text-muted-foreground" />
            Protocolo <span className="font-mono font-semibold">{protocol}</span>
          </p>
        )}
      </div>

      {highlight && (
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 text-center">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{highlight.label}</p>
          <p className="mt-1 text-3xl font-bold text-primary sm:text-4xl">{highlight.value}</p>
        </div>
      )}

      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Resumo do pedido
        </p>
        <dl className="grid gap-2 sm:grid-cols-2">
          {summary.map((row) => (
            <div key={row.label} className="flex flex-col">
              <dt className="text-[11px] uppercase text-muted-foreground">{row.label}</dt>
              <dd className="text-sm font-medium text-foreground break-words">{row.value || "—"}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Próximos passos
        </p>
        <ol className="space-y-3">
          {nextSteps.map((s, i) => (
            <li key={s.title} className="flex gap-3 rounded-xl border border-border bg-card p-3">
              <span className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-semibold">{s.title}</p>
                <p className="text-xs text-muted-foreground">{s.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button className="flex-1 gap-1.5" onClick={() => navigate(trackingHref)}>
          Acompanhar solicitação <ArrowRight className="h-4 w-4" />
        </Button>
        {chatHref && (
          <Button variant="outline" className="flex-1 gap-1.5" onClick={() => navigate(chatHref)}>
            <MessageCircle className="h-4 w-4" /> Falar com especialista
          </Button>
        )}
        <Button variant="ghost" className="sm:w-auto gap-1.5" onClick={() => navigate("/")}>
          <Home className="h-4 w-4" /> Início
        </Button>
      </div>
    </div>
  );
}
