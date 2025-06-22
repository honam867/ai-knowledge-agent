"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

interface UserProfileProps {
  onLogout?: () => void;
  showCard?: boolean;
  className?: string;
}

export function UserProfile({
  onLogout,
  showCard = true,
  className,
}: UserProfileProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout, isLoggingOut, googleAuth, isGoogleAuthenticating } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isHandlingCallback, setIsHandlingCallback] = useState(false);

  // Handle Google OAuth callback
  useEffect(() => {
    const handleGoogleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      
      // If we have OAuth parameters and no user yet, handle the callback
      if (code && !user && !isHandlingCallback) {
        setIsHandlingCallback(true);
        try {
          console.log('UserProfile: Handling Google OAuth callback with code:', code);
          await googleAuth({ code, state: state || undefined });
          // Clear the URL parameters after successful authentication
          router.replace('/dashboard');
        } catch (error) {
          console.error('UserProfile: Google OAuth callback failed:', error);
          // Redirect to signin on failure
          router.push('/auth/signin?error=oauth_callback_failed');
        } finally {
          setIsHandlingCallback(false);
        }
      }
    };

    handleGoogleCallback();
  }, [searchParams, user, googleAuth, router, isHandlingCallback]);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await logout();
      onLogout?.();
      router.push("/auth/signin");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state during OAuth callback
  if (isGoogleAuthenticating || isHandlingCallback) {
    const loadingContent = (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">
          Completing Google authentication...
        </p>
      </div>
    );

    if (showCard) {
      return (
        <Card className={className}>
          <CardContent>{loadingContent}</CardContent>
        </Card>
      );
    }
    return <div className={className}>{loadingContent}</div>;
  }

  if (!user) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const content = (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-16 h-16 rounded-full"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-2xl font-semibold text-primary">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold">{user.name}</h3>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <div className="flex items-center space-x-2 mt-1">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                user.emailVerified
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {user.emailVerified ? "Verified" : "Unverified"}
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {user.provider === "google" ? "Google" : "Email"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="font-medium text-muted-foreground">Member since</p>
          <p>{formatDate(user.createdAt)}</p>
        </div>
        <div>
          <p className="font-medium text-muted-foreground">Last updated</p>
          <p>{formatDate(user.updatedAt)}</p>
        </div>
        {user.lastLoginAt && (
          <div className="col-span-2">
            <p className="font-medium text-muted-foreground">Last login</p>
            <p>{formatDate(user.lastLoginAt)}</p>
          </div>
        )}
      </div>

      <div className="flex space-x-2 pt-4 border-t">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => router.push("/profile/edit")}
        >
          Edit Profile
        </Button>
        <Button
          variant="destructive"
          className="flex-1"
          onClick={handleLogout}
          disabled={isLoggingOut || isLoading}
        >
          {isLoggingOut || isLoading ? "Signing out..." : "Sign out"}
        </Button>
      </div>
    </div>
  );

  if (showCard) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Your account information and settings
          </CardDescription>
        </CardHeader>
        <CardContent>{content}</CardContent>
      </Card>
    );
  }

  return <div className={className}>{content}</div>;
}

// Compact version for navigation bars
export function UserProfileCompact({ onLogout }: { onLogout?: () => void }) {
  const { user, logout, isLoggingOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      onLogout?.();
      setIsDropdownOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent"
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="text-left">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-background border rounded-md shadow-lg z-50">
          <div className="py-1">
            <button
              onClick={() => {
                setIsDropdownOpen(false);
                // Navigate to profile
              }}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-accent"
            >
              View Profile
            </button>
            <button
              onClick={() => {
                setIsDropdownOpen(false);
                // Navigate to settings
              }}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-accent"
            >
              Settings
            </button>
            <hr className="my-1" />
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {isLoggingOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
