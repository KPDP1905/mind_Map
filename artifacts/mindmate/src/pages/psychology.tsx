import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePageTheme } from "@/hooks/use-page-theme";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, BookOpen, ChevronRight, ChevronDown, ExternalLink, Play } from "lucide-react";

const TOPICS = [
  {
    id: "what",
    emoji: "🧠",
    title: "What is Psychology?",
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-50 dark:bg-violet-950/30",
    text: "text-violet-700 dark:text-violet-300",
    content: `Psychology is the scientific study of the human mind and behavior. It explores how people think, feel, act, and interact with others. The word "psychology" comes from the Greek words "psyche" (soul/mind) and "logos" (study).

Psychologists study everything from basic brain processes and neural activity to complex social behaviors, personality, emotions, and mental health.

Psychology is both a science (using research methods, experiments, and data) and a practice (applying knowledge to help people live better lives).

**Key areas:** Clinical Psychology, Cognitive Psychology, Developmental Psychology, Social Psychology, Neuropsychology, Health Psychology, Forensic Psychology.`,
  },
  {
    id: "perspectives",
    emoji: "🔍",
    title: "Perspectives of Psychology",
    color: "from-blue-500 to-cyan-600",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    text: "text-blue-700 dark:text-blue-300",
    content: `**Biological Perspective** — Behavior is shaped by genetics, neurotransmitters, hormones, and brain structure. (e.g., depression linked to serotonin levels)

**Psychodynamic Perspective** — Behavior driven by unconscious forces and childhood experiences. (Freud, Jung, Adler)

**Behavioral Perspective** — Behavior is learned through conditioning and reinforcement. (Pavlov, Skinner, Watson)

**Cognitive Perspective** — Focuses on thought processes: perception, memory, problem-solving. (Beck, Bandura)

**Humanistic Perspective** — Emphasizes free will, human potential, and self-actualization. (Maslow, Rogers)

**Sociocultural Perspective** — Behavior shaped by cultural norms, social pressures, and environment. (Vygotsky)

**Evolutionary Perspective** — Behavior explained through natural selection and survival advantages. (Darwin)`,
  },
  {
    id: "goals",
    emoji: "🎯",
    title: "Goals of Psychology",
    color: "from-green-500 to-teal-600",
    bg: "bg-green-50 dark:bg-green-950/30",
    text: "text-green-700 dark:text-green-300",
    content: `Psychology has four main goals:

**1. Describe** — Carefully observe and record behavior to understand what people do. (e.g., documenting symptoms of PTSD)

**2. Explain** — Identify the causes and reasons behind behavior. Why do people behave the way they do?

**3. Predict** — Based on patterns, predict future behavior. Can we forecast who may develop depression?

**4. Control (Change)** — Apply psychological knowledge to influence behavior for positive outcomes. This is the foundation of therapy, education, and public health.

These four goals work together — you can't effectively change behavior without first understanding it.`,
  },
  {
    id: "disorders",
    emoji: "💊",
    title: "What Are Mental Disorders?",
    color: "from-rose-500 to-pink-600",
    bg: "bg-rose-50 dark:bg-rose-950/30",
    text: "text-rose-700 dark:text-rose-300",
    content: `A mental disorder (or mental illness) is a clinically significant pattern of behavior or psychological experience that causes distress or impairs functioning.

**Common disorders include:**
• **Depression** — Persistent sadness, loss of interest, low energy
• **Anxiety Disorders** — GAD, Social Anxiety, Panic Disorder, Phobias
• **OCD** — Obsessive thoughts and compulsive rituals
• **PTSD** — Trauma-related flashbacks and hypervigilance
• **ADHD** — Attention difficulties and hyperactivity
• **Bipolar Disorder** — Extreme mood swings between highs and lows
• **Schizophrenia** — Disrupted thinking, hallucinations
• **Eating Disorders** — Anorexia, Bulimia, Binge Eating

**Diagnosis:** Classified using DSM-5 (Diagnostic and Statistical Manual) or ICD-11.

**Key insight:** Mental disorders exist on a spectrum. Having symptoms doesn't mean you're "broken" — it means your mind needs support, just like a body needs medicine for a physical illness. ❤️`,
  },
  {
    id: "importance",
    emoji: "🌟",
    title: "Why Is Psychology Important?",
    color: "from-amber-500 to-orange-600",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    text: "text-amber-700 dark:text-amber-300",
    content: `Psychology matters in every aspect of life:

**Mental Health:** Helps diagnose and treat depression, anxiety, trauma, and hundreds of other conditions.

**Education:** Understanding how children learn helps teachers create better curricula and support struggling students.

**Relationships:** Psychology helps us understand attachment, communication, conflict resolution, and love.

**Workplace:** Organizational psychology improves productivity, leadership, and employee well-being.

**Society:** Helps reduce prejudice, understand crime, improve public health campaigns.

**Self-Understanding:** Perhaps most importantly — psychology helps YOU understand why you feel and act the way you do, giving you power to change.

In India, mental health awareness is growing rapidly. 1 in 5 Indians experience a mental health condition annually — psychology is not a luxury, it's a necessity.`,
  },
  {
    id: "trauma",
    emoji: "🌱",
    title: "Childhood Trauma, Yoga & Meditation",
    color: "from-teal-500 to-green-600",
    bg: "bg-teal-50 dark:bg-teal-950/30",
    text: "text-teal-700 dark:text-teal-300",
    content: `**Childhood Trauma** occurs when a child experiences events too overwhelming for their developing mind to process. This can reshape brain development — especially the amygdala (fear center) and prefrontal cortex (decision-making).

Types of childhood trauma: abuse (physical, emotional, sexual), neglect, witnessing violence, losing a parent, severe illness, bullying.

**Long-term effects:** PTSD, anxiety, depression, difficulty trusting, emotional dysregulation, relationship problems.

**Healing is possible.** Research shows neuroplasticity — the brain's ability to rewire — means trauma can heal with the right support.

**Yoga for trauma:** "Trauma-sensitive yoga" helps survivors reconnect with their body safely. Poses like Child's Pose, Legs-Up-the-Wall, and gentle flows activate the parasympathetic system.

**Meditation:** Mindfulness-based stress reduction (MBSR) has strong clinical evidence for trauma. Regular meditation decreases cortisol, shrinks the amygdala, and grows the prefrontal cortex.

**Remember:** Healing isn't linear. Be patient with yourself. 🌱`,
  },
];

