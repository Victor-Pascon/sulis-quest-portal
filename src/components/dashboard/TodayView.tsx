import { Plus, Sparkles, Calendar, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { QuestCard } from "@/components/QuestCard";
import { useNavigate } from "react-router-dom";
import { isToday, parseISO } from "date-fns";

interface Quest {
    id: string;
    title: string;
    description: string;
    reward_amount: number;
    is_completed: boolean;
    created_at: string;
}

interface TodayViewProps {
    username: string | null;
    quests: Quest[];
    loading: boolean;
    onComplete: (id: string, reward: number) => void;
}

export const TodayView = ({ username, quests, loading, onComplete }: TodayViewProps) => {
    const navigate = useNavigate();

    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

    const todayQuests = quests.filter(q => isToday(parseISO(q.created_at)));
    const pendingQuests = todayQuests.filter(q => !q.is_completed);
    const completedQuests = todayQuests.filter(q => q.is_completed);

    const totalCount = todayQuests.length;
    const completedCount = completedQuests.length;
    const progressValue = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex justify-between items-start gap-4">
                <div className="space-y-1 flex-1">
                    <h1 className="text-3xl font-display font-bold text-foreground">
                        {greeting}, <span className="text-gradient-quest">{username || "Heroi"}</span>
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Foco total na jornada de hoje!
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => navigate("/quests/new")}
                        className="flex gap-2 bg-primary hover:bg-primary/90 glow-primary font-semibold shadow-lg shadow-primary/20 transition-all active:scale-95"
                        size="default"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="hidden xs:inline">Nova Quest</span>
                    </Button>
                    <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center border border-secondary/50 animate-pulse-glow">
                        <Sparkles className="w-5 h-5 text-secondary" />
                    </div>
                </div>
            </header>

            {/* Daily Progress */}
            <div className="space-y-3 glass-card p-5 rounded-2xl border border-white/10 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10" />
                <div className="flex justify-between text-sm font-bold relative z-10">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-foreground">Objetivo do Dia</span>
                    </div>
                    <span className="text-gradient-quest">{completedCount}/{totalCount} Quests</span>
                </div>
                <Progress value={progressValue} className="h-4 relative z-10" />
                <p className="text-xs text-muted-foreground text-center relative z-10 italic">
                    {progressValue === 100 ? "✨ Lendário! Todas as quests concluídas!" :
                        progressValue >= 75 ? "🔥 A vitória está próxima!" :
                            progressValue >= 50 ? "💪 No meio da batalha, continue firme!" :
                                progressValue > 0 ? "🚀 Primeiro passo dado!" : "⚔️ Desafie-se hoje!"}
                </p>
            </div>

            {/* Quests Lists */}
            <div className="space-y-8 pb-10">
                {/* Pending Section */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-lg font-bold flex items-center gap-2 text-foreground/90">
                            <Circle className="w-5 h-5 text-amber-500" />
                            Em espera / Pendentes
                            <span className="ml-1 text-xs bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full border border-amber-500/20">
                                {pendingQuests.length}
                            </span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {loading ? (
                            <>
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
                                ))}
                            </>
                        ) : pendingQuests.length > 0 ? (
                            pendingQuests.map(quest => (
                                <QuestCard
                                    key={quest.id}
                                    id={quest.id}
                                    title={quest.title}
                                    description={quest.description}
                                    reward={quest.reward_amount}
                                    isCompleted={quest.is_completed}
                                    onComplete={() => onComplete(quest.id, quest.reward_amount)}
                                />
                            ))
                        ) : (
                            <div className="text-center py-10 space-y-4 glass-card border-dashed border-white/10 rounded-2xl bg-white/0 col-span-full">
                                <p className="text-muted-foreground text-sm">Nenhuma quest pendente para hoje.</p>
                                {todayQuests.length === 0 && (
                                    <div className="flex justify-center">
                                        <Button variant="outline" size="sm" className="gap-2 border-white/10 hover:bg-white/5 text-xs" onClick={() => navigate("/quests/new")}>
                                            <Plus className="w-3.5 h-3.5" /> Criar Desafio
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>

                {/* Completed Section */}
                {completedQuests.length > 0 && (
                    <section className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-lg font-bold flex items-center gap-2 text-foreground/70">
                                <CheckCircle2 className="w-5 h-5 text-success" />
                                Finalizadas
                                <span className="ml-1 text-xs bg-success/10 text-success px-2 py-0.5 rounded-full border border-success/20">
                                    {completedQuests.length}
                                </span>
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-80 hover:opacity-100 transition-opacity">
                            {completedQuests.map(quest => (
                                <QuestCard
                                    key={quest.id}
                                    id={quest.id}
                                    title={quest.title}
                                    description={quest.description}
                                    reward={quest.reward_amount}
                                    isCompleted={quest.is_completed}
                                    onComplete={() => { }}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};
