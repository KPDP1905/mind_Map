import { useState, useRef, useEffect } from "react";
import { Link, useRoute } from "wouter";
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
import { MessageCircle, Send, Plus, ArrowLeft } from "lucide-react";
import { format } from "date-fns";

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
          New Chat
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
                    <p className="text-sm text-muted-foreground mt-1">
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

export function ChatSession({ id }: { id: string }) {
  const convId = parseInt(id, 10);
  const { data: conversation, isLoading: loadingConv } = useGetOpenaiConversation(convId);
  const { data: initialMessages, isLoading: loadingMsgs } = useListOpenaiMessages(convId);
  
  const [messages, setMessages] = useState<Array<{role: string, content: string, id: number}>>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMessage = input.trim();
    setInput("");
    
    // Optimistic user message
    const tempUserId = Date.now();
    setMessages(prev => [...prev, { id: tempUserId, role: "user", content: userMessage }]);
    setIsStreaming(true);

    try {
      const response = await fetch(`/api/openai/conversations/${convId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: userMessage }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      
      // Temporary assistant message
      const tempAssistantId = Date.now() + 1;
      setMessages(prev => [...prev, { id: tempAssistantId, role: "assistant", content: "" }]);

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
            } catch (e) {
              // Ignore parse errors from incomplete chunks
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsStreaming(false);
    }
  };

  if (loadingConv || loadingMsgs) {
    return (
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <Skeleton className="h-16 w-full rounded-none border-b" />
        <div className="flex-1 p-4 space-y-4">
          <Skeleton className="h-12 w-3/4 rounded-2xl" />
          <Skeleton className="h-24 w-3/4 ml-auto rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] md:h-[calc(100vh-4rem)] max-w-4xl mx-auto border border-border/50 rounded-3xl overflow-hidden bg-card shadow-sm">
      <div className="flex items-center p-4 border-b border-border/50 bg-muted/20">
        <Link href="/chat">
          <Button variant="ghost" size="icon" className="mr-2 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h2 className="font-semibold text-foreground">{conversation?.title || "Chat"}</h2>
          <p className="text-xs text-muted-foreground">Your Mind's Doctor</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground mt-10">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <p>How are you feeling right now?</p>
            <p className="text-sm mt-1">I'm here to listen and help you process your thoughts.</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[85%] sm:max-w-[75%] rounded-3xl px-5 py-3 ${
                msg.role === 'user' 
                  ? 'bg-primary text-primary-foreground rounded-br-sm' 
                  : 'bg-muted text-foreground rounded-bl-sm border border-border/50'
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.content}</p>
            </div>
          </div>
        ))}
        {isStreaming && messages[messages.length - 1]?.role === "user" && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-3xl px-5 py-4 bg-muted text-foreground rounded-bl-sm border border-border/50 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-border/50 bg-background/50 backdrop-blur-sm">
        <form onSubmit={sendMessage} className="flex gap-2 relative">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-full px-6 py-6 bg-muted/30 border-border/50 focus-visible:ring-primary/30 text-base"
            disabled={isStreaming}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!input.trim() || isStreaming}
            className="rounded-full w-12 h-12 bg-primary hover:bg-primary/90 absolute right-1 top-1 flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}

// Ensure Sparkles is imported
import { Sparkles } from "lucide-react";

export default function ChatPage() {
  const [match, params] = useRoute("/chat/:id");
  
  if (match && params?.id) {
    return <ChatSession id={params.id} />;
  }
  
  return <ChatList />;
}