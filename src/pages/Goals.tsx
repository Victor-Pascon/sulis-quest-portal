import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { GoalCard } from "@/components/GoalCard";
import { GoalMetrics } from "@/components/dashboard/GoalMetrics";
import { toast } from "sonner";
import { Target, Loader2, Plus, LayoutDashboard, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

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

const Goals = () => {
    const navigate = useNavigate();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);

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
                                    <div key={goal.id} onClick={() => navigate(`/goals/edit/${goal.id}`)} className="cursor-pointer">
                                        <GoalCard
                                            title={goal.title}
                                            type={goal.type}
                                            currentCount={goal.current_count}
                                            targetCount={goal.target_count}
                                            rewardAmount={goal.reward_amount}
                                            isCompleted={goal.is_completed}
                                        />
                                    </div>
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
