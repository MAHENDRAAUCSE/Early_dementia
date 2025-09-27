import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Brain, 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Plus,
  X,
  Activity,
  Heart,
  Stethoscope
} from "lucide-react";

type HistoryItem = {
  id: string;
  ts: number;
  phone?: string | null;
  memoryScore: number;
  speechScore: number;
  attentionScore: number;
  label: "Low" | "Medium" | "High";
};

type UserProfile = {
  phone: string;
  email: string;
  fullName: string;
  dateOfBirth: string;
  location: string;
  emergencyContact: string;
  medicalHistory: string[];
  registrationDate: number;
};

type HealthIssue = {
  id: string;
  title: string;
  description: string;
  severity: "Low" | "Medium" | "High";
  dateReported: number;
  status: "Active" | "Resolved" | "Monitoring";
};

type Checkup = {
  id: string;
  date: number;
  type: string;
  provider: string;
  notes: string;
  findings: string[];
  nextAppointment?: number;
};

export default function Dashboard() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [screeningHistory, setScreeningHistory] = useState<HistoryItem[]>([]);
  const [healthIssues, setHealthIssues] = useState<HealthIssue[]>([]);
  const [checkups, setCheckups] = useState<Checkup[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [newIssue, setNewIssue] = useState<{ title: string; description: string; severity: "Low" | "Medium" | "High" }>({ title: "", description: "", severity: "Low" });
  const [newCheckup, setNewCheckup] = useState({ 
    type: "", 
    provider: "", 
    notes: "", 
    findings: "" 
  });
  const [showAddIssue, setShowAddIssue] = useState(false);
  const [showAddCheckup, setShowAddCheckup] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("guardian_medics_user");
    if (!user) {
      navigate("/login");
      return;
    }

    const profileData = localStorage.getItem("guardian_medics_user_profile");
    if (profileData) {
      setUserProfile(JSON.parse(profileData));
    }

    const historyData = localStorage.getItem("guardian_medics_history");
    if (historyData) {
      const history = JSON.parse(historyData) as HistoryItem[];
      setScreeningHistory(history.reverse());
    }

    const issuesData = localStorage.getItem("guardian_medics_health_issues");
    if (issuesData) {
      setHealthIssues(JSON.parse(issuesData));
    }

    const checkupsData = localStorage.getItem("guardian_medics_checkups");
    if (checkupsData) {
      setCheckups(JSON.parse(checkupsData));
    }
  }, [navigate]);



  const addHealthIssue = () => {
    if (!newIssue.title.trim()) return;
    
    const issue: HealthIssue = {
      id: Date.now().toString(),
      title: newIssue.title,
      description: newIssue.description,
      severity: newIssue.severity,
      dateReported: Date.now(),
      status: "Active"
    };
    
    const updatedIssues = [...healthIssues, issue];
    setHealthIssues(updatedIssues);
    localStorage.setItem("guardian_medics_health_issues", JSON.stringify(updatedIssues));
    setNewIssue({ title: "", description: "", severity: "Low" });
    setShowAddIssue(false);
  };

  const addCheckup = () => {
    if (!newCheckup.type.trim() || !newCheckup.provider.trim()) return;
    
    const checkup: Checkup = {
      id: Date.now().toString(),
      date: Date.now(),
      type: newCheckup.type,
      provider: newCheckup.provider,
      notes: newCheckup.notes,
      findings: newCheckup.findings.split(',').map(f => f.trim()).filter(f => f)
    };
    
    const updatedCheckups = [...checkups, checkup];
    setCheckups(updatedCheckups);
    localStorage.setItem("guardian_medics_checkups", JSON.stringify(updatedCheckups));
    setNewCheckup({ type: "", provider: "", notes: "", findings: "" });
    setShowAddCheckup(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "text-green-600";
    if (score >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "High": return "destructive";
      case "Medium": return "secondary";
      default: return "outline";
    }
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/40 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome!</CardTitle>
            <CardDescription>Complete your profile to access your health dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/login")} className="w-full">
              Complete Setup
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/40 py-8">
      <div className="container max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent">
              Health Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {userProfile.fullName}
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/cognitive-tests">
              <Button>Advanced Assessment</Button>
            </Link>
            <Link to="/">
              <Button variant="outline">Basic Assessment</Button>
            </Link>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="health-issues">Health Issues</TabsTrigger>
            <TabsTrigger value="checkups">Checkups</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Latest Cognitive Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                {screeningHistory.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">
                          <Badge variant={getSeverityColor(screeningHistory[0].label)}>
                            {screeningHistory[0].label} Risk
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(screeningHistory[0].ts).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link to="/my-profile">
                          <Button variant="outline" size="sm">View Profile</Button>
                        </Link>
                        <Link to="/history">
                          <Button variant="outline" size="sm">All History</Button>
                        </Link>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Memory</div>
                        <div className={`text-2xl font-bold ${getScoreColor(screeningHistory[0].memoryScore)}`}>
                          {Math.round(screeningHistory[0].memoryScore * 100)}%
                        </div>
                        <Progress value={screeningHistory[0].memoryScore * 100} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Speech</div>
                        <div className={`text-2xl font-bold ${getScoreColor(screeningHistory[0].speechScore)}`}>
                          {Math.round(screeningHistory[0].speechScore * 100)}%
                        </div>
                        <Progress value={screeningHistory[0].speechScore * 100} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Attention</div>
                        <div className={`text-2xl font-bold ${getScoreColor(screeningHistory[0].attentionScore)}`}>
                          {Math.round(screeningHistory[0].attentionScore * 100)}%
                        </div>
                        <Progress value={screeningHistory[0].attentionScore * 100} className="h-2" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No assessments taken yet</p>
                    <Link to="/">
                      <Button className="mt-4">Take Your First Assessment</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* New Cognitive Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-blue-600/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-6 w-6 text-primary" />
                    Advanced Cognitive Tests
                  </CardTitle>
                  <CardDescription>
                    Comprehensive assessment including color vision, hearing, music recognition, and coordination tests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Color Vision Test
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Hearing Assessment
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        Music Recognition
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        Coordination Test
                      </div>
                    </div>
                    <Link to="/cognitive-tests" className="block">
                      <Button className="w-full">
                        Start Comprehensive Assessment
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="text-2xl">🧩</div>
                    Daily Puzzle Hub
                  </CardTitle>
                  <CardDescription>
                    Hourly brain challenges with streaks, notifications, and cognitive fitness tracking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Today's Progress</span>
                      <Badge variant="outline">0/4 puzzles</Badge>
                    </div>
                    <Progress value={0} className="h-2" />
                    <Link to="/puzzle-hub" className="block">
                      <Button variant="outline" className="w-full">
                        Open Puzzle Hub
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Health Issues</p>
                      <p className="text-2xl font-bold">
                        {healthIssues.filter(issue => issue.status === "Active").length}
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Checkups</p>
                      <p className="text-2xl font-bold">{checkups.length}</p>
                    </div>
                    <Stethoscope className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Assessments Taken</p>
                      <p className="text-2xl font-bold">{screeningHistory.length}</p>
                    </div>
                    <Activity className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="health-issues" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Health Issues</CardTitle>
                  <CardDescription>Track and monitor your health concerns</CardDescription>
                </div>
                <Button onClick={() => setShowAddIssue(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Issue
                </Button>
              </CardHeader>
              <CardContent>
                {showAddIssue && (
                  <Card className="mb-4">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Add New Health Issue</h4>
                        <Button variant="ghost" size="sm" onClick={() => setShowAddIssue(false)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={newIssue.title}
                          onChange={(e) => setNewIssue({...newIssue, title: e.target.value})}
                          placeholder="e.g., Persistent headaches"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={newIssue.description}
                          onChange={(e) => setNewIssue({...newIssue, description: e.target.value})}
                          placeholder="Describe symptoms, frequency, etc."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Severity</Label>
                        <select 
                          value={newIssue.severity}
                          onChange={(e) => setNewIssue({...newIssue, severity: e.target.value as "Low" | "Medium" | "High"})}
                          className="w-full px-3 py-2 border rounded-md bg-background"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>
                      </div>
                      <Button onClick={addHealthIssue} className="w-full">Add Issue</Button>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-4">
                  {healthIssues.length === 0 ? (
                    <div className="text-center py-8">
                      <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No health issues recorded</p>
                    </div>
                  ) : (
                    healthIssues.map((issue) => (
                      <Card key={issue.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{issue.title}</h4>
                                <Badge variant={getSeverityColor(issue.severity)}>
                                  {issue.severity}
                                </Badge>
                                <Badge variant="outline">{issue.status}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{issue.description}</p>
                              <p className="text-xs text-muted-foreground">
                                Reported on {new Date(issue.dateReported).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checkups" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Medical Checkups</CardTitle>
                  <CardDescription>Keep track of your medical appointments and results</CardDescription>
                </div>
                <Button onClick={() => setShowAddCheckup(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Checkup
                </Button>
              </CardHeader>
              <CardContent>
                {showAddCheckup && (
                  <Card className="mb-4">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Add New Checkup</h4>
                        <Button variant="ghost" size="sm" onClick={() => setShowAddCheckup(false)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Checkup Type</Label>
                          <Input
                            value={newCheckup.type}
                            onChange={(e) => setNewCheckup({...newCheckup, type: e.target.value})}
                            placeholder="e.g., Annual Physical"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Healthcare Provider</Label>
                          <Input
                            value={newCheckup.provider}
                            onChange={(e) => setNewCheckup({...newCheckup, provider: e.target.value})}
                            placeholder="e.g., Dr. Smith"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Notes</Label>
                        <Textarea
                          value={newCheckup.notes}
                          onChange={(e) => setNewCheckup({...newCheckup, notes: e.target.value})}
                          placeholder="General notes about the visit"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Key Findings (comma separated)</Label>
                        <Input
                          value={newCheckup.findings}
                          onChange={(e) => setNewCheckup({...newCheckup, findings: e.target.value})}
                          placeholder="e.g., Blood pressure normal, Weight stable"
                        />
                      </div>
                      <Button onClick={addCheckup} className="w-full">Add Checkup</Button>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-4">
                  {checkups.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No checkups recorded</p>
                    </div>
                  ) : (
                    checkups.map((checkup) => (
                      <Card key={checkup.id}>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{checkup.type}</h4>
                                <p className="text-sm text-muted-foreground">{checkup.provider}</p>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {new Date(checkup.date).toLocaleDateString()}
                              </p>
                            </div>
                            {checkup.notes && (
                              <p className="text-sm">{checkup.notes}</p>
                            )}
                            {checkup.findings.length > 0 && (
                              <div>
                                <p className="text-sm font-medium mb-2">Key Findings:</p>
                                <div className="flex flex-wrap gap-2">
                                  {checkup.findings.map((finding, index) => (
                                    <Badge key={index} variant="outline">
                                      {finding}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>


          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences and privacy settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Profile Visibility</h4>
                      <p className="text-sm text-muted-foreground">Control who can see your profile information</p>
                    </div>
                    <select className="px-3 py-2 border rounded-md bg-background">
                      <option>Private</option>
                      <option>Healthcare Providers Only</option>
                      <option>Public</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-muted-foreground">Receive assessment reminders and health tips</p>
                    </div>
                    <input type="checkbox" className="h-4 w-4" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Data Sharing</h4>
                      <p className="text-sm text-muted-foreground">Share anonymized data for research purposes</p>
                    </div>
                    <input type="checkbox" className="h-4 w-4" />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium text-destructive">Danger Zone</h3>
                  <div className="p-4 border border-destructive/20 rounded-lg">
                    <h4 className="font-medium mb-2">Delete Account</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <Button variant="destructive" size="sm">Delete Account</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


