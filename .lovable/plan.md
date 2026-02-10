

# Sulis Quest -- Implementacao Completa das Melhorias

## Visao Geral

Este plano implementa todas as 10 melhorias solicitadas, corrigindo os erros de build existentes e adicionando as novas funcionalidades.

---

## Fase 0: Correcao de Erros de Build

Tres erros precisam ser corrigidos antes de qualquer nova funcionalidade:

1. **Dashboard.tsx** - `increment_balance` nao existe como RPC no Supabase. Substituir por update direto na tabela `profiles`.
2. **Goals.tsx** - O tipo `Goal.type` esta definido como `'daily' | 'weekly' | 'monthly'` mas o Supabase retorna `string`. Ajustar a interface para usar `string` e fazer cast onde necessario.

---

## Fase 1: Migracao de Banco de Dados

Adicionar duas novas colunas a tabela `quests`:

```text
ALTER TABLE quests ADD COLUMN goal_id uuid REFERENCES goals(id) ON DELETE SET NULL;
ALTER TABLE quests ADD COLUMN completed_at timestamptz;
```

Criar a funcao RPC `increment_balance`:

```text
CREATE OR REPLACE FUNCTION increment_balance(user_id uuid, amount integer)
RETURNS void AS $$
  UPDATE profiles SET sulis_balance = COALESCE(sulis_balance, 0) + amount WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER;
```

---

## Fase 2: Logo na Tela de Auth

- Copiar a imagem `logo-site-sulis-quest_sem-fundo.png` para o projeto
- Em `Auth.tsx`, substituir o icone `<Sparkles>` pela imagem do logo (tamanho ~100x100)
- Aplicar o mesmo logo na pagina `Index.tsx` se utilizada

---

## Fase 3: Toggle de Quest (Desmarcar)

**Arquivos afetados:** `QuestCard.tsx`, `TodayView.tsx`, `Dashboard.tsx`

- `QuestCard` passa a aceitar `onUncomplete` como prop
- Ao clicar no circulo de uma quest ja concluida, chamar `onUncomplete`
- Em `Dashboard.tsx`, criar `handleUncompleteQuest` que:
  - Define `is_completed = false` e `completed_at = null` no Supabase
  - Subtrai a recompensa do `sulis_balance`
  - Decrementa `current_count` da meta vinculada (se houver `goal_id`)
- `TodayView` repassa o callback `onUncomplete` para as quests concluidas

---

## Fase 4: Opcao "Tarefa Unica" na Criacao de Quests

**Arquivo:** `QuestForm.tsx`

- Adicionar `"once"` (Unica) ao RadioGroup de frequencia, junto com daily/weekly/monthly
- O campo `category` no banco ja e `text`, entao aceita qualquer valor
- Atualizar o schema Zod para incluir `"once"`

---

## Fase 5: Metas Gerando Tarefas Automaticamente

**Arquivo:** `GoalForm.tsx`

- Ao criar uma meta, apos o insert na tabela `goals`, criar automaticamente N quests (N = `target_count`) vinculadas via `goal_id`
- Titulo das quests geradas: `"{titulo_da_meta} #{n}"`
- A categoria das quests segue o `type` da meta (daily, weekly, monthly)
- Em `Dashboard.tsx`, ao completar uma quest com `goal_id`, incrementar `current_count` somente da meta vinculada (nao de todas)

---

## Fase 6: Streak Diario

**Arquivo:** `Dashboard.tsx`

- No `handleCompleteQuest`, apos marcar a quest:
  - Buscar `last_active_date` do perfil
  - Se for ontem: incrementar `current_streak`, atualizar `last_active_date` para hoje
  - Se for hoje: nao fazer nada
  - Se for anterior a ontem: resetar `current_streak = 1`, atualizar data
- Ao desfazer quest: nao alterar o streak

---

## Fase 7: Pagina de Historico

**Novo arquivo:** `src/pages/History.tsx`

- Rota `/history` adicionada ao `App.tsx`
- Substituir "Recompensas" no `BottomNav` por "Historico" (icone `History`)
- Tres abas: **Dia**, **Mes**, **Ano**
  - **Dia**: Calendario Shadcn para selecionar data; lista quests concluidas naquela data (filtro por `completed_at`)
  - **Mes**: Cards agrupados por mes com contagem
  - **Ano**: Resumo anual com numeros
- Ao completar uma quest, gravar `completed_at = now()` na atualizacao

---

## Fase 8: Calendario e Relogio nos Formularios

**Arquivos:** `QuestForm.tsx`, `GoalForm.tsx`

- **Calendario**: Adicionar campo de data usando Shadcn Calendar + Popover para selecionar datas (inicio/fim da quest ou periodo da meta)
- **Relogio (TimePicker)**: Criar componente `TimePicker.tsx` com dois ScrollAreas (horas 00-23 e minutos 00-59) em Popover, substituindo o `<input type="time">`
- Ambos estilizados com o tema escuro do app

---

## Fase 9: Notificacoes de Lembrete

- No `Dashboard.tsx`, ao montar o componente, solicitar permissao de notificacao via `Notification.requestPermission()`
- Criar um `useEffect` com `setInterval` (a cada 60 segundos) que:
  - Busca quests com `reminder_active = true` e `reminder_time` correspondente ao horario atual
  - Dispara `new Notification(quest.title, { body: quest.description })`
- Funciona em desktop e PWA instalado

---

## Fase 10: PWA (Installable Web App)

- Instalar `vite-plugin-pwa`
- Configurar em `vite.config.ts` com manifest (nome "Sulis Quest", cores, icones do logo)
- Adicionar meta tags mobile no `index.html` (theme-color, apple-touch-icon, etc.)
- Criar pagina `/install` com instrucoes e botao para instalar (prompt `beforeinstallprompt`)
- Registrar Service Worker para cache offline

---

## Novos Arquivos

```text
src/pages/History.tsx
src/pages/InstallPWA.tsx
src/components/TimePicker.tsx
```

## Arquivos Modificados

```text
src/pages/Dashboard.tsx (fix build errors, streak, notifications, uncomplete)
src/pages/Goals.tsx (fix type error)
src/pages/Auth.tsx (logo)
src/pages/QuestForm.tsx (once option, calendar, timepicker)
src/pages/GoalForm.tsx (auto-generate quests, calendar)
src/components/QuestCard.tsx (toggle uncomplete)
src/components/dashboard/TodayView.tsx (pass uncomplete callback)
src/components/BottomNav.tsx (add History, remove Rewards)
src/App.tsx (new routes)
index.html (PWA meta tags)
vite.config.ts (PWA plugin)
```

## Ordem de Implementacao

1. Corrigir erros de build (Fase 0)
2. Migration do banco (Fase 1)
3. Logo (Fase 2)
4. Toggle quest (Fase 3)
5. Tarefa unica (Fase 4)
6. Metas gerando tarefas (Fase 5)
7. Streak (Fase 6)
8. Historico (Fase 7)
9. Calendario/Relogio (Fase 8)
10. Notificacoes (Fase 9)
11. PWA (Fase 10)

