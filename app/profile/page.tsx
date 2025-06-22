'use client';

import { ProtectedRoute } from '@/components/providers/auth-provider';
import { UserProfile } from '@/components/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

function ProfilePageContent() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/signin');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="mt-2 text-gray-600">Manage your account settings and preferences</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Profile Card */}
          <div className="lg:col-span-1">
            <UserProfile showCard={true} />
          </div>
          
          {/* Account Settings */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account preferences and security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Security</h4>
                  <p className="text-sm text-muted-foreground">
                    Your account is secured with {user?.provider === 'google' ? 'Google OAuth' : 'email/password authentication'}.
                  </p>
                  {user?.provider === 'email' && (
                    <Button variant="outline" size="sm">
                      Change Password
                    </Button>
                  )}
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Notifications</h4>
                  <p className="text-sm text-muted-foreground">
                    Manage your email and push notification preferences.
                  </p>
                  <Button variant="outline" size="sm">
                    Notification Settings
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Privacy</h4>
                  <p className="text-sm text-muted-foreground">
                    Control your privacy settings and data sharing preferences.
                  </p>
                  <Button variant="outline" size="sm">
                    Privacy Settings
                  </Button>
                </div>
                
                <div className="pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => router.push('/dashboard')}
                    className="mr-2"
                  >
                    Back to Dashboard
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleLogout}
                  >
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfilePageContent />
    </ProtectedRoute>
  );
} 