import { Suspense } from 'react';
import { UserProfile } from '@/components/auth';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome to your dashboard</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <h3 className="font-medium">Create Project</h3>
                  <p className="text-sm text-gray-600">Start a new project</p>
                </div>
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <h3 className="font-medium">View Analytics</h3>
                  <p className="text-sm text-gray-600">Check your stats</p>
                </div>
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <h3 className="font-medium">Settings</h3>
                  <p className="text-sm text-gray-600">Manage preferences</p>
                </div>
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <h3 className="font-medium">Help</h3>
                  <p className="text-sm text-gray-600">Get support</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <Suspense fallback={<div>Loading profile...</div>}>
              <UserProfile />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
} 