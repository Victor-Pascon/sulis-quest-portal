import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Sparkles, Swords, Trophy, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Dashboard = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

      if (data && !error) {
        setUsername(data.username);
      } else {
        // Fallback or handle error silently
        console.error("Error fetching profile:", error);
      }
    };

    getProfile();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-quest-radial">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-display font-bold text-gradient-quest">Sulis Quest</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="space-y-3">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gradient-quest">
              Bem-vindo, {username || "Aventureiro"}!
            </h2>
            <p className="text-muted-foreground text-lg">
              Sua jornada épica começa agora. Prepare-se para conquistar suas metas!
            </p>
          </div>

          {/* Placeholder Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
              <CardContent className="p-6 text-center space-y-2">
                <Swords className="w-8 h-8 text-primary mx-auto" />
                <h3 className="font-semibold text-foreground">Missões</h3>
                <p className="text-sm text-muted-foreground">Em breve</p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
              <CardContent className="p-6 text-center space-y-2">
                <Trophy className="w-8 h-8 text-secondary mx-auto" />
                <h3 className="font-semibold text-foreground">Conquistas</h3>
                <p className="text-sm text-muted-foreground">Em breve</p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
              <CardContent className="p-6 text-center space-y-2">
                <Target className="w-8 h-8 text-primary mx-auto" />
                <h3 className="font-semibold text-foreground">Metas</h3>
                <p className="text-sm text-muted-foreground">Em breve</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
