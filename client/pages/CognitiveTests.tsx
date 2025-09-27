import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Brain, 
  Eye, 
  Ear, 
  Music, 
  Palette, 
  Volume2, 
  Play, 
  Pause,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Timer,
  Headphones
} from "lucide-react";
import { AudioService, SAMPLE_SONGS, HEARING_FREQUENCIES } from "@/services/audioService";

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

const TEST_CONFIGURATIONS = {
  "color-blindness": {
    title: "Color Vision Assessment",
    description: "Detect color vision deficiencies using Ishihara-style tests",
    icon: Palette,
    duration: 120, // seconds
    questions: 8
  },
  "hearing": {
    title: "Hearing Acuity Test",
    description: "Assess hearing sensitivity across different frequencies",
    icon: Ear,
    duration: 180,
    questions: 12
  },
  "music-recognition": {
    title: "Music Memory Test",
    description: "Identify songs through hypermuffled audio clips",
    icon: Music,
    duration: 240,
    questions: 10
  },
  "coordination": {
    title: "Eye-Ear Coordination",
    description: "Test multisensory coordination and reaction times",
    icon: Eye,
    duration: 300,
    questions: 15
  },
  "brain-puzzles": {
    title: "Cognitive Puzzles",
    description: "Pattern recognition and spatial reasoning challenges",
    icon: Brain,
    duration: 360,
    questions: 20
  }
};

