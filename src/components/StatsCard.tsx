import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    className?: string; // Allow custom styling
}

export const StatsCard = ({ title, value, icon: Icon, description, className }: StatsCardProps) => {
    return (
        <Card className={`border-border/50 bg-card/60 backdrop-blur-sm ${className}`}>
            <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                    <Icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-bold text-foreground">{value}</h3>
                        {description && <span className="text-xs text-muted-foreground">{description}</span>}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
