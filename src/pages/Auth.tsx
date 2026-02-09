import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Lock, User, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const loginSchema = z.object({
  email: z.string().trim().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

const signupSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "O nome de usuário deve ter pelo menos 3 caracteres")
    .max(30, "O nome de usuário deve ter no máximo 30 caracteres")
    .regex(/^[a-zA-Z0-9_]+$/, "Use apenas letras, números e underscore"),
  email: z.string().trim().email("Email inválido"),
  password: z
    .string()
    .min(6, "A senha deve ter pelo menos 6 caracteres")
    .max(72, "A senha deve ter no máximo 72 caracteres"),
});

type FieldErrors = Record<string, string>;

const Auth = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // Form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const clearMessages = () => {
    setMessage(null);
    setFieldErrors({});
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    const result = loginSchema.safeParse({ email: loginEmail, password: loginPassword });
    if (!result.success) {
      const errors: FieldErrors = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) errors[err.path[0] as string] = err.message;
      });
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: result.data.email,
        password: result.data.password,
      });
      if (error) throw error;

      setMessage({ type: "success", text: "Login realizado com sucesso!" });
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erro ao fazer login";
      setMessage({ type: "error", text: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    const result = signupSchema.safeParse({
      username: signupUsername,
      email: signupEmail,
      password: signupPassword,
    });
    if (!result.success) {
      const errors: FieldErrors = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) errors[err.path[0] as string] = err.message;
      });
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: result.data.email,
        password: result.data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { username: result.data.username },
        },
      });
      if (error) throw error;

      setMessage({
        type: "success",
        text: "Conta criada com sucesso! Verifique seu email para confirmar.",
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erro ao criar conta";
      if (msg.includes("already registered")) {
        setMessage({ type: "error", text: "Este email já está cadastrado. Tente fazer login." });
      } else {
        setMessage({ type: "error", text: msg });
      }
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-quest-radial flex items-center justify-center p-4">
      {/* Decorative orbs */}
      <div className="fixed top-20 left-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl animate-pulse-glow pointer-events-none" />
      <div className="fixed bottom-20 right-10 w-80 h-80 rounded-full bg-secondary/5 blur-3xl animate-pulse-glow pointer-events-none" style={{ animationDelay: "1.5s" }} />

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Logo & Tagline */}
        <header className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 animate-float">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-quest tracking-wide">
            Sulis Quest
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Transforme sua rotina em uma jornada épica
          </p>
        </header>

        {/* Auth Card */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl">
          <CardContent className="p-6 pt-6">
            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); clearMessages(); }}>
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50">
                <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Entrar
                </TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Cadastrar
                </TabsTrigger>
              </TabsList>



              {/* Feedback Messages */}
              {message && (
                <Alert
                  variant={message.type === "error" ? "destructive" : "default"}
                  className={`mb-4 ${message.type === "success" ? "border-success/50 bg-success/10 text-success" : ""}`}
                >
                  <AlertDescription>{message.text}</AlertDescription>
                </Alert>
              )}

              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-foreground/80">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="pl-10 bg-muted/30 border-border/50 rounded-xl h-12 focus-visible:ring-primary/50 placeholder:text-muted-foreground/50"
                      />
                    </div>
                    {fieldErrors.email && (
                      <p className="text-sm text-destructive">{fieldErrors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-foreground/80">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-10 bg-muted/30 border-border/50 rounded-xl h-12 focus-visible:ring-primary/50 placeholder:text-muted-foreground/50"
                      />
                    </div>
                    {fieldErrors.password && (
                      <p className="text-sm text-destructive">{fieldErrors.password}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-xl text-base font-semibold bg-primary hover:bg-primary/90 glow-primary hover:glow-primary-hover transition-all duration-300"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Entrar na Aventura"
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Signup Tab */}
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-username" className="text-foreground/80">Nome de Usuário</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-username"
                        type="text"
                        placeholder="heroi_epico"
                        value={signupUsername}
                        onChange={(e) => setSignupUsername(e.target.value)}
                        className="pl-10 bg-muted/30 border-border/50 rounded-xl h-12 focus-visible:ring-primary/50 placeholder:text-muted-foreground/50"
                      />
                    </div>
                    {fieldErrors.username && (
                      <p className="text-sm text-destructive">{fieldErrors.username}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-foreground/80">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="pl-10 bg-muted/30 border-border/50 rounded-xl h-12 focus-visible:ring-primary/50 placeholder:text-muted-foreground/50"
                      />
                    </div>
                    {fieldErrors.email && (
                      <p className="text-sm text-destructive">{fieldErrors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-foreground/80">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="pl-10 bg-muted/30 border-border/50 rounded-xl h-12 focus-visible:ring-primary/50 placeholder:text-muted-foreground/50"
                      />
                    </div>
                    {fieldErrors.password && (
                      <p className="text-sm text-destructive">{fieldErrors.password}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-xl text-base font-semibold bg-primary hover:bg-primary/90 glow-primary hover:glow-primary-hover transition-all duration-300"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Criar Conta"
                    )}
                  </Button>
                </form>
              </TabsContent>

            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground/60">
          Ao continuar, você concorda com os Termos de Uso e Política de Privacidade.
        </p>
      </div>
    </div>
  );
};

export default Auth;
