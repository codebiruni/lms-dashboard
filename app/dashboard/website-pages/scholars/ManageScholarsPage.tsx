/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import {
  UploadCloud,
  Loader2,
  Plus,
  Trash2,
  Facebook,
  Twitter,
  Linkedin,
  ChevronRight,
  ChevronLeft,
  Save,
  Target,
  Eye,
  Users,
  Award,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import POSTDATA from "@/app/default/functions/Post";
import GETDATA from "@/app/default/functions/GetData";
import PATCHDATA from "@/app/default/functions/Patch";

// Types based on the schema
interface Scholar {
  name: string;
  title: string;
  description: string;
}

interface Stat {
  title: string;
  value: string;
}

interface AboutPageFormData {
  baseText: string;
  bannerText: {
    blackText: string;
    colorText: string;
  };
  shortDescription?: string;
  missionTitle?: string;
  missionDescription?: string;
  visionTitle?: string;
  visionDescription?: string;
  teamSectionTitle?: string;
  scholarSectionTitle?: string;
  scholars: Scholar[];
  stats: Stat[];
}

// Tab order for navigation
const TAB_ORDER = [
  "basic",
  "banner",
  "mission-vision",
  "team",
  "scholars",
  "stats",
];

export default function ManageScholarsPage() {
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [pageId, setPageId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("basic");

  // Initialize react-hook-form
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<AboutPageFormData>({
    defaultValues: {
      baseText: "",
      bannerText: {
        blackText: "",
        colorText: "",
      },
      shortDescription: "",
      missionTitle: "",
      missionDescription: "",
      visionTitle: "",
      visionDescription: "",
      teamSectionTitle: "",
      scholarSectionTitle: "",
      scholars: [{ name: "", title: "", description: "" }],
      stats: [{ title: "", value: "" }],
    },
  });

  // UseFieldArray for dynamic arrays
  const {
    fields: scholarFields,
    append: appendScholar,
    remove: removeScholar,
  } = useFieldArray({
    control,
    name: "scholars",
  });

  const {
    fields: statFields,
    append: appendStat,
    remove: removeStat,
  } = useFieldArray({
    control,
    name: "stats",
  });

  // Track which tabs have been visited/validated
  const [validatedTabs, setValidatedTabs] = useState<Set<string>>(new Set());

  // Watch form values for validation
  const watchedValues = watch();

  // Fetch existing data on component mount
  useEffect(() => {
    fetchPageData();
  }, []);

  const fetchPageData = async () => {
    try {
      setFetchLoading(true);
      const response = await GETDATA("/v1/scholars-page");

      if (response?.success && response?.data) {
        const data = response.data;
        setPageId(data._id || null);

        // Reset form with fetched data
        reset({
          baseText: data.baseText || "",
          bannerText: {
            blackText: data.bannerText?.blackText || "",
            colorText: data.bannerText?.colorText || "",
          },
          shortDescription: data.shortDescription || "",
          missionTitle: data.missionTitle || "",
          missionDescription: data.missionDescription || "",
          visionTitle: data.visionTitle || "",
          visionDescription: data.visionDescription || "",
          teamSectionTitle: data.teamSectionTitle || "",
          scholarSectionTitle: data.scholarSectionTitle || "",
          scholars: data.scholars?.length > 0 
            ? data.scholars 
            : [{ name: "", title: "", description: "" }],
          stats: data.stats?.length > 0 
            ? data.stats 
            : [{ title: "", value: "" }],
        });

        // Mark all tabs as validated since we have existing data
        setValidatedTabs(new Set(TAB_ORDER));
      }
    } catch (error: any) {
      console.error("Error fetching page data:", error);
      toast.error("Failed to fetch page data");
    } finally {
      setFetchLoading(false);
    }
  };

  // Validation functions for each tab
  const validateBasicTab = (): boolean => {
    const baseText = watchedValues.baseText;
    const shortDescription = watchedValues.shortDescription;
    
    if (!baseText?.trim()) {
      toast.error("Base text is required");
      return false;
    }

    if (!shortDescription?.trim()) {
      toast.error("Short description is required");
      return false;
    }

    return true;
  };

  const validateBannerTab = (): boolean => {
    const blackText = watchedValues.bannerText?.blackText;
    const colorText = watchedValues.bannerText?.colorText;
    
    if (!blackText?.trim()) {
      toast.error("Banner black text is required");
      return false;
    }

    if (!colorText?.trim()) {
      toast.error("Banner color text is required");
      return false;
    }

    return true;
  };

  const validateMissionVisionTab = (): boolean => {
    const missionTitle = watchedValues.missionTitle;
    const missionDescription = watchedValues.missionDescription;
    const visionTitle = watchedValues.visionTitle;
    const visionDescription = watchedValues.visionDescription;

    if (!missionTitle?.trim()) {
      toast.error("Mission title is required");
      return false;
    }

    if (!missionDescription?.trim()) {
      toast.error("Mission description is required");
      return false;
    }

    if (!visionTitle?.trim()) {
      toast.error("Vision title is required");
      return false;
    }

    if (!visionDescription?.trim()) {
      toast.error("Vision description is required");
      return false;
    }

    return true;
  };

  const validateTeamTab = (): boolean => {
    const teamSectionTitle = watchedValues.teamSectionTitle;
    
    if (!teamSectionTitle?.trim()) {
      toast.error("Team section title is required");
      return false;
    }

    return true;
  };

  const validateScholarsTab = (): boolean => {
    const scholarSectionTitle = watchedValues.scholarSectionTitle;
    const scholars = watchedValues.scholars;
    
    if (!scholarSectionTitle?.trim()) {
      toast.error("Scholars section title is required");
      return false;
    }

    // Check if at least one scholar has data
    const hasValidScholar = scholars?.some(
      scholar => scholar?.name?.trim() || scholar?.title?.trim()
    );

    if (!hasValidScholar) {
      toast.error("At least one scholar is required");
      return false;
    }

    return true;
  };

  const validateStatsTab = (): boolean => {
    const stats = watchedValues.stats;
    
    // Check if at least one stat has data
    const hasValidStat = stats?.some(
      stat => stat?.title?.trim() && stat?.value?.trim()
    );

    if (!hasValidStat) {
      toast.error("At least one statistic with title and value is required");
      return false;
    }

    return true;
  };

  // Navigation handlers
  const handleNext = () => {
    const currentIndex = TAB_ORDER.indexOf(activeTab);
    
    let isValid = false;
    
    switch (activeTab) {
      case "basic":
        isValid = validateBasicTab();
        break;
      case "banner":
        isValid = validateBannerTab();
        break;
      case "mission-vision":
        isValid = validateMissionVisionTab();
        break;
      case "team":
        isValid = validateTeamTab();
        break;
      case "scholars":
        isValid = validateScholarsTab();
        break;
      case "stats":
        isValid = validateStatsTab();
        break;
      default:
        isValid = true;
    }

    if (isValid) {
      setValidatedTabs(prev => new Set(prev).add(activeTab));
      
      if (currentIndex < TAB_ORDER.length - 1) {
        setActiveTab(TAB_ORDER[currentIndex + 1]);
      }
    }
  };

  const handlePrevious = () => {
    const currentIndex = TAB_ORDER.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(TAB_ORDER[currentIndex - 1]);
    }
  };

  const handleTabChange = (tab: string) => {
    if (validatedTabs.has(tab) || tab === activeTab) {
      setActiveTab(tab);
    } else {
      toast.error("Please complete the current tab first");
    }
  };

  // Submit handler - sends JSON data
  const onSubmit = async (data: AboutPageFormData) => {
    // Validate all tabs
    if (!validateBasicTab()) return;
    if (!validateBannerTab()) return;
    if (!validateMissionVisionTab()) return;
    if (!validateTeamTab()) return;
    if (!validateScholarsTab()) return;
    if (!validateStatsTab()) return;

    try {
      setLoading(true);

      // Clean up the data before sending
      const cleanedData = {
        baseText: data.baseText,
        bannerText: {
          blackText: data.bannerText.blackText,
          colorText: data.bannerText.colorText,
        },
        shortDescription: data.shortDescription || undefined,
        missionTitle: data.missionTitle || undefined,
        missionDescription: data.missionDescription || undefined,
        visionTitle: data.visionTitle || undefined,
        visionDescription: data.visionDescription || undefined,
        teamSectionTitle: data.teamSectionTitle || undefined,
        scholarSectionTitle: data.scholarSectionTitle || undefined,
        scholars: data.scholars
          .filter(scholar => scholar.name?.trim() || scholar.title?.trim())
          .map(scholar => ({
            name: scholar.name || "",
            title: scholar.title || "",
            description: scholar.description || "",
          })),
        stats: data.stats
          .filter(stat => stat.title?.trim() && stat.value?.trim())
          .map(stat => ({
            title: stat.title || "",
            value: stat.value || "",
          })),
      };

      let response;

      if (pageId) {
        response = await PATCHDATA(`/v1/scholars-page/${pageId}`, cleanedData);
      } else {
        response = await POSTDATA("/v1/scholars-page", cleanedData);
      }

      if (!response?.success) {
        throw new Error(response?.message || "Failed to save page");
      }

      toast.success(`Page ${pageId ? "updated" : "created"} successfully!`);
      fetchPageData(); // Refresh data to get updated _id
    } catch (error: any) {
      console.error("Submit error:", error);
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

  const isLastTab = activeTab === "stats";
  const isFirstTab = activeTab === "basic";

  return (
    <div className="container mx-auto py-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Manage About/Scholars Page {pageId ? "(Edit Mode)" : "(Create New)"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure your about us and scholars page. Only one configuration will be saved.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger 
                  value="basic" 
                  className={validatedTabs.has("basic") ? "border-green-500 border" : ""}
                >
                  Basic Info {validatedTabs.has("basic") && "✓"}
                </TabsTrigger>
                <TabsTrigger 
                  value="banner"
                  className={validatedTabs.has("banner") ? "border-green-500 border" : ""}
                >
                  Banner {validatedTabs.has("banner") && "✓"}
                </TabsTrigger>
                <TabsTrigger 
                  value="mission-vision"
                  className={validatedTabs.has("mission-vision") ? "border-green-500 border" : ""}
                >
                  Mission & Vision {validatedTabs.has("mission-vision") && "✓"}
                </TabsTrigger>
                <TabsTrigger 
                  value="team"
                  className={validatedTabs.has("team") ? "border-green-500 border" : ""}
                >
                  Team {validatedTabs.has("team") && "✓"}
                </TabsTrigger>
                <TabsTrigger 
                  value="scholars"
                  className={validatedTabs.has("scholars") ? "border-green-500 border" : ""}
                >
                  Scholars {validatedTabs.has("scholars") && "✓"}
                </TabsTrigger>
                <TabsTrigger 
                  value="stats"
                  className={validatedTabs.has("stats") ? "border-green-500 border" : ""}
                >
                  Stats {validatedTabs.has("stats") && "✓"}
                </TabsTrigger>
              </TabsList>

              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>
                      Base Text <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      placeholder="Enter base text for the page"
                      {...register("baseText", { 
                        required: "Base text is required",
                        minLength: {
                          value: 1,
                          message: "Base text is required"
                        }
                      })}
                      rows={3}
                    />
                    {errors.baseText && (
                      <p className="text-sm text-red-500">{errors.baseText.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Short Description <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      placeholder="Enter short description"
                      {...register("shortDescription", { 
                        required: "Short description is required" 
                      })}
                      rows={3}
                    />
                    {errors.shortDescription && (
                      <p className="text-sm text-red-500">{errors.shortDescription.message}</p>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Banner Tab */}
              <TabsContent value="banner" className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>
                      Banner Black Text <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="e.g., About"
                      {...register("bannerText.blackText", { 
                        required: "Banner black text is required" 
                      })}
                    />
                    {errors.bannerText?.blackText && (
                      <p className="text-sm text-red-500">{errors.bannerText.blackText.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Banner Color Text <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="e.g., Us"
                      {...register("bannerText.colorText", { 
                        required: "Banner color text is required" 
                      })}
                    />
                    {errors.bannerText?.colorText && (
                      <p className="text-sm text-red-500">{errors.bannerText.colorText.message}</p>
                    )}
                  </div>
                </div>

                <div className="rounded-lg bg-muted/30 p-4">
                  <p className="text-sm font-medium">Preview:</p>
                  <p className="text-xl">
                    <span className="text-foreground">{watchedValues.bannerText?.blackText || "About"}</span>{" "}
                    <span className="text-primary">{watchedValues.bannerText?.colorText || "Us"}</span>
                  </p>
                </div>
              </TabsContent>

              {/* Mission & Vision Tab */}
              <TabsContent value="mission-vision" className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Mission</h3>
                  </div>
                  
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label>
                        Mission Title <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        placeholder="Enter mission title"
                        {...register("missionTitle", { 
                          required: "Mission title is required" 
                        })}
                      />
                      {errors.missionTitle && (
                        <p className="text-sm text-red-500">{errors.missionTitle.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Mission Description <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        placeholder="Enter mission description"
                        {...register("missionDescription", { 
                          required: "Mission description is required" 
                        })}
                        rows={4}
                      />
                      {errors.missionDescription && (
                        <p className="text-sm text-red-500">{errors.missionDescription.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Vision</h3>
                  </div>
                  
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label>
                        Vision Title <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        placeholder="Enter vision title"
                        {...register("visionTitle", { 
                          required: "Vision title is required" 
                        })}
                      />
                      {errors.visionTitle && (
                        <p className="text-sm text-red-500">{errors.visionTitle.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Vision Description <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        placeholder="Enter vision description"
                        {...register("visionDescription", { 
                          required: "Vision description is required" 
                        })}
                        rows={4}
                      />
                      {errors.visionDescription && (
                        <p className="text-sm text-red-500">{errors.visionDescription.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Team Tab */}
              <TabsContent value="team" className="space-y-4">
                <div className="space-y-2">
                  <Label>
                    Team Section Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="e.g., Meet Our Team"
                    {...register("teamSectionTitle", { 
                      required: "Team section title is required" 
                    })}
                  />
                  {errors.teamSectionTitle && (
                    <p className="text-sm text-red-500">{errors.teamSectionTitle.message}</p>
                  )}
                </div>

                <div className="rounded-lg bg-muted/30 p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Team management has been removed from the schema. Only the section title is available.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    If you need team members, please update the schema to include them.
                  </p>
                </div>
              </TabsContent>

              {/* Scholars Tab */}
              <TabsContent value="scholars" className="space-y-4">
                <div className="space-y-2">
                  <Label>
                    Scholars Section Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="e.g., Our Scholars"
                    {...register("scholarSectionTitle", { 
                      required: "Scholars section title is required" 
                    })}
                  />
                  {errors.scholarSectionTitle && (
                    <p className="text-sm text-red-500">{errors.scholarSectionTitle.message}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <Label>Scholars</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendScholar({ name: "", title: "", description: "" })}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Scholar
                  </Button>
                </div>

                {scholarFields.map((field, index) => (
                  <Card key={field.id} className="relative border">
                    <CardContent className="pt-6">
                      <div className="grid gap-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                              placeholder="Scholar name"
                              {...register(`scholars.${index}.name`)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                              placeholder="e.g., Research Fellow"
                              {...register(`scholars.${index}.title`)}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            placeholder="Brief description"
                            {...register(`scholars.${index}.description`)}
                            rows={2}
                          />
                        </div>

                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeScholar(index)}
                            className="text-red-500 hover:text-red-600"
                            disabled={scholarFields.length <= 1}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove Scholar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <p className="text-sm text-muted-foreground">
                  At least one scholar is required
                </p>
              </TabsContent>

              {/* Stats Tab */}
              <TabsContent value="stats" className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Statistics</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendStat({ title: "", value: "" })}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Stat
                  </Button>
                </div>

                {statFields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-12 gap-2 rounded-lg border p-4">
                    <div className="col-span-5">
                      <Input
                        placeholder="Stat title (e.g., Years of Experience)"
                        {...register(`stats.${index}.title`, {
                          required: "Title is required"
                        })}
                      />
                    </div>
                    <div className="col-span-5">
                      <Input
                        placeholder="Stat value (e.g., 10+)"
                        {...register(`stats.${index}.value`, {
                          required: "Value is required"
                        })}
                      />
                    </div>
                    <div className="col-span-2 flex items-center justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeStat(index)}
                        className="text-red-500 hover:text-red-600"
                        disabled={statFields.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <p className="text-sm text-muted-foreground">
                  At least one statistic with title and value is required
                </p>
              </TabsContent>
            </Tabs>

            <Separator className="my-6" />

            {/* Navigation and Submit Buttons */}
            <div className="flex justify-between">
              <Button
                onClick={handlePrevious}
                disabled={isFirstTab || loading}
                variant="outline"
                size="lg"
                type="button"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              {isLastTab ? (
                <Button
                  type="submit"
                  disabled={loading}
                  size="lg"
                  className="min-w-50 bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {pageId ? "Update Page" : "Create Page"}
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={loading}
                  size="lg"
                  className="min-w-50"
                  type="button"
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}