import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Swords, Trash2, Bell, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    RadioGroup,
    RadioGroupItem
} from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { TimePicker } from "@/components/TimePicker";

const formSchema = z.object({
    title: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
    description: z.string().optional(),
    category: z.enum(["daily", "weekly", "monthly", "once"]),
    reward_amount: z.string(),
    reminder_active: z.boolean().default(false),
    reminder_time: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const QuestForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(!!id);

    const isEditMode = !!id;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            category: "daily",
            reward_amount: "1",
            reminder_active: false,
            reminder_time: "08:00",
        },
    });

    const rewardValue = form.watch("reward_amount");

    useEffect(() => {
        if (id) {
            fetchQuest(id);
        }
    }, [id]);

    const fetchQuest = async (questId: string) => {
        try {
            const { data, error } = await supabase
                .from("quests")
                .select("*")
                .eq("id", questId)
                .single();

            if (error) throw error;

            if (data) {
                form.reset({
                    title: data.title,
                    description: data.description || "",
                    category: (data.category as any) || "daily",
                    reward_amount: String(data.reward_amount || 1),
                    reminder_active: data.reminder_active || false,
                    reminder_time: data.reminder_time?.substring(0, 5) || "08:00",
                });
            }
        } catch (error) {
            console.error("Error fetching quest:", error);
            toast.error("Erro ao carregar os dados da quest.");
            navigate("/dashboard");
        } finally {
            setFetching(false);
        }
    };

    const onSubmit = async (values: FormValues) => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado");

            const questData = {
                user_id: user.id,
                title: values.title,
                description: values.description,
                category: values.category,
                reward_amount: parseInt(values.reward_amount),
                reminder_active: values.reminder_active,
                reminder_time: values.reminder_active ? values.reminder_time : null,
            };

            let error;
            if (isEditMode) {
                const { error: updateError } = await supabase
                    .from("quests")
                    .update(questData)
                    .eq("id", id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from("quests")
                    .insert([questData]);
                error = insertError;
            }

            if (error) throw error;

            toast.success(isEditMode ? "Quest atualizada!" : "Nova quest criada!");
            navigate("/dashboard");
        } catch (error) {
            console.error("Error saving quest:", error);
            toast.error("Erro ao salvar a quest.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const { error } = await supabase
                .from("quests")
                .delete()
                .eq("id", id);

            if (error) throw error;

            toast.success("Quest excluída com sucesso.");
            navigate("/dashboard");
        } catch (error) {
            console.error("Error deleting quest:", error);
            toast.error("Erro ao excluir a quest.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-muted-foreground animate-pulse">Carregando quest...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-quest-radial pb-8">
            <header className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-b border-white/5 z-50 p-4">
                <div className="container max-w-4xl mx-auto flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(-1)}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <h1 className="text-xl font-bold text-foreground">
                        {isEditMode ? "Editar Quest" : "Nova Quest"}
                    </h1>
                    <div className="w-10" />
                </div>
            </header>

            <main className="container max-w-4xl mx-auto pt-24 px-4">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                        {/* Basic Info Card */}
                        <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-muted-foreground text-xs uppercase tracking-wider">Nome da Quest</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ex: Beber 2L de água"
                                                className="bg-background/50 border-white/10 h-12 text-lg focus:border-primary/50 transition-all"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-muted-foreground text-xs uppercase tracking-wider">Descrição (Opcional)</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ex: Manter-se hidratado durante o treino"
                                                className="bg-background/50 border-white/10 focus:border-primary/50"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Config Card */}
                        <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl space-y-8">
                            {/* Category Selection */}
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem className="space-y-4">
                                        <FormLabel className="text-muted-foreground text-xs uppercase tracking-wider">Frequência</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="grid grid-cols-4 gap-3"
                                            >
                                                {[
                                                    { id: "daily", label: "Diária" },
                                                    { id: "weekly", label: "Semanal" },
                                                    { id: "monthly", label: "Mensal" },
                                                    { id: "once", label: "Única" },
                                                ].map((opt) => (
                                                    <FormItem key={opt.id}>
                                                        <FormControl>
                                                            <RadioGroupItem
                                                                value={opt.id}
                                                                className="sr-only"
                                                            />
                                                        </FormControl>
                                                        <FormLabel className={`
                                                            flex items-center justify-center h-10 rounded-xl border-2 cursor-pointer transition-all text-sm font-medium
                                                            ${field.value === opt.id
                                                                ? 'bg-primary/20 border-primary text-primary shadow-lg shadow-primary/20'
                                                                : 'bg-background/30 border-white/5 text-muted-foreground hover:bg-background/50'}
                                                        `}>
                                                            {opt.label}
                                                        </FormLabel>
                                                    </FormItem>
                                                ))}
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Reward Selection */}
                            <FormField
                                control={form.control}
                                name="reward_amount"
                                render={({ field }) => (
                                    <FormItem className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <FormLabel className="text-muted-foreground text-xs uppercase tracking-wider">Recompensa</FormLabel>
                                            <div className="flex items-center gap-1.5 text-primary bg-primary/20 px-3 py-1 rounded-full animate-pulse-glow">
                                                <Sparkles className="w-4 h-4" />
                                                <span className="text-sm font-bold">+{rewardValue} Sulis</span>
                                            </div>
                                        </div>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="grid grid-cols-3 gap-4"
                                            >
                                                {["1", "2", "3"].map((val) => (
                                                    <FormItem key={val}>
                                                        <FormControl>
                                                            <RadioGroupItem
                                                                value={val}
                                                                className="sr-only"
                                                            />
                                                        </FormControl>
                                                        <FormLabel className={`
                                                            flex flex-col items-center justify-center py-4 rounded-xl border-2 cursor-pointer transition-all
                                                            ${field.value === val
                                                                ? 'bg-secondary/20 border-secondary text-secondary shadow-lg shadow-secondary/20 scale-105'
                                                                : 'bg-background/30 border-white/5 text-muted-foreground hover:bg-background/50'}
                                                        `}>
                                                            <Swords className="w-5 h-5 mb-1" />
                                                            <span className="text-lg font-bold">{val}</span>
                                                        </FormLabel>
                                                    </FormItem>
                                                ))}
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Reminder Card */}
                        <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Bell className="w-4 h-4 text-muted-foreground" />
                                        <span className="font-semibold text-foreground">Lembrete</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Ser notificado para não esquecer.</p>
                                </div>
                                <FormField
                                    control={form.control}
                                    name="reminder_active"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    className="data-[state=checked]:bg-primary"
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {form.watch("reminder_active") && (
                                <FormField
                                    control={form.control}
                                    name="reminder_time"
                                    render={({ field }) => (
                                        <FormItem className="animate-in slide-in-from-top-2 duration-300">
                                            <FormLabel className="text-muted-foreground text-xs uppercase tracking-wider">Horário do Lembrete</FormLabel>
                                            <FormControl>
                                                <TimePicker
                                                    value={field.value || "08:00"}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-4">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 rounded-2xl text-lg font-bold bg-primary hover:bg-primary/90 glow-primary transition-all active:scale-[0.98]"
                            >
                                {loading ? "Salvando..." : (
                                    <div className="flex items-center gap-2">
                                        <Save className="w-5 h-5" />
                                        {isEditMode ? "Atualizar Quest" : "Começar Quest"}
                                    </div>
                                )}
                            </Button>

                            {isEditMode && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Excluir Quest
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-card border-white/10 text-foreground">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                            <AlertDialogDescription className="text-muted-foreground">
                                                Esta ação não pode ser desfeita. Isso excluirá permanentemente a quest.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="bg-background border-white/10">Cancelar</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={handleDelete}
                                                className="bg-destructive text-white hover:bg-destructive/90"
                                            >
                                                Excluir
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </div>

                    </form>
                </Form>
            </main>
        </div>
    );
};

export default QuestForm;
