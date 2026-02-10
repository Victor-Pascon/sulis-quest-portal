import { Target, Coins, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

interface GoalCardProps {
    title: string;
    type: string;
    currentCount: number;
    targetCount: number;
    rewardAmount: number;
    isCompleted: boolean;
    onComplete?: () => void;
}

export const GoalCard = ({
    title,
    type,
    currentCount,
    targetCount,
    rewardAmount,
    isCompleted,
}: GoalCardProps) => {
    const progress = Math.min((currentCount / targetCount) * 100, 100);

    const typeLabels: Record<string, string> = {
        daily: "Diária",
        weekly: "Semanal",
        monthly: "Mensal",
    };

    const typeColors: Record<string, string> = {
        daily: "text-blue-400 bg-blue-400/10 border-blue-400/20",
        weekly: "text-purple-400 bg-purple-400/10 border-purple-400/20",
        monthly: "text-pink-400 bg-pink-400/10 border-pink-400/20",
    };

    return (
        <Card className={`glass-card transition-all duration-300 relative overflow-hidden ${isCompleted ? 'opacity-70 grayscale-[0.5]' : 'hover:glass-card-hover hover:scale-[1.02]'}`}>
            <CardContent className="p-5 space-y-4">
                <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${typeColors[type] || typeColors.daily}`}>
                                {typeLabels[type] || type}
                            </span>
                            {isCompleted && (
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-success/20 bg-success/10 text-success flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Concluída
                                </span>
                            )}
                        </div>
                        <h3 className="text-lg font-bold text-foreground leading-tight">
                            {title}
                        </h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                        <Target className={`w-5 h-5 ${isCompleted ? 'text-success' : 'text-primary'}`} />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="text-foreground">{currentCount} / {targetCount} quests</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>

                <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-secondary/10 border border-secondary/20">
                        <Coins className="w-4 h-4 text-secondary" />
                        <span className="text-sm font-bold text-secondary">+{rewardAmount} Sulis</span>
                    </div>
                    {!isCompleted && (
                        <span className="text-[10px] text-muted-foreground italic">
                            {targetCount - currentCount} restantes
                        </span>
                    )}
                </div>
            </CardContent>

            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        </Card>
    );
};
