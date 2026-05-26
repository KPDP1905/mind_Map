import { useState } from "react";
import { useListJournalEntries, useCreateJournalEntry, getListJournalEntriesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Plus, PenLine } from "lucide-react";

export default function JournalPage() {
  const { data: entries, isLoading } = useListJournalEntries();
  const createEntry = useCreateJournalEntry();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isComposing, setIsComposing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    createEntry.mutate(
      {
        data: {
          title,
          content,
          tags: tags.trim() || undefined
        }
      },
      {
        onSuccess: () => {
          toast({ title: "Entry saved", description: "Your journal entry has been safely stored." });
          setTitle("");
          setContent("");
          setTags("");
          setIsComposing(false);
          queryClient.invalidateQueries({ queryKey: getListJournalEntriesQueryKey() });
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to save entry.", variant: "destructive" });
        }
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
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Input
                  placeholder="Give your entry a title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-2xl font-bold border-0 border-b border-border/50 rounded-none px-0 py-6 focus-visible:ring-0 focus-visible:border-primary bg-transparent"
                />
              </div>
              <div>
                <Textarea
                  placeholder="Write whatever is on your mind. This space is just for you..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[250px] resize-none border-0 px-0 py-4 focus-visible:ring-0 text-lg leading-relaxed bg-transparent"
                />
              </div>
              <div className="pt-4 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <Input
                  placeholder="Tags (comma separated)..."
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full sm:max-w-xs rounded-full bg-muted/30 border-border/50"
                />
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button type="button" variant="ghost" onClick={() => setIsComposing(false)} className="rounded-full flex-1 sm:flex-auto">
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
          [...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-3xl" />
          ))
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