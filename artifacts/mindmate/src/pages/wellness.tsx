import { useEffect, useState } from "react";
import { 
  useGetDailyAffirmation, 
  useListWellnessExercises, 
  useListGratitudeEntries, 
  useCreateGratitudeEntry,
  getListGratitudeEntriesQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Wind, Heart, Star, CheckCircle2 } from "lucide-react";

export default function WellnessPage() {
  const { data: affirmation, isLoading: loadingAff } = useGetDailyAffirmation();
  const { data: gratitudeEntries, isLoading: loadingGratitude } = useListGratitudeEntries();
  const createGratitude = useCreateGratitudeEntry();
  
  const [gratitudeText, setGratitudeText] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleGratitudeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gratitudeText.trim()) return;

    createGratitude.mutate(
      { data: { text: gratitudeText } },
      {
        onSuccess: () => {
          toast({ title: "Added to your gratitude journal", description: "Focusing on the good helps rewire your brain." });
          setGratitudeText("");
          queryClient.invalidateQueries({ queryKey: getListGratitudeEntriesQueryKey() });
        }
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Wellness Tools</h1>
        <p className="text-muted-foreground mt-1 text-lg">Simple exercises to bring you back to center.</p>
      </div>

      {/* Daily Affirmation */}
      <section>
        <Card className="rounded-3xl border-0 shadow-lg bg-gradient-to-br from-primary/80 to-secondary/80 overflow-hidden relative text-white">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <CardContent className="p-8 sm:p-12 text-center relative z-10">
            <Sparkles className="w-8 h-8 mx-auto mb-6 text-white/80" />
            <h2 className="text-sm font-medium tracking-widest uppercase mb-4 text-white/80">Daily Affirmation</h2>
            {loadingAff ? (
              <Skeleton className="h-8 w-3/4 mx-auto bg-white/20" />
            ) : (
              <p className="text-2xl sm:text-3xl font-serif leading-tight">
                "{affirmation?.text || "I am exactly where I need to be right now."}"
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Breathing Exercise */}
        <section>
          <Card className="rounded-3xl border-border/50 shadow-sm h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wind className="w-5 h-5 text-blue-500" />
                Box Breathing
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center p-8">
              <BreathingOrb />
              <p className="text-center text-muted-foreground mt-8 text-sm max-w-[200px]">
                Follow the circle. Breathe in as it expands, hold, and breathe out as it shrinks.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Gratitude Journal */}
        <section>
          <Card className="rounded-3xl border-border/50 shadow-sm h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" />
                Gratitude Log
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <form onSubmit={handleGratitudeSubmit} className="mb-6 flex gap-2">
                <Input 
                  placeholder="What are you grateful for today?"
                  value={gratitudeText}
                  onChange={(e) => setGratitudeText(e.target.value)}
                  className="rounded-full bg-muted/30 border-border/50 focus-visible:ring-primary/30"
                />
                <Button type="submit" disabled={!gratitudeText.trim() || createGratitude.isPending} className="rounded-full px-6">
                  Add
                </Button>
              </form>

              <div className="flex-1 overflow-y-auto max-h-[300px] pr-2 space-y-3">
                {loadingGratitude ? (
                  Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)
                ) : gratitudeEntries && gratitudeEntries.length > 0 ? (
                  gratitudeEntries.map((entry) => (
                    <div key={entry.id} className="p-4 rounded-2xl bg-muted/20 border border-border/50 text-sm">
                      <p className="text-foreground">{entry.text}</p>
                      <span className="text-xs text-muted-foreground mt-2 block">
                        {format(new Date(entry.createdAt), "MMM d, yyyy")}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Star className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                    <p className="text-sm">No entries yet. Start small.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

function BreathingOrb() {
  const [phase, setPhase] = useState(0); // 0: inhale, 1: hold, 2: exhale, 3: hold
  const phases = ["Inhale", "Hold", "Exhale", "Hold"];

  useEffect(() => {
    const cycle = () => {
      setPhase(0); // Inhale 4s
      setTimeout(() => setPhase(1), 4000); // Hold 4s
      setTimeout(() => setPhase(2), 8000); // Exhale 4s
      setTimeout(() => setPhase(3), 12000); // Hold 4s
    };
    
    cycle();
    const interval = setInterval(cycle, 16000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      <motion.div
        className="absolute w-32 h-32 rounded-full bg-primary/20 blur-md"
        animate={{
          scale: [1, 1.8, 1.8, 1, 1],
          opacity: [0.3, 0.6, 0.6, 0.3, 0.3],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          times: [0, 0.25, 0.5, 0.75, 1],
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute w-32 h-32 rounded-full bg-gradient-to-tr from-primary to-secondary shadow-lg flex items-center justify-center"
        animate={{
          scale: [1, 1.8, 1.8, 1, 1],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          times: [0, 0.25, 0.5, 0.75, 1],
          ease: "easeInOut"
        }}
      >
        <span className="text-white font-medium tracking-wide z-10 text-sm">
          {phases[phase]}
        </span>
      </motion.div>
    </div>
  );
}