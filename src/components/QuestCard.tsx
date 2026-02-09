import { useState } from "react";
import { Check, Circle, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface QuestProps {
    id: string;
    title: string;
    description?: string;
    reward: number;
    isCompleted: boolean;
    onComplete: (id: string) => void;
}

export const QuestCard = ({ id, title, description, reward, isCompleted, onComplete }: QuestProps) => {
    const [complete, setComplete] = useState(isCompleted);

    const handleComplete = () => {
        if (!complete) {
            setComplete(true);
            onComplete(id);
        }
    };

    return (
        <Card
            className={`border-border/50 bg-card/60 backdrop-blur-sm transition-all duration-300 ${complete ? "opacity-70 border-primary/20" : "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
                }`}
        >
            <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div
                        onClick={handleComplete}
                        className={`cursor-pointer w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${complete
                                ? "bg-primary border-primary text-primary-foreground scale-110"
                                : "border-muted-foreground/30 hover:border-primary/50"
                            }`}
                    >
                        {complete && <Check className="w-5 h-5" />}
                    </div>

                    <div className={`transition-all duration-300 ${complete ? "line-through text-muted-foreground" : ""}`}>
                        <h4 className="font-semibold text-foreground">{title}</h4>
                        {description && <p className="text-sm text-muted-foreground">{description}</p>}
                    </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                    <Swords className="w-3 h-3" />
                    <span>+{reward}</span>
                </div>
            </CardContent>
        </Card>
    );
};
