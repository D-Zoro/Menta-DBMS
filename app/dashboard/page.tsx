import React from 'react';

const Dashboard: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <header className="bg-white shadow-md p-4 rounded-md mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Doctor's Dashboard</h1>
            </header>
            <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-4 rounded-md shadow-md">
                    <h2 className="text-lg font-semibold text-gray-700">Upcoming Appointments</h2>
                    <p className="text-gray-600 mt-2">You have 3 appointments today.</p>
                </div>
                <div className="bg-white p-4 rounded-md shadow-md">
                    <h2 className="text-lg font-semibold text-gray-700">Patient Notes</h2>
                    <p className="text-gray-600 mt-2">Review and update patient notes.</p>
                </div>
                <div className="bg-white p-4 rounded-md shadow-md">
                    <h2 className="text-lg font-semibold text-gray-700">Mental Health Resources</h2>
                    <p className="text-gray-600 mt-2">Access helpful resources for your patients.</p>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;