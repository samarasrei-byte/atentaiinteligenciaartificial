import { FormEvent, useMemo, useState } from 'react';
import { ArrowRight, Bot, Search, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface SmartSearchEntry {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  onOpen: () => void;
}

export interface SmartSearchFact {
  label: string;
  value: string | number;
  keywords: string[];
}

interface ChatItem {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  entries?: SmartSearchEntry[];
}

interface SmartPanelSearchProps {
  entries: SmartSearchEntry[];
  facts?: SmartSearchFact[];
  className?: string;
}

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export function SmartPanelSearch({ entries, facts = [], className }: SmartPanelSearchProps) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatItem[]>([]);
  const [expanded, setExpanded] = useState(false);

  const suggestions = useMemo(() => entries.slice(0, 4), [entries]);

  const submit = (event?: FormEvent, suggestion?: string) => {
    event?.preventDefault();
    const raw = (suggestion ?? query).trim();
    if (!raw) return;

    const term = normalize(raw);
    const words = term.split(/\s+/).filter((word) => word.length > 2);
    const score = (values: string[]) => {
      const haystack = normalize(values.join(' '));
      return words.reduce((total, word) => total + (haystack.includes(word) ? 1 : 0), 0);
    };

    const matchingFacts = facts.filter((fact) => score([fact.label, ...fact.keywords]) > 0);
    const matchingEntries = entries
      .map((entry) => ({ entry, score: score([entry.title, entry.description, ...entry.keywords]) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((item) => item.entry);

    let response = 'Não encontrei esse assunto nas áreas disponíveis para o seu acesso. Tente buscar pelo nome de uma tela, serviço, relatório ou indicador.';
    if (matchingFacts.length > 0) {
      response = matchingFacts.map((fact) => `${fact.label}: ${fact.value}`).join('\n');
      if (matchingEntries.length > 0) response += '\n\nTambém encontrei estas áreas:';
    } else if (matchingEntries.length > 0) {
      response = matchingEntries.length === 1
        ? 'Encontrei esta área no seu painel:'
        : `Encontrei ${matchingEntries.length} áreas relacionadas no seu painel:`;
    }

    const stamp = Date.now();
    setMessages((current) => [
      ...current,
      { id: stamp, role: 'user', text: raw },
      { id: stamp + 1, role: 'assistant', text: response, entries: matchingEntries },
    ]);
    setQuery('');
    setExpanded(true);
  };

  return (
    <Card className={cn('overflow-hidden border-primary/20 shadow-sm', className)}>
      <CardContent className="p-0">
        <div className="bg-gradient-to-r from-primary/[0.08] via-background to-background p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-primary p-2.5 text-primary-foreground shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Busca inteligente</p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight sm:text-xl">O que você quer encontrar no painel?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Escreva como se estivesse conversando. A busca considera apenas informações e áreas permitidas para o seu perfil.
              </p>
            </div>
          </div>

          <form onSubmit={submit} className="mt-5 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ex.: onde vejo o DIFAL, minhas simulações ou usuários?"
                className="h-11 bg-background pl-10 pr-3"
                aria-label="Pesquisar em todo o painel"
              />
            </div>
            <Button type="submit" size="icon" className="h-11 w-11" disabled={!query.trim()} aria-label="Enviar busca">
              <Send className="h-4 w-4" />
            </Button>
          </form>

          {messages.length === 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestions.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => submit(undefined, entry.title)}
                  className="rounded-full border bg-background/80 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  {entry.title}
                </button>
              ))}
            </div>
          )}
        </div>

        {expanded && messages.length > 0 && (
          <div className="max-h-[360px] space-y-4 overflow-y-auto border-t bg-muted/15 p-4 sm:p-5" aria-live="polite">
            {messages.map((message) => (
              <div key={message.id} className={cn('flex gap-2.5', message.role === 'user' && 'justify-end')}>
                {message.role === 'assistant' && (
                  <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div className={cn(
                  'max-w-[88%] rounded-2xl px-4 py-3 text-sm',
                  message.role === 'user' ? 'bg-primary text-primary-foreground' : 'border bg-card text-foreground',
                )}>
                  <p className="whitespace-pre-line leading-relaxed">{message.text}</p>
                  {!!message.entries?.length && (
                    <div className="mt-3 space-y-2">
                      {message.entries.map((entry) => (
                        <button
                          key={entry.id}
                          type="button"
                          onClick={entry.onOpen}
                          className="flex w-full items-center gap-3 rounded-xl border bg-background p-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/[0.03]"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-foreground">{entry.title}</p>
                            <p className="mt-0.5 truncate text-xs text-muted-foreground">{entry.description}</p>
                          </div>
                          <ArrowRight className="h-4 w-4 shrink-0 text-primary" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SmartPanelSearch;