const PSYCHOLOGISTS = [
  {
    name: "Sigmund Freud",
    years: "1856–1939",
    nationality: "🇦🇹 Austrian",
    title: "Father of Psychoanalysis",
    theory: "Psychoanalytic Theory",
    emoji: "🛋️",
    keyIdeas: [
      "The unconscious mind drives most behavior",
      "Id, Ego, Superego — three parts of personality",
      "Psychosexual stages of development",
      "Defense mechanisms (repression, projection, denial)",
      "Dream analysis as a window to the unconscious",
    ],
    famousExperiment: "The 'talking cure' — case studies of Anna O., Dora, and others. Developed free association and dream analysis as therapeutic tools.",
    contribution: "Founded psychotherapy and made the mind a legitimate subject of scientific study. Controversial but enormously influential.",
    ytId: "AIFyB5c4-E0",
  },
  {
    name: "Carl Jung",
    years: "1875–1961",
    nationality: "🇨🇭 Swiss",
    title: "Founder of Analytical Psychology",
    theory: "Analytical/Jungian Psychology",
    emoji: "🔮",
    keyIdeas: [
      "Collective unconscious — shared unconscious symbols",
      "Archetypes (The Hero, The Shadow, Anima/Animus)",
      "Introversion vs Extroversion (basis of MBTI)",
      "Individuation — becoming your true self",
      "Synchronicity — meaningful coincidences",
    ],
    famousExperiment: "Word Association Test — revealed unconscious 'complexes' by measuring reaction time to stimulus words.",
    contribution: "His work on personality types gave us introvert/extrovert, and the MBTI is directly based on his theory. The Shadow concept revolutionized self-work.",
    ytId: "2AmPgOgPbgY",
  },
  {
    name: "B.F. Skinner",
    years: "1904–1990",
    nationality: "🇺🇸 American",
    title: "Father of Operant Conditioning",
    theory: "Behaviorism",
    emoji: "📦",
    keyIdeas: [
      "Operant conditioning — behavior shaped by consequences",
      "Reinforcement (positive/negative) and punishment",
      "Schedules of reinforcement control behavior strength",
      "All behavior is learned — free will is an illusion",
      "Behavior modification therapy",
    ],
    famousExperiment: "The Skinner Box — placed rats/pigeons in a box with levers. Pressing a lever delivered food (reward) or stopped shock (negative reinforcement), demonstrating operant conditioning.",
    contribution: "Principles used everywhere: dog training, schools, apps (like slot machine design), addiction treatment, autism therapy (ABA).",
    ytId: "yhvaSEJtOV8",
  },
  {
    name: "Ivan Pavlov",
    years: "1849–1936",
    nationality: "🇷🇺 Russian",
    title: "Discoverer of Classical Conditioning",
    theory: "Classical Conditioning",
    emoji: "🐕",
    keyIdeas: [
      "Classical conditioning — pairing stimuli to produce learned responses",
      "Unconditioned stimulus (food) → Unconditioned response (salivation)",
      "Conditioned stimulus (bell) → Conditioned response after pairing",
      "Extinction — conditioned response disappears without reinforcement",
      "Generalization and discrimination",
    ],
    famousExperiment: "The Dog Experiment — rang a bell before feeding dogs. Eventually, just the bell made them salivate. First scientific demonstration of learned responses.",
    contribution: "Basis for understanding fears, phobias, addictions, and PTSD triggers. Therapy technique 'systematic desensitization' comes directly from his work.",
    ytId: "hhqumfpxuzI",
  },
  {
    name: "Abraham Maslow",
    years: "1908–1970",
    nationality: "🇺🇸 American",
    title: "Father of Humanistic Psychology",
    theory: "Hierarchy of Needs",
    emoji: "🔺",
    keyIdeas: [
      "Hierarchy of Needs — 5-level pyramid of human motivation",
      "Physiological → Safety → Love → Esteem → Self-Actualization",
      "Peak experiences — moments of profound happiness and fulfillment",
      "Self-actualization — becoming your fullest potential",
      "Study of healthy people rather than troubled ones",
    ],
    famousExperiment: "Studied exemplary individuals (Einstein, Gandhi, Eleanor Roosevelt) to understand peak human functioning — opposite of studying dysfunction.",
    contribution: "The Hierarchy of Needs is one of the most recognized psychology models. Used in business, education, nursing, and personal development worldwide.",
    ytId: "4l4BRFkxIFk",
  },
  {
    name: "Viktor Frankl",
    years: "1905–1997",
    nationality: "🇦🇹 Austrian",
    title: "Founder of Logotherapy",
    theory: "Existential/Logotherapy",
    emoji: "🕯️",
    keyIdeas: [
      "Man's search for meaning is the primary drive in life",
      "Logotherapy — finding meaning even in suffering",
      "Three ways to find meaning: creating work, experiencing love, suffering with dignity",
      "The 'last of human freedoms' — choosing your attitude in any situation",
      "Existential vacuum — emptiness when meaning is absent",
    ],
    famousExperiment: "Survived four Nazi concentration camps including Auschwitz. Observed that those who held onto meaning survived longer. Documented in 'Man's Search for Meaning'.",
    contribution: "His book is one of the most influential psychology books ever written. Logotherapy is used for depression, addiction, and end-of-life care.",
    ytId: "vocHZGRE_YA",
  },
];

