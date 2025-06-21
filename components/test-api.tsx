'use client';

import { useTestQuery, useHealthQuery, useInvalidateQueries } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';

export function TestApi() {
  const { 
    data: testData, 
    isLoading: testLoading, 
    error: testError, 
    refetch: refetchTest 
  } = useTestQuery();
  
  const { 
    data: healthData, 
    isLoading: healthLoading, 
    error: healthError, 
    refetch: refetchHealth 
  } = useHealthQuery();
  
  const { invalidateTest, invalidateHealth, invalidateAll } = useInvalidateQueries();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">React Query API Test</h1>
        <p className="text-gray-600">Testing API connection to localhost:8070</p>
      </div>

      {/* Test Endpoint Section */}
      <div className="border rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Test Endpoint (/test)</h2>
          <div className="space-x-2">
            <Button 
              onClick={() => refetchTest()} 
              variant="outline" 
              size="sm"
              disabled={testLoading}
            >
              Refetch
            </Button>
            <Button 
              onClick={() => invalidateTest()} 
              variant="outline" 
              size="sm"
            >
              Invalidate Cache
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="font-medium">Status:</span>
            {testLoading && <span className="text-blue-600">Loading...</span>}
            {testError && <span className="text-red-600">Error</span>}
            {testData && !testLoading && <span className="text-green-600">Success</span>}
          </div>
          
          {testError && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-red-800 font-medium">Error Details:</p>
              <p className="text-red-700 text-sm">
                {testError instanceof Error ? testError.message : 'Unknown error occurred'}
              </p>
            </div>
          )}
          
          {testData && (
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <p className="text-green-800 font-medium">Response Data:</p>
              <pre className="text-green-700 text-sm bg-green-100 p-2 rounded mt-2 overflow-auto">
                {JSON.stringify(testData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Health Endpoint Section */}
      <div className="border rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Health Endpoint (/health)</h2>
          <div className="space-x-2">
            <Button 
              onClick={() => refetchHealth()} 
              variant="outline" 
              size="sm"
              disabled={healthLoading}
            >
              Refetch
            </Button>
            <Button 
              onClick={() => invalidateHealth()} 
              variant="outline" 
              size="sm"
            >
              Invalidate Cache
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="font-medium">Status:</span>
            {healthLoading && <span className="text-blue-600">Loading...</span>}
            {healthError && <span className="text-red-600">Error</span>}
            {healthData && !healthLoading && <span className="text-green-600">Success</span>}
          </div>
          
          {healthError && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-red-800 font-medium">Error Details:</p>
              <p className="text-red-700 text-sm">
                {healthError instanceof Error ? healthError.message : 'Unknown error occurred'}
              </p>
            </div>
          )}
          
          {healthData && (
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <p className="text-green-800 font-medium">Response Data:</p>
              <pre className="text-green-700 text-sm bg-green-100 p-2 rounded mt-2 overflow-auto">
                {JSON.stringify(healthData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Global Actions */}
      <div className="border rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">Global Cache Management</h2>
        <div className="space-x-2">
          <Button 
            onClick={() => invalidateAll()} 
            variant="destructive" 
            size="sm"
          >
            Invalidate All Queries
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          This will invalidate all cached queries and trigger refetches for active queries.
        </p>
      </div>

      {/* API Info */}
      <div className="border rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">API Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Base URL:</span> http://localhost:8070
          </div>
          <div>
            <span className="font-medium">Timeout:</span> 10 seconds
          </div>
          <div>
            <span className="font-medium">Stale Time:</span> 1 minute
          </div>
          <div>
            <span className="font-medium">Cache Time:</span> 5 minutes
          </div>
        </div>
      </div>
    </div>
  );
} 