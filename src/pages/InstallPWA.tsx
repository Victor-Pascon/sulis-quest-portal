import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Smartphone, Monitor, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/BottomNav";
import logoImage from "@/assets/logo-sulis-quest.png";

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallPWA = () => {
    const navigate = useNavigate();
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        window.addEventListener("beforeinstallprompt", handler);

        // Check if already installed
        if (window.matchMedia("(display-mode: standalone)").matches) {
            setIsInstalled(true);
        }

        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
            setIsInstalled(true);
        }
        setDeferredPrompt(null);
    };

    return (
        <div className="min-h-screen bg-gradient-quest-radial pb-24 font-sans">
            <header className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-b border-white/5 z-50 p-4">
                <div className="container max-w-4xl mx-auto flex items-center justify-between">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <h1 className="text-xl font-bold">Instalar App</h1>
                    <div className="w-10" />
                </div>
            </header>

            <main className="container max-w-2xl mx-auto pt-24 px-4 space-y-8">
                <div className="text-center space-y-4">
                    <img src={logoImage} alt="Sulis Quest" className="w-24 h-24 mx-auto" />
                    <h2 className="text-3xl font-bold text-foreground">Sulis Quest</h2>
                    <p className="text-muted-foreground">
                        Instale o app no seu dispositivo para acesso rápido e notificações.
                    </p>
                </div>

                {isInstalled ? (
                    <div className="glass-card p-6 rounded-2xl border border-success/20 text-center space-y-3">
                        <p className="text-success font-bold text-lg">✅ App já instalado!</p>
                        <p className="text-muted-foreground text-sm">
                            O Sulis Quest já está no seu dispositivo.
                        </p>
                    </div>
                ) : deferredPrompt ? (
                    <div className="text-center">
                        <Button
                            onClick={handleInstall}
                            className="h-14 px-8 text-lg font-bold gap-3 bg-primary hover:bg-primary/90 glow-primary"
                        >
                            <Download className="w-6 h-6" />
                            Instalar Agora
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* iOS Instructions */}
                        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
                            <div className="flex items-center gap-3">
                                <Smartphone className="w-6 h-6 text-primary" />
                                <h3 className="font-bold text-lg">iPhone / iPad (Safari)</h3>
                            </div>
                            <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                                <li>Abra este site no <strong>Safari</strong></li>
                                <li>Toque no botão <Share className="w-4 h-4 inline" /> (Compartilhar)</li>
                                <li>Role para baixo e toque em <strong>"Adicionar à Tela Inicial"</strong></li>
                                <li>Toque em <strong>"Adicionar"</strong></li>
                            </ol>
                        </div>

                        {/* Android Instructions */}
                        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
                            <div className="flex items-center gap-3">
                                <Smartphone className="w-6 h-6 text-secondary" />
                                <h3 className="font-bold text-lg">Android (Chrome)</h3>
                            </div>
                            <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                                <li>Abra este site no <strong>Chrome</strong></li>
                                <li>Toque no menu <strong>⋮</strong> (três pontos)</li>
                                <li>Toque em <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong></li>
                                <li>Confirme a instalação</li>
                            </ol>
                        </div>

                        {/* Desktop Instructions */}
                        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
                            <div className="flex items-center gap-3">
                                <Monitor className="w-6 h-6 text-accent" />
                                <h3 className="font-bold text-lg">Desktop (Chrome/Edge)</h3>
                            </div>
                            <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                                <li>Clique no ícone de instalação <Download className="w-4 h-4 inline" /> na barra de endereço</li>
                                <li>Ou vá em Menu → <strong>"Instalar Sulis Quest"</strong></li>
                                <li>Confirme a instalação</li>
                            </ol>
                        </div>
                    </div>
                )}
            </main>

            <BottomNav />
        </div>
    );
};

export default InstallPWA;
