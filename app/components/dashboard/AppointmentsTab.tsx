"use client";

import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { FiCalendar, FiClock, FiSearch, FiPlusCircle } from 'react-icons/fi';
import AddAppointmentModal from '../appointments/AddAppointmentModal';

type Patient = {
  id: string;
  name: string;
  age?: number;
  gender?: string;
};

type Appointment = {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  notes?: string;
  patient: Patient;
};

type AppointmentsTabProps = {
  initialAppointments?: Appointment[];
};

export default function AppointmentsTab({ initialAppointments = [] }: AppointmentsTabProps) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddAppointmentModal, setShowAddAppointmentModal] = useState(false);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('upcoming'); // 'upcoming', 'today', 'all'
  
  // Fetch appointments on component mount
  useEffect(() => {
    fetchAppointments();
  }, []);
  
  // Fetch appointments with filter
  const fetchAppointments = async (filter = 'upcoming') => {
    setIsLoading(true);
    try {
      const queryParams = filter === 'upcoming' ? '?future=true' : '';
      const response = await fetch(`/api/appointments${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      
      const data = await response.json();
      setAppointments(data.appointments || []);
    } catch (err: any) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Apply filters to appointments
  const getFilteredAppointments = () => {
    // First apply the search filter
    let filtered = appointments.filter(appointment => 
      appointment.patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (appointment.notes && appointment.notes.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    // Then apply the time filter
    if (filterType === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      filtered = filtered.filter(appointment => {
        const appointmentDate = new Date(appointment.scheduledAt);
        return appointmentDate >= today && appointmentDate < tomorrow;
      });
    } else if (filterType === 'upcoming') {
      const now = new Date();
      filtered = filtered.filter(appointment => {
        const appointmentDate = new Date(appointment.scheduledAt);
        return appointmentDate >= now;
      });
    }
    
    return filtered;
  };
  
  const filteredAppointments = getFilteredAppointments();
  
  // Handle filter change
  const handleFilterChange = (newFilter: string) => {
    setFilterType(newFilter);
    if (newFilter === 'upcoming') {
      fetchAppointments('upcoming');
    } else {
      fetchAppointments('all');
    }
  };
  
  // Format time as 12-hour format
  const formatTime = (dateString: string) => {
    return format(parseISO(dateString), 'h:mm a');
  };
  
  // Format date as Month Day, Year
  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'MMMM d, yyyy');
  };
  
  return (
    <>
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
            <h2 className="text-lg font-medium text-gray-800 flex items-center">
              <FiCalendar className="mr-2" /> Appointments Management
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search appointments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              <button 
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center"
                onClick={() => setShowAddAppointmentModal(true)}
              >
                <FiPlusCircle className="mr-2" /> New Appointment
              </button>
            </div>
          </div>
          
          {/* Filter tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-6">
                <button
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    filterType === 'upcoming'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => handleFilterChange('upcoming')}
                >
                  Upcoming
                </button>
                <button
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    filterType === 'today'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => handleFilterChange('today')}
                >
                  Today
                </button>
                <button
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    filterType === 'all'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => handleFilterChange('all')}
                >
                  All
                </button>
              </nav>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
              {error}
            </div>
          )}
          
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredAppointments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAppointments.map(appointment => (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{appointment.patient.name}</div>
                        <div className="text-sm text-gray-500">
                          {appointment.patient.gender && appointment.patient.age
                            ? `${appointment.patient.gender.charAt(0).toUpperCase() + appointment.patient.gender.slice(1)}, ${appointment.patient.age} yrs`
                            : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FiCalendar className="text-gray-400 mr-1.5" />
                          <div className="text-sm text-gray-900">
                            {formatDate(appointment.scheduledAt)}
                          </div>
                        </div>
                        <div className="flex items-center mt-1">
                          <FiClock className="text-gray-400 mr-1.5" />
                          <div className="text-sm text-gray-500">
                            {formatTime(appointment.scheduledAt)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {appointment.durationMinutes} min
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {appointment.notes || 'No notes'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-800">View</button>
                          <button className="text-blue-600 hover:text-blue-800">Edit</button>
                          <button className="text-red-600 hover:text-red-800">Cancel</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-md">
              {searchQuery ? (
                <p>No appointments found matching "{searchQuery}"</p>
              ) : (
                <div>
                  <p className="mb-4">No {filterType === 'upcoming' ? 'upcoming' : filterType === 'today' ? 'today\'s' : ''} appointments found</p>
                  <button 
                    onClick={() => setShowAddAppointmentModal(true)}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <FiPlusCircle className="mr-1" /> Schedule a new appointment
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Add Appointment Modal */}
      <AddAppointmentModal 
        isOpen={showAddAppointmentModal} 
        onClose={() => setShowAddAppointmentModal(false)}
        onAppointmentAdded={() => {
          // Re-fetch appointments with current filter when a new one is added
          fetchAppointments(filterType === 'upcoming' ? 'upcoming' : 'all');
        }} 
      />
    </>
  );
}