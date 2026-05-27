import { useState } from "react";
import { useCreateMood, useListMoods, getListMoodsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Music, ExternalLink, Gamepad2 } from "lucide-react";
import { Link } from "wouter";

const MOODS = [
  { mood: "Terrible", emoji: "😢", score: 2, color: "bg-red-100 text-red-600 hover:bg-red-200 hover:border-red-300 border-red-200" },
  { mood: "Bad",      emoji: "😔", score: 4, color: "bg-orange-100 text-orange-600 hover:bg-orange-200 hover:border-orange-300 border-orange-200" },
  { mood: "Okay",     emoji: "😐", score: 6, color: "bg-yellow-100 text-yellow-600 hover:bg-yellow-200 hover:border-yellow-300 border-yellow-200" },
  { mood: "Good",     emoji: "🙂", score: 8, color: "bg-blue-100 text-blue-600 hover:bg-blue-200 hover:border-blue-300 border-blue-200" },
  { mood: "Amazing",  emoji: "😄", score: 10, color: "bg-green-100 text-green-600 hover:bg-green-200 hover:border-green-300 border-green-200" }
];

type Song = { title: string; artist: string; query: string };

const MOOD_SONGS: Record<string, Song[]> = {
  Terrible: [
    { title: "Fix You",         artist: "Coldplay",             query: "Coldplay+Fix+You" },
    { title: "Breathe Me",      artist: "Sia",                  query: "Sia+Breathe+Me" },
    { title: "The Scientist",   artist: "Coldplay",             query: "Coldplay+The+Scientist" },
    { title: "Let It Be",       artist: "The Beatles",          query: "Beatles+Let+It+Be" },
  ],
  Bad: [
    { title: "Here Comes the Sun",   artist: "The Beatles",        query: "Beatles+Here+Comes+The+Sun" },
    { title: "Somewhere Only We Know", artist: "Keane",            query: "Keane+Somewhere+Only+We+Know" },
    { title: "Three Little Birds",   artist: "Bob Marley",         query: "Bob+Marley+Three+Little+Birds" },
    { title: "Unwritten",            artist: "Natasha Bedingfield", query: "Natasha+Bedingfield+Unwritten" },
  ],
  Okay: [
    { title: "Weightless",           artist: "Marconi Union",      query: "Marconi+Union+Weightless" },
    { title: "Yellow",               artist: "Coldplay",           query: "Coldplay+Yellow" },
    { title: "Somewhere Over the Rainbow", artist: "Israel Kamakawiwoʻole", query: "Israel+Kamakawiwo+Somewhere+Over+Rainbow" },
    { title: "Counting Stars",       artist: "OneRepublic",        query: "OneRepublic+Counting+Stars" },
  ],
  Good: [
    { title: "Happy",                artist: "Pharrell Williams",  query: "Pharrell+Williams+Happy" },
    { title: "Good Life",            artist: "OneRepublic",        query: "OneRepublic+Good+Life" },
    { title: "Best Day of My Life",  artist: "American Authors",   query: "American+Authors+Best+Day+Of+My+Life" },
    { title: "Shake It Off",         artist: "Taylor Swift",       query: "Taylor+Swift+Shake+It+Off" },
  ],
  Amazing: [
    { title: "Can't Stop the Feeling", artist: "Justin Timberlake", query: "Justin+Timberlake+Cant+Stop+The+Feeling" },
    { title: "Uptown Funk",          artist: "Bruno Mars",         query: "Bruno+Mars+Uptown+Funk" },
    { title: "Dancing Queen",        artist: "ABBA",               query: "ABBA+Dancing+Queen" },
    { title: "Livin' on a Prayer",   artist: "Bon Jovi",           query: "Bon+Jovi+Livin+On+A+Prayer" },
  ],
};

const MOOD_GAME_TIPS: Record<string, string> = {
  Terrible: "A gentle mind game can help redirect difficult emotions.",
  Bad:      "A quick puzzle can lift your spirits — give it a try!",
  Okay:     "Sharpen your focus with a fun brain challenge.",
  Good:     "Keep the good vibes going with a quick game!",
  Amazing:  "Channel that energy into a high-score challenge!",
};

