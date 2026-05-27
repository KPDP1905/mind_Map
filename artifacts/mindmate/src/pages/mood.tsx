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
import { Music, ExternalLink, Gamepad2, Youtube } from "lucide-react";
import { Link } from "wouter";

const MOODS = [
  { mood: "Terrible", emoji: "😢", score: 2, color: "bg-red-100 text-red-600 hover:bg-red-200 hover:border-red-300 border-red-200" },
  { mood: "Bad",      emoji: "😔", score: 4, color: "bg-orange-100 text-orange-600 hover:bg-orange-200 hover:border-orange-300 border-orange-200" },
  { mood: "Okay",     emoji: "😐", score: 6, color: "bg-yellow-100 text-yellow-600 hover:bg-yellow-200 hover:border-yellow-300 border-yellow-200" },
  { mood: "Good",     emoji: "🙂", score: 8, color: "bg-blue-100 text-blue-600 hover:bg-blue-200 hover:border-blue-300 border-blue-200" },
  { mood: "Amazing",  emoji: "😄", score: 10, color: "bg-green-100 text-green-600 hover:bg-green-200 hover:border-green-300 border-green-200" }
];

type Song = { title: string; artist: string; ytId: string };
type GenreKey = "hollywood" | "bollywood" | "spiritual";

const GENRE_LABELS: Record<GenreKey, { label: string; emoji: string }> = {
  hollywood: { label: "Hollywood", emoji: "🎬" },
  bollywood: { label: "Bollywood", emoji: "🎥" },
  spiritual: { label: "Spiritual", emoji: "🕉️" },
};

