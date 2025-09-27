import * as React from "react";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Location data by country
const LOCATION_DATA = {
  "United States": {
    states: [
      "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
      "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
      "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
      "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
      "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
      "New Hampshire", "New Jersey", "New Mexico", "New York",
      "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
      "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
      "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
      "West Virginia", "Wisconsin", "Wyoming"
    ],
    cities: {
      "California": ["Los Angeles", "San Francisco", "San Diego", "Sacramento", "San Jose", "Fresno", "Oakland", "Santa Ana", "Anaheim", "Riverside", "Stockton", "Irvine", "Chula Vista", "Fremont", "Glendale"],
      "Texas": ["Houston", "San Antonio", "Dallas", "Austin", "Fort Worth", "El Paso", "Arlington", "Corpus Christi", "Plano", "Laredo", "Lubbock", "Garland", "Irving"],
      "Florida": ["Jacksonville", "Miami", "Tampa", "Orlando", "St. Petersburg", "Hialeah", "Fort Lauderdale", "Port St. Lucie", "Cape Coral", "Pembroke Pines"],
      "New York": ["New York", "Buffalo", "Rochester", "Yonkers", "Syracuse", "Albany", "New Rochelle", "Mount Vernon", "Schenectady", "Utica"],
      "Pennsylvania": ["Philadelphia", "Pittsburgh", "Allentown", "Erie", "Reading", "Scranton", "Bethlehem", "Lancaster", "Harrisburg", "Altoona"],
      "Illinois": ["Chicago", "Aurora", "Rockford", "Joliet", "Naperville", "Springfield", "Peoria", "Elgin", "Waukegan", "Cicero"],
      "Ohio": ["Columbus", "Cleveland", "Cincinnati", "Toledo", "Akron", "Dayton", "Parma", "Canton", "Youngstown", "Lorain"],
      "Georgia": ["Atlanta", "Augusta", "Columbus", "Savannah", "Athens", "Sandy Springs", "Roswell", "Macon", "Johns Creek", "Albany"],
      "North Carolina": ["Charlotte", "Raleigh", "Greensboro", "Durham", "Winston-Salem", "Fayetteville", "Cary", "Wilmington", "High Point", "Asheville"],
      "Michigan": ["Detroit", "Grand Rapids", "Warren", "Sterling Heights", "Lansing", "Ann Arbor", "Flint", "Dearborn", "Livonia", "Westland"]
    }
  },
  "Canada": {
    states: [
      "Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador",
      "Northwest Territories", "Nova Scotia", "Nunavut", "Ontario", "Prince Edward Island",
      "Quebec", "Saskatchewan", "Yukon"
    ],
    cities: {
      "Ontario": ["Toronto", "Ottawa", "Mississauga", "Brampton", "Hamilton", "London", "Markham", "Vaughan", "Kitchener", "Windsor"],
      "Quebec": ["Montreal", "Quebec City", "Laval", "Gatineau", "Longueuil", "Sherbrooke", "Saguenay", "Lévis", "Trois-Rivières", "Terrebonne"],
      "British Columbia": ["Vancouver", "Surrey", "Burnaby", "Richmond", "Abbotsford", "Coquitlam", "Saanich", "Delta", "Kelowna", "Langley"],
      "Alberta": ["Calgary", "Edmonton", "Red Deer", "Lethbridge", "St. Albert", "Medicine Hat", "Grande Prairie", "Airdrie", "Spruce Grove", "Leduc"]
    }
  },
  "United Kingdom": {
    states: ["England", "Scotland", "Wales", "Northern Ireland"],
    cities: {
      "England": ["London", "Birmingham", "Manchester", "Liverpool", "Leeds", "Sheffield", "Bristol", "Newcastle", "Nottingham", "Leicester"],
      "Scotland": ["Glasgow", "Edinburgh", "Aberdeen", "Dundee", "Paisley", "East Kilbride", "Livingston", "Hamilton", "Cumbernauld", "Kirkcaldy"],
      "Wales": ["Cardiff", "Swansea", "Newport", "Wrexham", "Barry", "Caerphilly", "Bridgend", "Neath", "Port Talbot", "Cwmbran"],
      "Northern Ireland": ["Belfast", "Derry", "Lisburn", "Newtownabbey", "Bangor", "Craigavon", "Castlereagh", "Ballymena", "Newtownards", "Carrickfergus"]
    }
  },
  "Australia": {
    states: ["New South Wales", "Victoria", "Queensland", "Western Australia", "South Australia", "Tasmania", "Australian Capital Territory", "Northern Territory"],
    cities: {
      "New South Wales": ["Sydney", "Newcastle", "Wollongong", "Maitland", "Albury", "Tamworth", "Orange", "Port Macquarie", "Wagga Wagga", "Bathurst"],
      "Victoria": ["Melbourne", "Geelong", "Ballarat", "Bendigo", "Frankston", "Mildura", "Shepparton", "Wodonga", "Warrnambool", "Traralgon"],
      "Queensland": ["Brisbane", "Gold Coast", "Townsville", "Cairns", "Toowoomba", "Rockhampton", "Mackay", "Bundaberg", "Hervey Bay", "Gladstone"],
      "Western Australia": ["Perth", "Fremantle", "Rockingham", "Mandurah", "Bunbury", "Kalgoorlie", "Geraldton", "Albany", "Busselton", "Broome"]
    }
  },
  "Germany": {
    states: ["Baden-Württemberg", "Bavaria", "Berlin", "Brandenburg", "Bremen", "Hamburg", "Hesse", "Lower Saxony", "Mecklenburg-Vorpommern", "North Rhine-Westphalia", "Rhineland-Palatinate", "Saarland", "Saxony", "Saxony-Anhalt", "Schleswig-Holstein", "Thuringia"],
    cities: {
      "Bavaria": ["Munich", "Nuremberg", "Augsburg", "Würzburg", "Regensburg", "Ingolstadt", "Fürth", "Erlangen", "Bayreuth", "Bamberg"],
      "North Rhine-Westphalia": ["Cologne", "Düsseldorf", "Dortmund", "Essen", "Duisburg", "Bochum", "Wuppertal", "Bielefeld", "Bonn", "Münster"],
      "Berlin": ["Berlin"],
      "Hamburg": ["Hamburg"]
    }
  },
  "France": {
    states: ["Île-de-France", "Auvergne-Rhône-Alpes", "Hauts-de-France", "Occitanie", "Nouvelle-Aquitaine", "Grand Est", "Provence-Alpes-Côte d'Azur", "Pays de la Loire", "Normandy", "Brittany", "Centre-Val de Loire", "Burgundy-Franche-Comté", "Corsica"],
    cities: {
      "Île-de-France": ["Paris", "Boulogne-Billancourt", "Saint-Denis", "Argenteuil", "Montreuil", "Créteil", "Nanterre", "Colombes", "Aulnay-sous-Bois", "Rueil-Malmaison"],
      "Auvergne-Rhône-Alpes": ["Lyon", "Grenoble", "Saint-Étienne", "Villeurbanne", "Clermont-Ferrand", "Chambéry", "Valence", "Annecy", "Bourg-en-Bresse", "Roanne"],
      "Provence-Alpes-Côte d'Azur": ["Marseille", "Nice", "Toulon", "Aix-en-Provence", "Antibes", "Cannes", "Avignon", "Fréjus", "Arles", "Gap"]
    }
  },
  "India": {
    states: [
      "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", 
      "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", 
      "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", 
      "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", 
      "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", 
      "Ladakh", "Puducherry", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", 
      "Lakshadweep", "Andaman and Nicobar Islands"
    ],
    cities: {
      "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Solapur", "Amravati", "Kolhapur", "Sangli", "Jalgaon"],
      "Delhi": ["New Delhi", "Delhi", "Gurgaon", "Faridabad", "Ghaziabad", "Noida", "Greater Noida", "Dwarka", "Rohini", "Janakpuri"],
      "Karnataka": ["Bengaluru", "Mysuru", "Hubli", "Mangaluru", "Belgaum", "Gulbarga", "Davanagere", "Bellary", "Bijapur", "Shimoga"],
      "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Erode", "Vellore", "Thoothukudi", "Dindigul"],
      "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Malda", "Bardhaman", "Baharampur", "Habra", "Kharagpur"],
      "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Gandhinagar", "Anand", "Navsari"],
      "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner", "Ajmer", "Bhilwara", "Alwar", "Bharatpur", "Sikar"],
      "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi", "Meerut", "Allahabad", "Bareilly", "Moradabad", "Aligarh"],
      "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Ramagundam", "Khammam", "Mahbubnagar", "Nalgonda", "Adilabad", "Suryapet"],
      "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Firozpur", "Batala", "Pathankot", "Moga"],
      "Haryana": ["Faridabad", "Gurgaon", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Karnal", "Sonipat", "Panchkula"],
      "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Palakkad", "Alappuzha", "Malappuram", "Kannur", "Kasaragod"],
      "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Rajahmundry", "Tirupati", "Kadapa", "Kakinada", "Anantapur"],
      "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam", "Rewa"],
      "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Brahmapur", "Sambalpur", "Puri", "Balasore", "Bhadrak", "Baripada", "Jharsuguda"],
      "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Bihar Sharif", "Arrah", "Begusarai", "Katihar"],
      "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur", "Bongaigaon", "Dhubri", "North Lakhimpur"]
    }
  }
};

