import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Bell, 
  Brain, 
  Trophy, 
  Flame, 
  Calendar,
  Clock,
  CheckCircle,
  X,
  Star,
  TrendingUp,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Target,
  Award,
  Zap
} from "lucide-react";
import { notificationService, PuzzleStreak } from "@/services/notificationService";

interface PuzzleCompletion {
  puzzleId: string;
  timestamp: number;
  correct: boolean;
  timeSpent: number;
  points: number;
}

export default function PuzzleHub() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");
  const [streak, setStreak] = useState<PuzzleStreak | null>(null);
  const [completions, setCompletions] = useState<PuzzleCompletion[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [weeklyStats, setWeeklyStats] = useState({ completed: 0, accuracy: 0 });

  useEffect(() => {
    // Load initial data
    setNotificationPermission(Notification.permission);
    setNotificationsEnabled(localStorage.getItem("hourly_puzzles_enabled") === "true");
    setStreak(notificationService.getStreak());
    
    // Load completions
    const storedCompletions = JSON.parse(localStorage.getItem("daily_puzzle_completions") || "[]");
    setCompletions(storedCompletions);
    
    // Calculate stats
    const points = storedCompletions.reduce((acc: number, comp: PuzzleCompletion) => acc + comp.points, 0);
    setTotalPoints(points);
    
    // Calculate weekly stats
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const weeklyCompletions = storedCompletions.filter((comp: PuzzleCompletion) => comp.timestamp > weekAgo);
    const weeklyAccuracy = weeklyCompletions.length > 0 
      ? weeklyCompletions.filter((comp: PuzzleCompletion) => comp.correct).length / weeklyCompletions.length * 100
      : 0;
    
    setWeeklyStats({
      completed: weeklyCompletions.length,
      accuracy: Math.round(weeklyAccuracy)
    });
  }, []);

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      const granted = await notificationService.requestPermission();
      if (granted) {
        localStorage.setItem("hourly_puzzles_enabled", "true");
        setNotificationsEnabled(true);
        notificationService.scheduleHourlyPuzzles();
        setNotificationPermission("granted");
      } else {
        localStorage.setItem("hourly_puzzles_enabled", "false");
        setNotificationsEnabled(false);
      }
    } else {
      localStorage.setItem("hourly_puzzles_enabled", "false");
      setNotificationsEnabled(false);
      notificationService.cancelAllNotifications();
    }
  };

  const generateInstantPuzzle = () => {
    // Generate a puzzle for immediate solving
    const puzzle = (notificationService as any).generateRandomPuzzle();
    localStorage.setItem(`puzzle_${puzzle.id}`, JSON.stringify(puzzle));
    window.location.href = `/daily-puzzle/${puzzle.id}`;
  };

  const resetStreak = () => {
    if (!confirm("Are you sure you want to reset your streak? This action cannot be undone.")) {
      return;
    }
    
    const resetStreak = {
      currentStreak: 0,
      longestStreak: 0,
      totalCompleted: 0,
      lastCompletedDate: ""
    };
    
    localStorage.setItem("cognitive_puzzle_streak", JSON.stringify(resetStreak));
    localStorage.setItem("daily_puzzle_completions", JSON.stringify([]));
    setStreak(resetStreak);
    setCompletions([]);
    setTotalPoints(0);
    setWeeklyStats({ completed: 0, accuracy: 0 });
  };

  const getStreakLevel = (streak: number) => {
    if (streak >= 30) return { level: "Master", color: "text-purple-600", icon: "👑" };
    if (streak >= 14) return { level: "Expert", color: "text-blue-600", icon: "🏆" };
    if (streak >= 7) return { level: "Advanced", color: "text-green-600", icon: "⭐" };
    if (streak >= 3) return { level: "Improving", color: "text-yellow-600", icon: "📈" };
    return { level: "Beginner", color: "text-gray-600", icon: "🌱" };
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/40 py-12">
      <div className="container max-w-6xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Cognitive Puzzle Hub
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Challenge your brain daily with personalized puzzles and track your cognitive fitness
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <Flame className="w-8 h-8 text-orange-500" />
              </div>
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {streak?.currentStreak || 0}
              </div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
              {streak && (
                <div className="mt-2">
                  <Badge variant="outline" className={getStreakLevel(streak.currentStreak).color}>
                    {getStreakLevel(streak.currentStreak).icon} {getStreakLevel(streak.currentStreak).level}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
              <div className="text-3xl font-bold text-yellow-600 mb-1">{totalPoints}</div>
              <div className="text-sm text-muted-foreground">Total Points</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="w-8 h-8 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-green-600 mb-1">{weeklyStats.accuracy}%</div>
              <div className="text-sm text-muted-foreground">Weekly Accuracy</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <Award className="w-8 h-8 text-blue-500" />
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-1">{streak?.totalCompleted || 0}</div>
              <div className="text-sm text-muted-foreground">Puzzles Solved</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="puzzles" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="puzzles">Daily Puzzles</TabsTrigger>
            <TabsTrigger value="settings">Notifications</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="puzzles" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Instant Challenge */}
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-blue-600/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-6 h-6 text-primary" />
                    Instant Challenge
                  </CardTitle>
                  <CardDescription>
                    Ready for a brain challenge? Generate a random puzzle to solve right now!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={generateInstantPuzzle} size="lg" className="w-full">
                    <Play className="w-4 h-4 mr-2" />
                    Start Puzzle Challenge
                  </Button>
                </CardContent>
              </Card>

              {/* Daily Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-blue-600" />
                    Today's Progress
                  </CardTitle>
                  <CardDescription>
                    Your cognitive fitness activity for today
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Daily Goal</span>
                    <Badge variant={completions.filter(c => {
                      const today = new Date().toDateString();
                      return new Date(c.timestamp).toDateString() === today;
                    }).length > 0 ? "default" : "outline"}>
                      {completions.filter(c => {
                        const today = new Date().toDateString();
                        return new Date(c.timestamp).toDateString() === today;
                      }).length > 0 ? "Complete" : "Pending"}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Puzzles Today</span>
                      <span>{completions.filter(c => {
                        const today = new Date().toDateString();
                        return new Date(c.timestamp).toDateString() === today;
                      }).length}</span>
                    </div>
                    <Progress value={Math.min(completions.filter(c => {
                      const today = new Date().toDateString();
                      return new Date(c.timestamp).toDateString() === today;
                    }).length * 25, 100)} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Puzzle Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Puzzle Categories</CardTitle>
                <CardDescription>
                  Different types of cognitive challenges to train various brain functions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {[
                    { type: "math", icon: "🔢", title: "Math", description: "Numerical reasoning" },
                    { type: "memory", icon: "🧠", title: "Memory", description: "Recall challenges" },
                    { type: "pattern", icon: "🔍", title: "Pattern", description: "Sequence recognition" },
                    { type: "word", icon: "📝", title: "Word", description: "Language skills" },
                    { type: "logic", icon: "🤔", title: "Logic", description: "Problem solving" }
                  ].map((category) => (
                    <div key={category.type} className="p-4 rounded-lg border bg-muted/50 text-center">
                      <div className="text-3xl mb-2">{category.icon}</div>
                      <h4 className="font-semibold mb-1">{category.title}</h4>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-6 h-6 text-blue-600" />
                  Notification Settings
                </CardTitle>
                <CardDescription>
                  Configure hourly puzzle notifications to maintain your cognitive fitness routine
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Hourly Puzzle Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Receive brain challenges every hour to maintain cognitive engagement
                    </p>
                  </div>
                  <Switch
                    checked={notificationsEnabled}
                    onCheckedChange={handleNotificationToggle}
                    disabled={notificationPermission === "denied"}
                  />
                </div>

                {notificationPermission === "denied" && (
                  <Alert className="border-red-200 bg-red-50">
                    <X className="h-4 w-4 text-red-600" />
                    <AlertTitle className="text-red-800">Notifications Blocked</AlertTitle>
                    <AlertDescription className="text-red-700">
                      Notifications are blocked in your browser. Please enable them in your browser settings
                      to receive hourly puzzle challenges.
                    </AlertDescription>
                  </Alert>
                )}

                {notificationsEnabled && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">Notifications Active</AlertTitle>
                    <AlertDescription className="text-green-700">
                      You'll receive puzzle notifications every hour. Make sure to keep this tab open
                      or bookmark it for quick access to challenges!
                    </AlertDescription>
                  </Alert>
                )}

                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-4">Advanced Settings</h4>
                  <div className="space-y-4">
                    <Button
                      variant="outline"
                      onClick={resetStreak}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset All Progress
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  Puzzle History
                </CardTitle>
                <CardDescription>
                  Review your recent puzzle completions and track your progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                {completions.length === 0 ? (
                  <div className="text-center py-12">
                    <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No puzzles completed yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start solving puzzles to build your cognitive fitness history
                    </p>
                    <Button onClick={generateInstantPuzzle}>
                      <Play className="w-4 h-4 mr-2" />
                      Solve Your First Puzzle
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {completions
                      .sort((a, b) => b.timestamp - a.timestamp)
                      .slice(0, 20)
                      .map((completion) => (
                      <div
                        key={completion.puzzleId}
                        className="flex items-center justify-between p-4 rounded-lg border bg-muted/30"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-full ${completion.correct ? 'bg-green-100' : 'bg-red-100'}`}>
                            {completion.correct ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <X className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">
                              {completion.correct ? "Puzzle Solved" : "Puzzle Attempted"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(completion.timestamp)} • {Math.round(completion.timeSpent)}s
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">+{completion.points}</div>
                          <div className="text-sm text-muted-foreground">points</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Back to Dashboard */}
        <div className="text-center mt-8">
          <Link to="/dashboard">
            <Button variant="outline">
              <TrendingUp className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}