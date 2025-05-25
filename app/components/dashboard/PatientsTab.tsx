"use client";

import { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { FiPlus, FiSearch, FiUsers, FiUserPlus } from 'react-icons/fi';
import AddPatientModal from '../patients/AddPatientModal';

type Patient = {
  id: string;
  name: string;
  age?: number;
  gender?: string;
  contactInfo?: string;
  createdAt: string;
};

type PatientsTabProps = {
  stats: any;
};

export default function PatientsTab({ stats }: PatientsTabProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [error, setError] = useState('');
  const [genderStats, setGenderStats] = useState({ male: 0, female: 0, other: 0 });
  
  // Fetch patients on component mount
  useEffect(() => {
    fetchPatients();
  }, []);
  
  // Update gender stats when stats prop changes
  useEffect(() => {
    if (stats && stats.patientsByGender) {
      setGenderStats(stats.patientsByGender);
    }
  }, [stats]);
  
  // Filter patients based on search query
  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/patients');
      
      if (!response.ok) {
        throw new Error('Failed to fetch patients');
      }
      
      const data = await response.json();
      setPatients(data.patients || []);
      
      // Calculate gender stats from patients if not provided in stats prop
      if (!stats || !stats.patientsByGender) {
        const patientsList = data.patients || [];
        calculateGenderStats(patientsList);
      }
    } catch (err: any) {
      console.error('Error fetching patients:', err);
      setError('Failed to load patients. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate gender statistics from patient data
  const calculateGenderStats = (patientsList: Patient[]) => {
    const genderCounts = {
      male: 0,
      female: 0,
      other: 0
    };
    
    patientsList.forEach(patient => {
      const gender = patient.gender?.toLowerCase();
      if (gender === 'male') {
        genderCounts.male += 1;
      } else if (gender === 'female') {
        genderCounts.female += 1;
      } else {
        genderCounts.other += 1;
      }
    });
    
    setGenderStats(genderCounts);
  };

  // Chart data for patient gender distribution
  const genderChartData = {
    labels: ['Male', 'Female', 'Other/Unspecified'],
    datasets: [
      {
        data: [genderStats.male, genderStats.female, genderStats.other],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 206, 86, 0.6)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-800 flex items-center">
              <FiUsers className="mr-2" /> Patient Management
            </h2>
            
            <div className="flex space-x-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              <button 
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                onClick={() => setShowAddPatientModal(true)}
              >
                <FiUserPlus className="mr-2" /> New Patient
              </button>
            </div>
          </div>
          
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Patient Demographics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium text-gray-700 mb-2">Gender Distribution</h4>
                <div className="h-64">
                  {genderStats.male === 0 && genderStats.female === 0 && genderStats.other === 0 ? (
                    <div className="flex items-center justify-center h-full flex-col">
                      <p className="text-gray-500 mb-2">No gender data available</p>
                      <button
                        onClick={() => setShowAddPatientModal(true)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Add patients to see distribution
                      </button>
                    </div>
                  ) : (
                    <Pie 
                      data={genderChartData} 
                      options={{ 
                        maintainAspectRatio: false,
                        responsive: true,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: {
                              usePointStyle: true,
                              padding: 20
                            }
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = genderStats.male + genderStats.female + genderStats.other;
                                const percentage = total > 0 ? Math.round((Number(value) / total) * 100) : 0;
                                return `${label}: ${value} (${percentage}%)`;
                              }
                            }
                          }
                        }
                      }} 
                    />
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium text-gray-700 mb-2">Patient Statistics</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-lg font-semibold text-blue-600">{patients.length}</div>
                    <div className="text-sm text-gray-500">Total Patients</div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-lg font-semibold text-green-600">
                      {patients.filter(p => new Date(p.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
                    </div>
                    <div className="text-sm text-gray-500">New This Month</div>
                  </div>
                </div>

                <div className="mt-4">
                  <h5 className="text-sm font-medium text-gray-600 mb-2">Gender Breakdown</h5>
                  <ul className="space-y-1">
                    <li className="text-sm">
                      <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                      Male: {genderStats.male}
                    </li>
                    <li className="text-sm">
                      <span className="inline-block w-3 h-3 rounded-full bg-pink-500 mr-2"></span>
                      Female: {genderStats.female}
                    </li>
                    <li className="text-sm">
                      <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
                      Other/Unspecified: {genderStats.other}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Patient List</h3>
            
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
                {error}
              </div>
            )}
            
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredPatients.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredPatients.map((patient) => (
                      <tr key={patient.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">{patient.name}</td>
                        <td className="py-3 px-4 text-sm text-gray-500">{patient.age || 'N/A'}</td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {patient.gender ? (
                            patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {patient.contactInfo || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-800">View</button>
                            <button className="text-blue-600 hover:text-blue-800">Edit</button>
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
                  <p>No patients found matching "{searchQuery}"</p>
                ) : (
                  <div>
                    <p className="mb-4">No patients found</p>
                    <button 
                      onClick={() => setShowAddPatientModal(true)}
                      className="inline-flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <FiPlus className="mr-1" /> Add your first patient
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Add Patient Modal */}
      <AddPatientModal 
        isOpen={showAddPatientModal} 
        onClose={() => setShowAddPatientModal(false)}
        onPatientAdded={() => {
          fetchPatients();
        }} 
      />
    </>
  );
}