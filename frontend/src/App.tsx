import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import axios from 'axios';
import { 
  Stethoscope, Shield, Brain, Activity, AlertTriangle, CheckCircle, XCircle, Info,
  History, Home, BookOpen, Settings, Heart, Zap, Plus, Calendar, Thermometer,
  Droplets, Activity as ActivityIcon, TrendingUp, Clock, Star, ExternalLink,
  Phone, MapPin, AlertCircle, ChevronRight, User, Bell, Palette, Database
} from 'lucide-react';
import HealthDisclaimer from './components/HealthDisclaimer';
import AnimatedCard from './components/AnimatedCard';
import LoadingSpinner from './components/LoadingSpinner';
import FloatingActionButton from './components/FloatingActionButton';
import ThemeToggle from './components/ThemeToggle';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000/api'

type TabType = 'dashboard' | 'symptoms' | 'misinfo' | 'resources' | 'history' | 'emergency' | 'settings'

export default function App() {
  const [tab, setTab] = useState<TabType>('dashboard')
  const [preferModel, setPreferModel] = useState<boolean>(true)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 text-gray-900 dark:text-gray-100">
      <Toaster position="top-right" />
      
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 via-transparent to-purple-100/20 dark:from-blue-900/10 dark:to-purple-900/10" />
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-xl"
          animate={{ x: [0, 100, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-40 h-40 bg-purple-200/30 dark:bg-purple-900/20 rounded-full blur-xl"
          animate={{ x: [0, -80, 0], y: [0, 60, 0], scale: [1, 0.8, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.header 
        className="border-b border-white/20 bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl sticky top-0 z-40 shadow-lg"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <motion.div className="flex items-center space-x-3" whileHover={{ scale: 1.05 }}>
              <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                <Stethoscope className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </motion.div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                MedLens AI
              </h1>
            </motion.div>

            <div className="flex items-center gap-2 sm:gap-3">
              <nav className="flex flex-wrap gap-1 sm:gap-2">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: Home },
                  { id: 'symptoms', label: 'Symptoms', icon: Activity },
                  { id: 'misinfo', label: 'Misinfo', icon: Shield },
                  { id: 'resources', label: 'Resources', icon: BookOpen },
                  { id: 'history', label: 'History', icon: History },
                  { id: 'emergency', label: 'Emergency', icon: Zap },
                  { id: 'settings', label: 'Settings', icon: Settings }
                ].map(({ id, label, icon: Icon }) => (
                  <motion.button 
                    key={id}
                    className={`px-2 sm:px-3 py-2 rounded-lg font-medium transition-all duration-300 text-xs sm:text-sm ${
                      tab === id 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl' 
                        : 'bg-white/20 dark:bg-gray-800/30 backdrop-blur-md text-gray-800 dark:text-gray-100 hover:bg-white/30 dark:hover:bg-gray-800/40 border border-white/20'
                    }`}
                    onClick={() => setTab(id as TabType)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                    <span className="hidden sm:inline">{label}</span>
                  </motion.button>
                ))}
              </nav>
              <div className="ml-2"><ThemeToggle /></div>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <AnimatePresence mode="wait">
          <motion.div 
            key={tab} 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }} 
            transition={{ duration: 0.3 }}
            className="min-h-[60vh]"
          >
            {tab === 'dashboard' && <Dashboard />}
            {tab === 'symptoms' && <SymptomChecker preferModel={preferModel} />}
            {tab === 'misinfo' && <MisinformationFilter />}
            {tab === 'resources' && <MedicalResources />}
            {tab === 'history' && <HealthHistory />}
            {tab === 'emergency' && <EmergencyGuide />}
            {tab === 'settings' && <AppSettings preferModel={preferModel} setPreferModel={setPreferModel} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <motion.footer 
        className="mt-10 border-t border-white/10 bg-white/20 dark:bg-gray-900/20 backdrop-blur-xl shadow-inner" 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 0.2 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <div className="font-semibold mb-2">MedLens AI</div>
            <p className="text-gray-700 dark:text-gray-300">AI-assisted symptom checking and misinformation detection (India-first).</p>
          </div>
          <div>
            <div className="font-semibold mb-2">Resources</div>
            <ul className="space-y-1 text-blue-700 dark:text-blue-400">
              <li><a href="https://www.mohfw.gov.in" target="_blank" rel="noreferrer">MoHFW</a></li>
              <li><a href="https://www.icmr.gov.in" target="_blank" rel="noreferrer">ICMR</a></li>
              <li><a href="https://www.nhp.gov.in" target="_blank" rel="noreferrer">NHP</a></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-2">Emergency</div>
            <p className="text-gray-700 dark:text-gray-300">Call 112 (all-in-one) or 108 (ambulance).</p>
          </div>
          <div className="md:col-span-3"><HealthDisclaimer /></div>
        </div>
      </motion.footer>

      <FloatingActionButton icon={Brain} onClick={() => toast.success('AI Assistant activated!')} tooltip="AI Assistant" />
    </div>
  )
}

// Dashboard Component
const Dashboard = () => {
  const [stats, setStats] = useState({
    symptomsChecked: 24,
    articlesScanned: 156,
    accuracyRate: 94.2,
    timeSaved: '2.3h'
  });
  const [patterns, setPatterns] = useState<any[]>([])
  const [loadingPatterns, setLoadingPatterns] = useState(false)

  const quickActions = [
    { icon: Stethoscope, title: 'Check Symptoms', desc: 'Analyze your symptoms', color: 'bg-blue-500' },
    { icon: Shield, title: 'Scan Article', desc: 'Verify medical claims', color: 'bg-green-500' },
    { icon: History, title: 'View History', desc: 'Your health timeline', color: 'bg-purple-500' },
    { icon: BookOpen, title: 'Resources', desc: 'Trusted medical sources', color: 'bg-orange-500' }
  ];

  const loadPatterns = async () => {
    setLoadingPatterns(true)
    try{
      const res = await axios.get(`${API_BASE}/symptom-patterns?n_clusters=3&limit=200`)
      setPatterns(res.data)
    }catch(e:any){
      setPatterns([])
    }finally{
      setLoadingPatterns(false)
    }
  }

  useEffect(()=>{ loadPatterns() },[])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Welcome Section */}
      <AnimatedCard className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Welcome back! 👋</h2>
            <p className="text-blue-100">Your AI health assistant is ready to help</p>
          </div>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Heart className="w-12 h-12 text-red-200" />
          </motion.div>
        </div>
      </AnimatedCard>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(stats).map(([key, value]) => (
          <AnimatedCard key={key} className="text-center">
            <div className="text-2xl font-bold text-blue-600">{value}</div>
            <div className="text-sm text-gray-600 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </div>
          </AnimatedCard>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatedCard className="cursor-pointer hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${action.color} text-white`}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold">{action.title}</div>
                    <div className="text-sm text-gray-600">{action.desc}</div>
                  </div>
                </div>
              </AnimatedCard>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Top Patterns */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Top Symptom Patterns
        </h3>
        <AnimatedCard title="Recent Clusters" delay={0.1}>
          {loadingPatterns ? (
            <LoadingSpinner text="Finding patterns..." />
          ) : patterns.length === 0 ? (
            <div className="text-sm text-gray-600">Not enough data yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {patterns.map((c:any)=> (
                <div key={c.label} className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
                  <div className="text-sm font-semibold mb-1">Cluster #{c.label}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-300 mb-2">Count: {c.count}</div>
                  <div className="flex flex-wrap gap-1">
                    {c.terms.map((t:string)=> (
                      <span key={t} className="px-2 py-1 rounded bg-white/70 dark:bg-gray-800/60 text-xs">{t}</span>
                    ))}
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center gap-1 mb-1">
                      <div className="text-xs text-gray-600 dark:text-gray-300">Size:</div>
                      <div className="text-xs font-medium">{c.count}</div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                        style={{ 
                          width: `${Math.min(100, (c.count / Math.max(...patterns.map((p:any) => p.count))) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </AnimatedCard>
      </div>

      {/* Recent Activity */}
      <RecentActivity />
    </motion.div>
  );
};

// Medical Resources Component
const MedicalResources = () => {
  const resources = [
    { name: 'MoHFW, Government of India', description: 'Official health advisories and resources for India', url: 'https://www.mohfw.gov.in', category: 'Government', rating: 4.9 },
    { name: 'ICMR', description: 'Indian Council of Medical Research: guidelines and studies', url: 'https://www.icmr.gov.in', category: 'Government', rating: 4.8 },
    { name: 'NHP India', description: 'National Health Portal: citizen-centric health information', url: 'https://www.nhp.gov.in', category: 'Government', rating: 4.7 },
    { name: 'AIIMS', description: 'All India Institute of Medical Sciences', url: 'https://www.aiims.edu', category: 'Hospital', rating: 4.8 },
    { name: 'WHO India', description: 'WHO information and updates for India', url: 'https://www.who.int/india', category: 'International', rating: 4.7 },
    { name: 'PIB Health', description: 'Press Information Bureau health releases', url: 'https://pib.gov.in/PressReleaseIframePage.aspx?MinID=29', category: 'Government', rating: 4.5 }
  ];

  const categories = ['All', 'Hospital', 'Government', 'Health Portal', 'International'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <AnimatedCard className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">Medical Resources</h2>
            <p className="text-green-100">Trusted sources for health information</p>
          </div>
        </div>
      </AnimatedCard>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <motion.button
            key={category}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
          >
            {category}
          </motion.button>
        ))}
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource, index) => (
          <motion.div
            key={resource.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <AnimatedCard className="h-full">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-500">{resource.category}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{resource.rating}</span>
                </div>
              </div>
              
              <h3 className="font-semibold text-lg mb-2">{resource.name}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                {resource.description}
              </p>
              
              <motion.a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                Visit Site
                <ExternalLink className="w-4 h-4" />
              </motion.a>
            </AnimatedCard>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// Health History Component
const HealthHistory = () => {
  const [symptoms, setSymptoms] = useState([
    {
      id: 1,
      symptom: 'Headache',
      severity: 'Mild',
      date: '2024-01-15',
      duration: '2 hours',
      notes: 'Stress-related, improved with rest'
    },
    {
      id: 2,
      symptom: 'Fever',
      severity: 'Moderate',
      date: '2024-01-10',
      duration: '3 days',
      notes: 'Accompanied by fatigue, resolved with medication'
    },
    {
      id: 3,
      symptom: 'Cough',
      severity: 'Mild',
      date: '2024-01-05',
      duration: '1 week',
      notes: 'Dry cough, improved with hydration'
    }
  ]);

  const severityColors = {
    'Mild': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    'Moderate': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    'Severe': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <AnimatedCard className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="flex items-center gap-3">
          <History className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">Health History</h2>
            <p className="text-purple-100">Track your symptoms and health journey</p>
          </div>
        </div>
      </AnimatedCard>

      {/* Add New Entry */}
      <AnimatedCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Add New Symptom</h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Entry
          </motion.button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Symptom"
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option>Severity</option>
            <option>Mild</option>
            <option>Moderate</option>
            <option>Severe</option>
          </select>
          <input
            type="date"
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Duration"
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </AnimatedCard>

      {/* Symptoms Timeline */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Recent Symptoms
        </h3>
        
        <div className="space-y-4">
          {symptoms.map((symptom) => (
            <motion.div
              key={symptom.id}
              whileHover={{ scale: 1.02 }}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <h4 className="font-semibold">{symptom.symptom}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${severityColors[symptom.severity]}`}>
                    {symptom.severity}
                  </span>
                </div>
                <div className="text-sm text-gray-500">{symptom.date}</div>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {symptom.duration}
                </div>
                <div className="flex items-center gap-1">
                  <Info className="w-4 h-4" />
                  {symptom.notes}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// Emergency Guide Component
function EmergencyGuide() {
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [nearbyHospitals, setNearbyHospitals] = useState<any[]>([])
  const [loadingHospitals, setLoadingHospitals] = useState(false)

  const emergencySituations = [
    {
      title: 'Chest Pain',
      description: 'Could indicate heart attack',
      action: 'Call India emergency number 112 (or 108 for ambulance) immediately',
      icon: Heart,
      severity: 'Critical',
      color: 'border-red-500',
      iconBg: 'bg-red-500'
    },
    {
      title: 'Difficulty Breathing',
      description: 'Severe shortness of breath',
      action: 'Seek immediate medical attention',
      icon: Activity,
      severity: 'Critical',
      color: 'border-red-500',
      iconBg: 'bg-red-500'
    },
    {
      title: 'Severe Bleeding',
      description: 'Uncontrolled bleeding',
      action: 'Apply pressure and call 112 / 108',
      icon: Droplets,
      severity: 'Critical',
      color: 'border-red-500',
      iconBg: 'bg-red-500'
    },
    {
      title: 'High Fever',
      description: 'Temperature above 103°F (39.4°C)',
      action: 'Contact healthcare provider',
      icon: Thermometer,
      severity: 'Urgent',
      color: 'border-orange-500',
      iconBg: 'bg-orange-500'
    },
    {
      title: 'Severe Headache',
      description: 'Worst headache of your life',
      action: 'Seek medical attention',
      icon: AlertTriangle,
      severity: 'Urgent',
      color: 'border-orange-500',
      iconBg: 'bg-orange-500'
    },
    {
      title: 'Loss of Consciousness',
      description: 'Fainting or blacking out',
      action: 'Call 112 / 108 immediately',
      icon: AlertCircle,
      severity: 'Critical',
      color: 'border-red-500',
      iconBg: 'bg-red-500'
    }
  ]

  const emergencyContacts = [
    {
      name: 'Emergency (All-in-one)',
      number: '112',
      description: 'National emergency number',
      icon: Phone,
      color: 'bg-red-500'
    },
    {
      name: 'Ambulance',
      number: '108',
      description: 'Emergency medical services',
      icon: Phone,
      color: 'bg-orange-500'
    },
    {
      name: 'Police',
      number: '100',
      description: 'Law enforcement',
      icon: Phone,
      color: 'bg-blue-500'
    }
  ]

  const firstAidTips = [
    {
      title: 'CPR Basics',
      description: '30 chest compressions followed by 2 rescue breaths. Continue until help arrives.'
    },
    {
      title: 'Bleeding Control',
      description: 'Apply direct pressure with clean cloth. Elevate if possible. Call emergency services.'
    },
    {
      title: 'Choking',
      description: 'Perform abdominal thrusts (Heimlich maneuver). Call emergency if not resolved.'
    },
    {
      title: 'Burn Care',
      description: 'Cool with running water for 10-20 minutes. Do not apply ice or ointments.'
    }
  ]

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          findNearbyHospitals(position.coords.latitude, position.coords.longitude)
        },
        (error) => {
          toast.error('Unable to get location. Please enable location access.')
        }
      )
    } else {
      toast.error('Geolocation is not supported by this browser.')
    }
  }

  const findNearbyHospitals = async (lat: number, lng: number) => {
    setLoadingHospitals(true)
    try {
      // Using OpenStreetMap Nominatim API for hospital search
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=hospital&format=json&lat=${lat}&lon=${lng}&radius=5000&limit=10`
      )
      const data = await response.json()
      setNearbyHospitals(data.map((hospital: any) => ({
        name: hospital.display_name.split(',')[0],
        address: hospital.display_name,
        distance: calculateDistance(lat, lng, parseFloat(hospital.lat), parseFloat(hospital.lon)),
        lat: parseFloat(hospital.lat),
        lng: parseFloat(hospital.lon)
      })).sort((a: any, b: any) => a.distance - b.distance))
    } catch (error) {
      toast.error('Unable to find nearby hospitals.')
    } finally {
      setLoadingHospitals(false)
    }
  }

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return Math.round(R * c * 10) / 10 // Round to 1 decimal place
  }

  const openInMaps = (lat: number, lng: number, name: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`
    window.open(url, '_blank')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <AnimatedCard className="bg-gradient-to-r from-red-600 to-orange-600 text-white">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">Emergency Guide</h2>
            <p className="text-red-100">Quick reference for urgent medical situations</p>
          </div>
        </div>
      </AnimatedCard>

      {/* Emergency Contacts */}
      <AnimatedCard>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Phone className="w-5 h-5" />
          Emergency Contacts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <Phone className="w-5 h-5 text-red-600" />
            <div>
              <div className="font-semibold">Emergency Services (India)</div>
              <div className="text-sm text-gray-600">Dial 112 (all-in-one) or 108 (ambulance)</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <MapPin className="w-5 h-5 text-blue-600" />
            <div>
              <div className="font-semibold">Nearest Hospital</div>
              <div className="text-sm text-gray-600">Find nearby facilities</div>
            </div>
          </div>
        </div>
      </AnimatedCard>

      {/* Nearest Hospital Section */}
      <AnimatedCard title="🏥 Find Nearest Hospital" delay={0.1}>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <button
              onClick={getCurrentLocation}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <MapPin className="w-4 h-4" />
              {userLocation ? 'Update Location' : 'Find Nearby Hospitals'}
            </button>
            {userLocation && (
              <div className="text-sm text-gray-600 dark:text-gray-300">
                📍 Location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
              </div>
            )}
          </div>

          {loadingHospitals ? (
            <LoadingSpinner text="Finding nearby hospitals..." />
          ) : nearbyHospitals.length > 0 ? (
            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Found {nearbyHospitals.length} hospitals nearby:
              </div>
              {nearbyHospitals.slice(0, 5).map((hospital, index) => (
                <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-gray-100">{hospital.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">{hospital.address}</div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        📍 {hospital.distance} km away
                      </div>
                    </div>
                    <button
                      onClick={() => openInMaps(hospital.lat, hospital.lng, hospital.name)}
                      className="ml-2 px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      Directions
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : userLocation ? (
            <div className="text-sm text-gray-600 dark:text-gray-300">
              No hospitals found nearby. Try expanding your search area.
            </div>
          ) : (
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Click "Find Nearby Hospitals" to locate medical facilities near you.
            </div>
          )}
        </div>
      </AnimatedCard>

      {/* Emergency Situations */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Emergency Situations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {emergencySituations.map((emergency, index) => (
            <motion.div
              key={emergency.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <AnimatedCard className="border-l-4 border-red-500">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${emergency.color} text-white`}>
                    <emergency.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{emergency.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        emergency.severity === 'Critical' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                      }`}>
                        {emergency.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{emergency.description}</p>
                    <div className="flex items-center gap-2 text-sm font-medium text-red-600">
                      <AlertTriangle className="w-4 h-4" />
                      {emergency.action}
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <AnimatedCard className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Important Notice</h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              This guide is for informational purposes only. In case of emergency in India, call 112 (all-in-one) or 108 (ambulance) immediately, or visit the nearest hospital. This tool is not a substitute for professional medical advice.
            </p>
          </div>
        </div>
      </AnimatedCard>
    </motion.div>
  );
};

// Settings Component
function AppSettings({preferModel, setPreferModel}:{preferModel:boolean, setPreferModel:(v:boolean)=>void}){
  const [settings, setSettings] = useState({
    darkMode: true,
    notifications: true,
    autoSave: true,
    language: 'English'
  });

  const [apiKey, setApiKey] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <AnimatedCard className="bg-gradient-to-r from-gray-600 to-gray-800 text-white">
        <div className="flex items-center gap-3">
          <Settings className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">Settings</h2>
            <p className="text-gray-300">Customize your experience</p>
          </div>
        </div>
      </AnimatedCard>

      {/* Appearance Settings */}
      <AnimatedCard>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Appearance
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Dark Mode</div>
              <div className="text-sm text-gray-600">Toggle dark/light theme</div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </AnimatedCard>

      {/* AI Configuration */}
      <AnimatedCard>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Database className="w-5 h-5" />
          AI Configuration
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Prefer Model-based Extraction</label>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Prefer Model-based Extraction</div>
                <div className="text-sm text-gray-600">Use Hugging Face NER if available; otherwise heuristic only.</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={preferModel} onChange={e=>setPreferModel(e.target.checked)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </AnimatedCard>

      {/* Notifications */}
      <AnimatedCard>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notifications
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Push Notifications</div>
              <div className="text-sm text-gray-600">Receive health alerts</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={settings.notifications} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </AnimatedCard>

      {/* Data & Privacy */}
      <AnimatedCard>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Data & Privacy
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Auto-save Health Data</div>
              <div className="text-sm text-gray-600">Save your health history locally</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={settings.autoSave} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Export Data</div>
              <div className="text-sm text-gray-600">Download your health history</div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Export
            </motion.button>
          </div>
        </div>
      </AnimatedCard>

      {/* About */}
      <AnimatedCard>
        <h3 className="text-lg font-semibold mb-4">About MedLens AI</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>Version: 1.0.0</p>
          <p>Built with React, FastAPI, and AI</p>
          <p>Your trusted health assistant</p>
        </div>
      </AnimatedCard>
    </motion.div>
  );
};

function SymptomChecker({preferModel}:{preferModel:boolean}) {
  const [text, setText] = useState('I have fever and cough for 2 days')
  const [age, setAge] = useState<string>('')
  const [sex, setSex] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>('')

  const submit = async () => {
    if (!text.trim()) {
      toast.error('Please describe your symptoms')
      return
    }

    setLoading(true)
    setError('')
    try {
      const res = await axios.post(`${API_BASE}/symptom-check?prefer_model=${preferModel}`, { text, age: age ? Number(age) : undefined, sex: sex || undefined })
      setResult(res.data)
      toast.success('Symptoms analyzed successfully!')
    } catch (e: any) {
      const errorMsg = e?.response?.data?.detail || e?.message || 'Request failed'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-4">Symptom Analysis</h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Describe your symptoms in detail and our AI will help identify potential causes and suggest appropriate actions.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <AnimatedCard title="Describe Your Symptoms" delay={0.2} className="w-full">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  What symptoms are you experiencing?
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Describe your symptoms in detail... (e.g., 'I have a fever of 101°F, headache, and fatigue for the past 2 days')"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Age (optional)
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="25"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sex (optional)
                  </label>
                  <select
                    value={sex}
                    onChange={(e) => setSex(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <button
                onClick={submit}
                disabled={!text.trim() || loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                {loading ? <LoadingSpinner /> : <Stethoscope className="w-5 h-5" />}
                {loading ? 'Analyzing...' : 'Check Symptoms'}
              </button>
            </div>
          </AnimatedCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="space-y-4">
                <AnimatedCard title="Extracted Symptoms" delay={0.1}>
                  <div className="space-y-2">
                    {result.extracted_symptoms?.map((s: any, idx: number) => (
                      <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * idx }} className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="font-medium">{s.name}</span>
                        <span className="text-sm text-gray-500">({Math.round(s.confidence * 100)}%)</span>
                      </motion.div>
                    ))}
                  </div>
                </AnimatedCard>
                <AnimatedCard title="Suggested Actions" delay={0.2}>
                  <div className="space-y-2">
                    {result.suggested_actions?.map((a: string, idx: number) => (
                      <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * idx }} className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                        <Info className="w-5 h-5 text-blue-500" />
                        <span>{a}</span>
                      </motion.div>
                    ))}
                  </div>
                </AnimatedCard>
                {result.caution_flags?.length > 0 && (
                  <AnimatedCard title="Important Cautions" delay={0.3}>
                    <div className="space-y-2">
                      {result.caution_flags?.map((c: string, idx: number) => (
                        <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * idx }} className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                          <span className="text-red-700 dark:text-red-300">{c}</span>
                        </motion.div>
                      ))}
                    </div>
                  </AnimatedCard>
                )}
                <div className="flex gap-2 pt-2">
                  <button onClick={()=>sendFeedback('symptom_check','up')} className="px-3 py-2 rounded bg-green-600 text-white text-sm">Helpful</button>
                  <button onClick={()=>sendFeedback('symptom_check','down')} className="px-3 py-2 rounded bg-red-600 text-white text-sm">Not Helpful</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

function MisinformationFilter() {
  const [text, setText] = useState('This detox drink is a miracle cure that instantly fixes all diseases.')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>('')

  const submit = async () => {
    if (!text.trim()) { toast.error('Please enter content to analyze'); return }
    setLoading(true)
    setError('')
    try {
      const res = await axios.post(`${API_BASE}/misinformation-scan`, { text })
      setResult(res.data)
      toast.success('Content analyzed successfully!')
    } catch (e: any) {
      const errorMsg = e?.response?.data?.detail || e?.message || 'Request failed'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-4">Misinformation Detector</h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Paste medical content to check for potential misinformation and get verified sources.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <AnimatedCard title="Content to Analyze" delay={0.2} className="max-w-3xl mx-auto">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Medical Content</label>
                <textarea value={text} onChange={e => setText(e.target.value)} className="w-full h-40 p-4 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none" placeholder="Paste medical content, articles, or claims to analyze..." />
              </div>
              <motion.button onClick={submit} disabled={loading} className="w-full py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-medium hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                {loading ? (<LoadingSpinner size="sm" text="Analyzing content..." />) : (<><Shield className="w-5 h-5 inline mr-2" />Scan for Misinformation</>)}
              </motion.button>
            </div>
          </AnimatedCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="space-y-4">
                {typeof result.high_risk_count === 'number' && (
                  <div className={`p-3 rounded-lg ${result.high_risk_count>0?'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200':'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'}`}>
                    {result.high_risk_count>0 ? `${result.high_risk_count} high-risk claims detected` : 'No high-risk claims detected'}
                  </div>
                )}
                {result.summary && (
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 text-sm">{result.summary}</div>
                )}
                {result.assessments?.map((a: any, idx: number) => (
                  <AnimatedCard key={idx} title={`Risk Level: ${a.risk.toUpperCase()}`} delay={0.1 * idx} className={`${a.risk === 'high' ? 'border-red-200 bg-red-50/50 dark:bg-red-950/40' : ''} ${a.risk === 'medium' ? 'border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/40' : ''} ${a.risk === 'low' ? 'border-green-200 bg-green-50/50 dark:bg-green-950/40' : ''} ${a.risk === 'info' ? 'border-blue-200 bg-blue-50/50 dark:bg-blue-950/40' : ''}`}>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        {a.risk === 'high' && <XCircle className="w-5 h-5 text-red-500 mt-0.5" />}
                        {a.risk === 'medium' && <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />}
                        {a.risk === 'low' && <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />}
                        {a.risk === 'info' && <Info className="w-5 h-5 text-blue-500 mt-0.5" />}
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 dark:text-gray-100 mb-2">{a.claim}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{a.rationale}</p>
                        </div>
                      </div>
                      {a.references?.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Verified Sources:</p>
                          <div className="space-y-1">
                            {a.references?.map((r: string, i: number) => (
                              <motion.a key={i} href={r} target="_blank" rel="noreferrer" className="block text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 underline" whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>{r}</motion.a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button onClick={()=>sendFeedback('misinformation_scan','up')} className="px-3 py-2 rounded bg-green-600 text-white text-sm">Helpful</button>
                      <button onClick={()=>sendFeedback('misinformation_scan','down')} className="px-3 py-2 rounded bg-red-600 text-white text-sm">Not Helpful</button>
                    </div>
                  </AnimatedCard>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

// RecentActivity Component
const RecentActivity = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/logs?limit=6`);
      setItems(res.data);
    } catch (e: any) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs() }, []);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5" />
        Recent Activity
      </h3>
      {loading ? <LoadingSpinner text="Loading..." /> : (
        <div className="space-y-2">
          {items.slice(0, 3).map((it, idx) => (
            <motion.div 
              key={idx} 
              className="p-3 rounded-lg border bg-white/70 dark:bg-gray-800/50" 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.1 * idx }}
            >
              <div className="text-xs text-gray-500 mb-1">
                {new Date(it.created_at || Date.now()).toLocaleString('en-IN')}
              </div>
              <div className="text-sm font-medium">{it.type}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300 truncate">
                {it.result_summary}
              </div>
            </motion.div>
          ))}
          {items.length === 0 && (
            <div className="text-sm text-gray-500 text-center py-4">No recent activity</div>
          )}
        </div>
      )}
    </div>
  );
};

async function sendFeedback(context: string, verdict: 'up'|'down'|'neutral', notes?: string) {
  try {
    await axios.post(`${API_BASE}/feedback`, { context, verdict, notes });
    toast.success('Thanks for the feedback!');
  } catch (e: any) {
    toast.error('Failed to send feedback');
  }
}


