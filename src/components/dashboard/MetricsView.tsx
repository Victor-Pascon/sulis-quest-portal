import { TrendingUp, CheckSquare, ListTodo, Trophy, Flame, Coins, CalendarDays } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, Cell, PieChart, Pie
} from 'recharts';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Quest {
    id: string;
    is_completed: boolean;
    reward_amount: number;
    created_at: string;
}

interface MetricsViewProps {
    quests: Quest[];
    sulisBalance: number;
    streak: number;
}

export const MetricsView = ({ quests, sulisBalance, streak }: MetricsViewProps) => {
    // 1. Basic Metrics
    const totalQuests = quests.length;
    const completedQuests = quests.filter(q => q.is_completed).length;
    const pendingQuests = totalQuests - completedQuests;
    const completionRate = totalQuests > 0 ? Math.round((completedQuests / totalQuests) * 100) : 0;

    // 2. Weekly Data (Last 7 days)
    const last7Days = eachDayOfInterval({
        start: subDays(new Date(), 6),
        end: new Date(),
    });

    const dailyData = last7Days.map(day => {
        const dayQuests = quests.filter(q => isSameDay(parseISO(q.created_at), day));
        return {
            name: format(day, 'EEE', { locale: ptBR }),
            completed: dayQuests.filter(q => q.is_completed).length,
            total: dayQuests.length,
        };
    });

    // 3. Status Distribution (Pie Chart Data)
    const statusData = [
        { name: 'Concluídas', value: completedQuests, color: 'hsl(var(--primary))' },
        { name: 'Pendentes', value: pendingQuests, color: 'hsl(var(--secondary))' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <header>
                <h1 className="text-3xl font-display font-bold text-foreground">
                    Métricas & <span className="text-gradient-quest">Insights</span>
                </h1>
                <p className="text-muted-foreground text-sm">Análise detalhada do seu desempenho épico.</p>
            </header>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatsCard title="Sulis" value={sulisBalance} icon={Coins} className="border-primary/20 glass-card" />
                <StatsCard title="Streak" value={streak} icon={Flame} description="dias" className="border-orange-500/20 glass-card" />
                <StatsCard title="Taxa %" value={completionRate} icon={TrendingUp} description="conclusão" className="border-success/20 glass-card" />
                <StatsCard title="Concluídas" value={completedQuests} icon={CheckSquare} className="border-secondary/20 glass-card" />
                <StatsCard title="Pendentes" value={pendingQuests} icon={ListTodo} className="border-amber-500/20 glass-card" />
                <StatsCard title="Total" value={totalQuests} icon={Trophy} className="border-white/10 glass-card" />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Progress Line Chart */}
                <div className="glass-card p-6 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-2 mb-6">
                        <CalendarDays className="w-5 h-5 text-primary" />
                        <h3 className="font-bold text-lg">Atividade nos últimos 7 dias</h3>
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={dailyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(15, 10, 20, 0.9)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                    itemStyle={{ color: 'hsl(var(--primary))' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="completed"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: 'hsl(var(--primary))' }}
                                    activeDot={{ r: 6, fill: 'hsl(var(--primary))', stroke: 'white' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Status Distribution Bar Chart */}
                <div className="glass-card p-6 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-2 mb-6">
                        <TrendingUp className="w-5 h-5 text-secondary" />
                        <h3 className="font-bold text-lg">Distribuição de Status</h3>
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dailyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                />
                                <YAxis axisLine={false} tickLine={false} hide />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                    contentStyle={{
                                        backgroundColor: 'rgba(15, 10, 20, 0.9)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px'
                                    }}
                                />
                                <Bar dataKey="total" fill="rgba(255,255,255,0.1)" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="completed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Statistics Table Style Summary */}
            <section className="glass-card p-8 rounded-2xl border border-white/10 space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-yellow-500" />
                    Recordes & Conquistas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                            <span className="text-muted-foreground">Total de Quests</span>
                            <span className="font-bold">{totalQuests}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                            <span className="text-muted-foreground">Média de Conclusão</span>
                            <span className="font-bold">{(completedQuests / (totalQuests || 1)).toFixed(1)} / quest</span>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                            <span className="text-muted-foreground">Nível de Herói</span>
                            <span className="font-bold text-primary">Nível {Math.floor(completedQuests / 10) + 1}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                            <span className="text-muted-foreground">Próxima Recompensa</span>
                            <span className="font-bold text-secondary">{10 - (completedQuests % 10)} quests</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