// Popular countries
// Get Indian states directly from LOCATION_DATA
const INDIAN_STATES = LOCATION_DATA["India"]?.states || [];

interface LocationSelectorProps {
  city?: string;
  state?: string;
  country?: string;
  onCityChange?: (city: string) => void;
  onStateChange?: (state: string) => void;
  onCountryChange?: (country: string) => void;
  className?: string;
}

export function LocationSelector({
  city,
  state,
  country,
  onCityChange,
  onStateChange,
  onCountryChange,
  className
}: LocationSelectorProps) {
  
  // Get available cities for selected Indian state
  const getCitiesForIndianState = (selectedState: string) => {
    if (!selectedState) return [];
    
    const indiaData = LOCATION_DATA["India"];
    if (!indiaData) return [];
    
    const cities = indiaData.cities[selectedState as keyof typeof indiaData.cities];
    if (cities) {
      return cities;
    }
    
    // Fallback for states not in cities data
    return ["Other"];
  };

  const handleStateChange = (newState: string) => {
    onStateChange?.(newState);
    // Reset city when state changes
    onCityChange?.("");
  };

  const handleCityChange = (newCity: string) => {
    onCityChange?.(newCity);
  };

  const availableStates = INDIAN_STATES;
  const availableCities = state ? getCitiesForIndianState(state) : [];

  return (
    <div className={`space-y-4 ${className || ""}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* State - First */}
        <div className="space-y-2">
          <Label>State/Union Territory *</Label>
          <Select 
            key={`state-${availableStates.length}`}
            value={state || ""} 
            onValueChange={handleStateChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              {availableStates.map((stateName) => (
                <SelectItem key={stateName} value={stateName}>
                  {stateName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* City - Second */}
        <div className="space-y-2">
          <Label>City</Label>
          <Select 
            value={city || ""} 
            onValueChange={handleCityChange}
            disabled={!state || availableCities.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder={!state ? "Select state first" : "Select city"} />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              {availableCities.map((cityName) => (
                <SelectItem key={cityName} value={cityName}>
                  {cityName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

interface LocationInputProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function LocationInput({ value, onChange, className }: LocationInputProps) {
  // Parse existing address into components - expects State, City format for India
  const parseAddress = (address: string) => {
    if (!address) return { city: "", state: "" };
    
    const parts = address.split(", ");
    
    // Handle different formats for backward compatibility
    if (parts.length === 3) {
      // Old format: City, State, Country
      const possibleCountry = parts[2];
      if (possibleCountry === "India") {
        return {
          state: parts[1] || "",
          city: parts[0] || ""
        };
      }
    }
    
    // New format: State, City (India is implicit)
    return {
      state: parts[0] || "",
      city: parts[1] || ""
    };
  };

  const initialState = parseAddress(value || "");
  const [selectedState, setSelectedState] = useState(initialState.state);
  const [selectedCity, setSelectedCity] = useState(initialState.city);

  // Update internal state when external value changes
  useEffect(() => {
    const parsed = parseAddress(value || "");
    setSelectedState(parsed.state);
    setSelectedCity(parsed.city);
  }, [value]);

  const updateAddress = (newState: string, newCity: string) => {
    const addressParts = [newState, newCity].filter(Boolean);
    const newAddress = addressParts.join(", ");
    onChange?.(newAddress);
  };

  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
    setSelectedCity(""); // Reset city when state changes
    updateAddress(newState, "");
  };

  const handleCityChange = (newCity: string) => {
    setSelectedCity(newCity);
    updateAddress(selectedState, newCity);
  };

  return (
    <LocationSelector
      city={selectedCity}
      state={selectedState}
      country="India"
      onCountryChange={undefined}
      onStateChange={handleStateChange}
      onCityChange={handleCityChange}
      className={className}
    />
  );
}