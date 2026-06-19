export const mockWeeklyData = [
  { day: "Mon", emissions: 12.4, target: 10 },
  { day: "Tue", emissions: 9.8, target: 10 },
  { day: "Wed", emissions: 11.2, target: 10 },
  { day: "Thu", emissions: 8.5, target: 10 },
  { day: "Fri", emissions: 13.1, target: 10 },
  { day: "Sat", emissions: 7.2, target: 10 },
  { day: "Sun", emissions: 6.8, target: 10 },
];

export const mockMonthlyData = [
  { month: "Jan", emissions: 285, savings: 40 },
  { month: "Feb", emissions: 260, savings: 55 },
  { month: "Mar", emissions: 310, savings: 35 },
  { month: "Apr", emissions: 240, savings: 80 },
  { month: "May", emissions: 220, savings: 95 },
  { month: "Jun", emissions: 195, savings: 115 },
  { month: "Jul", emissions: 175, savings: 130 },
  { month: "Aug", emissions: 185, savings: 120 },
  { month: "Sep", emissions: 165, savings: 145 },
  { month: "Oct", emissions: 155, savings: 150 },
  { month: "Nov", emissions: 170, savings: 140 },
  { month: "Dec", emissions: 180, savings: 130 },
];

export const mockCategoryData = [
  { name: "Transport", value: 35, color: "#22c55e" },
  { name: "Food", value: 28, color: "#10b981" },
  { name: "Energy", value: 20, color: "#6366f1" },
  { name: "Shopping", value: 12, color: "#f59e0b" },
  { name: "Waste", value: 5, color: "#ef4444" },
];

export const mockLeaderboard = [
  { rank: 1, name: "Aisha Sharma", avatar: "AS", score: 94, saved: 248, points: 4820 },
  { rank: 2, name: "Carlos M.", avatar: "CM", score: 91, saved: 231, points: 4510 },
  { rank: 3, name: "Emma Liu", avatar: "EL", score: 88, saved: 215, points: 4230 },
  { rank: 4, name: "David K.", avatar: "DK", score: 85, saved: 198, points: 3960 },
  { rank: 5, name: "Priya R.", avatar: "PR", score: 82, saved: 184, points: 3720 },
  { rank: 6, name: "Noah B.", avatar: "NB", score: 79, saved: 172, points: 3450 },
  { rank: 7, name: "Sofia T.", avatar: "ST", score: 76, saved: 165, points: 3180 },
  { rank: 8, name: "Liam Chen", avatar: "LC", score: 73, saved: 151, points: 2940 },
];

export const mockChallenges = [
  {
    id: 1,
    title: "No Car Day",
    description: "Avoid using personal vehicles for an entire day",
    points: 150,
    duration: "1 day",
    category: "Transport",
    difficulty: "Easy",
    icon: "🚗",
    progress: 0,
    completed: false,
  },
  {
    id: 2,
    title: "Plastic-Free Week",
    description: "Go plastic-free for 7 days with reusable alternatives",
    points: 500,
    duration: "7 days",
    category: "Waste",
    difficulty: "Hard",
    icon: "♻️",
    progress: 60,
    completed: false,
  },
  {
    id: 3,
    title: "Vegetarian Weekend",
    description: "Switch to plant-based meals for the weekend",
    points: 200,
    duration: "2 days",
    category: "Food",
    difficulty: "Medium",
    icon: "🥦",
    progress: 100,
    completed: true,
  },
  {
    id: 4,
    title: "Save 10 kWh",
    description: "Reduce electricity consumption by 10 kWh this week",
    points: 300,
    duration: "7 days",
    category: "Energy",
    difficulty: "Medium",
    icon: "⚡",
    progress: 40,
    completed: false,
  },
  {
    id: 5,
    title: "Walk 20 km",
    description: "Walk or cycle 20 km total this week",
    points: 250,
    duration: "7 days",
    category: "Transport",
    difficulty: "Medium",
    icon: "🚶",
    progress: 75,
    completed: false,
  },
];

export const mockHabits = [
  { id: 1, label: "Used bicycle or walked", icon: "🚲", points: 20, completed: false },
  { id: 2, label: "Used reusable bottle", icon: "🍶", points: 10, completed: true },
  { id: 3, label: "Avoided single-use plastic", icon: "🚫", points: 15, completed: false },
  { id: 4, label: "Took public transport", icon: "🚌", points: 25, completed: true },
  { id: 5, label: "Planted a tree/plant", icon: "🌱", points: 50, completed: false },
  { id: 6, label: "Switched off unused appliances", icon: "💡", points: 10, completed: true },
  { id: 7, label: "Walked instead of driving", icon: "🚶", points: 20, completed: false },
  { id: 8, label: "Composted food waste", icon: "🌿", points: 15, completed: false },
];

