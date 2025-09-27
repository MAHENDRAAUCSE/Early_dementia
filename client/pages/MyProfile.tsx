import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DatePickerWithInput } from "@/components/ui/date-picker";
import { LocationInput } from "@/components/ui/location-selector";
import { 
  User, 
  Calendar, 
  Clock, 
  Brain, 
  Activity, 
  Trash2, 
  Edit3, 
  Plus, 
  Save, 
  X,
  UserCircle,
  Mail,
  Phone,
  MapPin,
  Calendar as CalendarIcon,
  Heart,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  AlertTriangle
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface UserProfile {
  phone: string;
  email: string;
  fullName: string;
  dateOfBirth: string;
  address: string;
  emergencyContact: string;
  medicalHistory: string[];
  registrationDate: number;
  gender: string;
  occupation: string;
  preferredLanguage: string;
  insuranceProvider: string;
  primaryPhysician: string;
  allergies: string[];
  medications: string[];
  smokingStatus: string;
  exerciseFrequency: string;
  sleepHours: string;
  stressLevel: string;
  familyHistory: string[];
}

interface HistoryItem {
  id: string;
  ts: number;
  phone: string;
  memoryScore: number;
  speechScore: number;
  attentionScore: number;
  label: string;
}

export default function MyProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [screeningHistory, setScreeningHistory] = useState<HistoryItem[]>([]);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState("profile");

  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("guardian_medics_user");
    if (!user) {
      navigate("/login");
      return;
    }

    const loadData = () => {
      try {
        const profileData = localStorage.getItem("guardian_medics_user_profile");
        if (profileData) {
          const parsed = JSON.parse(profileData);
          setProfile(parsed);
          setEditForm(parsed);
        } else {
          const defaultProfile: UserProfile = {
            phone: user,
            email: "",
            fullName: "",
            dateOfBirth: "",
            address: "",
            emergencyContact: "",
            medicalHistory: [],
            registrationDate: Date.now(),
            gender: "",
            occupation: "",
            preferredLanguage: "English",
            insuranceProvider: "",
            primaryPhysician: "",
            allergies: [],
            medications: [],
            smokingStatus: "Never",
            exerciseFrequency: "Moderate",
            sleepHours: "7-8 hours",
            stressLevel: "Low",
            familyHistory: []
          };
          setProfile(defaultProfile);
          setEditForm(defaultProfile);
        }

        const historyData = localStorage.getItem("guardian_medics_history");
        if (historyData) {
          const history = JSON.parse(historyData) as HistoryItem[];
          setScreeningHistory(history.reverse());
        }
      } catch (error) {
        console.error("Error loading profile data:", error);
      }
    };

    loadData();
  }, [navigate]);

  const saveProfile = useCallback(async () => {
    if (!editForm) return;
    
    try {
      setProfile(editForm);
      localStorage.setItem("guardian_medics_user_profile", JSON.stringify(editForm));
      setEditingProfile(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  }, [editForm]);

  const clearHistory = useCallback(() => {
    setScreeningHistory([]);
    localStorage.setItem("guardian_medics_history", JSON.stringify([]));
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "high": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "text-green-600";
    if (score >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  if (!profile) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl">
      {/* Profile Header Card */}
      <Card className="mb-8 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-8 relative">
          <div className="flex items-center gap-6">
            {/* Profile Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : 'K'}
              </div>
            </div>
            
            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {profile.fullName || 'Kohn Wick'}
              </h1>
              <div className="flex items-center gap-4 text-gray-600 mb-4">
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {profile.gender || '+A'}
                </span>
                <span className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {profile.phone || '+911234567890'}
                </span>
              </div>
            </div>
            
            {/* Edit Button */}
            <Button
              variant={editingProfile ? "outline" : "default"}
              size="sm"
              onClick={() => {
                if (editingProfile) {
                  setEditForm(profile);
                }
                setEditingProfile(!editingProfile);
              }}
              className="absolute top-4 right-4"
            >
              {editingProfile ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="history">
            History
            <Badge variant="secondary" className="ml-2">
              {screeningHistory.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-primary" />
                <CardTitle>Personal Information</CardTitle>
              </div>
              <CardDescription>
                Your basic profile information for Detect Neural Dementia
              </CardDescription>
            </CardHeader>
            <CardContent>
              {editingProfile ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={editForm?.fullName || ""}
                        onChange={(e) => setEditForm(prev => prev ? {...prev, fullName: e.target.value} : null)}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editForm?.email || ""}
                        onChange={(e) => setEditForm(prev => prev ? {...prev, email: e.target.value} : null)}
                        placeholder="Enter your email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={editForm?.phone || ""}
                        onChange={(e) => setEditForm(prev => prev ? {...prev, phone: e.target.value} : null)}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <DatePickerWithInput
                        id="dateOfBirth"
                        value={editForm?.dateOfBirth || ""}
                        onChange={(value) => setEditForm(prev => prev ? {...prev, dateOfBirth: value} : null)}
                        placeholder="Select your date of birth"
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Location</Label>
                    <LocationInput
                      value={editForm?.address || ""}
                      onChange={(value) => setEditForm(prev => prev ? {...prev, address: value} : null)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    <Input
                      id="emergencyContact"
                      value={editForm?.emergencyContact || ""}
                      onChange={(e) => setEditForm(prev => prev ? {...prev, emergencyContact: e.target.value} : null)}
                      placeholder="Name and phone number"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <select
                        id="gender"
                        value={editForm?.gender || ""}
                        onChange={(e) => setEditForm(prev => prev ? {...prev, gender: e.target.value} : null)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="occupation">Occupation</Label>
                      <Input
                        id="occupation"
                        value={editForm?.occupation || ""}
                        onChange={(e) => setEditForm(prev => prev ? {...prev, occupation: e.target.value} : null)}
                        placeholder="Your occupation"
                      />
                    </div>
                    <div>
                      <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                      <Input
                        id="insuranceProvider"
                        value={editForm?.insuranceProvider || ""}
                        onChange={(e) => setEditForm(prev => prev ? {...prev, insuranceProvider: e.target.value} : null)}
                        placeholder="Insurance company name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="primaryPhysician">Primary Physician</Label>
                      <Input
                        id="primaryPhysician"
                        value={editForm?.primaryPhysician || ""}
                        onChange={(e) => setEditForm(prev => prev ? {...prev, primaryPhysician: e.target.value} : null)}
                        placeholder="Doctor's name and contact"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="smokingStatus">Smoking Status</Label>
                      <select
                        id="smokingStatus"
                        value={editForm?.smokingStatus || "Never"}
                        onChange={(e) => setEditForm(prev => prev ? {...prev, smokingStatus: e.target.value} : null)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        <option value="Never">Never</option>
                        <option value="Former">Former smoker</option>
                        <option value="Current">Current smoker</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="exerciseFrequency">Exercise Frequency</Label>
                      <select
                        id="exerciseFrequency"
                        value={editForm?.exerciseFrequency || "Moderate"}
                        onChange={(e) => setEditForm(prev => prev ? {...prev, exerciseFrequency: e.target.value} : null)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        <option value="Sedentary">Sedentary</option>
                        <option value="Light">Light (1-2 days/week)</option>
                        <option value="Moderate">Moderate (3-4 days/week)</option>
                        <option value="Active">Active (5+ days/week)</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="sleepHours">Sleep Hours</Label>
                      <select
                        id="sleepHours"
                        value={editForm?.sleepHours || "7-8 hours"}
                        onChange={(e) => setEditForm(prev => prev ? {...prev, sleepHours: e.target.value} : null)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        <option value="Less than 5 hours">Less than 5 hours</option>
                        <option value="5-6 hours">5-6 hours</option>
                        <option value="7-8 hours">7-8 hours</option>
                        <option value="9+ hours">9+ hours</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="allergies">Allergies (comma-separated)</Label>
                    <Input
                      id="allergies"
                      value={editForm?.allergies?.join(", ") || ""}
                      onChange={(e) => setEditForm(prev => prev ? {...prev, allergies: e.target.value.split(",").map(s => s.trim()).filter(s => s)} : null)}
                      placeholder="e.g., Peanuts, Shellfish, Penicillin"
                    />
                  </div>

                  <div>
                    <Label htmlFor="medications">Current Medications (comma-separated)</Label>
                    <Input
                      id="medications"
                      value={editForm?.medications?.join(", ") || ""}
                      onChange={(e) => setEditForm(prev => prev ? {...prev, medications: e.target.value.split(",").map(s => s.trim()).filter(s => s)} : null)}
                      placeholder="e.g., Lisinopril 10mg, Metformin 500mg"
                    />
                  </div>

                  <Button onClick={saveProfile} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Information Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <User className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Full Name</p>
                        <p className="text-gray-900 font-medium">{profile.fullName || "Karthikeya"}</p>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Mail className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Email</p>
                        <p className="text-gray-900 font-medium">{profile.email || "asdfghj@asdfghjk"}</p>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Phone className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Phone</p>
                        <p className="text-gray-900 font-medium">{profile.phone || "741852963"}</p>
                      </div>
                    </div>

                    {/* Date of Birth */}
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <CalendarIcon className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Date of Birth</p>
                        <p className="text-gray-900 font-medium">{profile.dateOfBirth || "2009-02-11"}</p>
                      </div>
                    </div>

                    {/* Gender */}
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <User className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Gender</p>
                        <p className="text-gray-900 font-medium">{profile.gender || "Not provided"}</p>
                      </div>
                    </div>

                    {/* Occupation */}
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <User className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Occupation</p>
                        <p className="text-gray-900 font-medium">{profile.occupation || "Not provided"}</p>
                      </div>
                    </div>

                    {/* Insurance Provider */}
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Heart className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Insurance Provider</p>
                        <p className="text-gray-900 font-medium">{profile.insuranceProvider || "Not provided"}</p>
                      </div>
                    </div>

                    {/* Primary Physician */}
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <User className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Primary Physician</p>
                        <p className="text-gray-900 font-medium">{profile.primaryPhysician || "Not provided"}</p>
                      </div>
                    </div>

                    {/* Exercise Frequency */}
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Activity className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Exercise Frequency</p>
                        <p className="text-gray-900 font-medium">{profile.exerciseFrequency}</p>
                      </div>
                    </div>

                    {/* Sleep Hours */}
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Sleep Hours</p>
                        <p className="text-gray-900 font-medium">{profile.sleepHours}</p>
                      </div>
                    </div>
                  </div>

                  {/* Address and Emergency Contact - Full Width */}
                  {profile.address && (
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <MapPin className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Address</p>
                        <p className="text-gray-900 font-medium">{profile.address}</p>
                      </div>
                    </div>
                  )}
                  
                  {profile.emergencyContact && (
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Emergency Contact</p>
                        <p className="text-gray-900 font-medium">{profile.emergencyContact}</p>
                      </div>
                    </div>
                  )}
                  {profile.allergies && profile.allergies.length > 0 && (
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Allergies</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {profile.allergies.map((allergy, index) => (
                            <Badge key={index} variant="destructive" className="text-xs">
                              {allergy}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {profile.medications && profile.medications.length > 0 && (
                    <div className="flex items-start gap-3">
                      <Heart className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Current Medications</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {profile.medications.map((medication, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {medication}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Assessment History
                </CardTitle>
                <CardDescription>
                  Complete record of your cognitive health assessments
                </CardDescription>
              </div>
              {screeningHistory.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearHistory}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear History
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {screeningHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Assessments Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Complete your first health assessment to see your results here.
                  </p>
                  <Button onClick={() => navigate("/")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Start Assessment
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold">{screeningHistory.length}</div>
                        <div className="text-sm text-muted-foreground">Total Assessments</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {screeningHistory.filter(h => h.label === "Low").length}
                        </div>
                        <div className="text-sm text-muted-foreground">Low Risk</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          {screeningHistory.filter(h => h.label === "Medium").length}
                        </div>
                        <div className="text-sm text-muted-foreground">Medium Risk</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {screeningHistory.filter(h => h.label === "High").length}
                        </div>
                        <div className="text-sm text-muted-foreground">High Risk</div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    {screeningHistory.map((assessment, index) => (
                      <Card key={assessment.id}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="bg-primary/10 rounded-full p-2">
                                <span className="text-sm font-medium text-primary">
                                  #{screeningHistory.length - index}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">
                                  Assessment {screeningHistory.length - index}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(assessment.ts).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <Badge className={getSeverityColor(assessment.label.toLowerCase())}>
                              {assessment.label} Risk
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-muted-foreground">Memory</span>
                                <span className={`text-sm font-medium ${getScoreColor(assessment.memoryScore)}`}>
                                  {Math.round(assessment.memoryScore * 100)}%
                                </span>
                              </div>
                              <Progress value={assessment.memoryScore * 100} className="h-2" />
                            </div>
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-muted-foreground">Speech</span>
                                <span className={`text-sm font-medium ${getScoreColor(assessment.speechScore)}`}>
                                  {Math.round(assessment.speechScore * 100)}%
                                </span>
                              </div>
                              <Progress value={assessment.speechScore * 100} className="h-2" />
                            </div>
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-muted-foreground">Attention</span>
                                <span className={`text-sm font-medium ${getScoreColor(assessment.attentionScore)}`}>
                                  {Math.round(assessment.attentionScore * 100)}%
                                </span>
                              </div>
                              <Progress value={assessment.attentionScore * 100} className="h-2" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your Detect Neural Dementia account preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Clear All Data</p>
                  <p className="text-sm text-muted-foreground">
                    Remove all assessments and profile data
                  </p>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => {
                    localStorage.clear();
                    navigate("/login");
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
