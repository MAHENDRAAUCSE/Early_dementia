import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Pause, Play, RefreshCw, Volume2, VolumeX, Brain, Sparkles, ChevronRight, ChevronLeft, RotateCw, User } from "lucide-react";

type Step = "welcome" | "memory" | "speech" | "attention" | "analysis" | "results";

const WORD_POOL = [
  "apple",
  "river",
  "book",
  "tree",
  "phone",
  "chair",
  "window",
  "garden",
  "music",
  "ocean",
  "mountain",
  "paper",
  "coffee",
  "bridge",
  "flower",
  "mirror",
  "pencil",
  "planet",
  "forest",
  "island",
  "train",
  "lamp",
  "cloud",
  "star",
  "bottle",
  "door",
  "car",
  "clock",
  "shoe",
  "plate",
];

function sampleWords(n: number) {
  const pool = [...WORD_POOL];
  const out: string[] = [];
  while (out.length < n && pool.length) {
    const idx = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}

function useCountdown(ms: number, deps: any[] = []) {
  const [remaining, setRemaining] = useState(ms);
  useEffect(() => {
    setRemaining(ms);
    const started = performance.now();
    let raf = 0;
    const tick = () => {
      const elapsed = performance.now() - started;
      const left = Math.max(0, ms - elapsed);
      setRemaining(left);
      if (left > 0) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, deps);
  return remaining;
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function generateRecommendations(riskLevel: 'Low' | 'Medium' | 'High'): string[] {
  switch (riskLevel) {
    case 'Low':
      return [
        'Continue regular cognitive activities like reading and puzzles',
        'Maintain a healthy lifestyle with regular exercise',
        'Consider retesting in 6-12 months',
        'Share results with your healthcare provider if you have concerns'
      ];
    case 'Medium':
      return [
        'Schedule a follow-up evaluation with a healthcare provider',
        'Consider cognitive training exercises',
        'Monitor for any changes in memory or thinking',
        'Maintain social activities and mental stimulation',
        'Consider retesting in 3-6 months'
      ];
    case 'High':
      return [
        'Schedule an appointment with a healthcare provider soon',
        'Consider a comprehensive neurological evaluation',
        'Discuss these results with your doctor',
        'Monitor daily activities and cognitive changes',
        'Consider involving family members in care planning'
      ];
    default:
      return ['Consult with a healthcare provider for guidance'];
  }
}

export default function Index() {
  const [step, setStep] = useState<Step>("welcome");
  const [words, setWords] = useState<string[]>(() => sampleWords(5));
  const [showWords, setShowWords] = useState(true);
  const [memoryCycle, setMemoryCycle] = useState(0);
  const [memoryInputs, setMemoryInputs] = useState<string[]>(["", "", "", "", ""]);
  const [memoryScore, setMemoryScore] = useState(0);
  const [lastAttentionFeedback, setLastAttentionFeedback] = useState<string | null>(null);
  const [userLoggedIn, setUserLoggedIn] = useState<string | null>(null);

  useEffect(() => {
    const user = localStorage.getItem("guardian_medics_user");
    setUserLoggedIn(user);
  }, []);

  const [recording, setRecording] = useState(false);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number>(0);
  const [speechDuration, setSpeechDuration] = useState(0);
  const [speakingRatio, setSpeakingRatio] = useState(0);
  const [pauseCount, setPauseCount] = useState(0);
  const speakingFramesRef = useRef(0);
  const totalFramesRef = useRef(0);
  const lastSpeakingTsRef = useRef<number | null>(null);
  const inSilenceRef = useRef(true);
  const pauseCounterRef = useRef(0);

  const [seqIndex, setSeqIndex] = useState(0);
  const [sequences, setSequences] = useState<number[][]>(() => generateSequences([3, 4]));
  const [showSequence, setShowSequence] = useState(true);
  const [userForward, setUserForward] = useState("");
  const [userBackward, setUserBackward] = useState("");
  const [attentionCorrect, setAttentionCorrect] = useState(0);

  const [userClickSequence, setUserClickSequence] = useState<number[]>([]);
  const [highlightedNumber, setHighlightedNumber] = useState<number | null>(null);

  useEffect(() => {
    if (step === "attention") {
      const seqs = generateSequences([3, 4]);
      setSequences(seqs);
      setSeqIndex(0);
      setShowSequence(true);
      setUserClickSequence([]);
      setAttentionCorrect(0);
    }
  }, [step]);

  useEffect(() => {
    let mounted = true;
    if (step !== "attention") return;
    if (!showSequence) return;

    const run = async () => {
      await new Promise((r) => setTimeout(r, 500));
      for (const n of sequences[seqIndex]) {
        if (!mounted) return;
        setHighlightedNumber(n);
        await new Promise((r) => setTimeout(r, 700));
        setHighlightedNumber(null);
        await new Promise((r) => setTimeout(r, 250));
      }
      if (!mounted) return;
      setShowSequence(false);
    };
    run();
    return () => {
      mounted = false;
      setHighlightedNumber(null);
    };
  }, [step, seqIndex, showSequence, sequences]);

  const evaluateSequence = useCallback((userSeq: number[]) => {
    const expected = sequences[seqIndex];
    let correct = 0;
    for (let i = 0; i < expected.length; i++) {
      if (userSeq[i] === expected[i]) correct += 1;
    }
    setAttentionCorrect((c) => c + correct);
    setLastAttentionFeedback(`${correct}/${expected.length} correct`);
    setTimeout(() => setLastAttentionFeedback(null), 1500);
    setUserClickSequence([]);
    if (seqIndex + 1 < sequences.length) {
      setTimeout(() => {
        setSeqIndex((s) => s + 1);
        setShowSequence(true);
      }, 800);
    } else {
      setTimeout(() => setStep("analysis"), 800);
    }
  }, [seqIndex, sequences]);
  function generateSequence(length: number) {
    const pool = [1,2,3,4,5,6,7,8,9];
    const out: number[] = [];
    while (out.length < length && pool.length) {
      const idx = Math.floor(Math.random() * pool.length);
      out.push(pool.splice(idx,1)[0]);
    }
    return out;
  }

  function generateSequences(lengths: number[]) {
    return lengths.map((l) => generateSequence(l));
  }

  const progress = useMemo(() => {
    switch (step) {
      case "welcome":
        return 5;
      case "memory":
        return 25;
      case "speech":
        return 50;
      case "attention":
        return 70;
      case "analysis":
        return 85;
      case "results":
        return 100;
    }
  }, [step]);

  useEffect(() => {
    if (step === "memory") {
      setShowWords(true);
      setMemoryInputs(["", "", "", "", ""]);
      const t1 = setTimeout(() => setShowWords(false), 6000);
      return () => clearTimeout(t1);
    }
  }, [step]);

  const countdown = useCountdown(6000, [step, memoryCycle]);

  const scoreMemory = useCallback(() => {
    const guessed = new Set(
      memoryInputs
        .map((s) => s.trim().toLowerCase())
        .filter((s) => s.length > 0),
    );
    let correct = 0;
    for (const w of words) {
      if (guessed.has(w)) correct += 1;
    }
    const s = correct / words.length;
    setMemoryScore(s);
    return { correct, score: s };
  }, [memoryInputs, words]);

  const stopAudioGraph = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    if (analyserRef.current) analyserRef.current.disconnect();
    if (audioCtxRef.current) audioCtxRef.current.close();
    analyserRef.current = null;
    audioCtxRef.current = null;
  };

  const startRecording = async () => {
    try {
      setAudioURL(null);
      setPauseCount(0);
      setSpeakingRatio(0);
      setSpeechDuration(0);
      speakingFramesRef.current = 0;
      totalFramesRef.current = 0;
      lastSpeakingTsRef.current = null;
      inSilenceRef.current = true;
      pauseCounterRef.current = 0;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      recordedChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
        setAudioURL(URL.createObjectURL(blob));
      };

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 1024;
      analyserRef.current = analyser;
      source.connect(analyser);

      const startTs = performance.now();
      const buffer = new Uint8Array(analyser.frequencyBinCount);
      const MIN_PAUSE_MS = 700;
      const SILENCE_RMS = 0.02;
      let lastStateSpeaking = false;

      const loop = () => {
        analyser.getByteTimeDomainData(buffer);
        let sumSq = 0;
        for (let i = 0; i < buffer.length; i++) {
          const v = (buffer[i] - 128) / 128;
          sumSq += v * v;
        }
        const rms = Math.sqrt(sumSq / buffer.length);
        const speakingNow = rms > SILENCE_RMS;

        totalFramesRef.current += 1;
        if (speakingNow) {
          speakingFramesRef.current += 1;
          lastSpeakingTsRef.current = performance.now();
          lastStateSpeaking = true;
        } else {
          if (lastStateSpeaking && lastSpeakingTsRef.current && performance.now() - lastSpeakingTsRef.current > MIN_PAUSE_MS) {
            pauseCounterRef.current += 1;
            lastSpeakingTsRef.current = null;
            lastStateSpeaking = false;
          }
        }

        const elapsed = performance.now() - startTs;
        setSpeechDuration(elapsed);
        setSpeakingRatio(
          speakingFramesRef.current / Math.max(1, totalFramesRef.current),
        );
        setPauseCount(pauseCounterRef.current);
        rafRef.current = requestAnimationFrame(loop);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setRecording(true);
      rafRef.current = requestAnimationFrame(loop);
    } catch (e) {
      console.error(e);
      alert("Microphone access is required for the speech task.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    stopAudioGraph();
    setRecording(false);
  };

  useEffect(() => {
    return () => {
      stopRecording();
      stopAudioGraph();
    };
  }, []);

  const computedScores = useMemo(() => {
    const speechScore = clamp01(0.6 * speakingRatio + 0.4 * (1 - Math.min(pauseCount, 6) / 6));
    const attentionTotal = sequences.reduce((s, arr) => s + arr.length, 0);
    const attentionScore = attentionTotal > 0 ? attentionCorrect / attentionTotal : 0.5;

    const composite = 0.5 * memoryScore + 0.35 * speechScore + 0.15 * (attentionCorrect ? attentionScore : 0.5);
    const risk = clamp01(1 - composite);
    let label: "Low" | "Medium" | "High" = "Low";
    if (risk >= 0.66) label = "High";
    else if (risk >= 0.33) label = "Medium";

    return { speechScore, attentionScore, composite, risk, label };
  }, [memoryScore, speakingRatio, pauseCount, attentionCorrect, sequences]);

  useEffect(() => {
    if (step !== "results") return;
    
    const saveAssessment = async () => {
      try {
        const phone = localStorage.getItem("guardian_medics_user");
        if (!phone) {
          console.error("No user logged in");
          return;
        }

        const wordsRecalled = memoryInputs
          .map(input => input.toLowerCase().trim())
          .filter(input => input && words.map(w => w.toLowerCase()).includes(input));

        const totalQuestions = sequences.reduce((sum, seq) => sum + seq.length, 0);

        const assessmentData = {
          userId: phone,
          scores: {
            memoryScore,
            speechScore: computedScores.speechScore,
            attentionScore: computedScores.attentionScore,
            overallScore: computedScores.composite,
          },
          details: {
            memoryTest: {
              wordsRecalled,
              totalWords: words.length,
              score: memoryScore,
            },
            speechTest: {
              pauseCount,
              speakingRatio,
              score: computedScores.speechScore,
            },
            attentionTest: {
              correctAnswers: attentionCorrect,
              totalQuestions,
              score: computedScores.attentionScore,
            },
          },
          riskLevel: computedScores.label,
          recommendations: generateRecommendations(computedScores.label),
        };

        console.log("Assessment completed successfully");

        const historyRaw = localStorage.getItem("guardian_medics_history");
        const history = historyRaw ? JSON.parse(historyRaw) : [];
        const item = {
          id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          ts: Date.now(),
          phone,
          memoryScore,
          speechScore: computedScores.speechScore,
          attentionScore: computedScores.attentionScore,
          label: computedScores.label,
        };
        history.push(item);
        localStorage.setItem("guardian_medics_history", JSON.stringify(history));
      } catch (error) {
        console.error("Failed to save assessment:", error);
      }
    };

    saveAssessment();
  }, [step, computedScores, memoryScore, words, memoryInputs, pauseCount, speakingRatio, attentionCorrect, sequences]);

  const resetAll = () => {
    setStep("welcome");
    setWords(sampleWords(5));
    setShowWords(true);
    setMemoryInputs(["", "", "", "", ""]);
    setMemoryScore(0);
    setRecording(false);
    setAudioURL(null);
    setSpeechDuration(0);
    setSpeakingRatio(0);
    setPauseCount(0);
    setSeqIndex(0);
    setShowSequence(true);
    setUserForward("");
    setUserBackward("");
    setAttentionCorrect(0);
    setUserClickSequence([]);
    setHighlightedNumber(null);
    setLastAttentionFeedback(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40">
      {/* Hero / Problem & Solution */}
      <section className="border-b bg-gradient-to-br from-primary/5 via-transparent to-accent/40">
        <div className="container py-16 md:py-24">
          <div className="grid md:grid-cols-2 items-center gap-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium shadow-sm">
                <Sparkles className="h-4 w-4 text-primary" /> Live Prototype
              </div>
              <h1 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight">
                AI-Powered Health Assessment, Simplified
              </h1>
              <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
                Dementia often goes undiagnosed in early stages because early cognitive decline is subtle. By the time symptoms are obvious, it’s too late for effective intervention.
              </p>
              <div className="mt-6 rounded-xl border bg-card p-4 md:p-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <Brain className="h-6 w-6 text-primary mt-0.5" />
                  <p className="text-base md:text-lg">
                    We built an <span className="font-semibold">AI-powered dementia screener</span> that detects early risk using <span className="font-semibold">speech + memory/thinking tasks</span>. It’s affordable, accessible, and supports vernacular languages.
                  </p>
                </div>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" onClick={() => setStep("memory")}>
                  Start Assessment <ChevronRight className="h-4 w-4" />
                </Button>
                <a href="#prototype" className="text-primary inline-flex items-center gap-2">
                  Explore flow
                  <ChevronRight className="h-4 w-4" />
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-primary/20 to-accent/30 blur-2xl" />
              <div className="relative rounded-3xl border bg-card p-6 shadow-xl">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-green-500" /> Secure, private, on-device prototype
                </div>
                <div className="mt-6 aspect-[4/3] w-full rounded-xl bg-gradient-to-br from-muted to-background grid place-items-center text-muted-foreground">
                  <Mic className="h-10 w-10 opacity-70" />
                </div>
                <div className="mt-6">
                  <Progress value={progress} />
                  <div className="mt-2 text-sm text-muted-foreground">Prototype progress</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* User Dashboard Notification */}
      {userLoggedIn && (
        <section className="border-b bg-muted/30">
          <div className="container py-6">
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Welcome back!</p>
                    <p className="text-sm text-muted-foreground">View your profile and assessment history</p>
                  </div>
                </div>
                <Link to="/my-profile">
                  <Button variant="outline" size="sm">
                    Go to My Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Flow */}
      <section id="prototype" className="container py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Badge variant="secondary">Step</Badge>
              <div className="text-sm text-muted-foreground">Less than 5 minutes</div>
            </div>
            <div className="w-1/2"><Progress value={progress} /></div>
          </div>

          {step === "welcome" && (
            <StepCard
              title="Welcome to Detect Neural Dementia"
              subtitle="Our AI-powered cognitive health assessment takes less than 5 minutes and can be used at home or in clinics."
              primaryCta={{ label: "Begin", onClick: () => setStep("memory"), icon: <ChevronRight className="h-4 w-4" /> }}
            />
          )}

          {step === "memory" && (
            <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl font-semibold">Memory Task</h2>
              <p className="mt-2 text-muted-foreground">
                The user is shown 5 random words. After a short pause, they are asked to recall the words.
              </p>

              {showWords ? (
                <div className="mt-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {words.map((w) => (
                      <div key={w} className="rounded-lg border bg-background px-3 py-2 text-center font-semibold">
                        {w}
                      </div>
                    ))}
                  </div>
                  <div className="mt-6">
                    <Progress value={((6000 - countdown) / 6000) * 100} />
                    <div className="mt-2 text-sm text-muted-foreground">Memorize these words…</div>
                  </div>
                </div>
              ) : (
                <div className="mt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                    {memoryInputs.map((val, i) => (
                      <input
                        key={i}
                        value={val}
                        onChange={(e) => {
                          const next = [...memoryInputs];
                          next[i] = e.target.value;
                          setMemoryInputs(next);
                        }}
                        placeholder={`Word ${i + 1}`}
                        className="w-full rounded-md border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                      />
                    ))}
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <Button variant="secondary" onClick={() => { setShowWords(true); setMemoryCycle((k) => k + 1); }} className="inline-flex items-center gap-2">
                      <RotateCw className="h-4 w-4" /> Show again
                    </Button>
                    <div className="flex items-center gap-3">
                      <Button variant="ghost" onClick={() => { const { correct } = scoreMemory(); setStep("speech"); }}>
                        Skip
                      </Button>
                      <Button onClick={() => { const { correct } = scoreMemory(); setStep("speech"); }} className="inline-flex items-center gap-2">
                        Continue <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === "speech" && (
            <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl font-semibold">Speech Task</h2>
              <p className="mt-2 text-muted-foreground">
                Describe the picture or narrate a short story. Your speech is recorded and analyzed for pauses and fluency.
              </p>
              <div className="mt-6 grid gap-6 md:grid-cols-[1.5fr_1fr]">
                <div>
                  <div className="aspect-video w-full overflow-hidden rounded-xl border bg-background grid place-items-center">
                    <img src="/placeholder.svg" alt="Describe this scene" className="h-full w-full object-contain p-6 opacity-80" />
                  </div>
                  <div className="mt-6 flex items-center gap-3">
                    {!recording ? (
                      <Button onClick={startRecording} className="inline-flex items-center gap-2">
                        <Mic className="h-4 w-4" /> Start Recording
                      </Button>
                    ) : (
                      <Button variant="destructive" onClick={stopRecording} className="inline-flex items-center gap-2">
                        <Pause className="h-4 w-4" /> Stop
                      </Button>
                    )}
                    {audioURL && (
                      <audio controls src={audioURL} className="ml-2" />
                    )}
                  </div>
                </div>
                <div>
                  <div className="rounded-lg border bg-background p-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        {speakingRatio > 0.05 ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />} Live levels
                      </div>
                      <div>{(speechDuration / 1000).toFixed(1)}s</div>
                    </div>
                    <AudioLevelBar analyser={analyserRef.current} />
                    <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                      <Metric label="Pauses" value={pauseCount} />
                      <Metric label="Speaking" value={`${Math.round(speakingRatio * 100)}%`} />
                      <Metric label="Quality" value={`${Math.round(clamp01(0.6 * speakingRatio + 0.4 * (1 - Math.min(pauseCount, 6) / 6)) * 100)}%`} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <Button variant="ghost" onClick={() => setStep("memory")}> <ChevronLeft className="h-4 w-4" /> Back</Button>
                <div className="flex items-center gap-3">
                  <Button variant="ghost" onClick={() => setStep("attention")}>Skip</Button>
                  <Button onClick={() => setStep("attention")}>Continue <ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          )}

          {step === "attention" && (
            <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl font-semibold">Attention Game — Click the Sequence</h2>
              <p className="mt-2 text-muted-foreground">Watch the numbers flash, then click them in the same order. Tap each tile in sequence.</p>

              <div className="mt-6">
                {showSequence ? (
                  <div className="rounded-lg border bg-background p-6 text-center">
                    <div className="text-sm text-muted-foreground">Watch carefully</div>
                    <div className="mt-4 text-4xl font-bold h-20 grid place-items-center">{highlightedNumber ?? ""}</div>
                  </div>
                ) : (
                  <div>
                    <div className="grid grid-cols-3 gap-3">
                      {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => {
                        const clickedIndex = userClickSequence.findIndex((v) => v === n);
                        const showOrder = clickedIndex >= 0 ? clickedIndex + 1 : null;
                        return (
                          <button
                            key={n}
                            onClick={() => {
                              if (userClickSequence.length >= sequences[seqIndex].length) return;
                              setUserClickSequence((s) => {
                                const next = [...s, n];
                                if (next.length === sequences[seqIndex].length) {
                                  evaluateSequence(next);
                                }
                                return next;
                              });
                            }}
                            className={`h-16 rounded-lg border bg-background text-2xl font-semibold relative flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary ${clickedIndex >= 0 ? "opacity-60" : "hover:scale-105"}`}
                          >
                            {n}
                            {showOrder && <span className="absolute -top-2 -right-2 rounded-full bg-primary text-white text-xs w-6 h-6 grid place-items-center">{showOrder}</span>}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      <Button variant="ghost" onClick={() => { setUserClickSequence([]); setLastAttentionFeedback(null); }}>Clear</Button>
                      <Button variant="secondary" onClick={() => evaluateSequence(userClickSequence)}>Submit</Button>
                      <div className="ml-auto text-sm text-muted-foreground">Clicked {userClickSequence.length}/{sequences[seqIndex].length}</div>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex items-center justify-between">
                  <Button variant="ghost" onClick={() => setStep("speech")}><ChevronLeft className="h-4 w-4" /> Back</Button>
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" onClick={() => setStep("analysis")}>Skip</Button>
                    {showSequence ? (
                      <Button onClick={() => setShowSequence(false)}>I'm ready</Button>
                    ) : (
                      <Button onClick={() => {
                        setSeqIndex((s) => (s + 1) % sequences.length);
                        setShowSequence(true);
                        setUserClickSequence([]);
                      }}>
                        Next
                      </Button>
                    )}
                  </div>
                </div>

                {lastAttentionFeedback && (
                  <div className="mt-4 rounded-md border bg-background p-3 text-sm font-medium">{lastAttentionFeedback}</div>
                )}
              </div>
            </div>
          )}







          {step === "analysis" && (
            <div className="rounded-2xl border bg-card p-8 shadow-sm grid place-items-center text-center">
              <div className="animate-pulse">
                <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 grid place-items-center">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">Running AI Risk Analysis…</h3>
                <p className="mt-2 text-muted-foreground">Combining memory, speech and attention signals</p>
              </div>
              <div className="mt-8 w-full">
                <Progress value={85} />
              </div>
              <div className="mt-6">
                <Button onClick={() => setStep("results")} className="inline-flex items-center gap-2">
                  View Results <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === "results" && (
            <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-semibold">Assessment Results</h2>
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      computedScores.label === "Low"
                        ? "bg-emerald-600 text-white"
                        : computedScores.label === "Medium"
                        ? "bg-amber-500 text-white"
                        : "bg-rose-600 text-white"
                    }
                  >
                    {computedScores.label} Risk
                  </Badge>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <ResultCard title="Memory" value={`${Math.round(memoryScore * 100)}%`} detail={`${Math.round(memoryScore * 5)}/5 words recalled`} />
                <ResultCard title="Speech" value={`${Math.round(computedScores.speechScore * 100)}%`} detail={`${pauseCount} pauses • ${Math.round(speakingRatio * 100)}% speaking`} />
                <ResultCard title="Attention" value={`${Math.round(computedScores.attentionScore * 100)}%`} detail={`${attentionCorrect}/${sequences.reduce((s,a)=>s+a.length,0)} correct`} />
              </div>

              <div className="mt-6 rounded-xl border bg-background p-4">
                {computedScores.label === "Low" && (
                  <p>✅ Low risk detected. We recommend retesting periodically. If you or family notice changes, consult a clinician.</p>
                )}
                {computedScores.label === "Medium" && (
                  <p>⚠️ Medium risk detected. Consider a follow-up evaluation and share this report with a healthcare provider.</p>
                )}
                {computedScores.label === "High" && (
                  <p>❗ High risk detected. We recommend a clinical referral for comprehensive assessment.</p>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <Button variant="secondary" onClick={resetAll} className="inline-flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" /> Restart
                </Button>
                <div className="text-sm text-muted-foreground">
                  Detect Neural Dementia demonstrates how AI can enhance preventive healthcare through accessible, non-invasive assessments. With multi-language support and scalable technology, this can transform health screening across healthcare systems.
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* About Dementia Section */}
      <section className="bg-muted/20 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Understanding Dementia</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Early detection can make a life-changing difference
            </p>
          </div>
          
          <div className="mx-auto max-w-6xl mt-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">55+ Million Affected</h3>
                <p className="text-muted-foreground">
                  Worldwide, with someone developing dementia every 3 seconds. Early intervention can slow cognitive decline by up to 30%.
                </p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Early Detection Key</h3>
                <p className="text-muted-foreground">
                  Cognitive decline begins 10-20 years before obvious symptoms. Our AI screening identifies subtle changes early.
                </p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Accessible Care</h3>
                <p className="text-muted-foreground">
                  Our AI assessment costs 90% less than traditional evaluations, making screening accessible to everyone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-transparent to-accent/40">
        <div className="container">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Our Team</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Guardians Medics - Dedicated to advancing healthcare through AI innovation
            </p>
            
            <div className="mt-12 rounded-2xl border bg-card p-8 shadow-sm max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold">Guardians Medics</h3>
              </div>
              
              <p className="text-muted-foreground leading-relaxed">
                We are a passionate team of healthcare professionals, AI researchers, and technology innovators 
                committed to making early dementia detection accessible worldwide. Our mission is to empower 
                individuals and healthcare providers with cutting-edge AI tools that can identify cognitive 
                changes before they become irreversible.
              </p>
              
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Badge variant="secondary" className="px-4 py-2">AI Research</Badge>
                <Badge variant="secondary" className="px-4 py-2">Healthcare Innovation</Badge>
                <Badge variant="secondary" className="px-4 py-2">Early Detection</Badge>
                <Badge variant="secondary" className="px-4 py-2">Global Health</Badge>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function StepCard({
  title,
  subtitle,
  primaryCta,
}: {
  title: string;
  subtitle: string;
  primaryCta: { label: string; onClick: () => void; icon?: JSX.Element };
}) {
  return (
    <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="mt-2 text-muted-foreground">{subtitle}</p>
      <div className="mt-6 flex items-center gap-3">
        <Button size="lg" onClick={primaryCta.onClick} className="inline-flex items-center gap-2">
          {primaryCta.label} {primaryCta.icon}
        </Button>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border bg-background p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

function ResultCard({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <div className="rounded-xl border bg-background p-4">
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
      <div className="mt-1 text-sm text-muted-foreground">{detail}</div>
    </div>
  );
}

function AudioLevelBar({ analyser }: { analyser: AnalyserNode | null }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let raf = 0;
    if (!analyser || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const buffer = new Uint8Array(analyser.frequencyBinCount);

    const draw = () => {
      if (!analyser) return;
      analyser.getByteTimeDomainData(buffer);
      let sumSq = 0;
      for (let i = 0; i < buffer.length; i++) {
        const v = (buffer[i] - 128) / 128;
        sumSq += v * v;
      }
      const rms = Math.sqrt(sumSq / buffer.length);
      const pct = Math.min(1, rms * 4);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width * pct;
      const root = document.documentElement;
      const muted = getComputedStyle(root).getPropertyValue("--muted-foreground").trim();
      const primary = getComputedStyle(root).getPropertyValue("--primary").trim();
      ctx.fillStyle = `hsl(${muted})`;
      ctx.globalAlpha = 0.15;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;
      ctx.fillStyle = `hsl(${primary})`;
      ctx.fillRect(0, 0, w, canvas.height);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [analyser]);

  return <canvas ref={canvasRef} height={12} className="mt-3 h-3 w-full rounded bg-secondary" />;
}