export default function MoodPage() {
  const [selectedMood, setSelectedMood] = useState<typeof MOODS[0] | null>(null);
  const [note, setNote] = useState("");
  const [loggedMood, setLoggedMood] = useState<typeof MOODS[0] | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: history, isLoading } = useListMoods({ limit: 10 });
  const createMood = useCreateMood();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMood) return;

    createMood.mutate(
      { data: { mood: selectedMood.mood, emoji: selectedMood.emoji, score: selectedMood.score, note, date: new Date().toISOString() } },
      {
        onSuccess: () => {
          toast({ title: "Mood logged!", description: "Taking a moment for yourself is a great step." });
          setLoggedMood(selectedMood);
          setSelectedMood(null);
          setNote("");
          queryClient.invalidateQueries({ queryKey: getListMoodsQueryKey() });
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to log mood.", variant: "destructive" });
        }
      }
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Mood Tracker</h1>
        <p className="text-muted-foreground mt-1 text-lg">Check in with yourself. How are you feeling right now?</p>
      </div>

      <Card className="rounded-3xl border-border/50 shadow-sm overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-foreground mb-4">Select your mood</label>
              <div className="grid grid-cols-5 gap-2 sm:gap-4">
                {MOODS.map((m) => (
                  <button
                    key={m.mood}
                    type="button"
                    onClick={() => { setSelectedMood(m); setLoggedMood(null); }}
                    className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl transition-all border ${
                      selectedMood?.mood === m.mood
                        ? `${m.color} scale-105 shadow-sm ring-2 ring-primary/20 ring-offset-2 ring-offset-background`
                        : "bg-muted/30 border-transparent hover:bg-muted/60 text-muted-foreground hover:scale-105"
                    }`}
                  >
                    <span className="text-3xl sm:text-4xl mb-2">{m.emoji}</span>
                    <span className="text-xs font-medium">{m.mood}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Song suggestions appear when a mood is selected */}
            <AnimatePresence>
              {selectedMood && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-2xl bg-primary/5 border border-primary/15 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                      <Music className="w-4 h-4" />
                      Songs for when you feel {selectedMood.mood.toLowerCase()}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {MOOD_SONGS[selectedMood.mood].map((song) => (
                        <a
                          key={song.title}
                          href={`https://www.youtube.com/results?search_query=${song.query}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between gap-2 bg-background rounded-xl px-3 py-2.5 hover:bg-primary/10 transition-colors group border border-border/40"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{song.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary flex-shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label htmlFor="note" className="block text-sm font-medium text-foreground mb-2">
                Add a note (optional)
              </label>
              <Textarea
                id="note"
                placeholder="What's making you feel this way?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="min-h-[120px] rounded-xl resize-none border-border/50 focus-visible:ring-primary/30"
              />
            </div>

            <Button
              type="submit"
              disabled={!selectedMood || createMood.isPending}
              className="w-full sm:w-auto rounded-full px-8"
              size="lg"
            >
              {createMood.isPending ? "Logging..." : "Log Mood"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Post-log suggestions */}
      <AnimatePresence>
        {loggedMood && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Card className="rounded-3xl border-primary/20 bg-primary/5 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <p className="font-semibold text-foreground">
                  Mood logged {loggedMood.emoji} — what would you like to do next?
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/games">
                    <Button variant="outline" className="rounded-full gap-2 border-primary/30 hover:bg-primary/10">
                      <Gamepad2 className="w-4 h-4" />
                      Play a mind game
                    </Button>
                  </Link>
                  <Link href="/chat">
                    <Button variant="outline" className="rounded-full gap-2 border-primary/30 hover:bg-primary/10">
                      💬 Talk to Your Mind's Doctor
                    </Button>
                  </Link>
                  <Link href="/wellness">
                    <Button variant="outline" className="rounded-full gap-2 border-primary/30 hover:bg-primary/10">
                      🌿 Wellness tools
                    </Button>
                  </Link>
                </div>
                <p className="text-xs text-muted-foreground">{MOOD_GAME_TIPS[loggedMood.mood]}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground mb-4">Recent History</h2>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        ) : history && history.length > 0 ? (
          <div className="space-y-4">
            {history.map((entry) => {
              const moodDef = MOODS.find(m => m.mood === entry.mood) || MOODS[2];
              return (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={entry.id}>
                  <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-6 flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0 ${moodDef.color}`}>
                        {entry.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-foreground truncate">{entry.mood}</h3>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {format(new Date(entry.createdAt), "MMM d, h:mm a")}
                          </span>
                        </div>
                        {entry.note ? (
                          <p className="text-sm text-muted-foreground line-clamp-2">{entry.note}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground/50 italic">No note added</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center p-8 border border-dashed rounded-3xl bg-muted/10">
            <p className="text-muted-foreground">You haven't logged any moods yet. Your history will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
