"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from 'chart.js';
import { DashboardStats, Appointment, Assessment } from '../types/dashboard-types';
import Header from '../components/dashboard/Header';
import OverviewTab from '../components/dashboard/OverviewTab';
import AppointmentsTab from '../components/dashboard/AppointmentsTab';
import PatientsTab from '../components/dashboard/PatientsTab';
import AssessmentsTab from '../components/dashboard/AssessmentsTab';

// Check if Chart is already registered to avoid re-registration errors
if (!('_initialized' in ChartJS)) {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement  // This is critical for Pie charts
  );
  
  // Mark as initialized to prevent duplicate registration
  Object.defineProperty(ChartJS, '_initialized', {
    configurable: true,
    value: true
  });
}

export default function Dashboard() {
  const { status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [recentAssessments, setRecentAssessments] = useState<Assessment[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Handle data reload
  const [reload, setReload] = useState(0);
  const reloadData = () => setReload(prev => prev + 1);

  useEffect(() => {
    if (status === "loading") return;
    
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    
    // Clear previous errors
    setError(null);
    
    // Fetch dashboard data
    const fetchDashboardData = async () => {
      setLoading(true);
      
      try {
        // Use Promise.all to fetch data in parallel
        const [statsRes, appointmentsRes, assessmentsRes] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/dashboard/appointments'),
          fetch('/api/dashboard/assessments')
        ]);
        
        // Check for errors in responses
        if (!statsRes.ok) {
          const errorData = await statsRes.json();
          throw new Error(errorData.error || "Failed to fetch dashboard statistics");
        }
        
        if (!appointmentsRes.ok) {
          const errorData = await appointmentsRes.json();
          throw new Error(errorData.error || "Failed to fetch appointments");
        }
        
        if (!assessmentsRes.ok) {
          const errorData = await assessmentsRes.json();
          throw new Error(errorData.error || "Failed to fetch assessments");
        }
        
        // Parse JSON responses
        const statsData = await statsRes.json();
        const appointmentsData = await appointmentsRes.json();
        const assessmentsData = await assessmentsRes.json();
        
        console.log("Stats data:", statsData);
        console.log("Appointments data:", appointmentsData);
        console.log("Assessments data:", assessmentsData);
        
        // Set state with fetched data
        setStats(statsData);
        setUpcomingAppointments(appointmentsData.appointments || []);
        setRecentAssessments(assessmentsData.assessments || []);
      } catch (error: any) {
        console.error("Error fetching dashboard data:", error);
        setError(error.message || "There was a problem loading your dashboard data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [status, router, reload]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Error message if something went wrong */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9v4a1 1 0 102 0v-4a1 1 0 10-2 0zm0-4a1 1 0 112 0 1 1 0 01-2 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={reloadData}
                  className="mt-2 text-sm text-red-700 underline hover:text-red-600"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <OverviewTab 
            stats={stats}
            upcomingAppointments={upcomingAppointments}
            recentAssessments={recentAssessments}
          />
        )}

        {activeTab === 'appointments' && (
          <AppointmentsTab initialAppointments={upcomingAppointments} />
        )}
        
        {activeTab === 'patients' && (
          <PatientsTab stats={stats} />
        )}
        
        {activeTab === 'assessments' && (
          <AssessmentsTab stats={stats} />
        )}
      </main>
    </div>
  );
}