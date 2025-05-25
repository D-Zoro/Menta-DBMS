"use client";

import { Bar } from 'react-chartjs-2';

type AssessmentsTabProps = {
  stats: any;
};

export default function AssessmentsTab({ stats }: AssessmentsTabProps) {
  // Chart data for assessment scores
  const assessmentChartData = {
    labels: stats?.assessmentScores.map(item => `${item.patient} (${item.type})`) || [],
    datasets: [
      {
        label: 'Assessment Score',
        data: stats?.assessmentScores.map(item => item.score) || [],
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
        borderColor: 'rgb(153, 102, 255)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Mental Health Assessments</h2>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Assessment Trends</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="font-medium text-gray-700 mb-2">Recent Assessment Scores</h4>
            <div className="h-80">
              <Bar 
                data={assessmentChartData}
                options={{ 
                  maintainAspectRatio: false,
                  indexAxis: 'y',
                  plugins: {
                    legend: {
                      display: false
                    }
                  }
                }} 
              />
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Assessment Tools</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-md p-4 hover:bg-blue-50 cursor-pointer transition-colors">
              <h4 className="font-medium text-gray-800">PHQ-9</h4>
              <p className="text-sm text-gray-600">Depression screening</p>
            </div>
            <div className="border rounded-md p-4 hover:bg-blue-50 cursor-pointer transition-colors">
              <h4 className="font-medium text-gray-800">GAD-7</h4>
              <p className="text-sm text-gray-600">Anxiety screening</p>
            </div>
            <div className="border rounded-md p-4 hover:bg-blue-50 cursor-pointer transition-colors">
              <h4 className="font-medium text-gray-800">CAGE-AID</h4>
              <p className="text-sm text-gray-600">Substance use screening</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}