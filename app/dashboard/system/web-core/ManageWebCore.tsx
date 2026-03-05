/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import {
  Loader2,
  Save,
  Globe,
  Key,
  Image,
  Video,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Server,
  Link,
  Shield,
  Copy,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import POSTDATA from "@/app/default/functions/Post";
import GETDATA from "@/app/default/functions/GetData";
import PATCHDATA from "@/app/default/functions/Patch";

// Types based on the schema
interface WebCoreData {
  _id?: string;
  frontendUrl: string;
  gemeniApiKey: string;
  imageHostApiKey: string;
  imageHostApiUrl: string;
  videoHostToken: string;
  videoHostApiUrl: string;
}

// Default values from schema
const DEFAULT_VALUES = {
  frontendUrl: "http://localhost:3000",
  gemeniApiKey: "AIzaSyBNK4g322K0jK5eQjtLHjYcvJO6bHs2kE4",
  imageHostApiKey: "6d207e02198a847aa98d0a2a901485a5",
  imageHostApiUrl: "https://freeimage.host/api/1/upload",
  videoHostToken: "GNf12ZYb2x7Zf1kQwSleHMLazpYghqAeSftiu8My",
  videoHostApiUrl: "https://api.pcloud.com/uploadfile",
};

// Service information for reference
const SERVICE_INFO = {
  gemeni: {
    name: "Google Gemini AI",
    docs: "https://ai.google.dev/docs",
    description: "AI-powered content generation and analysis",
  },
  freeimage: {
    name: "FreeImage.Host",
    docs: "https://freeimage.host/api",
    description: "Image hosting service for uploading and serving images",
  },
  pcloud: {
    name: "pCloud",
    docs: "https://docs.pcloud.com/",
    description: "Cloud storage for video hosting",
  },
};

export default function ManageWebCore() {
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [configId, setConfigId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("general");
  
  // Form fields
  const [frontendUrl, setFrontendUrl] = useState(DEFAULT_VALUES.frontendUrl);
  const [gemeniApiKey, setGemeniApiKey] = useState(DEFAULT_VALUES.gemeniApiKey);
  const [imageHostApiKey, setImageHostApiKey] = useState(DEFAULT_VALUES.imageHostApiKey);
  const [imageHostApiUrl, setImageHostApiUrl] = useState(DEFAULT_VALUES.imageHostApiUrl);
  const [videoHostToken, setVideoHostToken] = useState(DEFAULT_VALUES.videoHostToken);
  const [videoHostApiUrl, setVideoHostApiUrl] = useState(DEFAULT_VALUES.videoHostApiUrl);
  
  // UI state
  const [showGemeniKey, setShowGemeniKey] = useState(false);
  const [showImageKey, setShowImageKey] = useState(false);
  const [showVideoToken, setShowVideoToken] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Fetch existing WebCore config on component mount
  useEffect(() => {
    fetchWebCoreConfig();
  }, []);

  const fetchWebCoreConfig = async () => {
    try {
      setFetchLoading(true);
      const response = await GETDATA("/v1/web-core");

      if (response?.success && response?.data) {
        const data = response.data;
        setConfigId(data._id || null);

        // Set form fields (use existing data or defaults)
        setFrontendUrl(data.frontendUrl || DEFAULT_VALUES.frontendUrl);
        setGemeniApiKey(data.gemeniApiKey || DEFAULT_VALUES.gemeniApiKey);
        setImageHostApiKey(data.imageHostApiKey || DEFAULT_VALUES.imageHostApiKey);
        setImageHostApiUrl(data.imageHostApiUrl || DEFAULT_VALUES.imageHostApiUrl);
        setVideoHostToken(data.videoHostToken || DEFAULT_VALUES.videoHostToken);
        setVideoHostApiUrl(data.videoHostApiUrl || DEFAULT_VALUES.videoHostApiUrl);
      }
    } catch (error: any) {
      console.error("Error fetching WebCore config:", error);
      toast.error("Failed to fetch WebCore configuration");
    } finally {
      setFetchLoading(false);
    }
  };

  // Reset to defaults
  const resetToDefaults = () => {
    setFrontendUrl(DEFAULT_VALUES.frontendUrl);
    setGemeniApiKey(DEFAULT_VALUES.gemeniApiKey);
    setImageHostApiKey(DEFAULT_VALUES.imageHostApiKey);
    setImageHostApiUrl(DEFAULT_VALUES.imageHostApiUrl);
    setVideoHostToken(DEFAULT_VALUES.videoHostToken);
    setVideoHostApiUrl(DEFAULT_VALUES.videoHostApiUrl);
    toast.info("Reset to default values");
  };

  // Copy to clipboard
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast.success("Copied to clipboard");
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
    // Frontend URL validation
    if (!frontendUrl.trim()) {
      toast.error("Frontend URL is required");
      return false;
    }

    if (!isValidUrl(frontendUrl)) {
      toast.error("Please enter a valid Frontend URL");
      return false;
    }

    // Gemini API Key validation
    if (!gemeniApiKey.trim()) {
      toast.error("Gemini API Key is required");
      return false;
    }

    if (gemeniApiKey.length < 20) {
      toast.error("Gemini API Key should be at least 20 characters long");
      return false;
    }

    // Image Host API Key validation
    if (!imageHostApiKey.trim()) {
      toast.error("Image Host API Key is required");
      return false;
    }

    if (imageHostApiKey.length < 10) {
      toast.error("Image Host API Key should be at least 10 characters long");
      return false;
    }

    // Image Host URL validation
    if (!imageHostApiUrl.trim()) {
      toast.error("Image Host API URL is required");
      return false;
    }

    if (!isValidUrl(imageHostApiUrl)) {
      toast.error("Please enter a valid Image Host API URL");
      return false;
    }

    // Video Host Token validation
    if (!videoHostToken.trim()) {
      toast.error("Video Host Token is required");
      return false;
    }

    if (videoHostToken.length < 10) {
      toast.error("Video Host Token should be at least 10 characters long");
      return false;
    }

    // Video Host URL validation
    if (!videoHostApiUrl.trim()) {
      toast.error("Video Host API URL is required");
      return false;
    }

    if (!isValidUrl(videoHostApiUrl)) {
      toast.error("Please enter a valid Video Host API URL");
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
        frontendUrl,
        gemeniApiKey,
        imageHostApiKey,
        imageHostApiUrl,
        videoHostToken,
        videoHostApiUrl,
      };

      let response;

      if (configId) {
        // Update existing config
        response = await PATCHDATA(`/v1/web-core/${configId}`, data);
      } else {
        // Create new config
        response = await POSTDATA("/v1/web-core", data);
      }

      if (!response?.success) {
        throw new Error(response?.message || "Failed to save WebCore configuration");
      }

      toast.success(`WebCore configuration ${configId ? "updated" : "created"} successfully!`);
      
      // Refresh data to get latest
      fetchWebCoreConfig();
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
    <TooltipProvider>
      <div className="container mx-auto py-6 max-w-4xl">
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Server className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl font-bold">
                Web Core Configuration
              </CardTitle>
            </div>
            <CardDescription>
              Configure core web services including frontend URL, API keys, and service endpoints.
              Only one configuration will be saved.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-6">
                {/* Frontend URL */}
                <div className="space-y-2">
                  <Label htmlFor="frontendUrl" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Frontend URL <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="frontendUrl"
                        placeholder="https://yourdomain.com"
                        value={frontendUrl}
                        onChange={(e) => setFrontendUrl(e.target.value)}
                        disabled={loading}
                        className="pr-10"
                      />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => copyToClipboard(frontendUrl, "frontendUrl")}
                          >
                            {copiedField === "frontendUrl" ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copy URL</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your frontend application URL (used for CORS and redirects)
                  </p>
                </div>

                <Separator />

                {/* Reset to Defaults */}
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-medium">Reset Configuration</h4>
                    <p className="text-xs text-muted-foreground">
                      Restore all values to their default settings
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={resetToDefaults}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reset to Defaults
                  </Button>
                </div>

                {/* Info Alert */}
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Configuration Info</AlertTitle>
                  <AlertDescription>
                    These settings control your application`s core functionality.
                    Make sure to use valid API keys and endpoints for production.
                  </AlertDescription>
                </Alert>
              </TabsContent>

              <TabsContent value="services" className="space-y-8">
                {/* Gemini AI Service */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Google Gemini AI</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gemeniApiKey" className="flex items-center gap-2">
                      Gemini API Key <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="gemeniApiKey"
                          type={showGemeniKey ? "text" : "password"}
                          placeholder="Enter your Gemini API key"
                          value={gemeniApiKey}
                          onChange={(e) => setGemeniApiKey(e.target.value)}
                          disabled={loading}
                          className="pr-20"
                        />
                        <div className="absolute right-0 top-0 h-full flex">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-full px-2"
                                onClick={() => copyToClipboard(gemeniApiKey, "gemeniApiKey")}
                              >
                                {copiedField === "gemeniApiKey" ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Copy API Key</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-full px-2"
                                onClick={() => setShowGemeniKey(!showGemeniKey)}
                              >
                                {showGemeniKey ? (
                                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {showGemeniKey ? "Hide" : "Show"} API Key
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground">
                        {SERVICE_INFO.gemeni.description}
                      </p>
                      <a
                        href={SERVICE_INFO.gemeni.docs}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        Documentation
                      </a>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Image Host Service */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Image className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Image Hosting</h3>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imageHostApiUrl" className="flex items-center gap-2">
                      Image Host API URL <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="imageHostApiUrl"
                          placeholder="https://api.example.com/upload"
                          value={imageHostApiUrl}
                          onChange={(e) => setImageHostApiUrl(e.target.value)}
                          disabled={loading}
                          className="pr-10"
                        />
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => copyToClipboard(imageHostApiUrl, "imageHostApiUrl")}
                            >
                              {copiedField === "imageHostApiUrl" ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copy URL</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imageHostApiKey" className="flex items-center gap-2">
                      Image Host API Key <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="imageHostApiKey"
                          type={showImageKey ? "text" : "password"}
                          placeholder="Enter your Image Host API key"
                          value={imageHostApiKey}
                          onChange={(e) => setImageHostApiKey(e.target.value)}
                          disabled={loading}
                          className="pr-20"
                        />
                        <div className="absolute right-0 top-0 h-full flex">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-full px-2"
                                onClick={() => copyToClipboard(imageHostApiKey, "imageHostApiKey")}
                              >
                                {copiedField === "imageHostApiKey" ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Copy API Key</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-full px-2"
                                onClick={() => setShowImageKey(!showImageKey)}
                              >
                                {showImageKey ? (
                                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {showImageKey ? "Hide" : "Show"} API Key
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground">
                        {SERVICE_INFO.freeimage.description}
                      </p>
                      <a
                        href={SERVICE_INFO.freeimage.docs}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        Documentation
                      </a>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Video Host Service */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Video className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Video Hosting</h3>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="videoHostApiUrl" className="flex items-center gap-2">
                      Video Host API URL <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="videoHostApiUrl"
                          placeholder="https://api.example.com/upload"
                          value={videoHostApiUrl}
                          onChange={(e) => setVideoHostApiUrl(e.target.value)}
                          disabled={loading}
                          className="pr-10"
                        />
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => copyToClipboard(videoHostApiUrl, "videoHostApiUrl")}
                            >
                              {copiedField === "videoHostApiUrl" ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copy URL</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="videoHostToken" className="flex items-center gap-2">
                      Video Host Token <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="videoHostToken"
                          type={showVideoToken ? "text" : "password"}
                          placeholder="Enter your Video Host token"
                          value={videoHostToken}
                          onChange={(e) => setVideoHostToken(e.target.value)}
                          disabled={loading}
                          className="pr-20"
                        />
                        <div className="absolute right-0 top-0 h-full flex">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-full px-2"
                                onClick={() => copyToClipboard(videoHostToken, "videoHostToken")}
                              >
                                {copiedField === "videoHostToken" ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Copy Token</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-full px-2"
                                onClick={() => setShowVideoToken(!showVideoToken)}
                              >
                                {showVideoToken ? (
                                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {showVideoToken ? "Hide" : "Show"} Token
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground">
                        {SERVICE_INFO.pcloud.description}
                      </p>
                      <a
                        href={SERVICE_INFO.pcloud.docs}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        Documentation
                      </a>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                {/* Security Overview */}
                <Alert variant="default" className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                  <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertTitle className="text-blue-800 dark:text-blue-300">Security Overview</AlertTitle>
                  <AlertDescription className="text-blue-700 dark:text-blue-400">
                    All sensitive data (API keys, tokens) are stored encrypted in the database.
                    Never share these credentials publicly.
                  </AlertDescription>
                </Alert>

                {/* Security Recommendations */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Security Recommendations</h3>
                  
                  <div className="grid gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <Key className="h-5 w-5 text-primary" />
                          <div>
                            <h4 className="font-medium">API Key Rotation</h4>
                            <p className="text-sm text-muted-foreground">
                              Regularly rotate your API keys and tokens. Update them in this dashboard
                              when you generate new ones from your service providers.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <Globe className="h-5 w-5 text-primary" />
                          <div>
                            <h4 className="font-medium">CORS Configuration</h4>
                            <p className="text-sm text-muted-foreground">
                              Ensure your frontend URL is correctly configured to prevent unauthorized
                              cross-origin requests to your backend.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <Shield className="h-5 w-5 text-primary" />
                          <div>
                            <h4 className="font-medium">Environment Separation</h4>
                            <p className="text-sm text-muted-foreground">
                              Use different API keys for development, staging, and production environments.
                              Never use production keys in development.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Current Configuration Summary */}
                {configId && (
                  <div className="rounded-lg bg-muted/30 p-4">
                    <h4 className="text-sm font-medium mb-2">Current Configuration</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Frontend URL:</span>
                        <span className="font-mono">{frontendUrl.substring(0, 30)}...</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Gemini API Key:</span>
                        <span className="font-mono">••••••••••••••••</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Image Host Key:</span>
                        <span className="font-mono">••••••••••••••••</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Video Host Token:</span>
                        <span className="font-mono">••••••••••••••••</span>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <Separator className="my-6" />

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
    </TooltipProvider>
  );
}