import { Target, Trophy, TrendingUp, CheckCircle2, Clock } from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

interface Goal {
    id: string;
    title: string;
    type: 'daily' | 'weekly' | 'monthly';
    current_count: number;
    target_count: number;
    is_completed: boolean;
}

interface GoalMetricsProps {
    goals: Goal[];
}

export const GoalMetrics = ({ goals }: GoalMetricsProps) => {
    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.is_completed).length;
    const activeGoals = totalGoals - completedGoals;
    
    const typeDistribution = [
        { name: 'Diárias', value: goals.filter(g => g.type === 'daily').length, color: '#60A5FA' },
        { name: 'Semanais', value: goals.filter(g => g.type === 'weekly').length, color: '#A78BFA' },
        { name: 'Mensais', value: goals.filter(g => g.type === 'monthly').length, color: '#F472B6' },
    ].filter(d => d.value > 0);

    const completionData = [
        { name: 'Concluídas', value: completedGoals },
        { name: 'Em Progresso', value: activeGoals },
    ];

    const COLORS = ['hsl(var(--primary))', 'rgba(255,255,255,0.1)'];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard title="Total" value={totalGoals} icon={Target} color="text-primary" />
                <MetricCard title="Concluídas" value={completedGoals} icon={Trophy} color="text-yellow-500" />
                <MetricCard title="Ativas" value={activeGoals} icon={Clock} color="text-blue-400" />
                <MetricCard title="Taxa" value={`${totalGoals > 0 ? Math.round((completedGoals/totalGoals)*100) : 0}%`} icon={TrendingUp} color="text-success" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6 rounded-3xl border border-white/10">
                    <h3 className="font-bold mb-6 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary" /> Status de Conclusão
                    </h3>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={completionData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {completionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card p-6 rounded-3xl border border-white/10">
                    <h3 className="font-bold mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-secondary" /> Tipos de Metas
                    </h3>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={typeDistribution}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} />
                                <YAxis hide />
                                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }} />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {typeDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="glass-card p-4 rounded-2xl border border-white/5 flex items-center gap-4">
        <div className={`p-2 rounded-xl bg-white/5 border border-white/10 ${color}`}>
            <Icon className="w-5 h-5" />
        </div>
        <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{title}</p>
            <p className="text-xl font-display font-bold">{value}</p>
        </div>
    </div>
);