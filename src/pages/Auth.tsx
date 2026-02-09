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
      // TODO: Integrate with Supabase Auth
      // const { error } = await supabase.auth.signInWithPassword({
      //   email: result.data.email,
      //   password: result.data.password,
      // });
      // if (error) throw error;

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
      // TODO: Integrate with Supabase Auth
      // const { error } = await supabase.auth.signUp({
      //   email: result.data.email,
      //   password: result.data.password,
      //   options: {
      //     emailRedirectTo: `${window.location.origin}/`,
      //     data: { username: result.data.username },
      //   },
      // });
      // if (error) throw error;

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

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    clearMessages();
    try {
      // TODO: Integrate with Supabase Auth
      // const { error } = await supabase.auth.signInWithOAuth({
      //   provider: "google",
      //   options: { redirectTo: `${window.location.origin}/dashboard` },
      // });
      // if (error) throw error;
      setMessage({ type: "error", text: "Conecte o Supabase para habilitar o login com Google." });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erro ao conectar com Google";
      setMessage({ type: "error", text: msg });
    } finally {
      setGoogleLoading(false);
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

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-3 text-muted-foreground">ou continue com</span>
                </div>
              </div>

              {/* Google Login */}
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="w-full h-12 rounded-xl border-border/50 bg-muted/20 hover:bg-muted/40 transition-all duration-300"
              >
                {googleLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Continuar com Google
                  </>
                )}
              </Button>
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
