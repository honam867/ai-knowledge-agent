"use client";

import { useState } from "react";
import _ from "lodash";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/auth-api";

interface GoogleOAuthButtonProps {
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

export function GoogleOAuthButton({
  onSuccess,
  onError,
  disabled = false,
  children,
}: GoogleOAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleAuth = async () => {
    try {
      setIsLoading(true);

      // Get the Google OAuth URL from the backend
      const googleAuthUrl = authApi.getGoogleAuthUrl();
      console.log("❤️ ~ handleGoogleAuth ~ googleAuthUrl:", googleAuthUrl);

      // Validate URL before redirect
      if (_.isEmpty(googleAuthUrl)) {
        throw new Error("Failed to generate Google OAuth URL");
      }

      // Redirect to Google OAuth
      window.location.href = googleAuthUrl;
    } catch (error) {
      console.error("Google OAuth error:", error);
      const errorMessage = _.get(
        error,
        "message",
        "Google authentication failed"
      );
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleGoogleAuth}
      disabled={disabled || isLoading}
    >
      <svg
        className="mr-2 h-4 w-4"
        aria-hidden="true"
        focusable="false"
        data-prefix="fab"
        data-icon="google"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 488 512"
      >
        <path
          fill="currentColor"
          d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h240z"
        />
      </svg>
      {isLoading ? "Connecting..." : children || "Continue with Google"}
    </Button>
  );
}
