import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Save, Trash2, Loader2 } from "lucide-react";
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

const formSchema = z.object({
    title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
    type: z.enum(["daily", "weekly", "monthly"]),
    target_count: z.string().transform((v) => parseInt(v, 10)),
    reward_amount: z.string().transform((v) => parseInt(v, 10)),
});

const GoalForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(!!id);

    const isEditMode = !!id;

    const form = useForm<any>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            type: "daily",
            target_count: "5",
            reward_amount: "50",
        },
    });

    useEffect(() => {
        if (id) {
            fetchGoal(id);
        }
    }, [id]);

    const fetchGoal = async (goalId: string) => {
        try {
            const { data, error } = await supabase
                .from("goals")
                .select("*")
                .eq("id", goalId)
                .single();

            if (error) throw error;

            if (data) {
                form.reset({
                    title: data.title,
                    type: data.type,
                    target_count: String(data.target_count),
                    reward_amount: String(data.reward_amount),
                });
            }
        } catch (error) {
            console.error("Error fetching goal:", error);
            toast.error("Erro ao carregar os dados da meta.");
            navigate("/goals");
        } finally {
            setFetching(false);
        }
    };

    const onSubmit = async (values: any) => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado");

            const goalData = {
                user_id: user.id,
                title: values.title,
                type: values.type,
                target_count: parseInt(values.target_count),
                reward_amount: parseInt(values.reward_amount),
            };

            let error;
            if (isEditMode) {
                const { error: updateError } = await supabase
                    .from("goals")
                    .update(goalData)
                    .eq("id", id);
                error = updateError;
            } else {
                // Create goal
                const { data: goalResult, error: insertError } = await supabase
                    .from("goals")
                    .insert([goalData])
                    .select()
                    .single();
                error = insertError;

                // Auto-generate quests for the new goal
                if (!insertError && goalResult) {
                    const targetCount = parseInt(values.target_count);
                    const questsToCreate = [];
                    for (let i = 1; i <= targetCount; i++) {
                        questsToCreate.push({
                            user_id: user.id,
                            title: `${values.title} #${i}`,
                            description: `Tarefa ${i} da meta: ${values.title}`,
                            category: values.type,
                            reward_amount: 1,
                            goal_id: goalResult.id,
                        });
                    }
                    const { error: questError } = await supabase
                        .from("quests")
                        .insert(questsToCreate);
                    if (questError) {
                        console.error("Error creating quests for goal:", questError);
                        toast.error("Meta criada, mas houve erro ao gerar as tarefas.");
                    }
                }
            }

            if (error) throw error;

            toast.success(isEditMode ? "Meta atualizada!" : "Nova meta criada com tarefas!");
            navigate("/goals");
        } catch (error) {
            console.error("Error saving goal:", error);
            toast.error("Erro ao salvar a meta.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const { error } = await supabase
                .from("goals")
                .delete()
                .eq("id", id);

            if (error) throw error;

            toast.success("Meta excluída com sucesso.");
            navigate("/goals");
        } catch (error) {
            console.error("Error deleting goal:", error);
            toast.error("Erro ao excluir a meta.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-quest-radial pb-8">
            <header className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-b border-white/5 z-50 p-4">
                <div className="container max-w-4xl mx-auto flex items-center justify-between">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <h1 className="text-xl font-bold">
                        {isEditMode ? "Editar Meta" : "Nova Meta"}
                    </h1>
                    <div className="w-10" />
                </div>
            </header>

            <main className="container max-w-2xl mx-auto pt-24 px-4">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">O que você quer atingir?</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Mestre da Hidratação" className="bg-background/50 border-white/10" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">Frequência da Meta</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="grid grid-cols-3 gap-4"
                                            >
                                                {["daily", "weekly", "monthly"].map((t) => (
                                                    <FormItem key={t}>
                                                        <FormControl>
                                                            <RadioGroupItem value={t} className="sr-only" />
                                                        </FormControl>
                                                        <FormLabel className={`
                                                            flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all
                                                            ${field.value === t ? 'border-primary bg-primary/10' : 'border-white/5 bg-white/5 hover:bg-white/10'}
                                                        `}>
                                                            <span className="text-xs font-bold capitalize">
                                                                {t === 'daily' ? 'Diária' : t === 'weekly' ? 'Semanal' : 'Mensal'}
                                                            </span>
                                                        </FormLabel>
                                                    </FormItem>
                                                ))}
                                            </RadioGroup>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="target_count"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">Qtd. Quests</FormLabel>
                                            <FormControl>
                                                <Input type="number" min="1" className="bg-background/50 border-white/10" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="reward_amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">Bônus Sulis</FormLabel>
                                            <FormControl>
                                                <Input type="number" min="1" className="bg-background/50 border-white/10" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button type="submit" className="w-full h-12 text-lg font-bold gap-2" disabled={loading}>
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                {isEditMode ? "Salvar Alterações" : "Criar Meta Épica"}
                            </Button>

                            {isEditMode && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button type="button" variant="destructive" className="w-full h-12 font-bold gap-2" disabled={loading}>
                                            <Trash2 className="w-5 h-5" /> Excluir Meta
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="glass-card border-white/10">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Esta ação não pode ser desfeita. Todo o progresso desta meta será perdido.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="bg-white/5 border-white/10">Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                                                Confirmar Exclusão
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

export default GoalForm;
