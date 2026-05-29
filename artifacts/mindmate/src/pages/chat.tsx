import { useState, useRef, useEffect } from "react";
import { Link, useRoute } from "wouter";
import { usePageTheme } from "@/hooks/use-page-theme";
import { 
  useListOpenaiConversations, 
  useCreateOpenaiConversation,
  useGetOpenaiConversation,
  useListOpenaiMessages,
  getListOpenaiConversationsQueryKey,
  getListOpenaiMessagesQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, Send, Plus, ArrowLeft, Sparkles, RefreshCw, Clock } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export function ChatList() {
  const { data: conversations, isLoading } = useListOpenaiConversations();
  const createConv = useCreateOpenaiConversation();
  const queryClient = useQueryClient();

  const handleNewConversation = () => {
    createConv.mutate(
      { data: { title: "New Conversation" } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
        }
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Your Mind's Doctor</h1>
          <p className="text-muted-foreground mt-1 text-lg">A safe space to talk through your thoughts.</p>
        </div>
        <Button onClick={handleNewConversation} disabled={createConv.isPending} className="rounded-full">
          <Plus className="w-4 h-4 mr-2" />
          {createConv.isPending ? "Creating..." : "New Chat"}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : conversations && conversations.length > 0 ? (
        <div className="grid gap-4">
          {conversations.map((conv) => (
            <Link key={conv.id} href={`/chat/${conv.id}`}>
              <Card className="rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer bg-card/50">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-foreground truncate">{conv.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      Started {format(new Date(conv.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center p-12 border border-dashed rounded-3xl bg-muted/10">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
            <MessageCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No conversations yet</h3>
          <p className="text-muted-foreground mb-6">Start a new chat to talk with Your Mind's Doctor.</p>
          <Button onClick={handleNewConversation} disabled={createConv.isPending} className="rounded-full">
            <Plus className="w-4 h-4 mr-2" />
            Start Chat
          </Button>
        </div>
      )}
    </div>
  );
}

interface Message {
  id: number;
  role: string;
  content: string;
  createdAt?: string;
  failed?: boolean;
}

export function ChatSession({ id }: { id: string }) {
  const convId = parseInt(id, 10);
  const { data: conversation, isLoading: loadingConv } = useGetOpenaiConversation(convId);
  const { data: initialMessages, isLoading: loadingMsgs } = useListOpenaiMessages(convId);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages.map(m => ({ ...m, createdAt: m.createdAt ?? new Date().toISOString() })));
    }
  }, [initialMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (messageText?: string) => {
    const userMessage = (messageText ?? input).trim();
    if (!userMessage || isStreaming) return;
    setInput("");
    inputRef.current?.focus();

    const tempUserId = Date.now();
    const now = new Date().toISOString();
    setMessages(prev => [...prev, { id: tempUserId, role: "user", content: userMessage, createdAt: now }]);
    setIsStreaming(true);

    const tempAssistantId = Date.now() + 1;
    setMessages(prev => [...prev, { id: tempAssistantId, role: "assistant", content: "", createdAt: now }]);

    try {
      const response = await fetch(`${BASE}/api/openai/conversations/${convId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: userMessage }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                setMessages(prev => prev.map(msg =>
                  msg.id === tempAssistantId ? { ...msg, content: msg.content + data.content } : msg
                ));
              }
              if (data.done) {
                queryClient.invalidateQueries({ queryKey: getListOpenaiMessagesQueryKey(convId) });
              }
            } catch {
              // incomplete chunk — ignore
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => prev.map(msg =>
        msg.id === tempAssistantId
          ? { ...msg, content: "I'm sorry, something went wrong. Please try again.", failed: true }
          : msg
      ));
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  if (loadingConv || loadingMsgs) {
    return (
      <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
        <Skeleton className="h-16 w-full rounded-2xl mb-4" />
        <div className="flex-1 p-4 space-y-4">
          <Skeleton className="h-12 w-3/4 rounded-2xl" />
          <Skeleton className="h-24 w-3/4 ml-auto rounded-2xl" />
          <Skeleton className="h-16 w-2/3 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] md:h-[calc(100vh-4rem)] max-w-4xl mx-auto border border-border/50 rounded-3xl overflow-hidden bg-card shadow-sm">
      <div className="flex items-center p-4 border-b border-border/50 bg-muted/20 gap-3">
        <Link href="/chat">
          <Button variant="ghost" size="icon" className="rounded-full flex-shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-foreground truncate">{conversation?.title || "Chat"}</h2>
          <p className="text-xs text-green-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            Your Mind's Doctor — Online
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground mt-10 px-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <p className="font-medium text-foreground mb-1">How are you feeling right now?</p>
            <p className="text-sm">I'm here to listen and help you process your thoughts.</p>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {["I'm feeling anxious", "I need to vent", "Help me relax", "I'm not okay"].map(prompt => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                </div>
              )}
              <div className="max-w-[85%] sm:max-w-[75%] space-y-1">
                <div 
                  className={`rounded-3xl px-5 py-3 ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : msg.failed
                      ? 'bg-destructive/10 text-destructive rounded-bl-sm border border-destructive/20'
                      : 'bg-muted text-foreground rounded-bl-sm border border-border/50'
                  }`}
                >
                  {msg.content ? (
                    <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.content}</p>
                  ) : (
                    <div className="flex items-center gap-1 py-1">
                      <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  )}
                </div>
                {msg.createdAt && msg.content && (
                  <p className={`text-[10px] text-muted-foreground/60 ${msg.role === 'user' ? 'text-right' : 'text-left'} px-1`}>
                    {format(new Date(msg.createdAt), "h:mm a")}
                  </p>
                )}
                {msg.failed && (
                  <button
                    onClick={() => sendMessage(messages.find(m => m.id === msg.id - 1)?.content)}
                    className="text-xs text-destructive flex items-center gap-1 hover:underline px-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Retry
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-border/50 bg-background/50 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="flex gap-2 relative">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isStreaming ? "Responding..." : "Type your message..."}
            className="flex-1 rounded-full px-6 py-6 bg-muted/30 border-border/50 focus-visible:ring-primary/30 text-base pr-14"
            disabled={isStreaming}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isStreaming}
            className="rounded-full w-11 h-11 bg-primary hover:bg-primary/90 absolute right-1.5 top-1/2 -translate-y-1/2 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function ChatPage() {
  usePageTheme("linear-gradient(135deg, #eef4fb 0%, #e8eef8 35%, #ece8f5 65%, #f0eaf8 100%)");
  const [match, params] = useRoute("/chat/:id");
  
  if (match && params?.id) {
    return <ChatSession id={params.id} />;
  }
  
  return <ChatList />;
}
