"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Bar, Pie } from 'react-chartjs-2';

type OverviewProps = {
  stats: any;
  upcomingAppointments: any[];
  recentAssessments: any[];
};

export default function OverviewTab({ stats, upcomingAppointments, recentAssessments }: OverviewProps) {
  // Safe accessor function to prevent errors with undefined properties
  const safeGet = (obj: any, path: string[], defaultValue: any = undefined) => {
    let current = obj;
    for (const key of path) {
      if (current === undefined || current === null) return defaultValue;
      current = current[key];
    }
    return current === undefined ? defaultValue : current;
  };

  // Chart data for appointments by day (with safe access)
  const appointmentsByDay = safeGet(stats, ['appointmentsByDay'], []);
  const appointmentsChartData = {
    labels: appointmentsByDay.map(item => {
      try {
        return format(new Date(item.date), 'MMM d');
      } catch (e) {
        console.error("Date formatting error:", e);
        return "Invalid date";
      }
    }),
    datasets: [
      {
        label: 'Appointments',
        data: appointmentsByDay.map(item => item.count || 0),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1,
      },
    ],
  };
  
  // Chart data for patient gender distribution (with safe access)
  const patientsByGender = safeGet(stats, ['patientsByGender'], { male: 0, female: 0, other: 0 });
  const genderChartData = {
    labels: ['Male', 'Female', 'Other/Unspecified'],
    datasets: [
      {
        data: [
          patientsByGender.male || 0,
          patientsByGender.female || 0,
          patientsByGender.other || 0
        ],
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
  
  // Chart data for assessment scores (with safe access)
  const assessmentScores = safeGet(stats, ['assessmentScores'], []);
  const assessmentChartData = {
    labels: assessmentScores.map(item => `${item.patient} (${item.type})`),
    datasets: [
      {
        label: 'Assessment Score',
        data: assessmentScores.map(item => item.score || 0),
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
        borderColor: 'rgb(153, 102, 255)',
        borderWidth: 1,
      },
    ],
  };

  // Check if we have any data to display in the charts
  const hasAppointmentData = appointmentsByDay.length > 0;
  const hasGenderData = patientsByGender.male > 0 || patientsByGender.female > 0 || patientsByGender.other > 0;
  const hasAssessmentData = assessmentScores.length > 0;

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-600">Total Patients</h2>
              <p className="text-2xl font-semibold text-gray-800">{safeGet(stats, ['totalPatients'], 0)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-600">Today's Appointments</h2>
              <p className="text-2xl font-semibold text-gray-800">{safeGet(stats, ['appointmentsToday'], 0)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-600">Recent Assessments</h2>
              <p className="text-2xl font-semibold text-gray-800">{safeGet(stats, ['recentAssessments'], 0)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-600">Upcoming Appointments</h2>
              <p className="text-2xl font-semibold text-gray-800">{safeGet(stats, ['upcomingAppointments'], 0)}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Appointments This Month</h3>
          <div className="h-64">
            {hasAppointmentData ? (
              <Bar 
                data={appointmentsChartData} 
                options={{ 
                  maintainAspectRatio: false,
                  responsive: true,
                  plugins: {
                    legend: {
                      display: false,
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        precision: 0
                      }
                    }
                  }
                }} 
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No appointment data available</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Patient Gender Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            {hasGenderData ? (
              <Pie 
                data={genderChartData} 
                options={{ 
                  maintainAspectRatio: false,
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        padding: 20
                      }
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const label = context.label || '';
                          const value = context.raw || 0;
                          const total = patientsByGender.male + patientsByGender.female + patientsByGender.other;
                          const percentage = total > 0 ? Math.round((Number(value) / total) * 100) : 0;
                          return `${label}: ${value} (${percentage}%)`;
                        }
                      }
                    }
                  }
                }} 
              />
            ) : (
              <div className="text-gray-500">No gender data available</div>
            )}
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">Upcoming Appointments</h3>
            <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
          </div>
          <div className="space-y-4">
            {upcomingAppointments && upcomingAppointments.length > 0 ? (
              upcomingAppointments.slice(0, 5).map(appointment => (
                <div key={appointment.id} className="border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between">
                    <span className="font-medium">{appointment.patient?.name || 'Unknown Patient'}</span>
                    <span className="text-sm text-gray-500">
                      {format(new Date(appointment.scheduledAt), "MMM d, yyyy 'at' h:mm a")}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {appointment.durationMinutes} min appointment
                    {appointment.notes ? ` - ${appointment.notes}` : ''}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">No upcoming appointments</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">Recent Assessment Scores</h3>
            <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
          </div>
          {hasAssessmentData ? (
            <div className="h-64">
              <Bar 
                data={assessmentChartData}
                options={{ 
                  maintainAspectRatio: false,
                  responsive: true,
                  indexAxis: 'y',
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    x: {
                      beginAtZero: true,
                      ticks: {
                        precision: 0
                      }
                    }
                  }
                }} 
              />
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">No recent assessments</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}