export default function PsychologyPage() {
  usePageTheme("linear-gradient(135deg, #f5f0ff 0%, #ede8ff 40%, #f0f0ff 70%, #f8f5ff 100%)");
  const [openTopic, setOpenTopic] = useState<string | null>("what");
  const [selectedPsych, setSelectedPsych] = useState<string | null>(null);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "Georgia, serif", color: "#5b21b6" }}>
          🧠 Learn Psychology
        </h1>
        <p className="text-muted-foreground mt-1 text-lg">Understand the science of the mind. Understand yourself.</p>
      </div>

      {/* Topic accordion */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-violet-500" /> Core Concepts
        </h2>
        {TOPICS.map((topic) => (
          <motion.div key={topic.id} layout>
            <Card className={`rounded-2xl border-border/50 shadow-sm overflow-hidden transition-all ${openTopic === topic.id ? "shadow-md" : ""}`}>
              <button
                className="w-full p-5 flex items-center gap-4 text-left"
                onClick={() => setOpenTopic(openTopic === topic.id ? null : topic.id)}
              >
                <div className={`w-12 h-12 rounded-2xl ${topic.bg} flex items-center justify-center text-2xl flex-shrink-0`}>
                  {topic.emoji}
                </div>
                <div className="flex-1">
                  <p className={`font-semibold text-base ${topic.text}`}>{topic.title}</p>
                </div>
                <motion.div animate={{ rotate: openTopic === topic.id ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                </motion.div>
              </button>

              <AnimatePresence>
                {openTopic === topic.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className={`px-5 pb-6 ${topic.bg} border-t border-border/50`}>
                      <div className="pt-4 prose prose-sm max-w-none text-foreground leading-relaxed">
                        {topic.content.split("\n\n").map((para, i) => (
                          <p key={i} className="mb-3 text-sm leading-relaxed">
                            {para.split(/\*\*(.+?)\*\*/g).map((part, j) =>
                              j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                            )}
                          </p>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Famous Psychologists */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Brain className="w-5 h-5 text-violet-500" /> Famous Psychologists
        </h2>
        <p className="text-sm text-muted-foreground">Their discoveries shaped how we understand the human mind.</p>

        <div className="grid gap-4">
          {PSYCHOLOGISTS.map((psych) => (
            <motion.div key={psych.name} layout>
              <Card className={`rounded-2xl border-border/50 shadow-sm overflow-hidden ${selectedPsych === psych.name ? "ring-2 ring-violet-300" : ""}`}>
                <button
                  className="w-full p-5 flex items-start gap-4 text-left"
                  onClick={() => setSelectedPsych(selectedPsych === psych.name ? null : psych.name)}
                >
                  <div className="w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-950/40 flex items-center justify-center text-2xl flex-shrink-0">
                    {psych.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-lg text-foreground">{psych.name}</p>
                    <p className="text-sm text-violet-600 dark:text-violet-400 font-medium">{psych.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{psych.nationality} · {psych.years}</p>
                  </div>
                  <motion.div animate={{ rotate: selectedPsych === psych.name ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-5 h-5 text-muted-foreground mt-1" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {selectedPsych === psych.name && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-5 pb-6 border-t border-border/50 bg-muted/10 space-y-5">
                        <div className="pt-4">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Core Theory: {psych.theory}</p>
                          <ul className="space-y-2">
                            {psych.keyIdeas.map((idea, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                                <span className="text-violet-500 mt-0.5 flex-shrink-0">•</span>
                                {idea}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-4 bg-violet-50 dark:bg-violet-950/20 rounded-xl border border-violet-100 dark:border-violet-900">
                          <p className="text-xs font-semibold text-violet-700 dark:text-violet-300 mb-2">🔬 Famous Experiment / Contribution</p>
                          <p className="text-sm text-foreground leading-relaxed">{psych.famousExperiment}</p>
                        </div>

                        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900">
                          <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">🌍 Why They Matter Today</p>
                          <p className="text-sm text-foreground leading-relaxed">{psych.contribution}</p>
                        </div>

                        <a
                          href={`https://www.youtube.com/watch?v=${psych.ytId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900 hover:bg-red-100 transition-colors group"
                        >
                          <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                            <Play className="w-4 h-4 text-white ml-0.5" />
                          </div>
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-300 text-sm">Watch Biography on YouTube</p>
                            <p className="text-xs text-muted-foreground">Learn the full story of {psych.name.split(" ")[1]}</p>
                          </div>
                          <ExternalLink className="w-4 h-4 text-red-400 ml-auto group-hover:text-red-600 transition-colors" />
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