export const mockAIInsights = [
  {
    id: 1,
    type: "suggestion",
    icon: "🚲",
    title: "Switch to cycling twice a week",
    description: "Replacing car trips with cycling 2x/week could save 48 kg CO₂ monthly",
    impact: "High",
    saving: "48 kg/month",
  },
  {
    id: 2,
    type: "tip",
    icon: "❄️",
    title: "Reduce AC usage by 1 hour/day",
    description: "Setting AC 2°C higher saves 8% energy and reduces 12 kg CO₂ monthly",
    impact: "Medium",
    saving: "12 kg/month",
  },
  {
    id: 3,
    type: "suggestion",
    icon: "🥗",
    title: "Replace 2 meat meals with vegetarian",
    description: "Plant-based meals emit 50-75% less CO₂ than meat dishes",
    impact: "High",
    saving: "30 kg/month",
  },
  {
    id: 4,
    type: "tip",
    icon: "🚌",
    title: "Use public transport for office commute",
    description: "Buses emit 68% less CO₂ per passenger than solo car rides",
    impact: "Very High",
    saving: "65 kg/month",
  },
];

export const mockUserProfile = {
  name: "Alex Green",
  avatar: "AG",
  carbonScore: 72,
  ecoPoints: 3240,
  level: "Green Warrior",
  levelIcon: "🌿",
  streak: 14,
  totalSaved: 186,
  achievements: [
    { id: 1, title: "First Step", icon: "👣", unlocked: true },
    { id: 2, title: "Week Warrior", icon: "⚔️", unlocked: true },
    { id: 3, title: "Eco Cyclist", icon: "🚲", unlocked: true },
    { id: 4, title: "Plant Guardian", icon: "🌿", unlocked: true },
    { id: 5, title: "Carbon Saver", icon: "💚", unlocked: false },
    { id: 6, title: "Climate Hero", icon: "🏆", unlocked: false },
  ],
  completedChallenges: 8,
  joinDate: "2024-01-15",
};

export const mockStats = {
  co2Saved: 847200,
  treesEquivalent: 42360,
  communityMembers: 127840,
  sustainableActions: 2847000,
};

export const mockNotifications = [
  { id: 1, message: "Try walking today - it's a sunny day! 🌞", time: "2 min ago", type: "reminder" },
  { id: 2, message: "You've reduced emissions by 8% this week! 🎉", time: "1 hr ago", type: "achievement" },
  { id: 3, message: "Complete today's eco challenge for 150 points", time: "3 hr ago", type: "challenge" },
  { id: 4, message: "Your Plastic-Free Week challenge is 60% done", time: "Yesterday", type: "progress" },
];

export const mockChatResponses: Record<string, string> = {
  default: "I'm your AI Sustainability Coach! Ask me anything about reducing your carbon footprint, eco-friendly habits, or climate action. 🌱",
  emissions: "Here are key ways to reduce emissions:\n\n🚌 **Transport**: Use public transit, cycle, or walk. Electric vehicles are great too!\n\n🥗 **Food**: Eat more plant-based foods. A vegetarian diet produces 50% less CO₂.\n\n💡 **Energy**: Switch to LED lights, unplug devices when not in use, and use renewable energy.\n\n♻️ **Waste**: Reduce, reuse, recycle. Composting can cut household waste by 30%.",
  cycling: "Cycling vs Metro comparison:\n\n🚲 **Cycling**: 0g CO₂ per km (zero emissions!)\n🚇 **Metro**: ~14g CO₂ per km\n🚗 **Car (petrol)**: ~120g CO₂ per km\n\nCycling is the clear winner environmentally! For a 10km commute, cycling saves ~1.2kg CO₂ vs driving daily.",
  flight: "Flight emissions vary by distance:\n\n✈️ **Short-haul (<1500km)**: ~255g CO₂/km per passenger\n✈️ **Long-haul**: ~195g CO₂/km per passenger\n\nA London-New York flight emits ~986kg CO₂ per person. Consider:\n- Video calls instead of business travel\n- Train travel for shorter distances\n- Carbon offsetting if flying is necessary",
  shopping: "Sustainable shopping tips:\n\n🛒 **Buy less, buy better**: Choose quality items that last longer\n👕 **Second-hand**: Thrift stores reduce textile waste by 30%\n📦 **Minimal packaging**: Choose products with less plastic packaging\n🌱 **Eco certifications**: Look for Fair Trade, organic, or B Corp labels\n🏪 **Shop local**: Reduces transport emissions by up to 70%",
};
