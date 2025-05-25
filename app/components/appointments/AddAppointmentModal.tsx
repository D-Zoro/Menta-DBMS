"use client";

import { useState, useEffect } from 'react';
import { FiX, FiAlertCircle, FiCalendar, FiClock } from 'react-icons/fi';

type Patient = {
  id: string;
  name: string;
  age?: number;
  gender?: string;
};

type AddAppointmentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAppointmentAdded: () => void;
};

export default function AddAppointmentModal({ isOpen, onClose, onAppointmentAdded }: AddAppointmentModalProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [formData, setFormData] = useState({
    patientId: '',
    scheduledAt: '',
    scheduledTime: '',
    durationMinutes: '60',
    notes: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];
  
  // Fetch patients when modal is opened
  useEffect(() => {
    if (isOpen) {
      fetchPatients();
    }
  }, [isOpen]);
  
  const fetchPatients = async () => {
    setIsLoadingPatients(true);
    try {
      const response = await fetch('/api/patients');
      
      if (!response.ok) {
        throw new Error('Failed to fetch patients');
      }
      
      const data = await response.json();
      setPatients(data.patients || []);
      
    } catch (err: any) {
      console.error('Error fetching patients:', err);
      setError('Could not load patients list. Please try again.');
    } finally {
      setIsLoadingPatients(false);
    }
  };
  
  if (!isOpen) return null;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    // Validate required fields
    if (!formData.patientId) {
      setError('Please select a patient');
      return;
    }
    
    if (!formData.scheduledAt || !formData.scheduledTime) {
      setError('Date and time are required');
      return;
    }
    
    setIsLoading(true);
    
    // Combine date and time for the API
    const scheduledAt = new Date(`${formData.scheduledAt}T${formData.scheduledTime}`).toISOString();
    
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: formData.patientId,
          scheduledAt,
          durationMinutes: parseInt(formData.durationMinutes),
          notes: formData.notes
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add appointment');
      }
      
      // Success
      setSuccess(true);
      setFormData({
        patientId: '',
        scheduledAt: '',
        scheduledTime: '',
        durationMinutes: '60',
        notes: ''
      });
      
      // Notify parent component
      onAppointmentAdded();
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Schedule New Appointment</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center text-sm">
            <FiAlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">
            Appointment scheduled successfully!
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="patientId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Patient *
            </label>
            <select
              id="patientId"
              name="patientId"
              value={formData.patientId}
              onChange={handleChange}
              disabled={isLoadingPatients}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Select Patient</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} {patient.age ? `(${patient.age} yrs)` : ''}
                </option>
              ))}
            </select>
            {isLoadingPatients && (
              <p className="mt-1 text-xs text-gray-500">Loading patients...</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="scheduledAt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiCalendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="scheduledAt"
                  name="scheduledAt"
                  type="date"
                  required
                  min={today}
                  value={formData.scheduledAt}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Time *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiClock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="scheduledTime"
                  name="scheduledTime"
                  type="time"
                  required
                  value={formData.scheduledTime}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          </div>
          
          <div>
            <label htmlFor="durationMinutes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Duration (minutes)
            </label>
            <select
              id="durationMinutes"
              name="durationMinutes"
              value={formData.durationMinutes}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes (1 hour)</option>
              <option value="90">90 minutes (1.5 hours)</option>
              <option value="120">120 minutes (2 hours)</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Any notes about this appointment..."
            />
          </div>
          
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm focus:outline-none ${
                isLoading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Scheduling...
                </span>
              ) : (
                "Schedule Appointment"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}