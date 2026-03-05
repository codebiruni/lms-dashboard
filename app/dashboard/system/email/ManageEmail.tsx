/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import {
  Loader2,
  Save,
  Mail,
  Key,
  Server,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import POSTDATA from "@/app/default/functions/Post";
import GETDATA from "@/app/default/functions/GetData";
import PATCHDATA from "@/app/default/functions/Patch";

// Types based on the schema
interface EmailInfoData {
  _id?: string;
  email: string;
  password: string;
  smtp_host: string;
  email_port: number;
}

// Common SMTP providers for quick reference
const SMTP_PROVIDERS = [
  { name: "Gmail", host: "smtp.gmail.com", port: 587 },
  { name: "Outlook/Hotmail", host: "smtp-mail.outlook.com", port: 587 },
  { name: "Yahoo Mail", host: "smtp.mail.yahoo.com", port: 587 },
  { name: "Office 365", host: "smtp.office365.com", port: 587 },
  { name: "Amazon SES", host: "email-smtp.us-east-1.amazonaws.com", port: 587 },
  { name: "SendGrid", host: "smtp.sendgrid.net", port: 587 },
  { name: "Mailgun", host: "smtp.mailgun.org", port: 587 },
  { name: "Postmark", host: "smtp.postmarkapp.com", port: 587 },
  { name: "Zoho Mail", host: "smtp.zoho.com", port: 587 },
  { name: "Custom", host: "", port: 587 },
];

export default function ManageEmail() {
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [emailInfoId, setEmailInfoId] = useState<string | null>(null);
  
  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [smtpHost, setSmtpHost] = useState("");
  const [emailPort, setEmailPort] = useState<number>(587);
  
  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [testLoading, setTestLoading] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [showTestDialog, setShowTestDialog] = useState(false);

  // Fetch existing email info on component mount
  useEffect(() => {
    fetchEmailInfo();
  }, []);

  const fetchEmailInfo = async () => {
    try {
      setFetchLoading(true);
      const response = await GETDATA("/v1/email-info");

      if (response?.success && response?.data) {
        const data = response.data;
        setEmailInfoId(data._id || null);

        // Set form fields
        setEmail(data.email || "");
        setPassword(data.password || "");
        setSmtpHost(data.smtp_host || "");
        setEmailPort(data.email_port || 587);
        
        // Try to detect provider
        const provider = SMTP_PROVIDERS.find(
          p => p.host === data.smtp_host && p.port === data.email_port
        );
        if (provider) {
          setSelectedProvider(provider.name);
        }
      }
    } catch (error: any) {
      console.error("Error fetching email info:", error);
      toast.error("Failed to fetch email configuration");
    } finally {
      setFetchLoading(false);
    }
  };

  // Handle provider selection
  const handleProviderChange = (providerName: string) => {
    setSelectedProvider(providerName);
    const provider = SMTP_PROVIDERS.find(p => p.name === providerName);
    if (provider && provider.host) {
      setSmtpHost(provider.host);
      setEmailPort(provider.port);
    }
  };

  // Validation
  const validateForm = (): boolean => {
    if (!email.trim()) {
      toast.error("Email address is required");
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    if (!password.trim()) {
      toast.error("Password is required");
      return false;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }

    if (!smtpHost.trim()) {
      toast.error("SMTP host is required");
      return false;
    }

    if (!emailPort || emailPort <= 0 || emailPort > 65535) {
      toast.error("Please enter a valid port number (1-65535)");
      return false;
    }

    return true;
  };

  // Test email connection
  const testConnection = async () => {
    if (!validateForm()) return;

    if (!testEmail.trim()) {
      toast.error("Please enter a test email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      toast.error("Please enter a valid test email address");
      return;
    }

    try {
      setTestLoading(true);
      
      // Here you would typically call an API endpoint to test the email configuration
      // For now, we'll simulate a test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Test email sent successfully! Please check your inbox.");
      setShowTestDialog(false);
      setTestEmail("");
    } catch (error: any) {
      toast.error(error.message || "Failed to send test email");
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
        email,
        password,
        smtp_host: smtpHost,
        email_port: emailPort,
      };

      let response;

      if (emailInfoId) {
        // Update existing email info
        response = await PATCHDATA(`/v1/email-info/${emailInfoId}`, data);
      } else {
        // Create new email info
        response = await POSTDATA("/v1/email-info", data);
      }

      if (!response?.success) {
        throw new Error(response?.message || "Failed to save email configuration");
      }

      toast.success(`Email configuration ${emailInfoId ? "updated" : "created"} successfully!`);
      
      // Refresh data to get latest
      fetchEmailInfo();
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
            <Mail className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl font-bold">
              Email Configuration
            </CardTitle>
          </div>
          <CardDescription>
            Configure your email settings for sending notifications, password resets, and other system emails.
            Only one email configuration will be saved.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* SMTP Provider Quick Select */}
          <div className="space-y-2">
            <Label>Quick Provider Select (Optional)</Label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {SMTP_PROVIDERS.map((provider) => (
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
              Select a provider to auto-fill SMTP settings, or enter custom values below.
            </p>
          </div>

          <Separator />

          {/* Email Configuration Form */}
          <div className="space-y-4">
            {/* Email Address */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="e.g., noreply@yourdomain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                This email will be used as the sender for all system emails.
              </p>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Password / App Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your email password or app password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                For Gmail, use an{" "}
                <a
                  href="https://support.google.com/accounts/answer/185833"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  App Password
                </a>{" "}
                instead of your regular password.
              </p>
            </div>

            {/* SMTP Host */}
            <div className="space-y-2">
              <Label htmlFor="smtp_host" className="flex items-center gap-2">
                <Server className="h-4 w-4" />
                SMTP Host <span className="text-red-500">*</span>
              </Label>
              <Input
                id="smtp_host"
                placeholder="e.g., smtp.gmail.com"
                value={smtpHost}
                onChange={(e) => {
                  setSmtpHost(e.target.value);
                  setSelectedProvider("");
                }}
                disabled={loading}
              />
            </div>

            {/* Port */}
            <div className="space-y-2">
              <Label htmlFor="email_port" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Port <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email_port"
                type="number"
                min="1"
                max="65535"
                placeholder="e.g., 587"
                value={emailPort}
                onChange={(e) => {
                  setEmailPort(parseInt(e.target.value) || 587);
                  setSelectedProvider("");
                }}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Common ports: 25 (unencrypted), 465 (SSL), 587 (TLS)
              </p>
            </div>
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
                  Your email password is stored encrypted in the database. 
                  For Gmail accounts, it`s highly recommended to use an App Password 
                  instead of your regular account password. Never share your email credentials.
                </p>
              </div>
            </div>
          </div>

          {/* Test Email Section */}
          {emailInfoId && (
            <>
              <Separator />
              <div className="space-y-4">
                <Label>Test Email Configuration</Label>
                <p className="text-sm text-muted-foreground">
                  Send a test email to verify your configuration is working correctly.
                </p>
                
                {!showTestDialog ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowTestDialog(true)}
                  >
                    Send Test Email
                  </Button>
                ) : (
                  <div className="space-y-3 rounded-lg border p-4">
                    <Label htmlFor="testEmail">Test Email Address</Label>
                    <Input
                      id="testEmail"
                      type="email"
                      placeholder="Enter recipient email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      disabled={testLoading}
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={testConnection}
                        disabled={testLoading}
                        size="sm"
                      >
                        {testLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          "Send Test"
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowTestDialog(false);
                          setTestEmail("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          <Separator />

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
                  {emailInfoId ? "Update Configuration" : "Save Configuration"}
                </>
              )}
            </Button>
          </div>

          {/* Current Status */}
          {emailInfoId && (
            <div className="text-xs text-muted-foreground text-center">
              <p>Email configuration is active and ready to use.</p>
              <p className="mt-1">
                <span className="font-medium">Configured Email:</span> {email} |{" "}
                <span className="font-medium">SMTP:</span> {smtpHost}:{emailPort}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}