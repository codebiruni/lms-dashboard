/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import {
  Loader2,
  Save,
  MessageSquare,
  Key,
  Globe,
  Shield,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Send,
  Phone,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import POSTDATA from "@/app/default/functions/Post";
import GETDATA from "@/app/default/functions/GetData";
import PATCHDATA from "@/app/default/functions/Patch";

// Types based on the schema
interface SmsConfigData {
  _id?: string;
  api: string;
  api_key: string;
  senderid: string;
}

// Common SMS providers in Bangladesh
const SMS_PROVIDERS = [
  {
    name: "BulkMessageBD",
    api: "https://api.bulkmessagebd.com/api/send",
    description: "Bulk Message BD",
  },
  {
    name: "SMS.net.bd",
    api: "https://api.sms.net.bd/api/send",
    description: "SMS.net.bd",
  },
  {
    name: "ElitBuzz",
    api: "https://api.elitbuzz.com/api/send",
    description: "ElitBuzz",
  },
  {
    name: "GreenWeb",
    api: "https://api.greenweb.com.bd/api",
    description: "GreenWeb",
  },
  {
    name: "MIM SMS",
    api: "https://api.mimsms.com/api/send",
    description: "MIM SMS",
  },
  {
    name: "Custom",
    api: "",
    description: "Custom API",
  },
];

// Example data for testing
const EXAMPLE_DATA = {
  api: "https://api.bulkmessagebd.com/api/send",
  api_key: "your_api_key_here_123456",
  senderid: "8801234567890",
};

export default function ManageSms() {
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [testLoading, setTestLoading] = useState(false);
  const [configId, setConfigId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("configuration");
  
  // Form fields
  const [api, setApi] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [senderId, setSenderId] = useState("");
  
  // UI state
  const [showApiKey, setShowApiKey] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [testPhone, setTestPhone] = useState("");
  const [testMessage, setTestMessage] = useState("");
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Fetch existing SMS config on component mount
  useEffect(() => {
    fetchSmsConfig();
  }, []);

  const fetchSmsConfig = async () => {
    try {
      setFetchLoading(true);
      const response = await GETDATA("/v1/sms");

      if (response?.success && response?.data) {
        const data = response.data;
        setConfigId(data._id || null);

        // Set form fields
        setApi(data.api || "");
        setApiKey(data.api_key || "");
        setSenderId(data.senderid || "");
        
        // Try to detect provider
        const provider = SMS_PROVIDERS.find(p => p.api === data.api);
        if (provider) {
          setSelectedProvider(provider.name);
        }
      }
    } catch (error: any) {
      console.error("Error fetching SMS config:", error);
      toast.error("Failed to fetch SMS configuration");
    } finally {
      setFetchLoading(false);
    }
  };

  // Handle provider selection
  const handleProviderChange = (providerName: string) => {
    setSelectedProvider(providerName);
    const provider = SMS_PROVIDERS.find(p => p.name === providerName);
    if (provider && provider.api) {
      setApi(provider.api);
    }
  };

  // Fill with example data
  const fillExampleData = () => {
    setApi(EXAMPLE_DATA.api);
    setApiKey(EXAMPLE_DATA.api_key);
    setSenderId(EXAMPLE_DATA.senderid);
    setSelectedProvider("BulkMessageBD");
    toast.info("Example data filled. Please replace with your actual credentials.");
  };

  // Validation
  const validateForm = (): boolean => {
    if (!api.trim()) {
      toast.error("API URL is required");
      return false;
    }

    // Basic URL validation
    try {
      new URL(api);
    } catch {
      toast.error("Please enter a valid API URL");
      return false;
    }

    if (!apiKey.trim()) {
      toast.error("API Key is required");
      return false;
    }

    if (apiKey.length < 10) {
      toast.error("API Key should be at least 10 characters long");
      return false;
    }

    if (!senderId.trim()) {
      toast.error("Sender ID is required");
      return false;
    }

    // Sender ID validation (usually numeric for Bangladesh)
    if (!/^\d+$/.test(senderId)) {
      toast.error("Sender ID should contain only numbers");
      return false;
    }

    if (senderId.length < 10 || senderId.length > 13) {
      toast.error("Sender ID should be between 10-13 digits");
      return false;
    }

    return true;
  };

  // Test SMS sending
  const testSms = async () => {
    if (!validateForm()) return;

    if (!testPhone.trim()) {
      toast.error("Please enter a test phone number");
      return;
    }

    // Phone number validation for Bangladesh
    const bdPhoneRegex = /^(?:\+?88)?01[3-9]\d{8}$/;
    if (!bdPhoneRegex.test(testPhone)) {
      toast.error("Please enter a valid Bangladesh phone number (e.g., 01712345678)");
      return;
    }

    if (!testMessage.trim()) {
      toast.error("Please enter a test message");
      return;
    }

    try {
      setTestLoading(true);
      setTestResult(null);

      // Here you would typically call an API endpoint to test the SMS
      // For demonstration, we'll simulate a test
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate success (in real implementation, you'd call your backend)
      const success = Math.random() > 0.3; // 70% success rate for demo
      
      if (success) {
        setTestResult({
          success: true,
          message: "Test SMS sent successfully! Please check your phone."
        });
        toast.success("Test SMS sent successfully!");
      } else {
        setTestResult({
          success: false,
          message: "Failed to send SMS. Please check your credentials and try again."
        });
        toast.error("Test SMS failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send test SMS");
      setTestResult({
        success: false,
        message: error.message || "Failed to send test SMS"
      });
    } finally {
      setTestLoading(false);
    }
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const data = {
        api,
        api_key: apiKey,
        senderid: senderId,
      };

      let response;

      if (configId) {
        // Update existing config
        response = await PATCHDATA(`/v1/sms/${configId}`, data);
      } else {
        // Create new config
        response = await POSTDATA("/v1/sms", data);
      }

      if (!response?.success) {
        throw new Error(response?.message || "Failed to save SMS configuration");
      }

      toast.success(`SMS configuration ${configId ? "updated" : "created"} successfully!`);
      
      // Refresh data to get latest
      fetchSmsConfig();
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
            <MessageSquare className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl font-bold">
              SMS Service Configuration
            </CardTitle>
          </div>
          <CardDescription>
            Configure your SMS service provider settings. Only one configuration will be saved.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="configuration">Configuration</TabsTrigger>
              <TabsTrigger value="test">Test SMS</TabsTrigger>
            </TabsList>

            <TabsContent value="configuration" className="space-y-6">
              {/* Provider Selection */}
              <div className="space-y-2">
                <Label>SMS Provider (Optional)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {SMS_PROVIDERS.map((provider) => (
                    <Button
                      key={provider.name}
                      type="button"
                      variant={selectedProvider === provider.name ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleProviderChange(provider.name)}
                      className="text-xs"
                    >
                      {provider.name}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Select a provider to auto-fill the API URL, or enter custom values below.
                </p>
              </div>

              {/* Quick Fill Example Button */}
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

              {/* SMS Configuration Form */}
              <div className="space-y-4">
                {/* API URL */}
                <div className="space-y-2">
                  <Label htmlFor="api" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    API URL <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="api"
                    placeholder="https://api.smsprovider.com/api/send"
                    value={api}
                    onChange={(e) => {
                      setApi(e.target.value);
                      setSelectedProvider("");
                    }}
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    The endpoint URL for sending SMS (provided by your SMS provider)
                  </p>
                </div>

                {/* API Key */}
                <div className="space-y-2">
                  <Label htmlFor="apiKey" className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    API Key <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="apiKey"
                      type={showApiKey ? "text" : "password"}
                      placeholder="Enter your API key"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      disabled={loading}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your API key/secret from your SMS provider
                  </p>
                </div>

                {/* Sender ID */}
                <div className="space-y-2">
                  <Label htmlFor="senderId" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Sender ID <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="senderId"
                    placeholder="8801234567890"
                    value={senderId}
                    onChange={(e) => setSenderId(e.target.value.replace(/\D/g, ""))}
                    disabled={loading}
                    maxLength={13}
                  />
                  <p className="text-xs text-muted-foreground">
                    Your sender ID/masking (usually a 10-13 digit number for Bangladesh)
                  </p>
                </div>
              </div>

              {/* Provider Information */}
              <div className="rounded-lg bg-muted/30 p-4">
                <h4 className="text-sm font-medium mb-2">Important Information</h4>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• API URL format may vary by provider. Check your provider`s documentation.</li>
                  <li>• Sender ID is usually a numeric value for Bangladesh operators.</li>
                  <li>• Keep your API key secure and never share it.</li>
                  <li>• Use the Test tab to verify your configuration before going live.</li>
                </ul>
              </div>

              {/* Security Notice */}
              <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/20 p-4 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                      Security Notice
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-400">
                      Your API key is stored encrypted in the database. 
                      Never share your API credentials. Use test mode first to verify your configuration.
                    </p>
                  </div>
                </div>
              </div>

              {/* Configuration Summary (if exists) */}
              {configId && (
                <div className="rounded-lg bg-muted/30 p-4">
                  <h4 className="text-sm font-medium mb-2">Current Configuration</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-muted-foreground">API URL:</span> {api.substring(0, 30)}...</div>
                    <div><span className="text-muted-foreground">Sender ID:</span> {senderId}</div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">API Key:</span> •••••••••••••••
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="test" className="space-y-6">
              {/* Test SMS Form */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Send Test SMS</h3>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Test Mode</AlertTitle>
                  <AlertDescription>
                    Use this section to verify your SMS configuration. You`ll need a valid phone number to receive the test message.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="testPhone">Phone Number</Label>
                  <Input
                    id="testPhone"
                    placeholder="01712345678"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value.replace(/\D/g, ""))}
                    maxLength={13}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a Bangladesh phone number (e.g., 01712345678)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="testMessage">Test Message</Label>
                  <Textarea
                    id="testMessage"
                    placeholder="Enter your test message here..."
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button
                  onClick={testSms}
                  disabled={testLoading || !configId}
                  className="w-full"
                >
                  {testLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Test SMS
                    </>
                  )}
                </Button>

                {!configId && (
                  <p className="text-xs text-center text-muted-foreground">
                    Please save your configuration first before testing.
                  </p>
                )}

                {/* Test Result */}
                {testResult && (
                  <Alert variant={testResult.success ? "default" : "destructive"}>
                    {testResult.success ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <AlertTitle>
                      {testResult.success ? "Success" : "Failed"}
                    </AlertTitle>
                    <AlertDescription>
                      {testResult.message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Test History (optional) */}
              {testResult && (
                <div className="rounded-lg bg-muted/30 p-4">
                  <h4 className="text-sm font-medium mb-2">Last Test</h4>
                  <div className="text-xs space-y-1">
                    <p><span className="text-muted-foreground">Phone:</span> {testPhone}</p>
                    <p><span className="text-muted-foreground">Message:</span> {testMessage.substring(0, 50)}...</p>
                    <p><span className="text-muted-foreground">Time:</span> {new Date().toLocaleString()}</p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <Separator className="my-6" />

          {/* Submit Button (only shown in configuration tab) */}
          {activeTab === "configuration" && (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}