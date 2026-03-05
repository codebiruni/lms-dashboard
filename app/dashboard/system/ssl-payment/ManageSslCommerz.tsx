/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import {
  Loader2,
  Save,
  Shield,
  DollarSign,
  Globe,
  Link,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import POSTDATA from "@/app/default/functions/Post";
import GETDATA from "@/app/default/functions/GetData";
import PATCHDATA from "@/app/default/functions/Patch";

// Types based on the schema
interface SslCommerzData {
  _id?: string;
  sslStoreId: string;
  sslStorePassword: string;
  sslIsLive: boolean;
  currency: "BDT" | "USD" | "EUR" | "SGD" | "INR" | "MYR";
  successUrl: string;
  failUrl: string;
  cancelUrl: string;
}

// Available currencies
const CURRENCIES = [
  { value: "BDT", label: "Bangladeshi Taka (BDT)" },
  { value: "USD", label: "US Dollar (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "SGD", label: "Singapore Dollar (SGD)" },
  { value: "INR", label: "Indian Rupee (INR)" },
  { value: "MYR", label: "Malaysian Ringgit (MYR)" },
];

// Test and production URLs for reference
const SSLCOMMERZ_INFO = {
  test: {
    storeId: "your_test_store_id",
    storePassword: "your_test_store_password",
    apiUrl: "https://sandbox.sslcommerz.com",
    successUrl: "https://yourdomain.com/payment/success",
    failUrl: "https://yourdomain.com/payment/fail",
    cancelUrl: "https://yourdomain.com/payment/cancel",
  },
  production: {
    storeId: "your_live_store_id",
    storePassword: "your_live_store_password",
    apiUrl: "https://secure.sslcommerz.com",
    successUrl: "https://yourdomain.com/payment/success",
    failUrl: "https://yourdomain.com/payment/fail",
    cancelUrl: "https://yourdomain.com/payment/cancel",
  },
};

export default function ManageSslCommerz() {
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [configId, setConfigId] = useState<string | null>(null);
  
  // Form fields
  const [storeId, setStoreId] = useState("");
  const [storePassword, setStorePassword] = useState("");
  const [isLive, setIsLive] = useState(false);
  const [currency, setCurrency] = useState<"BDT" | "USD" | "EUR" | "SGD" | "INR" | "MYR">("BDT");
  const [successUrl, setSuccessUrl] = useState("");
  const [failUrl, setFailUrl] = useState("");
  const [cancelUrl, setCancelUrl] = useState("");
  
  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [testMode, setTestMode] = useState<"test" | "production">("test");

  // Fetch existing SSLCommerz config on component mount
  useEffect(() => {
    fetchSslConfig();
  }, []);

  const fetchSslConfig = async () => {
    try {
      setFetchLoading(true);
      const response = await GETDATA("/v1/ssl-commerz");

      if (response?.success && response?.data) {
        const data = response.data;
        setConfigId(data._id || null);

        // Set form fields
        setStoreId(data.sslStoreId || "");
        setStorePassword(data.sslStorePassword || "");
        setIsLive(data.sslIsLive || false);
        setCurrency(data.currency || "BDT");
        setSuccessUrl(data.successUrl || "");
        setFailUrl(data.failUrl || "");
        setCancelUrl(data.cancelUrl || "");
        
        // Set test mode based on isLive
        setTestMode(data.sslIsLive ? "production" : "test");
      }
    } catch (error: any) {
      console.error("Error fetching SSLCommerz config:", error);
      toast.error("Failed to fetch SSLCommerz configuration");
    } finally {
      setFetchLoading(false);
    }
  };

  // Handle test/production mode toggle
  const handleModeChange = (mode: "test" | "production") => {
    setTestMode(mode);
    setIsLive(mode === "production");
    
    // Optional: Show example values based on mode
    if (mode === "test" && !storeId && !storePassword) {
      // Don't auto-fill, just show tooltip
    }
  };

  // Fill with example data (for testing purposes)
  const fillExampleData = () => {
    const example = testMode === "test" ? SSLCOMMERZ_INFO.test : SSLCOMMERZ_INFO.production;
    
    setStoreId(example.storeId);
    setStorePassword(example.storePassword);
    setSuccessUrl(example.successUrl);
    setFailUrl(example.failUrl);
    setCancelUrl(example.cancelUrl);
    
    toast.info("Example data filled. Please replace with your actual credentials.");
  };

  // URL validation
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Validation
  const validateForm = (): boolean => {
    if (!storeId.trim()) {
      toast.error("Store ID is required");
      return false;
    }

    if (storeId.length < 5) {
      toast.error("Store ID should be at least 5 characters long");
      return false;
    }

    if (!storePassword.trim()) {
      toast.error("Store Password is required");
      return false;
    }

    if (storePassword.length < 8) {
      toast.error("Store Password should be at least 8 characters long");
      return false;
    }

    if (!successUrl.trim()) {
      toast.error("Success URL is required");
      return false;
    }

    if (!isValidUrl(successUrl)) {
      toast.error("Please enter a valid Success URL");
      return false;
    }

    if (!failUrl.trim()) {
      toast.error("Fail URL is required");
      return false;
    }

    if (!isValidUrl(failUrl)) {
      toast.error("Please enter a valid Fail URL");
      return false;
    }

    if (!cancelUrl.trim()) {
      toast.error("Cancel URL is required");
      return false;
    }

    if (!isValidUrl(cancelUrl)) {
      toast.error("Please enter a valid Cancel URL");
      return false;
    }

    return true;
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const data = {
        sslStoreId: storeId,
        sslStorePassword: storePassword,
        sslIsLive: isLive,
        currency,
        successUrl,
        failUrl,
        cancelUrl,
      };

      let response;

      if (configId) {
        // Update existing config
        response = await PATCHDATA(`/v1/ssl-commerz/${configId}`, data);
      } else {
        // Create new config
        response = await POSTDATA("/v1/ssl-commerz", data);
      }

      if (!response?.success) {
        throw new Error(response?.message || "Failed to save SSLCommerz configuration");
      }

      toast.success(`SSLCommerz configuration ${configId ? "updated" : "created"} successfully!`);
      
      // Refresh data to get latest
      fetchSslConfig();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-3xl">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl font-bold">
              SSLCommerz Payment Gateway Configuration
            </CardTitle>
          </div>
          <CardDescription>
            Configure your SSLCommerz payment gateway settings. Only one configuration will be saved.
            {isLive ? (
              <span className="ml-2 inline-flex items-center gap-1 text-green-600">
                <CheckCircle className="h-4 w-4" /> Live Mode
              </span>
            ) : (
              <span className="ml-2 inline-flex items-center gap-1 text-yellow-600">
                <AlertCircle className="h-4 w-4" /> Test Mode
              </span>
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Environment Selection */}
          <div className="space-y-2">
            <Label>Environment</Label>
            <div className="flex gap-4">
              <Button
                type="button"
                variant={testMode === "test" ? "default" : "outline"}
                onClick={() => handleModeChange("test")}
                className="flex-1"
              >
                <AlertCircle className="mr-2 h-4 w-4" />
                Test / Sandbox
              </Button>
              <Button
                type="button"
                variant={testMode === "production" ? "default" : "outline"}
                onClick={() => handleModeChange("production")}
                className="flex-1"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Production / Live
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {testMode === "test" 
                ? "Test mode: Use sandbox credentials for testing. No real transactions will occur."
                : "Production mode: Use live credentials for real transactions."}
            </p>
          </div>

          {/* Quick Fill Example Button (for testing) */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Quick Setup</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>Need example data for testing? Click the button below to fill in example credentials.</p>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={fillExampleData}
              >
                Fill Example Data
              </Button>
            </AlertDescription>
          </Alert>

          <Separator />

          {/* SSLCommerz Configuration Form */}
          <div className="space-y-4">
            {/* Store ID */}
            <div className="space-y-2">
              <Label htmlFor="storeId" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Store ID <span className="text-red-500">*</span>
              </Label>
              <Input
                id="storeId"
                placeholder={testMode === "test" ? "teststore123" : "livestore456"}
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Your SSLCommerz Store ID (provided by SSLCommerz)
              </p>
            </div>

            {/* Store Password */}
            <div className="space-y-2">
              <Label htmlFor="storePassword" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Store Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="storePassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your store password"
                  value={storePassword}
                  onChange={(e) => setStorePassword(e.target.value)}
                  disabled={loading}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Your SSLCommerz Store Password (keep this secure)
              </p>
            </div>

            {/* Currency */}
            <div className="space-y-2">
              <Label htmlFor="currency" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Currency <span className="text-red-500">*</span>
              </Label>
              <Select
                value={currency}
                onValueChange={(value: any) => setCurrency(value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((curr) => (
                    <SelectItem key={curr.value} value={curr.value}>
                      {curr.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Currency for payment transactions
              </p>
            </div>

            {/* Live Mode Toggle (Alternative to environment buttons) */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="live-mode">Live Mode</Label>
                <p className="text-xs text-muted-foreground">
                  Enable for real transactions, disable for testing
                </p>
              </div>
              <Switch
                id="live-mode"
                checked={isLive}
                onCheckedChange={(checked) => {
                  setIsLive(checked);
                  setTestMode(checked ? "production" : "test");
                }}
                disabled={loading}
              />
            </div>
          </div>

          <Separator />

          {/* URL Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Callback URLs</h3>
            
            {/* Success URL */}
            <div className="space-y-2">
              <Label htmlFor="successUrl" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Success URL <span className="text-red-500">*</span>
              </Label>
              <Input
                id="successUrl"
                type="url"
                placeholder="https://yourdomain.com/payment/success"
                value={successUrl}
                onChange={(e) => setSuccessUrl(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                URL where customers are redirected after successful payment
              </p>
            </div>

            {/* Fail URL */}
            <div className="space-y-2">
              <Label htmlFor="failUrl" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Fail URL <span className="text-red-500">*</span>
              </Label>
              <Input
                id="failUrl"
                type="url"
                placeholder="https://yourdomain.com/payment/fail"
                value={failUrl}
                onChange={(e) => setFailUrl(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                URL where customers are redirected after failed payment
              </p>
            </div>

            {/* Cancel URL */}
            <div className="space-y-2">
              <Label htmlFor="cancelUrl" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Cancel URL <span className="text-red-500">*</span>
              </Label>
              <Input
                id="cancelUrl"
                type="url"
                placeholder="https://yourdomain.com/payment/cancel"
                value={cancelUrl}
                onChange={(e) => setCancelUrl(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                URL where customers are redirected if they cancel payment
              </p>
            </div>
          </div>

          {/* API Information */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>SSLCommerz API Endpoints</AlertTitle>
            <AlertDescription className="space-y-1">
              <p><span className="font-medium">Test/Sandbox:</span> https://sandbox.sslcommerz.com</p>
              <p><span className="font-medium">Production/Live:</span> https://secure.sslcommerz.com</p>
              <p className="text-xs mt-2">
                Make sure your callback URLs are registered in your SSLCommerz dashboard.
              </p>
            </AlertDescription>
          </Alert>

          {/* Security Notice */}
          <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/20 p-4 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                  Security Notice
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-400">
                  Your SSLCommerz credentials are stored encrypted in the database. 
                  Never share your store password with anyone. For production, ensure you`re using live credentials.
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Configuration Summary (if exists) */}
          {configId && (
            <div className="rounded-lg bg-muted/30 p-4">
              <h4 className="text-sm font-medium mb-2">Current Configuration</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">Store ID:</span> {storeId}</div>
                <div><span className="text-muted-foreground">Currency:</span> {currency}</div>
                <div><span className="text-muted-foreground">Mode:</span> {isLive ? "Live" : "Test"}</div>
                <div><span className="text-muted-foreground">Success URL:</span> {successUrl.substring(0, 30)}...</div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={loading}
              size="lg"
              className="min-w-50"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {configId ? "Update Configuration" : "Save Configuration"}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}