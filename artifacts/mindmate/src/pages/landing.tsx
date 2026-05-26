import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Heart, Brain, Sparkles, MessageCircle } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      <header className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <Brain className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight">MindMate</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/sign-in">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">Log in</Button>
          </Link>
          <Link href="/sign-up">
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-6">Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="pt-32 pb-16 px-6 lg:px-8 max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[90vh]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            <span>Your personal emotional sanctuary</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-foreground tracking-tight leading-[1.1] mb-6">
            A quiet space for your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">mind</span>.
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
            Log your mood, talk things through with a gentle AI companion, and access tools designed to bring you back to center.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 bg-foreground hover:bg-foreground/90 text-background rounded-full text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                Start your journey
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 rounded-full text-lg border-border hover:bg-muted/50">
                Welcome back
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full"
        >
          <FeatureCard 
            icon={<Heart className="w-6 h-6 text-rose-500" />}
            title="Track gently"
            description="Log your daily feelings without judgment. Watch your patterns emerge over time."
          />
          <FeatureCard 
            icon={<MessageCircle className="w-6 h-6 text-blue-500" />}
            title="Talk freely"
            description="Chat with an AI companion that listens, understands, and offers therapeutic guidance."
          />
          <FeatureCard 
            icon={<Brain className="w-6 h-6 text-purple-500" />}
            title="Breathe deeply"
            description="Access guided exercises, affirmations, and gratitude journaling to find your calm."
          />
        </motion.div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-card p-8 rounded-3xl shadow-sm border border-border/50 hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
