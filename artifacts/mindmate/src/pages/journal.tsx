import { useState } from "react";
import { useListJournalEntries, useCreateJournalEntry, getListJournalEntriesQueryKey } from "@workspace/api-client-react";
import { usePageTheme } from "@/hooks/use-page-theme";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Plus, PenLine, Sparkles, ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const WHY_PROMPTS = [
  "Why did something bother me today?",
  "Why am I feeling this way right now?",
  "Why did I react that way to that situation?",
  "Why does this matter to me?",
  "Why am I struggling with this?",
];

const WHAT_PROMPTS = [
  "What was the highlight of my day?",
  "What am I worried about and is it realistic?",
  "What would I tell a friend in my situation?",
  "What do I need right now to feel better?",
  "What are 3 things I did well today?",
];

const WHEN_PROMPTS = [
  "When do I feel most like myself?",
  "When did I last feel truly happy? What was happening?",
  "When have I overcome something difficult before?",
  "When do I tend to feel most anxious or low?",
  "When did I notice progress in my mental health?",
];

interface AISuggestion {
  insight: string;
  cognitive_patterns: string[];
  suggestions: string[];
  affirmation: string;
}

export default function JournalPage() {
  usePageTheme("linear-gradient(135deg, #fdf6ec 0%, #f9eedf 40%, #fdf5ec 70%, #f5efe8 100%)");
  const { data: entries, isLoading } = useListJournalEntries();
  const createEntry = useCreateJournalEntry();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isComposing, setIsComposing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [showPrompts, setShowPrompts] = useState(false);
  const [promptTab, setPromptTab] = useState<"why" | "what" | "when">("why");

  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);
  const [showAi, setShowAi] = useState(false);

  const handlePromptClick = (prompt: string) => {
    const addition = content.trim() ? `\n\n${prompt}\n` : `${prompt}\n`;
    setContent(prev => prev + addition);
    setShowPrompts(false);
  };

  const handleGetAiSuggestions = async () => {
    if (!content.trim()) {
      toast({ title: "Write something first", description: "Add some content to your journal entry first." });
      return;
    }
    setAiLoading(true);
    setAiSuggestion(null);
    try {
      const res = await fetch(`${BASE}/api/journal/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: title || "Untitled", content }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setAiSuggestion(data);
      setShowAi(true);
    } catch {
      toast({ title: "AI suggestions unavailable", description: "Could not connect to AI service. Try again.", variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    createEntry.mutate(
      { data: { title, content, tags: tags.trim() || undefined } },
      {
        onSuccess: () => {
          toast({ title: "Entry saved", description: "Your journal entry has been safely stored." });
          setTitle(""); setContent(""); setTags("");
          setIsComposing(false); setShowPrompts(false); setShowAi(false); setAiSuggestion(null);
          queryClient.invalidateQueries({ queryKey: getListJournalEntriesQueryKey() });
        },
        onError: () => toast({ title: "Error", description: "Failed to save entry.", variant: "destructive" }),
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Journal</h1>
          <p className="text-muted-foreground mt-1 text-lg">A private space for your thoughts and reflections.</p>
        </div>
        {!isComposing && (
          <Button onClick={() => setIsComposing(true)} className="rounded-full">
            <PenLine className="w-4 h-4 mr-2" />
            Write
          </Button>
        )}
      </div>

      {isComposing && (
        <Card className="rounded-3xl border-primary/20 shadow-md bg-card/80 backdrop-blur-sm overflow-hidden animate-in zoom-in-95 duration-300">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  placeholder="Give your entry a title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-2xl font-bold border-0 border-b border-border/50 rounded-none px-0 py-6 focus-visible:ring-0 focus-visible:border-primary bg-transparent"
                />
              </div>

              {/* AI Writing Prompts */}
              <div>
                <button type="button" onClick={() => setShowPrompts(p => !p)}
                  className="flex items-center gap-2 text-sm text-primary font-medium hover:text-primary/80 transition-colors mb-2">
                  <Lightbulb className="w-4 h-4" />
                  {showPrompts ? "Hide" : "Show"} writing prompts
                  {showPrompts ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                <AnimatePresence>
                  {showPrompts && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      className="mb-4 p-4 rounded-2xl bg-amber-50/80 border border-amber-100 space-y-3">
                      <div className="flex gap-2">
                        {(["why", "what", "when"] as const).map(t => (
                          <button key={t} type="button" onClick={() => setPromptTab(t)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${
                              promptTab === t ? "bg-primary text-primary-foreground" : "bg-white text-muted-foreground hover:bg-muted/60 border"
                            }`}>
                            {t === "why" ? "🤔 Why" : t === "what" ? "🌟 What" : "⏰ When"}
                          </button>
                        ))}
                      </div>
                      <div className="grid gap-2">
                        {(promptTab === "why" ? WHY_PROMPTS : promptTab === "what" ? WHAT_PROMPTS : WHEN_PROMPTS).map(p => (
                          <button key={p} type="button" onClick={() => handlePromptClick(p)}
                            className="text-left text-sm p-2.5 rounded-xl bg-white hover:bg-amber-50 border border-amber-100 hover:border-amber-200 transition-colors text-foreground">
                            {p}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Textarea
                placeholder="Write whatever is on your mind. This space is just for you..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[250px] resize-none border-0 px-0 py-4 focus-visible:ring-0 text-lg leading-relaxed bg-transparent"
              />

              {/* AI Suggestions */}
              {aiSuggestion && showAi && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-2xl border border-primary/20 bg-primary/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Calmora's Reflection</p>
                    <button type="button" onClick={() => setShowAi(false)} className="text-xs text-muted-foreground hover:text-foreground">Dismiss</button>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed italic">"{aiSuggestion.insight}"</p>
                  {aiSuggestion.cognitive_patterns?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1.5">You might notice these thought patterns:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {aiSuggestion.cognitive_patterns.map(p => (
                          <span key={p} className="px-2.5 py-1 text-xs bg-secondary/30 text-secondary-foreground rounded-full">{p}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {aiSuggestion.suggestions?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1.5">Gentle suggestions:</p>
                      <ul className="space-y-1">
                        {aiSuggestion.suggestions.map((s, i) => (
                          <li key={i} className="text-sm text-foreground flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>{s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {aiSuggestion.affirmation && (
                    <p className="text-sm font-medium text-primary italic">💛 {aiSuggestion.affirmation}</p>
                  )}
                </motion.div>
              )}

              <div className="pt-2 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <Input
                  placeholder="Tags (comma separated)..."
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full sm:max-w-xs rounded-full bg-muted/30 border-border/50"
                />
                <div className="flex gap-2 w-full sm:w-auto flex-wrap">
                  <Button type="button" variant="outline" onClick={handleGetAiSuggestions}
                    disabled={aiLoading || !content.trim()} className="rounded-full flex-1 sm:flex-none gap-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    {aiLoading ? "Analyzing..." : "AI Insights"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => { setIsComposing(false); setShowPrompts(false); setAiSuggestion(null); }} className="rounded-full flex-1 sm:flex-auto">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!title.trim() || !content.trim() || createEntry.isPending} className="rounded-full flex-1 sm:flex-auto">
                    {createEntry.isPending ? "Saving..." : "Save Entry"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {isLoading ? (
          [...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-3xl" />)
        ) : entries && entries.length > 0 ? (
          entries.map((entry) => (
            <Card key={entry.id} className="rounded-3xl border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-4">
                  <h3 className="text-xl font-bold text-foreground">{entry.title}</h3>
                  <span className="text-sm text-muted-foreground flex-shrink-0">
                    {format(new Date(entry.createdAt), "EEEE, MMMM d, yyyy")}
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap line-clamp-4">
                  {entry.content}
                </p>
                {entry.tags && (
                  <div className="flex flex-wrap gap-2 mt-6">
                    {entry.tags.split(',').map((tag, i) => (
                      <span key={i} className="px-3 py-1 bg-secondary/30 text-secondary-foreground text-xs font-medium rounded-full">
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          !isComposing && (
            <div className="text-center p-16 border border-dashed rounded-3xl bg-muted/5">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Your journal is empty</h3>
              <p className="text-muted-foreground mb-6">Start writing to reflect on your days and track your mental journey.</p>
              <Button onClick={() => setIsComposing(true)} className="rounded-full">
                <Plus className="w-4 h-4 mr-2" />
                Write first entry
              </Button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
