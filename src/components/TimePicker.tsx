import { useState } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface TimePickerProps {
    value: string;
    onChange: (value: string) => void;
}

export const TimePicker = ({ value, onChange }: TimePickerProps) => {
    const [open, setOpen] = useState(false);

    const [hours, minutes] = value.split(":").map(Number);

    const handleHourClick = (h: number) => {
        onChange(`${String(h).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`);
    };

    const handleMinuteClick = (m: number) => {
        onChange(`${String(hours).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full justify-start gap-3 h-12 bg-background/50 border-white/10 hover:bg-background/70 text-lg font-mono"
                >
                    <Clock className="w-5 h-5 text-primary" />
                    <span>{value}</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0 bg-card border-white/10" align="start">
                <div className="flex divide-x divide-white/10">
                    {/* Hours */}
                    <div className="flex-1">
                        <div className="px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-white/10">
                            Hora
                        </div>
                        <ScrollArea className="h-48">
                            <div className="p-1">
                                {Array.from({ length: 24 }, (_, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => handleHourClick(i)}
                                        className={cn(
                                            "w-full text-center py-1.5 rounded-lg text-sm font-medium transition-colors",
                                            hours === i
                                                ? "bg-primary text-primary-foreground"
                                                : "text-foreground hover:bg-white/5"
                                        )}
                                    >
                                        {String(i).padStart(2, "0")}
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                    {/* Minutes */}
                    <div className="flex-1">
                        <div className="px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-white/10">
                            Min
                        </div>
                        <ScrollArea className="h-48">
                            <div className="p-1">
                                {Array.from({ length: 60 }, (_, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => handleMinuteClick(i)}
                                        className={cn(
                                            "w-full text-center py-1.5 rounded-lg text-sm font-medium transition-colors",
                                            minutes === i
                                                ? "bg-primary text-primary-foreground"
                                                : "text-foreground hover:bg-white/5"
                                        )}
                                    >
                                        {String(i).padStart(2, "0")}
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};
