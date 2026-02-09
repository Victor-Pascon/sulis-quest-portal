import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { GoalCard } from "@/components/GoalCard";
import { toast } from "sonner";
import { Target, Loader2 } from "lucide-react";

interface Goal {
    id: string;
    title: string;
    type: 'daily' | 'weekly' | 'monthly';
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
                .eq('user_id', user.id)
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
                <header className="mb-8 text-center">
                    <div className="inline-flex p-3 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
                        <Target className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground">Minhas Metas</h1>
                    <p className="text-muted-foreground mt-2">Conclua quests para atingir seus objetivos e ganhar Sulis extras!</p>
                </header>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        <p className="text-muted-foreground animate-pulse">Carregando seus desafios...</p>
                    </div>
                ) : goals.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {goals.map((goal) => (
                            <GoalCard
                                key={goal.id}
                                title={goal.title}
                                type={goal.type}
                                currentCount={goal.current_count}
                                targetCount={goal.target_count}
                                rewardAmount={goal.reward_amount}
                                isCompleted={goal.is_completed}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-background/20 backdrop-blur-md rounded-3xl border border-white/10">
                        <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                            <Target className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground">Nenhuma meta ativa</h3>
                        <p className="text-muted-foreground max-w-xs mx-auto mt-2">
                            Você ainda não tem metas definidas. Elas aparecerão aqui assim que forem criadas.
                        </p>
                    </div>
                )}
            </main>

            <BottomNav />
        </div>
    );
};

export default Goals;