const MOOD_SONGS: Record<GenreKey, Record<string, Song[]>> = {
  hollywood: {
    Terrible: [
      { title: "Fix You",           artist: "Coldplay",          ytId: "k4V3Mo61fJM" },
      { title: "The Scientist",     artist: "Coldplay",          ytId: "RB-RcX5DS5A" },
      { title: "Let Her Go",        artist: "Passenger",         ytId: "RBumgq5yVrA" },
      { title: "Breathe Me",        artist: "Sia",               ytId: "GFwEFgbFt6o" },
    ],
    Bad: [
      { title: "Here Comes the Sun",  artist: "The Beatles",         ytId: "KQetemT1sWc" },
      { title: "Three Little Birds",  artist: "Bob Marley",          ytId: "zahrZrzMBQk" },
      { title: "Somewhere Only We Know", artist: "Keane",            ytId: "Xn676-fLq7I" },
      { title: "Don't Worry Be Happy", artist: "Bobby McFerrin",     ytId: "d-diB65scQU" },
    ],
    Okay: [
      { title: "Weightless",         artist: "Marconi Union",     ytId: "UfcAVejslrU" },
      { title: "Yellow",             artist: "Coldplay",          ytId: "yKNxeF4KMsY" },
      { title: "Counting Stars",     artist: "OneRepublic",       ytId: "hT_nvWreIhg" },
      { title: "A Thousand Years",   artist: "Christina Perri",   ytId: "rtOvBOTyX00" },
    ],
    Good: [
      { title: "Happy",              artist: "Pharrell Williams", ytId: "ZbZSe6N_BXs" },
      { title: "Good Life",          artist: "OneRepublic",       ytId: "jZhQOvn9LD8" },
      { title: "Best Day of My Life",artist: "American Authors",  ytId: "Y66j_BUCBMY" },
      { title: "Shake It Off",       artist: "Taylor Swift",      ytId: "nfWlot6h_JM" },
    ],
    Amazing: [
      { title: "Can't Stop the Feeling", artist: "Justin Timberlake", ytId: "ru0K8uYEZWw" },
      { title: "Uptown Funk",        artist: "Bruno Mars",        ytId: "OPf0YbXqDm0" },
      { title: "Dancing Queen",      artist: "ABBA",              ytId: "xFrGuyw1V8s" },
      { title: "Blinding Lights",    artist: "The Weeknd",        ytId: "4NRXx6U8ABQ" },
    ],
  },
  bollywood: {
    Terrible: [
      { title: "Channa Mereya",      artist: "Pritam, Arijit Singh", ytId: "zahrZrzMBQk" },
      { title: "Agar Tum Saath Ho",  artist: "A.R. Rahman",          ytId: "sVyvpGbMFYE" },
      { title: "Kabira",             artist: "Pritam, Rekha Bhardwaj", ytId: "JhSnnlxAkso" },
      { title: "Tujhe Bhula Diya",   artist: "Shekhar Ravjiani",     ytId: "0jxSaJaVqDo" },
    ],
    Bad: [
      { title: "Ik Vaari Aa",        artist: "A.R. Rahman",          ytId: "b5SkFsWBUh0" },
      { title: "Tum Se Hi",          artist: "Mohit Chauhan",        ytId: "4p_L_DQAJUA" },
      { title: "Kun Faya Kun",       artist: "A.R. Rahman",          ytId: "T94PHkCPKkI" },
      { title: "Phir Se Ud Chala",   artist: "Mohit Chauhan",        ytId: "5vFMs9PzQr4" },
    ],
    Okay: [
      { title: "Dil Dhadakne Do",    artist: "Priyanka Chopra, Farhan Akhtar", ytId: "LmbmKSoO9I0" },
      { title: "O Re Piya",          artist: "Rahat Fateh Ali Khan", ytId: "kW3RJDKMdlQ" },
      { title: "Khwabon Ke Parindey",artist: "Mohit Chauhan",        ytId: "cpUgUBs2m9s" },
      { title: "Aaoge Jab Tum",      artist: "Ustad Rashid Khan",    ytId: "8sQe1Pk0jkA" },
    ],
    Good: [
      { title: "London Thumakda",    artist: "Labh Janjua",          ytId: "BfcMHLHEEbM" },
      { title: "Gallan Goodiyan",    artist: "Shankar-Ehsaan-Loy",  ytId: "SaGFBB9Wnpk" },
      { title: "Badtameez Dil",      artist: "Shalmali Kholgade",   ytId: "II2EO3Fq9U0" },
      { title: "Balam Pichkari",     artist: "Shalmali, Vishal D.",  ytId: "Fp2e2IfqMZc" },
    ],
    Amazing: [
      { title: "Nagada Sang Dhol",   artist: "Osman Mir, Shreya G.",ytId: "Fp2e2IfqMZc" },
      { title: "Malang",             artist: "Mohit Chauhan",        ytId: "ytRE5sUHMBY" },
      { title: "Kar Gayi Chull",     artist: "Badshah, Fazilpuria",  ytId: "p8cVHXBZwEA" },
      { title: "Nashe Si Chadh Gayi",artist: "Arijit Singh",         ytId: "mRdKo4-MXNI" },
    ],
  },
  spiritual: {
    Terrible: [
      { title: "Om Namah Shivaya",   artist: "Uma Mohan",            ytId: "7MOv0R8l2DE" },
      { title: "Maha Mrityunjaya Mantra", artist: "Shankar Mahadevan", ytId: "9QFR6XzCBcg" },
      { title: "Gayatri Mantra",     artist: "Anuradha Paudwal",     ytId: "OfALJQMiWpU" },
      { title: "Hanuman Chalisa",    artist: "Gulshan Kumar",        ytId: "AETFSijbUzo" },
    ],
    Bad: [
      { title: "Achyutam Keshavam",  artist: "Kumar Vishwas",        ytId: "aqCy_sDyRKo" },
      { title: "Om Jai Jagadish Hare", artist: "Anuradha Paudwal",  ytId: "TN5PvFGcFkI" },
      { title: "Raghupati Raghava",  artist: "A.R. Rahman",          ytId: "b5SkFsWBUh0" },
      { title: "Sri Ram Chandra Kripalu", artist: "Jagjit Singh",   ytId: "8Yq3fO7Qzn0" },
    ],
    Okay: [
      { title: "Prabhu Tero Naam",   artist: "Anuradha Paudwal",     ytId: "ZmNOIgTb0mU" },
      { title: "Om Shanti Om",       artist: "Kavita Krishnamurthy", ytId: "v8d1R8c4dZg" },
      { title: "So Kaho Hari Om",    artist: "Swami Mukundananda",   ytId: "0jxSaJaVqDo" },
      { title: "Vande Mataram",      artist: "A.R. Rahman",          ytId: "JhSnnlxAkso" },
    ],
    Good: [
      { title: "Ram Siya Ram",       artist: "Sachet-Parampara",     ytId: "Fp2e2IfqMZc" },
      { title: "Mere Ghar Ram Aaye", artist: "Jubin Nautiyal",       ytId: "mRdKo4-MXNI" },
      { title: "Jai Shri Ram",       artist: "Shankar Mahadevan",    ytId: "II2EO3Fq9U0" },
      { title: "Om Gan Ganpataye",   artist: "Suresh Wadkar",        ytId: "cpUgUBs2m9s" },
    ],
    Amazing: [
      { title: "Hare Krishna (Mahamantra)", artist: "ISKCON Devotees", ytId: "ZbZSe6N_BXs" },
      { title: "Jai Jai Shiv Shankar",  artist: "Asha Bhosle, Kishore Kumar", ytId: "nfWlot6h_JM" },
      { title: "Radhe Radhe",        artist: "Shankar Mahadevan",    ytId: "Y66j_BUCBMY" },
      { title: "Om Namo Bhagavate",  artist: "Uma Mohan",            ytId: "UfcAVejslrU" },
    ],
  },
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
  const [songGenre, setSongGenre] = useState<GenreKey>("hollywood");
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

      {/* Post-log suggestions — songs + next steps */}
      <AnimatePresence>
        {loggedMood && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Song suggestions */}
            <Card className="rounded-3xl border-primary/20 bg-primary/5 shadow-sm overflow-hidden">
              <CardContent className="p-6 space-y-5">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <Music className="w-5 h-5 text-primary" />
                  Songs for your {loggedMood.mood.toLowerCase()} mood {loggedMood.emoji}
                </div>

                {/* Genre tabs */}
                <div className="flex gap-2 flex-wrap">
                  {(Object.keys(GENRE_LABELS) as GenreKey[]).map((g) => (
                    <button
                      key={g}
                      onClick={() => setSongGenre(g)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                        songGenre === g
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-background border-border/50 text-muted-foreground hover:bg-muted/60"
                      }`}
                    >
                      {GENRE_LABELS[g].emoji} {GENRE_LABELS[g].label}
                    </button>
                  ))}
                </div>

                {/* Song cards */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={songGenre}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                  >
                    {MOOD_SONGS[songGenre][loggedMood.mood].map((song) => (
                      <a
                        key={song.title}
                        href={`https://www.youtube.com/watch?v=${song.ytId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 bg-background rounded-xl px-3 py-2.5 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors group border border-border/40 hover:border-red-200 dark:hover:border-red-800"
                      >
                        <Youtube className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">{song.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-red-500 flex-shrink-0 transition-colors" />
                      </a>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Next steps */}
            <Card className="rounded-3xl border-border/50 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <p className="font-medium text-foreground text-sm">What would you like to do next?</p>
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
