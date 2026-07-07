import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Helmet } from "react-helmet-async";

export interface QuizStep {
  title: string;
  subtitle?: string;
  content: ReactNode;
  canNext?: boolean;
}

interface QuizShellProps {
  title: string;
  metaDescription: string;
  brandLabel: string;
  step: number;
  steps: QuizStep[];
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  submitting?: boolean;
  submitLabel?: string;
  done?: boolean;
  doneContent?: ReactNode;
}

export default function QuizShell({
  title, metaDescription, brandLabel,
  step, steps, onBack, onNext, onSubmit,
  submitting, submitLabel = "Enviar simulação", done, doneContent,
}: QuizShellProps) {
  const total = steps.length;
  const current = steps[step];
  const progress = ((step + 1) / total) * 100;
  const isLast = step === total - 1;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background text-foreground">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={metaDescription} />
      </Helmet>

      <header className="flex-shrink-0 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <span className="text-sm font-semibold tracking-tight">
            AtentAI · <span className="text-muted-foreground">{brandLabel}</span>
          </span>
          <span className="text-[11px] text-muted-foreground">Passo {step + 1}/{total}</span>
        </div>
        {!done && <Progress value={progress} className="h-1 rounded-none" />}
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
          {done ? (
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
              {doneContent}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8"
              >
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{current.title}</h2>
                {current.subtitle && (
                  <p className="mt-1 text-sm text-muted-foreground">{current.subtitle}</p>
                )}
                <div className="mt-5">{current.content}</div>

                <div className="mt-8 flex items-center justify-between gap-3">
                  <Button
                    type="button" variant="ghost"
                    onClick={onBack} disabled={step === 0 || submitting}
                    className="gap-1"
                  >
                    <ArrowLeft className="h-4 w-4" /> Voltar
                  </Button>
                  {isLast ? (
                    <Button onClick={onSubmit} disabled={submitting || current.canNext === false} className="gap-2">
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : submitLabel}
                    </Button>
                  ) : (
                    <Button onClick={onNext} disabled={current.canNext === false} className="gap-1">
                      Continuar <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  );
}
