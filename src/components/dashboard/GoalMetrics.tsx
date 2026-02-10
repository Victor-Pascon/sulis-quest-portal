import { TrendingUp, Target, Trophy, PieChart as PieIcon, BarChart as BarIcon } from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

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

interface GoalMetricsProps {
    goals: Goal[];
}

export const GoalMetrics = ({ goals }: GoalMetricsProps) => {
    // 1. Basic Stats
    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.is_completed).length;
    const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

    // 2. Stats by Type
    const goalsByType = {
        daily: goals.filter(g => g.type === 'daily'),
        weekly: goals.filter(g => g.type === 'weekly'),
        monthly: goals.filter(g => g.type === 'monthly'),
    };

    const typeData = [
        { name: 'Diárias', completed: goalsByType.daily.filter(g => g.is_completed).length, total: goalsByType.daily.length },
        { name: 'Semanais', completed: goalsByType.weekly.filter(g => g.is_completed).length, total: goalsByType.weekly.length },
        { name: 'Mensais', completed: goalsByType.monthly.filter(g => g.is_completed).length, total: goalsByType.monthly.length },
    ];

    // 3. Pie Chart Data
    const pieData = [
        { name: 'Concluídas', value: completedGoals, color: 'hsl(var(--primary))' },
        { name: 'Pendentes', value: totalGoals - completedGoals, color: 'rgba(255,255,255,0.1)' },
    ];

    // 4. Progress data for Bar Chart (by type)
    const progressData = typeData.map(item => ({
        name: item.name,
        progresso: item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0,
    }));

    if (totalGoals === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mb-4 border border-white/5">
                    <TrendingUp className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Sem dados para exibir</h3>
                <p className="text-muted-foreground max-w-xs mx-auto mt-2">
                    Crie algumas metas para ver a análise do seu progresso aqui!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card p-6 rounded-2xl border border-primary/20 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground mb-1">Média de Conclusão</p>
                        <h3 className="text-3xl font-bold text-primary">{completionRate}%</h3>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                        <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                </div>

                <div className="glass-card p-6 rounded-2xl border border-secondary/20 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground mb-1">Metas Concluídas</p>
                        <h3 className="text-3xl font-bold text-secondary">{completedGoals} / {totalGoals}</h3>
                    </div>
                    <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center border border-secondary/20">
                        <Trophy className="w-6 h-6 text-secondary" />
                    </div>
                </div>

                <div className="glass-card p-6 rounded-2xl border border-white/10 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground mb-1">Metas Ativas</p>
                        <h3 className="text-3xl font-bold text-foreground">{totalGoals - completedGoals}</h3>
                    </div>
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                        <Target className="w-6 h-6 text-muted-foreground" />
                    </div>
                </div>
            </div>

            {/* Charts List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Progress by Type Bar Chart */}
                <div className="glass-card p-6 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-2 mb-6">
                        <BarIcon className="w-5 h-5 text-primary" />
                        <h3 className="font-bold text-lg">Progresso por Tipo (%)</h3>
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={progressData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                />
                                <YAxis
                                    domain={[0, 100]}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{
                                        backgroundColor: 'rgba(15, 10, 20, 0.9)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                    itemStyle={{ color: 'hsl(var(--primary))' }}
                                />
                                <Bar dataKey="progresso" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Global Distribution Pie Chart */}
                <div className="glass-card p-6 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-2 mb-6">
                        <PieIcon className="w-5 h-5 text-secondary" />
                        <h3 className="font-bold text-lg">Status Geral</h3>
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(15, 10, 20, 0.9)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center gap-6 mt-2">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-primary" />
                                <span className="text-xs text-muted-foreground">{completedGoals} Concluídas</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-white/10" />
                                <span className="text-xs text-muted-foreground">{totalGoals - completedGoals} Pendentes</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
