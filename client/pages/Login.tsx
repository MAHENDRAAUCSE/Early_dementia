import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithInput } from "@/components/ui/date-picker";
import { LocationInput } from "@/components/ui/location-selector";
import { User, Phone, Mail, Calendar, MapPin, Heart, Briefcase } from "lucide-react";

type UserProfile = {
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
};

export default function Login() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sentOtp, setSentOtp] = useState<string | null>(null);
  const [step, setStep] = useState<"enter" | "verify">("enter");
  const [mode, setMode] = useState<"login" | "register">("login");
  
  // Basic Information
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [gender, setGender] = useState("");
  const [occupation, setOccupation] = useState("");
  
  // Medical Information
  const [insuranceProvider, setInsuranceProvider] = useState("");
  const [primaryPhysician, setPrimaryPhysician] = useState("");
  const [allergies, setAllergies] = useState("");
  const [medications, setMedications] = useState("");
  
  // Lifestyle Information
  const [smokingStatus, setSmokingStatus] = useState("Never");
  const [exerciseFrequency, setExerciseFrequency] = useState("Moderate");
  const [sleepHours, setSleepHours] = useState("7-8 hours");
  
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("guardian_medics_user");
    if (user) navigate("/");
  }, [navigate]);

  const validateRegistrationFields = () => {
    if (!fullName.trim()) {
      alert("Please enter your full name");
      return false;
    }
    if (!email.trim() || !email.includes("@")) {
      alert("Please enter a valid email address");
      return false;
    }
    if (!dateOfBirth) {
      alert("Please enter your date of birth");
      return false;
    }
    return true;
  };

  const sendOtp = () => {
    const cleaned = phone.replace(/\D/g, "");
    if (!cleaned || cleaned.length < 6) {
      alert("Please enter a valid phone number");
      return;
    }
    
    if (mode === "register" && !validateRegistrationFields()) {
      return;
    }
    
    const code = String(Math.floor(1000 + Math.random() * 9000));
    setSentOtp(code);
    setStep("verify");
  };

  const verify = () => {
    if (otp === sentOtp) {
      const cleanedPhone = phone.replace(/\D/g, "");
      
      if (mode === "register") {
        const userProfile: UserProfile = {
          phone: cleanedPhone,
          email,
          fullName,
          dateOfBirth,
          address,
          emergencyContact,
          medicalHistory: [],
          registrationDate: Date.now(),
          gender,
          occupation,
          preferredLanguage: "English",
          insuranceProvider,
          primaryPhysician,
          allergies: allergies ? allergies.split(",").map(s => s.trim()).filter(s => s) : [],
          medications: medications ? medications.split(",").map(s => s.trim()).filter(s => s) : [],
          smokingStatus,
          exerciseFrequency,
          sleepHours,
          stressLevel: "Low",
          familyHistory: []
        };
        localStorage.setItem("guardian_medics_user_profile", JSON.stringify(userProfile));
      }
      
      localStorage.setItem("guardian_medics_user", cleanedPhone);
      if (!localStorage.getItem("guardian_medics_history")) localStorage.setItem("guardian_medics_history", JSON.stringify([]));
      
      // Dispatch custom event to update header immediately
      window.dispatchEvent(new CustomEvent('authStateChanged'));
      
      // Navigate to home page
      navigate("/");
    } else {
      alert("Incorrect code");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/40 p-4">
      <Card className="w-full max-w-2xl my-8">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent">
            Detect Neural Dementia
          </CardTitle>
          <CardDescription>
            {step === "verify" ? "Verify your identity" : "Access your health dashboard"}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {step === "enter" && (
            <Tabs value={mode} onValueChange={(value) => setMode(value as "login" | "register")} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="phone-login">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone-login"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 555 123 4567"
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button onClick={sendOtp} className="w-full">
                  Send Verification Code
                </Button>
              </TabsContent>
              
              <TabsContent value="register" className="space-y-6 mt-6 max-h-[70vh] overflow-y-auto">
                {/* Basic Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary">Basic Information</h3>
                  <div className="space-y-2">
                    <Label htmlFor="fullname">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullname"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone-register">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone-register"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 555 123 4567"
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth *</Label>
                  <DatePickerWithInput
                    id="dob"
                    value={dateOfBirth}
                    onChange={setDateOfBirth}
                    placeholder="Select your date of birth"
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    Location (Optional)
                  </Label>
                  <LocationInput
                    value={address}
                    onChange={setAddress}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="emergency">Emergency Contact (Optional)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="emergency"
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)}
                      placeholder="+1 555 987 6543"
                      className="pl-10"
                    />
                  </div>
                </div>
                </div>

                {/* Personal Details Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary">Personal Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                        <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="occupation">Occupation</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="occupation"
                        value={occupation}
                        onChange={(e) => setOccupation(e.target.value)}
                        placeholder="Your occupation"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
                </div>

                {/* Medical Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary">Medical Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="insurance">Insurance Provider</Label>
                    <div className="relative">
                      <Heart className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="insurance"
                        value={insuranceProvider}
                        onChange={(e) => setInsuranceProvider(e.target.value)}
                        placeholder="Insurance company name"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="physician">Primary Physician</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="physician"
                        value={primaryPhysician}
                        onChange={(e) => setPrimaryPhysician(e.target.value)}
                        placeholder="Doctor's name and contact"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
                </div>

                {/* Lifestyle Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary">Lifestyle Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smoking">Smoking Status</Label>
                    <Select value={smokingStatus} onValueChange={setSmokingStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Never">Never</SelectItem>
                        <SelectItem value="Former">Former smoker</SelectItem>
                        <SelectItem value="Current">Current smoker</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="exercise">Exercise Frequency</Label>
                    <Select value={exerciseFrequency} onValueChange={setExerciseFrequency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sedentary">Sedentary</SelectItem>
                        <SelectItem value="Light">Light (1-2 days/week)</SelectItem>
                        <SelectItem value="Moderate">Moderate (3-4 days/week)</SelectItem>
                        <SelectItem value="Active">Active (5+ days/week)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sleep">Sleep Hours</Label>
                    <Select value={sleepHours} onValueChange={setSleepHours}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Less than 5 hours">Less than 5 hours</SelectItem>
                        <SelectItem value="5-6 hours">5-6 hours</SelectItem>
                        <SelectItem value="7-8 hours">7-8 hours</SelectItem>
                        <SelectItem value="9+ hours">9+ hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                </div>

                {/* Medical History Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary">Medical History (Optional)</h3>
                  <div className="space-y-2">
                  <Label htmlFor="allergies">Allergies (comma-separated, optional)</Label>
                  <Input
                    id="allergies"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="e.g., Peanuts, Shellfish, Penicillin"
                  />
                </div>

                  <div className="space-y-2">
                    <Label htmlFor="medications">Current Medications (comma-separated, optional)</Label>
                    <Input
                      id="medications"
                      value={medications}
                      onChange={(e) => setMedications(e.target.value)}
                      placeholder="e.g., Lisinopril 10mg, Metformin 500mg"
                    />
                  </div>
                </div>
                
                <Button onClick={sendOtp} className="w-full mt-6">
                  Create Account & Send Code
                </Button>
              </TabsContent>
            </Tabs>
          )}

          {step === "verify" && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-2">
                  We sent a 4-digit code to your phone
                </div>
                <div className="p-3 bg-muted rounded-lg font-mono text-lg font-bold text-center">
                  {sentOtp}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  (Code shown for prototype demo)
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 4-digit code"
                  className="text-center text-lg font-mono"
                  maxLength={4}
                />
              </div>
              
              <div className="flex items-center justify-between gap-2">
                <Button variant="outline" onClick={() => setStep("enter")} className="flex-1">
                  Back
                </Button>
                <Button variant="outline" onClick={sendOtp}>
                  Resend
                </Button>
                <Button onClick={verify} className="flex-1">
                  {mode === "register" ? "Create Account" : "Login"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
