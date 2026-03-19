// Indian States and Cities data for Address Book

export const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Chandigarh",
];

export const citiesByState: Record<string, string[]> = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Tirupati", "Rajahmundry", "Kakinada"],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Tawang", "Pasighat", "Ziro"],
  "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga", "Purnia", "Bihar Sharif"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Rajnandgaon"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar", "Junagadh"],
  "Haryana": ["Gurgaon", "Faridabad", "Panipat", "Ambala", "Karnal", "Hisar", "Rohtak", "Sonipat"],
  "Himachal Pradesh": ["Shimla", "Dharamshala", "Manali", "Solan", "Mandi", "Kullu", "Kangra"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh", "Deoghar"],
  "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum", "Gulbarga", "Davangere", "Shimoga"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Palakkad", "Alappuzha", "Kannur"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", "Satna"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Kolhapur", "Navi Mumbai", "Kalyan"],
  "Manipur": ["Imphal", "Thoubal", "Bishnupur", "Churachandpur"],
  "Meghalaya": ["Shillong", "Tura", "Jowai", "Nongstoin"],
  "Mizoram": ["Aizawl", "Lunglei", "Champhai", "Serchhip"],
  "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Tuensang"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Pathankot"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner", "Ajmer", "Bhilwara", "Alwar"],
  "Sikkim": ["Gangtok", "Namchi", "Gyalshing", "Mangan"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Tiruppur", "Vellore"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Secunderabad"],
  "Tripura": ["Agartala", "Udaipur", "Dharmanagar", "Kailashahar"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra", "Meerut", "Allahabad", "Ghaziabad", "Noida", "Bareilly", "Aligarh"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Rishikesh", "Nainital", "Haldwani", "Roorkee", "Mussoorie"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Siliguri", "Asansol", "Bardhaman", "Kharagpur"],
  "Delhi": ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi", "Central Delhi", "Dwarka", "Rohini"],
  "Chandigarh": ["Chandigarh"],
};

// Basic pincode validation by state prefix
export const pincodeRangesByState: Record<string, { min: number; max: number }> = {
  "Maharashtra": { min: 400000, max: 445999 },
  "Delhi": { min: 110001, max: 110099 },
  "Karnataka": { min: 560000, max: 591999 },
  "Tamil Nadu": { min: 600000, max: 643999 },
  "Telangana": { min: 500000, max: 509999 },
  "Gujarat": { min: 360000, max: 396999 },
  "Rajasthan": { min: 301000, max: 345999 },
  "Uttar Pradesh": { min: 201000, max: 285999 },
  "West Bengal": { min: 700000, max: 743999 },
  "Kerala": { min: 670000, max: 695999 },
  "Punjab": { min: 140000, max: 160999 },
  "Haryana": { min: 121000, max: 136999 },
  "Bihar": { min: 800000, max: 855999 },
  "Madhya Pradesh": { min: 450000, max: 488999 },
  "Odisha": { min: 751000, max: 770999 },
};

export const validatePincode = (pincode: string, state?: string): { valid: boolean; message?: string } => {
  const pin = parseInt(pincode, 10);
  
  if (!/^\d{6}$/.test(pincode)) {
    return { valid: false, message: "Pincode must be 6 digits" };
  }
  
  if (pin < 100000 || pin > 999999) {
    return { valid: false, message: "Invalid pincode range" };
  }
  
  if (state && pincodeRangesByState[state]) {
    const range = pincodeRangesByState[state];
    if (pin < range.min || pin > range.max) {
      return { valid: false, message: `Pincode doesn't match ${state}` };
    }
  }
  
  return { valid: true };
};