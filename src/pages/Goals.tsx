import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { GoalCard } from "@/components/GoalCard";
import { GoalMetrics } from "@/components/dashboard/GoalMetrics";
import { QuestCard } from "@/components/QuestCard";
import { toast } from "sonner";
import { Target, Loader2, Plus, LayoutDashboard, TrendingUp, Pencil } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Goal {
    id: string;
    title: string;
    type: string;
    current_count: number;
    target_count: number;
    reward_amount: number;
    is_completed: boolean;
    user_id: string;
}

interface Quest {
    id: string;
    title: string;
    description: string | null;
    reward_amount: number | null;
    is_completed: boolean | null;
    goal_id: string | null;
}

const Goals = () => {
    const navigate = useNavigate();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);
    const [questsByGoal, setQuestsByGoal] = useState<Record<string, Quest[]>>({});
    const [loadingQuests, setLoadingQuests] = useState<string | null>(null);

    useEffect(() => {
        fetchGoals();
    }, [navigate]);

    const fetchGoals = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate("/auth");
                return;
            }

            const { data, error } = await supabase
                .from('goals')
                .select('*')
                .order('is_completed', { ascending: true })
                .order('created_at', { ascending: false });

            if (error) throw error;
            setGoals(data || []);
        } catch (error) {
            console.error("Error fetching goals:", error);
            toast.error("Erro ao carregar metas.");
        } finally {
            setLoading(false);
        }
    };

    const fetchQuestsForGoal = async (goalId: string) => {
        setLoadingQuests(goalId);
        try {
            const { data, error } = await supabase
                .from('quests')
                .select('*')
                .eq('goal_id', goalId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setQuestsByGoal(prev => ({ ...prev, [goalId]: data || [] }));
        } catch (error) {
            console.error("Error fetching quests:", error);
            toast.error("Erro ao carregar tarefas da meta.");
        } finally {
            setLoadingQuests(null);
        }
    };

    const toggleGoal = (goalId: string) => {
        if (expandedGoalId === goalId) {
            setExpandedGoalId(null);
        } else {
            setExpandedGoalId(goalId);
            if (!questsByGoal[goalId]) {
                fetchQuestsForGoal(goalId);
            }
        }
    };

    const handleCompleteQuest = async (questId: string) => {
        const goal = goals.find(g => questsByGoal[g.id]?.some(q => q.id === questId));
        if (!goal) return;

        const quest = questsByGoal[goal.id]?.find(q => q.id === questId);
        if (!quest) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Mark quest as completed
            const { error: questError } = await supabase
                .from('quests')
                .update({ is_completed: true, completed_at: new Date().toISOString() })
                .eq('id', questId);
            if (questError) throw questError;

            // Give quest reward
            const questReward = quest.reward_amount || 0;
            if (questReward > 0) {
                await supabase.rpc('increment_balance', { user_row_id: user.id, amount: questReward });
            }

            // Update goal progress
            const newCount = goal.current_count + 1;
            const goalCompleted = newCount >= goal.target_count;

            const { error: goalError } = await supabase
                .from('goals')
                .update({
                    current_count: newCount,
                    is_completed: goalCompleted,
                })
                .eq('id', goal.id);
            if (goalError) throw goalError;

            // If goal just completed, give goal bonus
            if (goalCompleted) {
                await supabase.rpc('increment_balance', { user_row_id: user.id, amount: goal.reward_amount });
                toast.success(`🎉 Meta "${goal.title}" concluída! +${goal.reward_amount} Sulis de bônus!`);
            }

            // Update local state
            setQuestsByGoal(prev => ({
                ...prev,
                [goal.id]: prev[goal.id].map(q =>
                    q.id === questId ? { ...q, is_completed: true } : q
                ),
            }));
            setGoals(prev => prev.map(g =>
                g.id === goal.id ? { ...g, current_count: newCount, is_completed: goalCompleted } : g
            ));
        } catch (error) {
            console.error("Error completing quest:", error);
            toast.error("Erro ao completar tarefa.");
        }
    };

    const handleUncompleteQuest = async (questId: string) => {
        const goal = goals.find(g => questsByGoal[g.id]?.some(q => q.id === questId));
        if (!goal) return;

        const quest = questsByGoal[goal.id]?.find(q => q.id === questId);
        if (!quest) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Unmark quest
            const { error: questError } = await supabase
                .from('quests')
                .update({ is_completed: false, completed_at: null })
                .eq('id', questId);
            if (questError) throw questError;

            // Subtract quest reward
            const questReward = quest.reward_amount || 0;
            if (questReward > 0) {
                await supabase.rpc('increment_balance', { user_row_id: user.id, amount: -questReward });
            }

            // If goal was completed, revert goal bonus too
            if (goal.is_completed) {
                await supabase.rpc('increment_balance', { user_row_id: user.id, amount: -goal.reward_amount });
                toast.info(`Bônus da meta "${goal.title}" revertido.`);
            }

            const newCount = Math.max(0, goal.current_count - 1);

            const { error: goalError } = await supabase
                .from('goals')
                .update({
                    current_count: newCount,
                    is_completed: false,
                })
                .eq('id', goal.id);
            if (goalError) throw goalError;

            // Update local state
            setQuestsByGoal(prev => ({
                ...prev,
                [goal.id]: prev[goal.id].map(q =>
                    q.id === questId ? { ...q, is_completed: false } : q
                ),
            }));
            setGoals(prev => prev.map(g =>
                g.id === goal.id ? { ...g, current_count: newCount, is_completed: false } : g
            ));
        } catch (error) {
            console.error("Error uncompleting quest:", error);
            toast.error("Erro ao desmarcar tarefa.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-quest-radial pb-24 font-sans">
            <main className="container max-w-5xl mx-auto px-4 pt-8 relative z-10">
                <header className="flex justify-between items-center mb-8">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                            <Target className="w-8 h-8 text-primary" />
                            Metas
                        </h1>
                        <p className="text-muted-foreground text-sm">Seus objetivos de longo prazo.</p>
                    </div>
                    <Button
                        onClick={() => navigate("/goals/new")}
                        className="rounded-xl gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="hidden sm:inline">Nova Meta</span>
                    </Button>
                </header>

                <Tabs defaultValue="list" className="w-full">
                    <div className="flex justify-center mb-8">
                        <TabsList className="grid w-full max-w-md grid-cols-2 p-1 bg-background/40 backdrop-blur-xl border border-white/10 rounded-2xl">
                            <TabsTrigger value="list" className="rounded-xl gap-2">
                                <LayoutDashboard className="w-4 h-4" />
                                <span className="font-bold">Objetivos</span>
                            </TabsTrigger>
                            <TabsTrigger value="stats" className="rounded-xl gap-2">
                                <TrendingUp className="w-4 h-4" />
                                <span className="font-bold">Progresso</span>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="list" className="mt-0 outline-none">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                                <p className="text-muted-foreground animate-pulse">Carregando seus desafios...</p>
                            </div>
                        ) : goals.length > 0 ? (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {goals.map((goal) => (
                                    <Collapsible
                                        key={goal.id}
                                        open={expandedGoalId === goal.id}
                                        onOpenChange={() => toggleGoal(goal.id)}
                                    >
                                        <CollapsibleTrigger asChild>
                                            <div className="cursor-pointer">
                                                <GoalCard
                                                    title={goal.title}
                                                    type={goal.type}
                                                    currentCount={goal.current_count}
                                                    targetCount={goal.target_count}
                                                    rewardAmount={goal.reward_amount}
                                                    isCompleted={goal.is_completed}
                                                    isExpanded={expandedGoalId === goal.id}
                                                />
                                            </div>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent className="mt-2 space-y-2 pl-2 border-l-2 border-primary/20">
                                            <div className="flex justify-end mb-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="gap-1 text-xs text-muted-foreground hover:text-foreground"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/goals/edit/${goal.id}`);
                                                    }}
                                                >
                                                    <Pencil className="w-3.5 h-3.5" /> Editar Meta
                                                </Button>
                                            </div>
                                            {loadingQuests === goal.id ? (
                                                <div className="flex items-center justify-center py-6">
                                                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                                </div>
                                            ) : questsByGoal[goal.id]?.length ? (
                                                questsByGoal[goal.id].map((quest) => (
                                                    <QuestCard
                                                        key={quest.id}
                                                        id={quest.id}
                                                        title={quest.title}
                                                        description={quest.description || undefined}
                                                        reward={quest.reward_amount || 0}
                                                        isCompleted={!!quest.is_completed}
                                                        onComplete={handleCompleteQuest}
                                                        onUncomplete={handleUncompleteQuest}
                                                    />
                                                ))
                                            ) : (
                                                <p className="text-sm text-muted-foreground text-center py-4">
                                                    Nenhuma tarefa vinculada a esta meta.
                                                </p>
                                            )}
                                        </CollapsibleContent>
                                    </Collapsible>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-background/20 backdrop-blur-md rounded-3xl border border-white/10">
                                <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                                    <Target className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground">Nenhuma meta ativa</h3>
                                <p className="text-muted-foreground max-w-xs mx-auto mt-2 mb-6">
                                    Você ainda não tem metas definidas. Comece criando seu primeiro objetivo épico!
                                </p>
                                <Button onClick={() => navigate("/goals/new")} variant="outline" className="border-white/10 hover:bg-white/5">
                                    Criar Minha Primeira Meta
                                </Button>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="stats" className="mt-0 outline-none">
                        <GoalMetrics goals={goals} />
                    </TabsContent>
                </Tabs>
            </main>

            <BottomNav />
        </div>
    );
};

export default Goals;
