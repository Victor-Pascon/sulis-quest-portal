

# Correcao e Melhoria do Sistema de Metas

## Problema Atual

1. **Sem forma de acompanhar progresso da meta**: Nao existe UI para marcar tarefas da meta como concluidas diretamente na pagina de metas
2. **Clique na meta navega para edicao**: Em vez disso, deveria expandir e mostrar as quests vinculadas
3. **Erro na edicao da meta**: Ja corrigido no ultimo diff (removido `user_id` do update)
4. **Recompensa da meta**: Deve ser dada somente ao completar TODAS as tarefas

## Solucao

### 1. Goals.tsx - Meta Expansivel com Quests

Reescrever a pagina de metas para que:
- Ao clicar numa meta, ela **expande** (usando Collapsible) mostrando suas quests vinculadas
- Cada quest pode ser marcada como concluida ali mesmo (reutilizando o QuestCard)
- Botao de editar fica dentro da area expandida (icone de lapis)
- Buscar quests vinculadas por `goal_id` ao expandir

### 2. Logica de Conclusao de Quest na Pagina de Metas

Criar funcoes `handleCompleteQuest` e `handleUncompleteQuest` em Goals.tsx que:
- Marcam/desmarcam a quest no banco (`is_completed`, `completed_at`)
- Atualizam `current_count` da meta vinculada
- **Recompensa Sulis da quest**: dada normalmente ao completar cada quest
- **Recompensa Sulis da meta (bonus)**: dada SOMENTE quando `current_count` atinge `target_count`
- Ao desmarcar: reverte tudo, incluindo `is_completed` da meta se necessario

### 3. GoalCard - Indicador Visual de Expansao

Adicionar icone de seta (ChevronDown/ChevronUp) no GoalCard para indicar que e clicavel/expansivel

---

## Detalhes Tecnicos

### Arquivos Modificados

- **src/pages/Goals.tsx**: Adicionar estado `expandedGoalId`, buscar quests por `goal_id`, renderizar QuestCards dentro de Collapsible, handlers de complete/uncomplete
- **src/components/GoalCard.tsx**: Adicionar prop `isExpanded` e icone de seta, botao de editar

### Fluxo de Dados

```text
Goals.tsx
  |-- fetchGoals() -> lista de metas
  |-- ao clicar meta -> expandedGoalId = goal.id
  |-- fetchQuestsForGoal(goal.id) -> quests vinculadas
  |-- QuestCard (complete/uncomplete)
       |-- atualiza quest.is_completed
       |-- atualiza goal.current_count
       |-- se current_count == target_count -> bonus Sulis
```

### Recompensas

- Cada quest completada: soma `quest.reward_amount` ao saldo
- Meta 100% completa: soma `goal.reward_amount` como bonus
- Desmarcar quest: subtrai `quest.reward_amount` e reverte progresso da meta

