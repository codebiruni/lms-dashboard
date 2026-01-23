"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import LOGOUTUSER from "@/app/default/functions/logoutOut";

// Shadcn UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import useContextData from "../custom-component/useContextData";

export default function Logout() {
  const { handleLogout, callLogout, handleUser } = useContextData();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleUserLogout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Call the logout function
      const res = await LOGOUTUSER();

      if (!res.success) {
        throw new Error(res.message || "Logout failed");
      }

      toast.success(
        "Logged out successfully! You have been successfully logged out."
      );
      handleUser(null);
      router.push("/");
      router.refresh();
      handleLogout(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred during logout";
      setError(errorMessage);

      // Show error toast
      toast.error("Logout failed! Please check your internet connection");
    } finally {
      setIsLoading(false);
    }
  };

  if (!callLogout) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-999999 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="space-y-1.5">
            <CardTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5" />
              Confirm Logout
            </CardTitle>
            <CardDescription>
              Are you sure you want to logout? You will need to login again to
              access your account.
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleLogout(false)}
            disabled={isLoading}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => handleLogout(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleUserLogout}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Logging out...
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4" />
                  Logout
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}