export default function CognitiveTests() {
  const navigate = useNavigate();
  const [currentTest, setCurrentTest] = useState<TestType | null>(null);
  const [testProgress, setTestProgress] = useState(0);
  const [sessionResults, setSessionResults] = useState<TestResult[]>([]);
  const [isTestActive, setIsTestActive] = useState(false);
  
  // Check authentication
  useEffect(() => {
    const user = localStorage.getItem("guardian_medics_user");
    if (!user) {
      navigate("/login");
    }
  }, [navigate]);

  const startTestSession = () => {
    setSessionResults([]);
    setCurrentTest("color-blindness");
    setIsTestActive(true);
  };

  const completeTest = (result: TestResult) => {
    const newResults = [...sessionResults, result];
    setSessionResults(newResults);
    
    // Move to next test
    const testTypes: TestType[] = ["color-blindness", "hearing", "music-recognition", "coordination", "brain-puzzles"];
    const currentIndex = testTypes.indexOf(currentTest!);
    
    if (currentIndex < testTypes.length - 1) {
      setCurrentTest(testTypes[currentIndex + 1]);
    } else {
      // All tests completed
      completeSession(newResults);
    }
  };

  const completeSession = (results: TestResult[]) => {
    const overallScore = results.reduce((acc, r) => acc + (r.score / r.maxScore), 0) / results.length * 100;
    const riskLevel: "Low" | "Medium" | "High" = 
      overallScore >= 80 ? "Low" : 
      overallScore >= 60 ? "Medium" : "High";
    
    const session: CognitiveSession = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      results,
      overallScore,
      riskLevel,
      recommendations: generateRecommendations(results, overallScore)
    };

    // Save to localStorage
    const existingSessions = JSON.parse(localStorage.getItem("cognitive_test_sessions") || "[]");
    localStorage.setItem("cognitive_test_sessions", JSON.stringify([...existingSessions, session]));

    setIsTestActive(false);
    setCurrentTest(null);
    
    // Navigate to results
    navigate(`/test-results/${session.id}`);
  };

  const generateRecommendations = (results: TestResult[], overallScore: number): string[] => {
    const recommendations: string[] = [];
    
    if (overallScore < 60) {
      recommendations.push("Consider consulting with a neurologist for comprehensive evaluation");
      recommendations.push("Increase daily mental stimulation activities");
    }
    
    results.forEach(result => {
      const scorePercentage = (result.score / result.maxScore) * 100;
      if (scorePercentage < 70) {
        switch (result.type) {
          case "color-blindness":
            recommendations.push("Schedule an eye examination with an optometrist");
            break;
          case "hearing":
            recommendations.push("Consider hearing assessment with an audiologist");
            break;
          case "music-recognition":
            recommendations.push("Practice auditory memory exercises and music therapy");
            break;
          case "coordination":
            recommendations.push("Engage in coordination exercises and balance training");
            break;
          case "brain-puzzles":
            recommendations.push("Increase cognitive training with puzzles and memory games");
            break;
        }
      }
    });
    
    // Add cerebro protein insights
    if (overallScore < 70) {
      recommendations.push("Research shows that cerebro protein supplementation may help support neuron health");
      recommendations.push("Consider lifestyle changes that support natural cerebro protein production");
      recommendations.push("Regular exercise and omega-3 fatty acids may help slow cognitive decline");
    }
    
    return recommendations;
  };

  if (isTestActive && currentTest) {
    return <TestRunner test={currentTest} onComplete={completeTest} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/40 py-12">
      <div className="container max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Advanced Cognitive Assessment Suite
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Comprehensive cognitive health evaluation with AI-powered insights
          </p>
          <div className="flex items-center justify-center gap-4">
            <Badge variant="secondary" className="px-4 py-2">
              <Brain className="w-4 h-4 mr-2" />
              5 Specialized Tests
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              <Timer className="w-4 h-4 mr-2" />
              ~20 minutes
            </Badge>
          </div>
        </div>

        <Card className="mb-8 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-blue-600/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary" />
              About This Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Our comprehensive cognitive assessment evaluates multiple aspects of brain health, including 
              visual processing, auditory perception, memory, coordination, and problem-solving abilities. 
              Each test is designed to detect early signs of cognitive decline and provide personalized 
              recommendations for brain health maintenance.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-semibold mb-2">Early Detection</h4>
                <p className="text-sm text-muted-foreground">
                  Identify potential cognitive issues before they become severe
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-semibold mb-2">AI-Powered Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  Get personalized insights based on latest neuroscience research
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 mb-8">
          {Object.entries(TEST_CONFIGURATIONS).map(([testType, config]) => {
            const Icon = config.icon;
            return (
              <Card key={testType} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-primary/10">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{config.title}</h3>
                        <p className="text-muted-foreground">{config.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm text-muted-foreground">
                            {config.questions} questions
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ~{Math.floor(config.duration / 60)} min
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Button size="lg" onClick={startTestSession} className="px-8 py-6 text-lg">
            <Brain className="w-5 h-5 mr-2" />
            Start Comprehensive Assessment
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Ensure you're in a quiet environment with good lighting
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <Link to="/dashboard">
            <Button variant="outline">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Test Runner Component
function TestRunner({ test, onComplete }: { test: TestType; onComplete: (result: TestResult) => void }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(TEST_CONFIGURATIONS[test].duration);
  const [isActive, setIsActive] = useState(true);
  const startTime = useRef(Date.now());

  useEffect(() => {
    if (!isActive) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          completeTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive]);

  const completeTest = () => {
    setIsActive(false);
    const duration = Date.now() - startTime.current;
    const result: TestResult = {
      type: test,
      score,
      maxScore: TEST_CONFIGURATIONS[test].questions,
      duration: duration / 1000,
      details: { timeRemaining }
    };
    onComplete(result);
  };

  const handleAnswer = (correct: boolean) => {
    if (correct) {
      setScore(prev => prev + 1);
    }
    
    if (currentQuestion < TEST_CONFIGURATIONS[test].questions - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      completeTest();
    }
  };

  const config = TEST_CONFIGURATIONS[test];
  const progress = ((currentQuestion + 1) / config.questions) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/40 py-12">
      <div className="container max-w-2xl">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">{config.title}</h2>
            <div className="flex items-center gap-4">
              <Badge variant="outline">
                Question {currentQuestion + 1} of {config.questions}
              </Badge>
              <Badge variant="secondary">
                <Timer className="w-4 h-4 mr-1" />
                {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
              </Badge>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Test-specific components will be rendered here */}
        <TestQuestion 
          test={test} 
          questionNumber={currentQuestion} 
          onAnswer={handleAnswer}
        />
      </div>
    </div>
  );
}

// Individual test question components
function TestQuestion({ 
  test, 
  questionNumber, 
  onAnswer 
}: { 
  test: TestType; 
  questionNumber: number; 
  onAnswer: (correct: boolean) => void;
}) {
  switch (test) {
    case "color-blindness":
      return <ColorBlindnessTest key={`cb-${questionNumber}`} questionNumber={questionNumber} onAnswer={onAnswer} />;
    case "hearing":
      return <HearingTest key={`hear-${questionNumber}`} questionNumber={questionNumber} onAnswer={onAnswer} />;
    case "music-recognition":
      return <MusicRecognitionTest key={`music-${questionNumber}`} questionNumber={questionNumber} onAnswer={onAnswer} />;
    case "coordination":
      return <CoordinationTest key={`coord-${questionNumber}`} questionNumber={questionNumber} onAnswer={onAnswer} />;
    case "brain-puzzles":
      return <BrainPuzzleTest key={`brain-${questionNumber}`} questionNumber={questionNumber} onAnswer={onAnswer} />;
    default:
      return <div>Test not implemented yet</div>;
  }
}

// Placeholder test components (to be implemented)
function ColorBlindnessTest({ questionNumber, onAnswer }: { questionNumber: number; onAnswer: (correct: boolean) => void }) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  
  // Generate stable color blindness test pattern - use questionNumber for consistency
  const correctAnswer = useMemo(() => Math.floor(Math.random() * 10).toString(), [questionNumber]);
  const options = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>What number do you see in this circle?</CardTitle>
        <CardDescription>
          Look at the colored dots and identify the number you can see
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          {/* This would be replaced with actual Ishihara-style color pattern */}
          <div className="w-64 h-64 mx-auto bg-gradient-to-br from-red-300 to-green-300 rounded-full flex items-center justify-center text-6xl font-bold text-red-600 opacity-70">
            {correctAnswer}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
          {options.map(option => (
            <Button
              key={option}
              variant={selectedAnswer === option ? "default" : "outline"}
              onClick={() => setSelectedAnswer(option)}
              className="aspect-square"
            >
              {option}
            </Button>
          ))}
        </div>
        
        <div className="mt-6 text-center">
          <Button 
            onClick={() => onAnswer(selectedAnswer === correctAnswer)}
            disabled={!selectedAnswer}
          >
            Next Question
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function HearingTest({ questionNumber, onAnswer }: { questionNumber: number; onAnswer: (correct: boolean) => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasHeard, setHasHeard] = useState(false);
  const [audioService] = useState(() => new AudioService());
  
  const currentFreqData = HEARING_FREQUENCIES[questionNumber % HEARING_FREQUENCIES.length];
  const { frequency, label } = currentFreqData;
  
  const playTone = async () => {
    setIsPlaying(true);
    setHasHeard(true);
    
    try {
      await audioService.generateTone(frequency, 2000);
      setTimeout(() => setIsPlaying(false), 2100);
    } catch (error) {
      console.error('Error playing tone:', error);
      setIsPlaying(false);
    }
  };

  // Cleanup audio service on unmount
  useEffect(() => {
    return () => {
      audioService.dispose();
    };
  }, [audioService]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Headphones className="w-5 h-5" />
          Hearing Test - {label}
        </CardTitle>
        <CardDescription>
          Put on headphones and listen carefully. Click "Play" to hear the tone.
          The volume should be at a comfortable level for normal conversation.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8">
          <Button
            size="lg"
            onClick={playTone}
            disabled={isPlaying}
            className="w-32 h-32 rounded-full relative overflow-hidden"
          >
            {isPlaying ? (
              <>
                <Volume2 className="w-12 h-12 animate-pulse" />
                <div className="absolute inset-0 bg-primary/20 animate-ping rounded-full" />
              </>
            ) : (
              <Play className="w-12 h-12" />
            )}
          </Button>
          <p className="mt-4 text-sm text-muted-foreground">
            {isPlaying ? `Playing ${frequency}Hz tone...` : "Click to play tone"}
          </p>
        </div>
        
        <div className="space-y-4">
          <p className="text-lg font-medium">Did you hear the tone clearly?</p>
          <div className="flex gap-4 justify-center">
            <Button 
              variant="outline" 
              onClick={() => onAnswer(true)}
              disabled={!hasHeard}
              className="min-w-[140px]"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Yes, I heard it
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onAnswer(false)}
              disabled={!hasHeard}
              className="min-w-[140px]"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              No, I didn't hear it
            </Button>
          </div>
        </div>

        {hasHeard && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Tip:</strong> If you're having trouble hearing certain frequencies, 
              consider consulting with an audiologist for a comprehensive hearing assessment.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MusicRecognitionTest({ questionNumber, onAnswer }: { questionNumber: number; onAnswer: (correct: boolean) => void }) {
  const [selectedSong, setSelectedSong] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [audioService] = useState(() => new AudioService());
  const [playbackTime, setPlaybackTime] = useState(0);
  const playbackRef = useRef<NodeJS.Timeout>();

  const correctSong = SAMPLE_SONGS[questionNumber % SAMPLE_SONGS.length];
  
  // Create shuffled options including the correct song
  const createOptions = () => {
    const otherSongs = SAMPLE_SONGS.filter(s => s.id !== correctSong.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    return [...otherSongs, correctSong].sort(() => Math.random() - 0.5);
  };
  
  const options = React.useMemo(() => createOptions(), [questionNumber]);
  React.useEffect(() => {
    // Reset selection when question changes
    setSelectedSong(null);
    setIsPlaying(false);
    setPlaybackTime(0);
  }, [questionNumber]);
  
  const playAudio = async () => {
    if (isPlaying) {
      // Stop current audio
      audioService.stopAudio();
      setIsPlaying(false);
      setPlaybackTime(0);
      if (playbackRef.current) {
        clearInterval(playbackRef.current);
      }
      return;
    }

    setIsPlaying(true);
    setPlaybackTime(0);
    
    try {
      // Generate a unique melody for the current song
      const playDuration = 10000; // 10 seconds
      await audioService.generateMelody(correctSong.id, playDuration);
      
      // Track playback time
      playbackRef.current = setInterval(() => {
        setPlaybackTime(prev => {
          if (prev >= 10) { // 10 seconds playback
            setIsPlaying(false);
            clearInterval(playbackRef.current!);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);

      // Auto-stop after duration
      setTimeout(() => {
        setIsPlaying(false);
        setPlaybackTime(0);
        if (playbackRef.current) {
          clearInterval(playbackRef.current);
        }
      }, playDuration);

    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
      setPlaybackTime(0);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
      }
      if (playbackRef.current) {
        clearInterval(playbackRef.current);
      }
      audioService.dispose();
    };
  }, [currentAudio, audioService]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="w-5 h-5" />
          Music Recognition Test
        </CardTitle>
        <CardDescription>
          Listen to this muffled song clip and try to identify the song. 
          The audio has been processed to make it more challenging.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-8">
          <Button
            size="lg"
            onClick={playAudio}
            className="rounded-full w-24 h-24 relative"
          >
            {isPlaying ? (
              <>
                <Pause className="w-8 h-8" />
                <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
              </>
            ) : (
              <Play className="w-8 h-8" />
            )}
          </Button>
          <div className="mt-4">
            <p className="text-muted-foreground">
              {isPlaying ? `Playing melody... (${playbackTime}s / 10s)` : "Click to play muffled melody"}
            </p>
            {isPlaying && (
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${(playbackTime / 10) * 100}%` }}
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-3">
          <p className="text-center font-medium">Which song is this?</p>
          {options.map(song => (
            <Button
              key={song.id}
              variant={selectedSong === `${song.title} - ${song.artist}` ? "default" : "outline"}
              onClick={() => setSelectedSong(`${song.title} - ${song.artist}`)}
              className="w-full text-left justify-start h-12"
            >
              <Music className="w-4 h-4 mr-3" />
              <div>
                <div className="font-medium">{song.title}</div>
                <div className="text-sm text-muted-foreground">{song.artist}</div>
              </div>
            </Button>
          ))}
        </div>
        
        <div className="text-center">
          <Button
            onClick={() => onAnswer(selectedSong === `${correctSong.title} - ${correctSong.artist}`)}
            disabled={!selectedSong}
            size="lg"
          >
            Submit Answer
          </Button>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>How it works:</strong> Each song has a unique melody pattern generated using musical notes. 
            The audio is processed with a low-pass filter to create the "muffled" effect, 
            simulating how songs might sound through different mediums or with hearing difficulties.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function CoordinationTest({ questionNumber, onAnswer }: { questionNumber: number; onAnswer: (correct: boolean) => void }) {
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [showTarget, setShowTarget] = useState(false);
  const [phase, setPhase] = useState<"wait" | "ready" | "go" | "result">("wait");
  
  const startTest = () => {
    setPhase("ready");
    const delay = Math.random() * 3000 + 2000; // 2-5 seconds
    
    setTimeout(() => {
      setPhase("go");
      setShowTarget(true);
      setStartTime(Date.now());
    }, delay);
  };
  
  const handleClick = () => {
    if (phase === "go" && startTime) {
      const time = Date.now() - startTime;
      setReactionTime(time);
      setPhase("result");
      setShowTarget(false);
    }
  };

  const handleNext = () => {
    // Good reaction time is typically under 500ms
    onAnswer(reactionTime! < 500);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reaction Time Test</CardTitle>
        <CardDescription>
          Click the target as quickly as possible when it appears
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-6">
        <div 
          className="relative h-64 bg-muted rounded-lg cursor-pointer overflow-hidden"
          onClick={handleClick}
        >
          {showTarget && (
            <div 
              className="absolute w-12 h-12 bg-red-500 rounded-full animate-pulse"
              style={{
                top: Math.random() * 200 + 'px',
                left: Math.random() * 300 + 'px'
              }}
            />
          )}
          
          <div className="flex items-center justify-center h-full">
            {phase === "wait" && (
              <p className="text-lg text-muted-foreground">Click "Start" to begin</p>
            )}
            {phase === "ready" && (
              <p className="text-lg text-yellow-600">Get ready...</p>
            )}
            {phase === "go" && (
              <p className="text-lg text-green-600">Click the red circle!</p>
            )}
            {phase === "result" && reactionTime && (
              <div>
                <p className="text-lg font-bold">{reactionTime}ms</p>
                <p className="text-muted-foreground">
                  {reactionTime < 300 ? "Excellent!" : 
                   reactionTime < 500 ? "Good!" : "Keep practicing!"}
                </p>
              </div>
            )}
          </div>
        </div>
        
        {phase === "wait" && (
          <Button onClick={startTest}>Start Reaction Test</Button>
        )}
        
        {phase === "result" && reactionTime && (
          <Button onClick={handleNext} className="mt-4">
            Next Test
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function BrainPuzzleTest({ questionNumber, onAnswer }: { questionNumber: number; onAnswer: (correct: boolean) => void }) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  
  // Generate pattern sequence
  const sequence = [2, 4, 8, 16, 32]; // Powers of 2
  const nextNumber = 64;
  const options = [48, 58, 64, 72];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pattern Recognition</CardTitle>
        <CardDescription>
          What number comes next in this sequence?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-3xl font-mono space-x-4 mb-4">
            {sequence.map((num, i) => (
              <span key={i} className="inline-block w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mr-2 mb-2">
                {num}
              </span>
            ))}
            <span className="inline-block w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
              ?
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
          {options.map(option => (
            <Button
              key={option}
              variant={selectedAnswer === option ? "default" : "outline"}
              onClick={() => setSelectedAnswer(option)}
              className="h-16 text-xl"
            >
              {option}
            </Button>
          ))}
        </div>
        
        <div className="text-center">
          <Button
            onClick={() => onAnswer(selectedAnswer === nextNumber)}
            disabled={selectedAnswer === null}
          >
            Submit Answer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}