import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Eye,
  Ear,
  Music,
  Palette,
  Timer,
  Download,
  Share2,
  Calendar,
  Activity,
  Lightbulb,
  Heart,
  Shield,
  Zap,
  RefreshCw
} from "lucide-react";

type TestType = "color-blindness" | "hearing" | "music-recognition" | "coordination" | "brain-puzzles";

type TestResult = {
  type: TestType;
  score: number;
  maxScore: number;
  duration: number;
  details: any;
};

type CognitiveSession = {
  id: string;
  timestamp: number;
  results: TestResult[];
  overallScore: number;
  riskLevel: "Low" | "Medium" | "High";
  recommendations: string[];
};

type CerebroProteinAnalysis = {
  estimatedLevel: "Low" | "Normal" | "High";
  neuronHealthScore: number;
  degenerationRisk: "Low" | "Moderate" | "High";
  regenerationPotential: "Poor" | "Fair" | "Good" | "Excellent";
  interventionRecommendations: string[];
};

const TEST_NAMES = {
  "color-blindness": "Color Vision",
  "hearing": "Hearing Acuity",
  "music-recognition": "Music Memory",
  "coordination": "Eye-Ear Coordination",
  "brain-puzzles": "Cognitive Puzzles"
};

const TEST_ICONS = {
  "color-blindness": Palette,
  "hearing": Ear,
  "music-recognition": Music,
  "coordination": Eye,
  "brain-puzzles": Brain
};

