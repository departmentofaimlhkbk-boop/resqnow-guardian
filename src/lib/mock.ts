export type Contact = {
  id: string;
  name: string;
  phone: string;
  relation: string;
  color: string;
};

export const CONTACTS: Contact[] = [
  { id: "c1", name: "Mom", phone: "+91 98450 11223", relation: "Family", color: "#FF3B30" },
  { id: "c2", name: "Dad", phone: "+91 98450 44556", relation: "Family", color: "#1677FF" },
  { id: "c3", name: "Rohan", phone: "+91 99001 77234", relation: "Brother", color: "#16C784" },
  { id: "c4", name: "Sister", phone: "+91 90080 23145", relation: "Family", color: "#FF9800" },
  { id: "c5", name: "Best Friend", phone: "+91 97400 88213", relation: "Friend", color: "#2196F3" },
  { id: "c6", name: "Dr. Mehta", phone: "+91 96320 45009", relation: "Doctor", color: "#16C784" },
  { id: "c7", name: "Neighbour", phone: "+91 91080 90011", relation: "Neighbour", color: "#1677FF" },
];

export const PERMISSIONS = [
  {
    id: "location",
    title: "Location Access",
    icon: "MapPin",
    why: "We share your precise location with helpers and hospitals during an emergency.",
  },
  {
    id: "motion",
    title: "Motion Sensors",
    icon: "Activity",
    why: "Accelerometer and gyroscope data lets ResQNow detect sudden impact and free-fall.",
  },
  {
    id: "notifications",
    title: "Notifications",
    icon: "Bell",
    why: "Critical alarms and nearby emergency requests are delivered instantly.",
  },
  {
    id: "calls",
    title: "Phone Calls",
    icon: "PhoneCall",
    why: "ResQNow can place a call to your emergency contacts when you can't.",
  },
  {
    id: "sms",
    title: "SMS",
    icon: "MessageSquare",
    why: "Fallback alerts are sent by SMS when the network is weak.",
  },
  {
    id: "bg-location",
    title: "Background Location",
    icon: "Navigation",
    why: "Detection keeps working while your screen is off or you're driving.",
  },
] as const;

export const VOLUNTEERS = [
  { id: "v1", name: "Rohit Sharma", distance: "0.8 km", rating: 4.9, helps: 32, status: "Available" },
  { id: "v2", name: "Priya Nair", distance: "1.4 km", rating: 4.8, helps: 21, status: "Available" },
  { id: "v3", name: "Imran Q.", distance: "2.1 km", rating: 4.7, helps: 47, status: "On a trip" },
  { id: "v4", name: "Sneha R.", distance: "2.9 km", rating: 5.0, helps: 12, status: "Available" },
];

export const HOSPITALS = [
  { id: "h1", name: "City Care Hospital", distance: "2.7 km", beds: 6, trauma: true },
  { id: "h2", name: "Manipal Multispeciality", distance: "3.9 km", beds: 12, trauma: true },
  { id: "h3", name: "St. Martha's", distance: "4.6 km", beds: 3, trauma: false },
];

export const HISTORY = [
  {
    id: "RQ-2291",
    date: "12 Mar 2026",
    time: "21:42",
    location: "MG Road, Bangalore",
    severity: "High",
    status: "Completed",
    helper: "Rohit Sharma",
    hospital: "City Care Hospital",
  },
  {
    id: "RQ-2118",
    date: "02 Feb 2026",
    time: "08:15",
    location: "Indiranagar 100ft Rd",
    severity: "Low",
    status: "Cancelled",
    helper: "—",
    hospital: "—",
  },
  {
    id: "RQ-1984",
    date: "19 Jan 2026",
    time: "18:03",
    location: "Koramangala 5th Blk",
    severity: "Medium",
    status: "Emergency",
    helper: "Priya Nair",
    hospital: "Manipal Multispeciality",
  },
];

export const USER = {
  name: "Arjun",
  fullName: "Arjun Menon",
  phone: "+91 98860 45120",
  location: "MG Road, Bangalore",
  blood: "O+",
  allergies: "Penicillin",
  conditions: "None",
};
