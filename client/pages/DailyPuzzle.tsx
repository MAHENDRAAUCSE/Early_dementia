import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Brain, 
  Trophy, 
  Flame, 
  Clock,
  CheckCircle,
  X,
  Timer,
  Zap,
  Star,
  Calendar,
  Target,
  TrendingUp
} from "lucide-react";
import { DailyPuzzle, PuzzleStreak, notificationService } from "@/services/notificationService";

export default function DailyPuzzlePage() {
  const { puzzleId } = useParams();
  const navigate = useNavigate();
  const [puzzle, setPuzzle] = useState<DailyPuzzle | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [textAnswer, setTextAnswer] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [streak, setStreak] = useState<PuzzleStreak | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!puzzleId) {
      navigate("/puzzle-hub");
      return;
    }

    // Load puzzle from localStorage
    const storedPuzzle = localStorage.getItem(`puzzle_${puzzleId}`);
    if (storedPuzzle) {
      setPuzzle(JSON.parse(storedPuzzle));
    } else {
      navigate("/puzzle-hub");
      return;
    }

    // Load streak data
    setStreak(notificationService.getStreak());
    setLoading(false);

    // Start timer
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmit(false); // Auto-submit as incorrect when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [puzzleId, navigate]);

  const handleSubmit = (manualSubmit: boolean = true) => {
    if (!puzzle || isSubmitted) return;

    let correct = false;
    if (puzzle.options) {
      correct = selectedAnswer === puzzle.correctAnswer;
    } else {
      // For text input (logic puzzles)
      correct = textAnswer.toLowerCase().trim() === puzzle.correctAnswer.toLowerCase().trim();
    }

    setIsCorrect(correct);
    setIsSubmitted(true);

    // Update streak
    const newStreak = notificationService.updateStreak(correct);
    setStreak(newStreak);

    // Save completion status
    const completions = JSON.parse(localStorage.getItem("daily_puzzle_completions") || "[]");
    completions.push({
      puzzleId: puzzle.id,
      timestamp: Date.now(),
      correct,
      timeSpent: 300 - timeRemaining,
      points: correct ? puzzle.points : 0
    });
    localStorage.setItem("daily_puzzle_completions", JSON.stringify(completions));

    // Remove puzzle from storage
    if (manualSubmit) {
      setTimeout(() => {
        localStorage.removeItem(`puzzle_${puzzleId}`);
      }, 3000);
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1: return "bg-green-100 text-green-800 border-green-300";
      case 2: return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case 3: return "bg-red-100 text-red-800 border-red-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getDifficultyLabel = (difficulty: number) => {
    switch (difficulty) {
      case 1: return "Easy";
      case 2: return "Medium";
      case 3: return "Hard";
      default: return "Unknown";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "math": return "🔢";
      case "memory": return "🧠";
      case "pattern": return "🔍";
      case "word": return "📝";
      case "logic": return "🤔";
      default: return "🧩";
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/40 py-12">
        <div className="container max-w-2xl">
          <div className="text-center">
            <Brain className="w-12 h-12 animate-pulse mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading puzzle...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!puzzle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/40 py-12">
        <div className="container max-w-2xl">
          <div className="text-center">
            <X className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Puzzle Not Found</h2>
            <p className="text-muted-foreground mb-4">The requested puzzle could not be loaded.</p>
            <Link to="/puzzle-hub">
              <Button>Go to Puzzle Hub</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/40 py-12">
      <div className="container max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Daily Cognitive Challenge
              </span>
            </h1>
            <div className="flex items-center gap-3">
              {streak && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Flame className="w-4 h-4 text-orange-500" />
                  {streak.currentStreak} day streak
                </Badge>
              )}
              <Badge 
                variant="outline" 
                className={`${timeRemaining < 60 ? 'text-red-600 border-red-300' : 'text-blue-600'}`}
              >
                <Timer className="w-4 h-4 mr-1" />
                {formatTime(timeRemaining)}
              </Badge>
            </div>
          </div>
          <Progress value={(300 - timeRemaining) / 300 * 100} className="h-2" />
        </div>

        {/* Puzzle Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">{getTypeIcon(puzzle.type)}</span>
                <span className="capitalize">{puzzle.type} Challenge</span>
              </CardTitle>
              <div className="flex gap-2">
                <Badge className={getDifficultyColor(puzzle.difficulty)}>
                  {getDifficultyLabel(puzzle.difficulty)}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  {puzzle.points} pts
                </Badge>
              </div>
            </div>
            <CardDescription>
              Complete this challenge to maintain your cognitive health streak!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Question */}
            <div className="p-6 bg-muted/50 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">{puzzle.question}</h3>
            </div>

            {/* Answer Options */}
            {!isSubmitted && (
              <div className="space-y-4">
                {puzzle.options ? (
                  // Multiple choice
                  <div className="space-y-3">
                    {puzzle.options.map((option, index) => (
                      <Button
                        key={index}
                        variant={selectedAnswer === option ? "default" : "outline"}
                        onClick={() => setSelectedAnswer(option)}
                        className="w-full text-left justify-start h-auto py-3"
                        disabled={isSubmitted}
                      >
                        <span className="font-mono mr-3 text-muted-foreground">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        {option}
                      </Button>
                    ))}
                  </div>
                ) : (
                  // Text input
                  <div className="space-y-3">
                    <Input
                      placeholder="Type your answer here..."
                      value={textAnswer}
                      onChange={(e) => setTextAnswer(e.target.value)}
                      disabled={isSubmitted}
                      className="text-lg p-4"
                    />
                  </div>
                )}

                <div className="text-center">
                  <Button
                    onClick={() => handleSubmit()}
                    disabled={puzzle.options ? !selectedAnswer : !textAnswer.trim()}
                    size="lg"
                    className="px-8"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Submit Answer
                  </Button>
                </div>
              </div>
            )}

            {/* Results */}
            {isSubmitted && (
              <div className="space-y-4">
                {isCorrect ? (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">Excellent!</AlertTitle>
                    <AlertDescription className="text-green-700">
                      Correct answer! You've earned {puzzle.points} points and maintained your streak.
                      {streak && streak.currentStreak > 1 && ` You're on a ${streak.currentStreak}-day streak!`}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="border-red-200 bg-red-50">
                    <X className="h-4 w-4 text-red-600" />
                    <AlertTitle className="text-red-800">Not quite right</AlertTitle>
                    <AlertDescription className="text-red-700">
                      The correct answer was: <strong>{puzzle.correctAnswer}</strong>
                      <br />
                      Don't worry! Keep practicing to improve your cognitive skills.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-center gap-3">
                  <Link to="/puzzle-hub">
                    <Button variant="outline">
                      <Brain className="w-4 h-4 mr-2" />
                      Puzzle Hub
                    </Button>
                  </Link>
                  <Link to="/dashboard">
                    <Button>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      View Progress
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Streak Info */}
        {streak && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                Your Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-orange-600">{streak.currentStreak}</div>
                  <div className="text-sm text-muted-foreground">Current Streak</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{streak.longestStreak}</div>
                  <div className="text-sm text-muted-foreground">Longest Streak</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{streak.totalCompleted}</div>
                  <div className="text-sm text-muted-foreground">Total Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}