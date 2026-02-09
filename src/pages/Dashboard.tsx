import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TodayView } from "@/components/dashboard/TodayView";
import { MetricsView } from "@/components/dashboard/MetricsView";
import { LayoutDashboard, TrendingUp } from "lucide-react";

interface Quest {
  id: string;
  title: string;
  description: string;
  reward_amount: number;
  is_completed: boolean;
  created_at: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string | null>(null);
  const [sulisBalance, setSulisBalance] = useState(0);
  const [streak, setStreak] = useState(0);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

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
        .order('is_completed', { ascending: true })
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
        const { error: profileError } = await supabase
          .rpc('increment_balance', { amount: reward });

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
      fetchData();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-quest-radial pb-24 font-sans">
      <main className="container max-w-5xl mx-auto px-4 pt-8 relative z-10 transition-all duration-300">
        <Tabs defaultValue="today" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-2 p-1 bg-background/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              <TabsTrigger
                value="today"
                className="rounded-xl flex items-center gap-2 py-2.5 transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg active:scale-95"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="font-bold">Hoje</span>
              </TabsTrigger>
              <TabsTrigger
                value="metrics"
                className="rounded-xl flex items-center gap-2 py-2.5 transition-all data-[state=active]:bg-secondary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg active:scale-95"
              >
                <TrendingUp className="w-4 h-4" />
                <span className="font-bold">Métricas</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="today" className="mt-0 focus-visible:outline-none outline-none">
            <TodayView
              username={username}
              quests={quests}
              loading={loading}
              onComplete={handleCompleteQuest}
            />
          </TabsContent>

          <TabsContent value="metrics" className="mt-0 focus-visible:outline-none outline-none">
            <MetricsView
              quests={quests}
              sulisBalance={sulisBalance}
              streak={streak}
            />
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
