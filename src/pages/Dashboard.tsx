import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, TrendingUp, Coins, Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatsCard } from "@/components/StatsCard";
import { QuestCard } from "@/components/QuestCard";
import { BottomNav } from "@/components/BottomNav";
import { toast } from "sonner";

interface Quest {
  id: string;
  title: string;
  description: string;
  reward_amount: number;
  is_completed: boolean;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string | null>(null);
  const [sulisBalance, setSulisBalance] = useState(0);
  const [streak, setStreak] = useState(0);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  // Determine greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  useEffect(() => {
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Fetch Profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setUsername(profile.username);
        setSulisBalance(profile.sulis_balance || 0);
        setStreak(profile.current_streak || 0);
      }

      // Fetch Quests
      const { data: questData, error: questError } = await supabase
        .from('quests')
        .select('*')
        .eq('user_id', user.id)
        .order('is_completed', { ascending: true }) // Not completed first
        .order('created_at', { ascending: false });

      if (questError) throw questError;
      setQuests(questData || []);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteQuest = async (id: string, reward: number) => {
    try {
      // Optimistic Update
      setSulisBalance(prev => prev + reward);
      setQuests(prev => prev.map(q => q.id === id ? { ...q, is_completed: true } : q));
      toast.success(`Quest concluída! +${reward} Sulis`);

      // Database Update
      const { error: questError } = await supabase
        .from('quests')
        .update({ is_completed: true })
        .eq('id', id);

      if (questError) throw questError;

      // Update Profile Balance
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // We need to fetch the current balance from DB to be safe, or use an RPC function
        // For simplicity, we'll increment strictly based on what we think
        // Ideally: create an RPC function increment_balance(amount)
        const { error: profileError } = await supabase
          .rpc('increment_balance', { amount: reward }); // We need to create this RPC or do a fetch-update

        // Fallback if RPC doesn't exist yet (likely doesn't), do fetch-update
        if (profileError) {
          const { data: currentProfile } = await supabase.from('profiles').select('sulis_balance').eq('id', user.id).single();
          if (currentProfile) {
            await supabase.from('profiles').update({ sulis_balance: currentProfile.sulis_balance + reward }).eq('id', user.id);
          }
        }
      }

    } catch (error) {
      console.error("Error completing quest:", error);
      toast.error("Erro ao completar quest.");
      // Rollback optimistic update if needed
      fetchData();
    }
  };

  const completedToday = quests.filter(q => q.is_completed).length;
  const totalToday = quests.length;
  const progress = totalToday > 0 ? (completedToday / totalToday) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-quest-radial pb-20"> {/* Padding for bottom nav */}

      {/* Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-64 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

      <main className="container mx-auto px-4 pt-8 space-y-8 relative z-10">

        {/* Header */}
        <header className="flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-3xl font-display font-bold text-foreground">
              {greeting}, <span className="text-gradient-quest">{username || "Heroi"}</span>
            </h1>
            <p className="text-muted-foreground text-sm">
              Sua jornada continua. Vamos conquistar o dia!
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center border border-secondary/50 animate-pulse-glow">
            <Sparkles className="w-5 h-5 text-secondary" />
          </div>
        </header>

        {/* Stats Section */}
        <section className="space-y-4">
          {/* Daily Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span>Progresso Diário</span>
              <span>{completedToday}/{totalToday} Quests</span>
            </div>
            <Progress value={progress} className="h-3 bg-secondary/10" indicatorClassName="bg-gradient-quest" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatsCard
              title="Sulis"
              value={sulisBalance}
              icon={Coins}
              className="border-primary/20"
            />
            <StatsCard
              title="Streak"
              value={streak}
              icon={TrendingUp}
              description="dias"
              className="border-secondary/20"
            />
          </div>
        </section>

        {/* Quests Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Quests de Hoje
            </h2>
            <Button size="sm" variant="ghost" className="text-xs text-muted-foreground hover:text-primary">
              Ver todas
            </Button>
          </div>

          <div className="space-y-3">
            {loading ? (
              <p className="text-center text-muted-foreground py-8 animate-pulse">Carregando sua jornada...</p>
            ) : quests.length > 0 ? (
              quests.map(quest => (
                <QuestCard
                  key={quest.id}
                  id={quest.id}
                  title={quest.title}
                  description={quest.description}
                  reward={quest.reward_amount}
                  isCompleted={quest.is_completed}
                  onComplete={() => handleCompleteQuest(quest.id, quest.reward_amount)}
                />
              ))
            ) : (
              <div className="text-center py-8 space-y-4 border border-dashed border-border rounded-xl bg-card/30">
                <p className="text-muted-foreground">Nenhuma quest ativa.</p>
                <Button variant="outline" className="gap-2" onClick={() => navigate("/quests/new")}>
                  <Plus className="w-4 h-4" /> Adicionar Quest
                </Button>
              </div>
            )}
          </div>
        </section>

      </main>

      {/* Floating Action Button (Mobile) */}
      <Button
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full shadow-lg z-40 md:hidden bg-primary hover:bg-primary/90 glow-primary"
        size="icon"
        onClick={() => navigate("/quests/new")}
      >
        <Plus className="w-6 h-6" />
      </Button>

      <BottomNav />
    </div>
  );
};


export default Dashboard;
