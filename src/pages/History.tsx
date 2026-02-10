import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { CalendarDays, BarChart3, TrendingUp, Loader2, CheckCircle2 } from "lucide-react";
import { format, parseISO, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface CompletedQuest {
    id: string;
    title: string;
    description: string | null;
    reward_amount: number;
    completed_at: string;
}

const History = () => {
    const navigate = useNavigate();
    const [quests, setQuests] = useState<CompletedQuest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    useEffect(() => {
        fetchCompletedQuests();
    }, [navigate]);

    const fetchCompletedQuests = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate("/auth");
                return;
            }

            const { data, error } = await supabase
                .from("quests")
                .select("id, title, description, reward_amount, completed_at")
                .eq("user_id", user.id)
                .eq("is_completed", true)
                .not("completed_at", "is", null)
                .order("completed_at", { ascending: false });

            if (error) throw error;
            setQuests((data as CompletedQuest[]) || []);
        } catch (error) {
            console.error("Error fetching history:", error);
            toast.error("Erro ao carregar histórico.");
        } finally {
            setLoading(false);
        }
    };

    // Day view: quests completed on selected date
    const dayQuests = quests.filter(q => q.completed_at && isSameDay(parseISO(q.completed_at), selectedDate));

    // Month view: group by month
    const monthGroups = quests.reduce((acc, q) => {
        if (!q.completed_at) return acc;
        const key = format(parseISO(q.completed_at), "yyyy-MM");
        if (!acc[key]) acc[key] = [];
        acc[key].push(q);
        return acc;
    }, {} as Record<string, CompletedQuest[]>);

    // Year view: group by year
    const yearGroups = quests.reduce((acc, q) => {
        if (!q.completed_at) return acc;
        const key = format(parseISO(q.completed_at), "yyyy");
        if (!acc[key]) acc[key] = [];
        acc[key].push(q);
        return acc;
    }, {} as Record<string, CompletedQuest[]>);

    // Dates that have completed quests (for calendar highlighting)
    const completedDates = quests
        .filter(q => q.completed_at)
        .map(q => parseISO(q.completed_at));

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-quest-radial flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-quest-radial pb-24 font-sans">
            <main className="container max-w-5xl mx-auto px-4 pt-8 relative z-10">
                <header className="mb-8 space-y-1">
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                        <CalendarDays className="w-8 h-8 text-primary" />
                        Histórico
                    </h1>
                    <p className="text-muted-foreground text-sm">Suas conquistas ao longo do tempo.</p>
                </header>

                <Tabs defaultValue="day" className="w-full">
                    <div className="flex justify-center mb-8">
                        <TabsList className="grid w-full max-w-md grid-cols-3 p-1 bg-background/40 backdrop-blur-xl border border-white/10 rounded-2xl">
                            <TabsTrigger value="day" className="rounded-xl gap-2">
                                <CalendarDays className="w-4 h-4" />
                                <span className="font-bold">Dia</span>
                            </TabsTrigger>
                            <TabsTrigger value="month" className="rounded-xl gap-2">
                                <BarChart3 className="w-4 h-4" />
                                <span className="font-bold">Mês</span>
                            </TabsTrigger>
                            <TabsTrigger value="year" className="rounded-xl gap-2">
                                <TrendingUp className="w-4 h-4" />
                                <span className="font-bold">Ano</span>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Day View */}
                    <TabsContent value="day" className="mt-0 outline-none space-y-6">
                        <div className="flex justify-center">
                            <div className="glass-card rounded-2xl border border-white/10 p-4">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={(d) => d && setSelectedDate(d)}
                                    locale={ptBR}
                                    className={cn("p-3 pointer-events-auto")}
                                    modifiers={{ hasQuests: completedDates }}
                                    modifiersClassNames={{ hasQuests: "bg-primary/20 text-primary font-bold" }}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-lg font-bold text-foreground">
                                {format(selectedDate, "dd 'de' MMMM, yyyy", { locale: ptBR })}
                            </h3>
                            {dayQuests.length > 0 ? (
                                <div className="space-y-3">
                                    {dayQuests.map(q => (
                                        <div key={q.id} className="glass-card p-4 rounded-xl border border-white/10 flex items-center gap-4">
                                            <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-foreground">{q.title}</h4>
                                                {q.description && <p className="text-sm text-muted-foreground">{q.description}</p>}
                                            </div>
                                            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
                                                +{q.reward_amount} Sulis
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-sm text-center py-8">
                                    Nenhuma quest concluída neste dia.
                                </p>
                            )}
                        </div>
                    </TabsContent>

                    {/* Month View */}
                    <TabsContent value="month" className="mt-0 outline-none space-y-4">
                        {Object.keys(monthGroups).length > 0 ? (
                            Object.entries(monthGroups)
                                .sort(([a], [b]) => b.localeCompare(a))
                                .map(([key, monthQuests]) => (
                                    <div key={key} className="glass-card p-5 rounded-2xl border border-white/10 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-lg font-bold text-foreground capitalize">
                                                {format(parseISO(key + "-01"), "MMMM yyyy", { locale: ptBR })}
                                            </h3>
                                            <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                                                {monthQuests.length} quests
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <span>Total Sulis: </span>
                                            <span className="font-bold text-secondary">
                                                +{monthQuests.reduce((sum, q) => sum + q.reward_amount, 0)}
                                            </span>
                                        </div>
                                    </div>
                                ))
                        ) : (
                            <p className="text-muted-foreground text-sm text-center py-16">
                                Nenhuma quest concluída ainda.
                            </p>
                        )}
                    </TabsContent>

                    {/* Year View */}
                    <TabsContent value="year" className="mt-0 outline-none space-y-4">
                        {Object.keys(yearGroups).length > 0 ? (
                            Object.entries(yearGroups)
                                .sort(([a], [b]) => b.localeCompare(a))
                                .map(([year, yearQuests]) => (
                                    <div key={year} className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
                                        <h3 className="text-2xl font-bold text-foreground">{year}</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-background/30 rounded-xl p-4 text-center border border-white/5">
                                                <p className="text-3xl font-bold text-primary">{yearQuests.length}</p>
                                                <p className="text-xs text-muted-foreground mt-1">Quests Concluídas</p>
                                            </div>
                                            <div className="bg-background/30 rounded-xl p-4 text-center border border-white/5">
                                                <p className="text-3xl font-bold text-secondary">
                                                    {yearQuests.reduce((sum, q) => sum + q.reward_amount, 0)}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">Sulis Ganhos</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                        ) : (
                            <p className="text-muted-foreground text-sm text-center py-16">
                                Nenhuma quest concluída ainda.
                            </p>
                        )}
                    </TabsContent>
                </Tabs>
            </main>

            <BottomNav />
        </div>
    );
};

export default History;
