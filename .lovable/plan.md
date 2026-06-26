Implementação em 8 etapas sequenciais no My Trade Lens, mantendo padrão visual, paleta, layout e reutilizando os componentes existentes (`MediaCard`, `EditableCard`, `SortableList`, `ConfirmDeleteDialog`, `ListManager`, `ImageUploadField`, `Progress`, `AlertDialog`).

## 1. Filtros na Home
Novo `src/components/TradeFilters.tsx` com selects (Ativo, Tipo, Setup, Resultado, Período) usando shadcn `Select`. Período "Personalizado" mostra dois `Input type=date`. Estado no `Index.tsx` substitui o atual `monthCursor` (mantido como caso interno do preset "Mês atual"). Função `applyFilters(trades, filters)` em `src/lib/filterTrades.ts`. Botão "Limpar filtros" reseta para defaults (Todos / Mês atual). Ativos e Setups vêm de `useTextList("assets")` / `useTextList("setups")`.

## 2. Resumo do Dia — Finalizar Dia
- Migration nova: tabela `daily_summary` (conforme SQL do usuário) + grants/RLS.
- `src/lib/repos/dailySummaryRepo.ts` (list/upsertByDate).
- `src/lib/dayStats.ts`: calcula stats do dia a partir de `trades` (totais, gains/losses, assertividade, top setup, top error≠Nenhum, top sentiment≠Neutro, pontos).
- Novo `src/components/FinalizeDayModal.tsx` (Dialog) exibido ao clicar "Finalizar Dia". Campo `Textarea` para observação. Botões "Cancelar" e "Confirmar e Finalizar" (upsert no Supabase, toast de sucesso).
- Botão "Finalizar Dia" no header de `Index.tsx` fica desabilitado quando não há trades com data = hoje.

## 3. Metas (daily/weekly/monthly/assertividade/max loss)
- Migration: tabela `goals` (singleton — usaremos sempre o registro mais recente).
- `src/lib/repos/goalsRepo.ts` (`get`, `save` — upsert no único row).
- Novo `src/components/GoalsCard.tsx` exibido como card fixo no topo do `DashboardPage`:
  - Modo edição (lápis) → inputs numéricos.
  - Modo visualização → `Progress` por meta calculado contra trades filtrados (dia/semana/mês). Cor via classe dinâmica no indicador (`bg-green-500/bg-yellow-500/bg-destructive`) sem hardcodar tokens semânticos — variante via prop.
- Reaproveita `src/components/ui/progress.tsx` com prop `indicatorClassName` (pequena extensão local, mantendo compat).

## 4. Relatório exportável
- Novo botão "Gerar Relatório" no header da Home (próximo a "Finalizar Dia") com `DropdownMenu`: PDF / Excel.
- Modal `ReportModal` para escolher período (Mês atual / Personalizado).
- `src/lib/export/csv.ts` (CSV/Excel-compat usando `;` e header em PT-BR — sem nova dep).
- PDF via `jspdf` + `jspdf-autotable` (instalar). Inclui tabela de trades e mini-resumo (totais, assertividade, top erro, top sentimento). Gráficos = renderizar contagens em mini-tabelas (sem capturar canvas do Recharts para evitar complexidade).

## 5. Diário de Bordo
- Migration: tabela `journal`.
- `src/lib/repos/journalRepo.ts`.
- Nova página `src/components/JournalPage.tsx`: form (data auto, título, conteúdo `Textarea`, seleção de humor via 5 emojis 😄🙂😐🙁😫), lista de cards com `SortableList` + `EditableCard` (custom render). Exclusão com `ConfirmDeleteDialog`. Vinculação automática: ao salvar, busca `daily_summary` pela data e grava `daily_summary_id` se existir.
- Sidebar: adicionar item "Diário" (ícone `BookOpen`) e roteamento em `Index.tsx`.

## 6. Score de Disciplina
- `src/lib/disciplineScore.ts`: calcula score (0–100) a partir dos trades dos últimos 30 dias com pesos:
  - +2 por trade sem erro ("Nenhum"), +2 por sentimento "Neutro"
  - −3 por trade com erro ≠ Nenhum, −2 por sentimento negativo (Ansiedade, Medo, Ganância, Raiva, Euforia)
  - −5 por dia que excedeu max trades por dia (campo adicionado em `goals`: `max_daily_trades` — incluir na migration de goals).
  - Normalizar via base 50 + soma, clamp 0–100.
- Novo `src/components/DisciplineScoreCard.tsx` no Dashboard: anel/barra com cor e label (Iniciante 0–20, Em desenvolvimento 21–40, Consistente 41–70, Disciplinado 71–90, Exemplar 91–100). Clique abre Dialog com breakdown (lista de bonus/penalidades).

## 7. Alertas de Padrões
- `src/lib/insights.ts`: funções puras retornando insights:
  - Dia da semana com mais losses
  - Setup com menor assertividade (mín. 3 trades)
  - Sentimento predominante em dias de loss
  - Ativo com pior desempenho
  - Sequência atual de losses consecutivos (hoje)
  - (horário fica fora — `Trade.date` não tem hora; mencionar como TODO oculto)
- Novo `src/components/InsightsCard.tsx` no Dashboard, grade de cards com `Lightbulb`/`AlertTriangle` e texto.

## 8. Refatoração geral
- Extrair `formatCurrency`/`formatPercent` para `src/lib/format.ts` (já espalhado em Dashboard/Table) e usar nos novos componentes.
- Unificar cálculos repetidos (`dayStats`, agregações) em `src/lib/tradeAggregates.ts`.
- Garantir que `Index.tsx` permaneça enxuto (movendo header e modal de delete para subcomponentes se ficar grande demais).
- Verificar grants/RLS das 3 novas migrations.
- Build + smoke test via Playwright headless (abrir Home, abrir Dashboard, abrir Diário) para validar que nada quebra.

## Detalhes técnicos
- Migrations criadas via tool de migration do Supabase (3 migrations: `daily_summary`, `goals` com `max_daily_trades`, `journal`).
- Sem alterações em paleta/tokens; cores de progresso usam utilitários Tailwind já permitidos (`bg-green-500`, `bg-yellow-500`, `bg-destructive`) restritos ao componente de progresso — ok porque são semânticos de status, não de tema.
- Sem mudanças em rotas existentes.
- Nenhuma dependência nova além de `jspdf` + `jspdf-autotable`.

## Arquivos novos
`src/components/TradeFilters.tsx`, `FinalizeDayModal.tsx`, `GoalsCard.tsx`, `ReportModal.tsx`, `JournalPage.tsx`, `DisciplineScoreCard.tsx`, `InsightsCard.tsx`; `src/lib/filterTrades.ts`, `dayStats.ts`, `disciplineScore.ts`, `insights.ts`, `format.ts`, `tradeAggregates.ts`, `export/csv.ts`, `export/pdf.ts`; `src/lib/repos/dailySummaryRepo.ts`, `goalsRepo.ts`, `journalRepo.ts`.

## Arquivos alterados
`src/pages/Index.tsx` (filtros, finalizar dia, relatório, rota diário); `src/components/AppSidebar.tsx` (item Diário); `src/components/DashboardPage.tsx` (GoalsCard, DisciplineScoreCard, InsightsCard); `src/components/ui/progress.tsx` (prop `indicatorClassName`).