export default function TestResults() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<CognitiveSession | null>(null);
  const [cerebroAnalysis, setCerebroAnalysis] = useState<CerebroProteinAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;
    
    const sessions = JSON.parse(localStorage.getItem("cognitive_test_sessions") || "[]");
    const foundSession = sessions.find((s: CognitiveSession) => s.id === sessionId);
    
    if (foundSession) {
      setSession(foundSession);
      setCerebroAnalysis(generateCerebroAnalysis(foundSession));
    } else {
      navigate("/cognitive-tests");
    }
    
    setLoading(false);
  }, [sessionId, navigate]);

  const generateCerebroAnalysis = (session: CognitiveSession): CerebroProteinAnalysis => {
    const { overallScore, results } = session;
    
    // Advanced AI analysis simulation based on test performance
    const cognitiveScore = results.find(r => r.type === "brain-puzzles");
    const memoryScore = results.find(r => r.type === "music-recognition");
    const coordinationScore = results.find(r => r.type === "coordination");
    const sensoryScore = (results.find(r => r.type === "color-blindness")!.score + 
                         results.find(r => r.type === "hearing")!.score) / 2;
    
    const neuronHealthScore = Math.round(
      (cognitiveScore!.score / cognitiveScore!.maxScore) * 30 +
      (memoryScore!.score / memoryScore!.maxScore) * 25 +
      (coordinationScore!.score / coordinationScore!.maxScore) * 25 +
      (sensoryScore / results.find(r => r.type === "color-blindness")!.maxScore) * 20
    );
    
    let estimatedLevel: "Low" | "Normal" | "High";
    let degenerationRisk: "Low" | "Moderate" | "High";
    let regenerationPotential: "Poor" | "Fair" | "Good" | "Excellent";
    
    if (overallScore >= 80) {
      estimatedLevel = "High";
      degenerationRisk = "Low";
      regenerationPotential = "Excellent";
    } else if (overallScore >= 65) {
      estimatedLevel = "Normal";
      degenerationRisk = "Low";
      regenerationPotential = "Good";
    } else if (overallScore >= 50) {
      estimatedLevel = "Normal";
      degenerationRisk = "Moderate";
      regenerationPotential = "Fair";
    } else {
      estimatedLevel = "Low";
      degenerationRisk = "High";
      regenerationPotential = "Poor";
    }
    
    const interventionRecommendations = [
      "Consider omega-3 fatty acid supplementation (EPA/DHA)",
      "Engage in regular aerobic exercise (30 min, 3-4x/week)",
      "Practice meditation or mindfulness exercises",
      "Maintain consistent sleep schedule (7-9 hours)",
      "Include brain-healthy foods: blueberries, walnuts, fish",
      "Social engagement and learning new skills",
      "Consider consulting with a neurologist for personalized advice"
    ];
    
    if (degenerationRisk === "High") {
      interventionRecommendations.unshift(
        "Immediate consultation with healthcare provider recommended",
        "Consider neuroprotective supplements under medical supervision"
      );
    }
    
    return {
      estimatedLevel,
      neuronHealthScore,
      degenerationRisk,
      regenerationPotential,
      interventionRecommendations: interventionRecommendations.slice(0, 5)
    };
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "Low": return "text-green-600 bg-green-50 border-green-200";
      case "Medium": case "Moderate": case "Fair": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "High": case "Poor": return "text-red-600 bg-red-50 border-red-200";
      default: return "text-blue-600 bg-blue-50 border-blue-200";
    }
  };

  const downloadReport = () => {
    if (!session || !cerebroAnalysis) return;
    
    const reportData = {
      session,
      cerebroAnalysis,
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cognitive-assessment-${session.id}.json`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/40 py-12">
        <div className="container max-w-4xl">
          <div className="text-center">
            <Brain className="w-12 h-12 animate-pulse mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading your results...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session || !cerebroAnalysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/40 py-12">
        <div className="container max-w-4xl">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Results Not Found</h2>
            <p className="text-muted-foreground mb-4">The requested test session could not be found.</p>
            <Link to="/cognitive-tests">
              <Button>Take New Assessment</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/40 py-12">
      <div className="container max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold">
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Cognitive Assessment Results
              </span>
            </h1>
            <div className="flex gap-3">
              <Button variant="outline" onClick={downloadReport}>
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
              <Button variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {formatDate(session.timestamp)}
          </p>
        </div>

        {/* Overall Score Card */}
        <Card className="mb-8 border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Brain className="w-8 h-8 text-primary" />
              Overall Cognitive Health Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-5xl font-bold mb-2 text-primary">
                  {Math.round(session.overallScore)}
                </div>
                <div className="text-muted-foreground">out of 100</div>
                <Progress value={session.overallScore} className="mt-3 h-3" />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Risk Level</span>
                  <Badge className={getRiskColor(session.riskLevel)}>
                    {session.riskLevel} Risk
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tests Completed</span>
                  <span className="font-semibold">{session.results.length}/5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total Duration</span>
                  <span className="font-semibold">
                    {Math.round(session.results.reduce((acc, r) => acc + r.duration, 0) / 60)} min
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center">
                {session.riskLevel === "Low" ? (
                  <div className="text-center text-green-600">
                    <CheckCircle className="w-16 h-16 mx-auto mb-2" />
                    <p className="font-semibold">Excellent Results!</p>
                  </div>
                ) : session.riskLevel === "Medium" ? (
                  <div className="text-center text-yellow-600">
                    <AlertTriangle className="w-16 h-16 mx-auto mb-2" />
                    <p className="font-semibold">Monitor Progress</p>
                  </div>
                ) : (
                  <div className="text-center text-red-600">
                    <AlertTriangle className="w-16 h-16 mx-auto mb-2" />
                    <p className="font-semibold">Needs Attention</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for detailed analysis */}
        <Tabs defaultValue="detailed" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="detailed">Detailed Results</TabsTrigger>
            <TabsTrigger value="cerebro">Cerebro Protein Analysis</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="trends">Progress Tracking</TabsTrigger>
          </TabsList>

          <TabsContent value="detailed" className="space-y-6">
            <div className="grid gap-4">
              {session.results.map((result) => {
                const Icon = TEST_ICONS[result.type];
                const percentage = (result.score / result.maxScore) * 100;
                
                return (
                  <Card key={result.type}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-primary/10">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{TEST_NAMES[result.type]}</h3>
                            <p className="text-sm text-muted-foreground">
                              {result.score} / {result.maxScore} correct
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{Math.round(percentage)}%</div>
                          <div className="text-sm text-muted-foreground">
                            {Math.round(result.duration)}s
                          </div>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="cerebro" className="space-y-6">
            <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-6 h-6 text-blue-600" />
                  AI-Powered Cerebro Protein Analysis
                </CardTitle>
                <CardDescription>
                  Advanced analysis of neuron health indicators and cognitive decline risk factors
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-white/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Estimated Cerebro Protein Level</span>
                        <Badge className={getRiskColor(cerebroAnalysis.estimatedLevel)}>
                          {cerebroAnalysis.estimatedLevel}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Based on cognitive performance patterns
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-white/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Neuron Health Score</span>
                        <span className="text-2xl font-bold text-blue-600">
                          {cerebroAnalysis.neuronHealthScore}/100
                        </span>
                      </div>
                      <Progress value={cerebroAnalysis.neuronHealthScore} className="h-2" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-white/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Degeneration Risk</span>
                        <Badge className={getRiskColor(cerebroAnalysis.degenerationRisk)}>
                          {cerebroAnalysis.degenerationRisk}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Risk of accelerated neuron death
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-white/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Regeneration Potential</span>
                        <Badge className={getRiskColor(cerebroAnalysis.regenerationPotential)}>
                          {cerebroAnalysis.regenerationPotential}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Capacity for neuron growth and recovery
                      </p>
                    </div>
                  </div>
                </div>

                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertTitle>Scientific Insight</AlertTitle>
                  <AlertDescription>
                    Research indicates that cerebro protein deficiency accelerates neuron death and 
                    impairs neuron regeneration. Your assessment suggests {cerebroAnalysis.estimatedLevel.toLowerCase()} levels, 
                    which correlates with {cerebroAnalysis.degenerationRisk.toLowerCase()} degeneration risk. 
                    Targeted interventions may help support natural protein production and neuron health.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-600" />
                    Personalized Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {session.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{rec}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-600" />
                    Cerebro Protein Support Interventions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {cerebroAnalysis.interventionRecommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-blue-50">
                        <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{rec}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Progress Tracking
                </CardTitle>
                <CardDescription>
                  Track your cognitive health over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Start Your Journey</h3>
                  <p className="text-muted-foreground mb-4">
                    Take regular assessments to track your cognitive health progress over time
                  </p>
                  <Link to="/cognitive-tests">
                    <Button>
                      <Timer className="w-4 h-4 mr-2" />
                      Schedule Next Assessment
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <Link to="/cognitive-tests">
            <Button size="lg">
              <RefreshCw className="w-4 h-4 mr-2" />
              Take Another Assessment
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="outline" size="lg">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}