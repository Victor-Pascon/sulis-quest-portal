import { useState, type MouseEvent } from "react";
import { Check, Swords } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface QuestProps {
    id: string;
    title: string;
    description?: string;
    reward: number;
    isCompleted: boolean;
    onComplete: (id: string) => void;
    onUncomplete?: (id: string) => void;
}

export const QuestCard = ({ id, title, description, reward, isCompleted, onComplete, onUncomplete }: QuestProps) => {
    const [complete, setComplete] = useState(isCompleted);
    const navigate = useNavigate();

    const handleToggle = (e: MouseEvent) => {
        e.stopPropagation();
        if (complete) {
            setComplete(false);
            onUncomplete?.(id);
        } else {
            setComplete(true);
            onComplete(id);
        }
    };

    return (
        <Card
            className={`glass-card transition-all duration-300 cursor-pointer ${complete
                    ? "opacity-60 border-primary/20"
                    : "hover:glass-card-hover hover:shadow-xl hover:shadow-primary/10 hover:scale-[1.02]"
                }`}
            onClick={() => navigate(`/quests/edit/${id}`)}
        >
            <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div
                        onClick={handleToggle}
                        className={`cursor-pointer w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${complete
                                ? "bg-gradient-to-br from-primary to-secondary border-primary text-primary-foreground scale-110 glow-primary"
                                : "border-muted-foreground/30 hover:border-primary/70 hover:bg-primary/10"
                            }`}
                        title={complete ? "Clique para desmarcar" : "Clique para concluir"}
                    >
                        {complete && <Check className="w-5 h-5" />}
                    </div>

                    <div className={`transition-all duration-300 ${complete ? "line-through text-muted-foreground" : ""}`}>
                        <h4 className="font-semibold text-foreground text-base">{title}</h4>
                        {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
                    </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-primary bg-gradient-to-r from-primary/20 to-secondary/20 px-3 py-1.5 rounded-full border border-primary/30">
                    <Swords className="w-3.5 h-3.5" />
                    <span>+{reward}</span>
                </div>
            </CardContent>
        </Card>
    );
};
