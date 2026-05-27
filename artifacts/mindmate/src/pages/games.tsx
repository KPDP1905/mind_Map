import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Gamepad2, Brain, RotateCcw, Trophy, Timer, Sigma } from "lucide-react";

// ─── Memory Match ────────────────────────────────────────────────────────────
const EMOJIS = ["🌸", "🌿", "🦋", "⭐", "🌈", "💜", "🌙", "☀️", "🍃", "🎵", "🌺", "🐢"];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function MemoryGame() {
  const [cards, setCards] = useState<{ id: number; emoji: string; flipped: boolean; matched: boolean }[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [locked, setLocked] = useState(false);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [won, setWon] = useState(false);

  const initGame = useCallback(() => {
    const pairs = shuffle(EMOJIS).slice(0, 8);
    const deck = shuffle([...pairs, ...pairs].map((emoji, id) => ({ id, emoji, flipped: false, matched: false })));
    setCards(deck);
    setFlipped([]);
    setMoves(0);
    setMatches(0);
    setLocked(false);
    setTime(0);
    setRunning(false);
    setWon(false);
  }, []);

  useEffect(() => { initGame(); }, [initGame]);

  useEffect(() => {
    let t: ReturnType<typeof setInterval>;
    if (running && !won) t = setInterval(() => setTime(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [running, won]);

  const flip = (id: number) => {
    if (locked || cards[id].flipped || cards[id].matched) return;
    if (!running) setRunning(true);
    const next = [...flipped, id];
    setCards(prev => prev.map((c, i) => i === id ? { ...c, flipped: true } : c));
    if (next.length === 2) {
      setMoves(m => m + 1);
      setLocked(true);
      const [a, b] = next;
      if (cards[a].emoji === cards[b].emoji) {
        setCards(prev => prev.map((c, i) => i === a || i === b ? { ...c, matched: true } : c));
        const newMatches = matches + 1;
        setMatches(newMatches);
        if (newMatches === 8) { setWon(true); setRunning(false); }
        setFlipped([]);
        setLocked(false);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map((c, i) => i === a || i === b ? { ...c, flipped: false } : c));
          setFlipped([]);
          setLocked(false);
        }, 900);
      }
    } else {
      setFlipped(next);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-4 text-sm font-medium">
          <span className="flex items-center gap-1.5 text-muted-foreground"><Timer className="w-4 h-4" /> {Math.floor(time / 60).toString().padStart(2,"0")}:{(time % 60).toString().padStart(2,"0")}</span>
          <span className="flex items-center gap-1.5 text-muted-foreground">🃏 {moves} moves</span>
          <span className="flex items-center gap-1.5 text-muted-foreground">✅ {matches}/8</span>
        </div>
        <Button size="sm" variant="outline" onClick={initGame} className="rounded-full gap-1.5">
          <RotateCcw className="w-3.5 h-3.5" /> Restart
        </Button>
      </div>

      <AnimatePresence>
        {won && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6 bg-green-50 rounded-2xl border border-green-200">
            <div className="text-4xl mb-2">🏆</div>
            <p className="font-bold text-green-700 text-xl">You won!</p>
            <p className="text-green-600 text-sm mt-1">{moves} moves · {Math.floor(time / 60)}:{(time % 60).toString().padStart(2,"0")}</p>
            <Button onClick={initGame} className="mt-4 rounded-full" size="sm">Play again</Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-sm mx-auto">
        {cards.map((card, i) => (
          <motion.button
            key={card.id}
            onClick={() => flip(i)}
            whileTap={{ scale: 0.95 }}
            className={`aspect-square rounded-xl text-3xl flex items-center justify-center border-2 transition-all cursor-pointer select-none ${
              card.matched ? "bg-green-100 border-green-300 scale-95" :
              card.flipped ? "bg-primary/10 border-primary/30" :
              "bg-muted/40 border-border/50 hover:bg-muted/70"
            }`}
          >
            <span className={card.flipped || card.matched ? "opacity-100" : "opacity-0"}>{card.emoji}</span>
          </motion.button>
        ))}
      </div>
      <p className="text-center text-xs text-muted-foreground">Match all pairs to win! Trains focus and short-term memory.</p>
    </div>
  );
}

// ─── Quick Math ───────────────────────────────────────────────────────────────
function generateQuestion(level: number) {
  const ops = level < 3 ? ["+", "-"] : ["+", "-", "×"];
  const op = ops[Math.floor(Math.random() * ops.length)];
  const max = level < 3 ? 20 : level < 6 ? 50 : 100;
  const a = Math.floor(Math.random() * max) + 1;
  const b = Math.floor(Math.random() * (op === "-" ? a : max)) + 1;
  const answer = op === "+" ? a + b : op === "-" ? a - b : a * b;
  const wrongs = new Set<number>();
  while (wrongs.size < 3) {
    const w = answer + (Math.floor(Math.random() * 11) - 5);
    if (w !== answer && w >= 0) wrongs.add(w);
  }
  const choices = shuffle([answer, ...wrongs]);
  return { question: `${a} ${op} ${b} = ?`, answer, choices };
}

function MathGame() {
  const [q, setQ] = useState(() => generateQuestion(1));
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [done, setDone] = useState(false);
  const total = 10;

  const answer = (choice: number) => {
    if (feedback) return;
    const correct = choice === q.answer;
    setFeedback(correct ? "correct" : "wrong");
    if (correct) setScore(s => s + 1);
    setTimeout(() => {
      if (round >= total) { setDone(true); return; }
      setRound(r => r + 1);
      setQ(generateQuestion(Math.ceil(round / 3)));
      setFeedback(null);
    }, 700);
  };

  const restart = () => { setQ(generateQuestion(1)); setScore(0); setRound(1); setFeedback(null); setDone(false); };

  if (done) return (
    <div className="text-center py-10 space-y-4">
      <div className="text-5xl">{score >= 8 ? "🌟" : score >= 5 ? "👍" : "💪"}</div>
      <p className="text-2xl font-bold text-foreground">{score}/{total}</p>
      <p className="text-muted-foreground">{score >= 8 ? "Excellent! Your mind is sharp." : score >= 5 ? "Good job! Keep practicing." : "Keep going — every session builds your focus."}</p>
      <Button onClick={restart} className="rounded-full">Play again</Button>
    </div>
  );

  return (
    <div className="space-y-8 max-w-sm mx-auto">
      <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
        <span>Question {round}/{total}</span>
        <span className="flex items-center gap-1"><Trophy className="w-4 h-4 text-amber-500" /> {score} pts</span>
      </div>

      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div className="h-full bg-primary rounded-full" animate={{ width: `${(round - 1) / total * 100}%` }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={round}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`text-center py-8 rounded-2xl border-2 transition-colors ${
            feedback === "correct" ? "bg-green-50 border-green-300" :
            feedback === "wrong" ? "bg-red-50 border-red-200" :
            "bg-muted/30 border-border/50"
          }`}
        >
          <p className="text-4xl font-bold text-foreground">{q.question}</p>
          {feedback && <p className="mt-2 text-lg">{feedback === "correct" ? "✅ Correct!" : `❌ Answer: ${q.answer}`}</p>}
        </motion.div>
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-3">
        {q.choices.map((c) => (
          <Button
            key={c}
            variant="outline"
            size="lg"
            onClick={() => answer(c)}
            disabled={!!feedback}
            className="rounded-xl h-14 text-xl font-semibold border-border/60 hover:bg-primary/10 hover:border-primary/40"
          >
            {c}
          </Button>
        ))}
      </div>
      <p className="text-center text-xs text-muted-foreground">Arithmetic sharpens focus and keeps your mind active.</p>
    </div>
  );
}

// ─── Word Scramble ────────────────────────────────────────────────────────────
const WORDS = [
  { word: "PEACE", hint: "A state of calm and quiet" },
  { word: "BALANCE", hint: "Steady and even on all sides" },
  { word: "GROWTH", hint: "Getting better over time" },
  { word: "BREATHE", hint: "Take air in and out" },
  { word: "MINDFUL", hint: "Aware of the present moment" },
  { word: "GRATITUDE", hint: "Feeling thankful" },
  { word: "STRENGTH", hint: "Inner power and resilience" },
  { word: "HEALING", hint: "Getting better after pain" },
  { word: "CLARITY", hint: "Clear thinking and focus" },
  { word: "COURAGE", hint: "Bravery in hard moments" },
];

function scramble(word: string) {
  const arr = word.split("");
  while (arr.join("") === word) arr.sort(() => Math.random() - 0.5);
  return arr.join("");
}

function WordGame() {
  const [idx, setIdx] = useState(0);
  const [scrambled, setScrambled] = useState(() => scramble(WORDS[0].word));
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const current = WORDS[idx];

  const next = () => {
    if (idx + 1 >= WORDS.length) { setDone(true); return; }
    const nextIdx = idx + 1;
    setIdx(nextIdx);
    setScrambled(scramble(WORDS[nextIdx].word));
    setInput(""); setFeedback(null); setShowHint(false);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const correct = input.trim().toUpperCase() === current.word;
    setFeedback(correct ? "correct" : "wrong");
    if (correct) setScore(s => s + 1);
    setTimeout(next, 900);
  };

  const restart = () => { setIdx(0); setScrambled(scramble(WORDS[0].word)); setInput(""); setFeedback(null); setScore(0); setDone(false); setShowHint(false); };

  if (done) return (
    <div className="text-center py-10 space-y-4">
      <div className="text-5xl">{score >= 8 ? "🌟" : "🧠"}</div>
      <p className="text-2xl font-bold">{score}/{WORDS.length}</p>
      <p className="text-muted-foreground">{score >= 8 ? "Amazing vocabulary!" : "Great effort — keep going!"}</p>
      <Button onClick={restart} className="rounded-full">Play again</Button>
    </div>
  );

  return (
    <div className="space-y-6 max-w-sm mx-auto">
      <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
        <span>Word {idx + 1}/{WORDS.length}</span>
        <span className="flex items-center gap-1"><Trophy className="w-4 h-4 text-amber-500" /> {score} pts</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div className="h-full bg-primary rounded-full" animate={{ width: `${idx / WORDS.length * 100}%` }} />
      </div>

      <div className={`text-center py-8 rounded-2xl border-2 space-y-3 transition-colors ${
        feedback === "correct" ? "bg-green-50 border-green-300" :
        feedback === "wrong" ? "bg-red-50 border-red-200" :
        "bg-muted/30 border-border/50"
      }`}>
        <p className="text-xs text-muted-foreground uppercase tracking-widest">Unscramble this word</p>
        <p className="text-4xl font-bold tracking-widest text-primary">{scrambled}</p>
        {showHint && <p className="text-sm text-muted-foreground italic">💡 {current.hint}</p>}
        {feedback && <p className="text-lg font-semibold">{feedback === "correct" ? `✅ ${current.word}` : `❌ ${current.word}`}</p>}
      </div>

      <form onSubmit={submit} className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value.toUpperCase())}
          placeholder="Your answer..."
          disabled={!!feedback}
          className="flex-1 px-4 py-3 rounded-xl border border-border/60 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 uppercase font-semibold tracking-wider"
          autoComplete="off"
        />
        <Button type="submit" disabled={!!feedback || !input.trim()} className="rounded-xl px-5">Go</Button>
      </form>
      <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={() => setShowHint(true)} disabled={showHint}>💡 Show hint</Button>
      <p className="text-center text-xs text-muted-foreground">Word puzzles boost language skills and reduce mental tension.</p>
    </div>
  );
}

// ─── Games Page ───────────────────────────────────────────────────────────────
const GAMES = [
  { id: "memory", label: "Memory Match", icon: Brain, desc: "Flip cards to find matching pairs", component: MemoryGame },
  { id: "math",   label: "Quick Math",   icon: Sigma, desc: "Solve arithmetic challenges",      component: MathGame },
  { id: "word",   label: "Word Scramble",icon: Gamepad2, desc: "Unscramble positive words",    component: WordGame },
];

export default function GamesPage() {
  const [active, setActive] = useState("memory");
  const ActiveGame = GAMES.find(g => g.id === active)!.component;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <Gamepad2 className="w-7 h-7 text-primary" />
          Mind Games
        </h1>
        <p className="text-muted-foreground mt-1 text-lg">Gentle mental exercises to refresh and refocus your mind.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {GAMES.map(g => (
          <button
            key={g.id}
            onClick={() => setActive(g.id)}
            className={`p-4 rounded-2xl border-2 text-left transition-all ${
              active === g.id
                ? "border-primary bg-primary/10 shadow-sm"
                : "border-border/50 bg-card hover:border-primary/40 hover:bg-muted/30"
            }`}
          >
            <g.icon className={`w-5 h-5 mb-2 ${active === g.id ? "text-primary" : "text-muted-foreground"}`} />
            <p className={`text-sm font-semibold ${active === g.id ? "text-primary" : "text-foreground"}`}>{g.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{g.desc}</p>
          </button>
        ))}
      </div>

      <Card className="rounded-3xl border-border/50 shadow-sm overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <ActiveGame />
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
