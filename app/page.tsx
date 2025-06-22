'use client';

import { TestApi } from "@/components/test-api";
import { UserProfileCompact } from "@/components/auth";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">AI Knowledge Agent</h1>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated && user ? (
                <UserProfileCompact />
              ) : (
                <div className="flex space-x-2">
                  <Link 
                    href="/auth/signin"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Sign in
                  </Link>
                  <Link 
                    href="/auth/signup"
                    className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isAuthenticated && user ? (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user.name}!</h2>
              <p className="mt-2 text-gray-600">Ready to explore your AI knowledge agent?</p>
              <div className="mt-4">
                <Link 
                  href="/dashboard"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-3xl font-bold text-gray-900">Welcome to AI Knowledge Agent</h2>
              <p className="mt-4 text-lg text-gray-600">
                Sign in to get started with your personalized AI experience
              </p>
              <div className="mt-8 flex justify-center space-x-4">
                <Link 
                  href="/auth/signup"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90"
                >
                  Get Started
                </Link>
                <Link 
                  href="/auth/signin"
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Sign In
                </Link>
              </div>
            </div>
          )}
          
          <TestApi />
        </div>
      </main>
    </div>
  );
}
