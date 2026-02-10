import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TodayView } from "@/components/dashboard/TodayView";
import { MetricsView } from "@/components/dashboard/MetricsView";
import { LayoutDashboard, TrendingUp } from "lucide-react";
import { format, subDays } from "date-fns";

interface Quest {
  id: string;
  title: string;
  description: string;
  reward_amount: number;
  is_completed: boolean;
  created_at: string;
  goal_id: string | null;
  completed_at: string | null;
  category: string | null;
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

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Notification reminder interval
  useEffect(() => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      quests.forEach((quest) => {
        if (
          !quest.is_completed &&
          (quest as any).reminder_active &&
          (quest as any).reminder_time
        ) {
          const reminderTime = String((quest as any).reminder_time).substring(0, 5);
          if (reminderTime === currentTime) {
            new Notification(`🔔 ${quest.title}`, {
              body: quest.description || "Hora de completar sua quest!",
              icon: "/favicon.ico",
            });
          }
        }
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [quests]);

  const fetchData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Fetch Profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        setUsername(profile.username);
        setSulisBalance(profile.sulis_balance || 0);
        setStreak(profile.current_streak || 0);
      }

      // Fetch Quests
      const { data: questData, error: questError } = await supabase
        .from("quests")
        .select("*")
        .eq("user_id", user.id)
        .order("is_completed", { ascending: true })
        .order("created_at", { ascending: false });

      if (questError) throw questError;
      setQuests((questData as Quest[]) || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  };

  const updateStreak = async (uid: string) => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("last_active_date, current_streak")
        .eq("id", uid)
        .single();

      if (!profile) return;

      const today = new Date();
      const todayStr = format(today, "yyyy-MM-dd");
      const lastActive = profile.last_active_date;

      if (lastActive === todayStr) {
        // Already counted today
        return;
      }

      const yesterdayStr = format(subDays(today, 1), "yyyy-MM-dd");
      let newStreak = 1;

      if (lastActive === yesterdayStr) {
        newStreak = (profile.current_streak || 0) + 1;
      }

      await supabase
        .from("profiles")
        .update({ current_streak: newStreak, last_active_date: todayStr })
        .eq("id", uid);

      setStreak(newStreak);
    } catch (error) {
      console.error("Error updating streak:", error);
    }
  };

  const handleCompleteQuest = async (id: string, reward: number) => {
    try {
      // Optimistic Update
      setSulisBalance((prev) => prev + reward);
      setQuests((prev) =>
        prev.map((q) =>
          q.id === id ? { ...q, is_completed: true, completed_at: new Date().toISOString() } : q
        )
      );
      toast.success(`Quest concluída! +${reward} Sulis`);

      // Database Update
      const { error: questError } = await supabase
        .from("quests")
        .update({ is_completed: true, completed_at: new Date().toISOString() })
        .eq("id", id);

      if (questError) throw questError;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Get the quest to check for goal_id
      const quest = quests.find((q) => q.id === id);

      // Increment Goal Progress only for linked goal
      if (quest?.goal_id) {
        const { data: goal } = await supabase
          .from("goals")
          .select("*")
          .eq("id", quest.goal_id)
          .single();

        if (goal && !goal.is_completed) {
          const newCount = goal.current_count + 1;
          const isNowCompleted = newCount >= goal.target_count;

          const updateData: any = { current_count: newCount };
          if (isNowCompleted) {
            updateData.is_completed = true;
            toast.success(
              `Meta Atingida: ${goal.title}! +${goal.reward_amount} Sulis extras! 🏆`
            );

            // Add goal reward
            const { data: cp } = await supabase
              .from("profiles")
              .select("sulis_balance")
              .eq("id", user.id)
              .single();
            if (cp) {
              await supabase
                .from("profiles")
                .update({
                  sulis_balance: (cp.sulis_balance || 0) + goal.reward_amount,
                })
                .eq("id", user.id);
              setSulisBalance((prev) => prev + goal.reward_amount);
            }
          }

          await supabase.from("goals").update(updateData).eq("id", goal.id);
        }
      }

      // Update Profile Balance for the quest reward
      const { data: currentProfile } = await supabase
        .from("profiles")
        .select("sulis_balance")
        .eq("id", user.id)
        .single();
      if (currentProfile) {
        await supabase
          .from("profiles")
          .update({
            sulis_balance: (currentProfile.sulis_balance || 0) + reward,
          })
          .eq("id", user.id);
      }

      // Update streak
      await updateStreak(user.id);
    } catch (error) {
      console.error("Error completing quest:", error);
      toast.error("Erro ao completar quest.");
      fetchData();
    }
  };

  const handleUncompleteQuest = async (id: string, reward: number) => {
    try {
      // Optimistic Update
      setSulisBalance((prev) => Math.max(0, prev - reward));
      setQuests((prev) =>
        prev.map((q) =>
          q.id === id ? { ...q, is_completed: false, completed_at: null } : q
        )
      );
      toast.info("Quest desmarcada.");

      // Database Update
      const { error: questError } = await supabase
        .from("quests")
        .update({ is_completed: false, completed_at: null })
        .eq("id", id);

      if (questError) throw questError;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const quest = quests.find((q) => q.id === id);

      // Decrement Goal Progress if linked
      if (quest?.goal_id) {
        const { data: goal } = await supabase
          .from("goals")
          .select("*")
          .eq("id", quest.goal_id)
          .single();

        if (goal) {
          const newCount = Math.max(0, goal.current_count - 1);
          await supabase
            .from("goals")
            .update({ current_count: newCount, is_completed: false })
            .eq("id", goal.id);
        }
      }

      // Subtract reward from balance
      const { data: currentProfile } = await supabase
        .from("profiles")
        .select("sulis_balance")
        .eq("id", user.id)
        .single();
      if (currentProfile) {
        await supabase
          .from("profiles")
          .update({
            sulis_balance: Math.max(0, (currentProfile.sulis_balance || 0) - reward),
          })
          .eq("id", user.id);
      }
    } catch (error) {
      console.error("Error uncompleting quest:", error);
      toast.error("Erro ao desmarcar quest.");
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

          <TabsContent
            value="today"
            className="mt-0 focus-visible:outline-none outline-none"
          >
            <TodayView
              username={username}
              quests={quests}
              loading={loading}
              onComplete={handleCompleteQuest}
              onUncomplete={handleUncompleteQuest}
            />
          </TabsContent>

          <TabsContent
            value="metrics"
            className="mt-0 focus-visible:outline-none outline-none"
          >
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
