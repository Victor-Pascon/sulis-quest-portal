import { LayoutDashboard, Target, Gift, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

export const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border/50 p-2 pb-6 md:pb-2 z-50">
            <div className="container max-w-md mx-auto flex justify-between items-center px-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className={`flex flex-col gap-1 h-auto ${isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'}`}
                    onClick={() => navigate('/dashboard')}
                >
                    <LayoutDashboard className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Jornada</span>
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    className={`flex flex-col gap-1 h-auto ${isActive('/goals') ? 'text-primary' : 'text-muted-foreground'}`}
                    onClick={() => navigate('/goals')} // Placeholder
                >
                    <Target className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Metas</span>
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    className={`flex flex-col gap-1 h-auto ${isActive('/rewards') ? 'text-primary' : 'text-muted-foreground'}`}
                    onClick={() => navigate('/rewards')} // Placeholder
                >
                    <Gift className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Recompensas</span>
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    className={`flex flex-col gap-1 h-auto ${isActive('/profile') ? 'text-primary' : 'text-muted-foreground'}`}
                    onClick={() => navigate('/profile')} // Placeholder
                >
                    <User className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Perfil</span>
                </Button>
            </div>
        </div>
    );
};
