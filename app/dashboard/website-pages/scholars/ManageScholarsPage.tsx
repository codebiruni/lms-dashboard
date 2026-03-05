/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
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
interface TeamMember {
  name: string;
  position: string;
  bio: string;
  image: string | null;
  facebook: string;
  linkedin: string;
  twitter: string;
}

interface Scholar {
  name: string;
  title: string;
  image: string | null;
  description: string;
}

interface Stat {
  title: string;
  value: string;
}

interface AboutPageData {
  _id?: string;
  baseText: string;
  bannerText: {
    blackText: string;
    colorText: string;
  };
  bannerImage: string | null;
  shortDescription: string;
  missionTitle: string;
  missionDescription: string;
  missionImage: string | null;
  visionTitle: string;
  visionDescription: string;
  visionImage: string | null;
  teamSectionTitle: string;
  teamMembers: TeamMember[];
  scholarSectionTitle: string;
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

  // Basic fields
  const [baseText, setBaseText] = useState("");
  const [shortDescription, setShortDescription] = useState("");

  // Banner fields
  const [bannerBlackText, setBannerBlackText] = useState("");
  const [bannerColorText, setBannerColorText] = useState("");
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [bannerImagePreview, setBannerImagePreview] = useState<string | null>(null);

  // Mission fields
  const [missionTitle, setMissionTitle] = useState("");
  const [missionDescription, setMissionDescription] = useState("");
  const [missionImage, setMissionImage] = useState<File | null>(null);
  const [missionImagePreview, setMissionImagePreview] = useState<string | null>(null);

  // Vision fields
  const [visionTitle, setVisionTitle] = useState("");
  const [visionDescription, setVisionDescription] = useState("");
  const [visionImage, setVisionImage] = useState<File | null>(null);
  const [visionImagePreview, setVisionImagePreview] = useState<string | null>(null);

  // Team section
  const [teamSectionTitle, setTeamSectionTitle] = useState("");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { name: "", position: "", bio: "", image: null, facebook: "", linkedin: "", twitter: "" },
  ]);
  const [teamMemberImages, setTeamMemberImages] = useState<(File | null)[]>(
    [null]
  );
  const [teamMemberImagePreviews, setTeamMemberImagePreviews] = useState<
    (string | null)[]
  >([null]);

  // Scholars section
  const [scholarSectionTitle, setScholarSectionTitle] = useState("");
  const [scholars, setScholars] = useState<Scholar[]>([
    { name: "", title: "", image: null, description: "" },
  ]);
  const [scholarImages, setScholarImages] = useState<(File | null)[]>([null]);
  const [scholarImagePreviews, setScholarImagePreviews] = useState<
    (string | null)[]
  >([null]);

  // Stats section
  const [stats, setStats] = useState<Stat[]>([
    { title: "", value: "" },
  ]);

  // Track which tabs have been visited/validated
  const [validatedTabs, setValidatedTabs] = useState<Set<string>>(new Set());

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

        // Set basic fields
        setBaseText(data.baseText || "");
        setShortDescription(data.shortDescription || "");

        // Set banner fields
        setBannerBlackText(data.bannerText?.blackText || "");
        setBannerColorText(data.bannerText?.colorText || "");
        setBannerImagePreview(data.bannerImage || null);

        // Set mission fields
        setMissionTitle(data.missionTitle || "");
        setMissionDescription(data.missionDescription || "");
        setMissionImagePreview(data.missionImage || null);

        // Set vision fields
        setVisionTitle(data.visionTitle || "");
        setVisionDescription(data.visionDescription || "");
        setVisionImagePreview(data.visionImage || null);

        // Set team section
        setTeamSectionTitle(data.teamSectionTitle || "");
        if (data.teamMembers?.length > 0) {
          setTeamMembers(data.teamMembers);
          setTeamMemberImages(new Array(data.teamMembers.length).fill(null));
          setTeamMemberImagePreviews(
            data.teamMembers.map((m: TeamMember) => m.image || null)
          );
        }

        // Set scholars section
        setScholarSectionTitle(data.scholarSectionTitle || "");
        if (data.scholars?.length > 0) {
          setScholars(data.scholars);
          setScholarImages(new Array(data.scholars.length).fill(null));
          setScholarImagePreviews(
            data.scholars.map((s: Scholar) => s.image || null)
          );
        }

        // Set stats
        if (data.stats?.length > 0) {
          setStats(data.stats);
        }

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

  // Image handlers
  const handleImageChange = (
    file: File,
    setImage: React.Dispatch<React.SetStateAction<File | null>>,
    setPreview: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleImageDrop = (
    e: React.DragEvent<HTMLDivElement>,
    setImage: React.Dispatch<React.SetStateAction<File | null>>,
    setPreview: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      handleImageChange(e.dataTransfer.files[0], setImage, setPreview);
    }
  };

  // Team member handlers
  const addTeamMember = () => {
    setTeamMembers((prev) => [
      ...prev,
      { name: "", position: "", bio: "", image: null, facebook: "", linkedin: "", twitter: "" },
    ]);
    setTeamMemberImages((prev) => [...prev, null]);
    setTeamMemberImagePreviews((prev) => [...prev, null]);
  };

  const removeTeamMember = (index: number) => {
    setTeamMembers((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
    setTeamMemberImages((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
    setTeamMemberImagePreviews((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const updateTeamMember = (
    index: number,
    field: keyof TeamMember,
    value: string
  ) => {
    setTeamMembers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleTeamMemberImageChange = (
    index: number,
    file: File,
    preview: string
  ) => {
    setTeamMemberImages((prev) => {
      const updated = [...prev];
      updated[index] = file;
      return updated;
    });
    setTeamMemberImagePreviews((prev) => {
      const updated = [...prev];
      updated[index] = preview;
      return updated;
    });
  };

  // Scholar handlers
  const addScholar = () => {
    setScholars((prev) => [
      ...prev,
      { name: "", title: "", image: null, description: "" },
    ]);
    setScholarImages((prev) => [...prev, null]);
    setScholarImagePreviews((prev) => [...prev, null]);
  };

  const removeScholar = (index: number) => {
    setScholars((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
    setScholarImages((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
    setScholarImagePreviews((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const updateScholar = (
    index: number,
    field: keyof Scholar,
    value: string
  ) => {
    setScholars((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleScholarImageChange = (
    index: number,
    file: File,
    preview: string
  ) => {
    setScholarImages((prev) => {
      const updated = [...prev];
      updated[index] = file;
      return updated;
    });
    setScholarImagePreviews((prev) => {
      const updated = [...prev];
      updated[index] = preview;
      return updated;
    });
  };

  // Stats handlers
  const addStat = () => {
    setStats((prev) => [...prev, { title: "", value: "" }]);
  };

  const removeStat = (index: number) => {
    setStats((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const updateStat = (index: number, field: keyof Stat, value: string) => {
    setStats((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Validation functions for each tab
  const validateBasicTab = (): boolean => {
    if (!baseText.trim()) {
      toast.error("Base text is required");
      return false;
    }

    if (!shortDescription.trim()) {
      toast.error("Short description is required");
      return false;
    }

    return true;
  };

  const validateBannerTab = (): boolean => {
    if (!bannerBlackText.trim()) {
      toast.error("Banner black text is required");
      return false;
    }

    if (!bannerColorText.trim()) {
      toast.error("Banner color text is required");
      return false;
    }

    if (!bannerImagePreview && !bannerImage) {
      toast.error("Banner image is required");
      return false;
    }

    return true;
  };

  const validateMissionVisionTab = (): boolean => {
    if (!missionTitle.trim()) {
      toast.error("Mission title is required");
      return false;
    }

    if (!missionDescription.trim()) {
      toast.error("Mission description is required");
      return false;
    }

    if (!missionImagePreview && !missionImage) {
      toast.error("Mission image is required");
      return false;
    }

    if (!visionTitle.trim()) {
      toast.error("Vision title is required");
      return false;
    }

    if (!visionDescription.trim()) {
      toast.error("Vision description is required");
      return false;
    }

    if (!visionImagePreview && !visionImage) {
      toast.error("Vision image is required");
      return false;
    }

    return true;
  };

  const validateTeamTab = (): boolean => {
    if (!teamSectionTitle.trim()) {
      toast.error("Team section title is required");
      return false;
    }

    // Check if at least one team member has data
    const hasValidMember = teamMembers.some(
      member => member.name.trim() || member.position.trim()
    );

    if (!hasValidMember) {
      toast.error("At least one team member is required");
      return false;
    }

    return true;
  };

  const validateScholarsTab = (): boolean => {
    if (!scholarSectionTitle.trim()) {
      toast.error("Scholars section title is required");
      return false;
    }

    // Check if at least one scholar has data
    const hasValidScholar = scholars.some(
      scholar => scholar.name.trim() || scholar.title.trim()
    );

    if (!hasValidScholar) {
      toast.error("At least one scholar is required");
      return false;
    }

    return true;
  };

  const validateStatsTab = (): boolean => {
    // Check if at least one stat has data
    const hasValidStat = stats.some(
      stat => stat.title.trim() && stat.value.trim()
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

  // Submit handler
  const handleSubmit = async () => {
    // Validate all tabs
    if (!validateBasicTab()) return;
    if (!validateBannerTab()) return;
    if (!validateMissionVisionTab()) return;
    if (!validateTeamTab()) return;
    if (!validateScholarsTab()) return;
    if (!validateStatsTab()) return;

    try {
      setLoading(true);

      const formData = new FormData();

      // Append basic fields
      formData.append("baseText", baseText);
      formData.append("shortDescription", shortDescription);

      // Append banner fields
      formData.append("bannerText[blackText]", bannerBlackText);
      formData.append("bannerText[colorText]", bannerColorText);
      if (bannerImage) {
        formData.append("bannerImage", bannerImage);
      }

      // Append mission fields
      formData.append("missionTitle", missionTitle);
      formData.append("missionDescription", missionDescription);
      if (missionImage) {
        formData.append("missionImage", missionImage);
      }

      // Append vision fields
      formData.append("visionTitle", visionTitle);
      formData.append("visionDescription", visionDescription);
      if (visionImage) {
        formData.append("visionImage", visionImage);
      }

      // Append team section
      formData.append("teamSectionTitle", teamSectionTitle);
      
      // Process team members
      const processedTeamMembers = teamMembers.map((member, index) => ({
        ...member,
        image: teamMemberImagePreviews[index]?.startsWith('blob:') ? null : teamMemberImagePreviews[index],
      }));
      formData.append("teamMembers", JSON.stringify(processedTeamMembers));

      // Append team member images
      teamMemberImages.forEach((image, index) => {
        if (image) {
          formData.append(`teamMemberImages`, image);
        }
      });

      // Append scholars section
      formData.append("scholarSectionTitle", scholarSectionTitle);
      
      // Process scholars
      const processedScholars = scholars.map((scholar, index) => ({
        ...scholar,
        image: scholarImagePreviews[index]?.startsWith('blob:') ? null : scholarImagePreviews[index],
      }));
      formData.append("scholars", JSON.stringify(processedScholars));

      // Append scholar images
      scholarImages.forEach((image, index) => {
        if (image) {
          formData.append(`scholarImages`, image);
        }
      });

      // Append stats
      formData.append("stats", JSON.stringify(stats));

      let response;

      if (pageId) {
        response = await PATCHDATA(`/v1/scholars-page/${pageId}`, formData);
      } else {
        response = await POSTDATA("/v1/scholars-page", formData);
      }

      if (!response?.success) {
        throw new Error(response?.message || "Failed to save page");
      }

      toast.success(`Page ${pageId ? "updated" : "created"} successfully!`);
      fetchPageData();
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
                    value={baseText}
                    onChange={(e) => setBaseText(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Short Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    placeholder="Enter short description"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    rows={3}
                  />
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
                    value={bannerBlackText}
                    onChange={(e) => setBannerBlackText(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Banner Color Text <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="e.g., Us"
                    value={bannerColorText}
                    onChange={(e) => setBannerColorText(e.target.value)}
                  />
                </div>
              </div>

              <div className="rounded-lg bg-muted/30 p-4">
                <p className="text-sm font-medium">Preview:</p>
                <p className="text-xl">
                  <span className="text-foreground">{bannerBlackText || "About"}</span>{" "}
                  <span className="text-primary">{bannerColorText || "Us"}</span>
                </p>
              </div>

              <div className="space-y-2">
                <Label>
                  Banner Image <span className="text-red-500">*</span>
                </Label>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleImageDrop(e, setBannerImage, setBannerImagePreview)}
                  className="relative flex h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/40 bg-muted/30 transition hover:border-primary"
                >
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    className="absolute inset-0 cursor-pointer opacity-0"
                    onChange={(e) =>
                      e.target.files &&
                      handleImageChange(e.target.files[0], setBannerImage, setBannerImagePreview)
                    }
                  />

                  {bannerImagePreview ? (
                    <div className="relative h-full w-full">
                      <Image
                        src={bannerImagePreview}
                        alt="banner preview"
                        fill
                        className="rounded-lg object-cover"
                      />
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="mb-2 h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Drag & drop banner image here or click to upload
                      </p>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Mission & Vision Tab */}
            <TabsContent value="mission-vision" className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Mission</h3>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>
                      Mission Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="Enter mission title"
                      value={missionTitle}
                      onChange={(e) => setMissionTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Mission Image <span className="text-red-500">*</span>
                    </Label>
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleImageDrop(e, setMissionImage, setMissionImagePreview)}
                      className="relative flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/40 bg-muted/30 transition hover:border-primary"
                    >
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp"
                        className="absolute inset-0 cursor-pointer opacity-0"
                        onChange={(e) =>
                          e.target.files &&
                          handleImageChange(e.target.files[0], setMissionImage, setMissionImagePreview)
                        }
                      />
                      {missionImagePreview ? (
                        <div className="relative h-full w-full">
                          <Image
                            src={missionImagePreview}
                            alt="mission"
                            fill
                            className="rounded-lg object-cover"
                          />
                        </div>
                      ) : (
                        <UploadCloud className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>
                    Mission Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    placeholder="Enter mission description"
                    value={missionDescription}
                    onChange={(e) => setMissionDescription(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Vision</h3>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>
                      Vision Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="Enter vision title"
                      value={visionTitle}
                      onChange={(e) => setVisionTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Vision Image <span className="text-red-500">*</span>
                    </Label>
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleImageDrop(e, setVisionImage, setVisionImagePreview)}
                      className="relative flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/40 bg-muted/30 transition hover:border-primary"
                    >
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp"
                        className="absolute inset-0 cursor-pointer opacity-0"
                        onChange={(e) =>
                          e.target.files &&
                          handleImageChange(e.target.files[0], setVisionImage, setVisionImagePreview)
                        }
                      />
                      {visionImagePreview ? (
                        <div className="relative h-full w-full">
                          <Image
                            src={visionImagePreview}
                            alt="vision"
                            fill
                            className="rounded-lg object-cover"
                          />
                        </div>
                      ) : (
                        <UploadCloud className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>
                    Vision Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    placeholder="Enter vision description"
                    value={visionDescription}
                    onChange={(e) => setVisionDescription(e.target.value)}
                    rows={4}
                  />
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
                  value={teamSectionTitle}
                  onChange={(e) => setTeamSectionTitle(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Team Members</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTeamMember}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Member
                </Button>
              </div>

              {teamMembers.map((member, index) => (
                <Card key={index} className="relative border">
                  <CardContent className="pt-6">
                    <div className="grid gap-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Name</Label>
                          <Input
                            placeholder="Member name"
                            value={member.name}
                            onChange={(e) =>
                              updateTeamMember(index, "name", e.target.value)
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Position</Label>
                          <Input
                            placeholder="e.g., CEO"
                            value={member.position}
                            onChange={(e) =>
                              updateTeamMember(index, "position", e.target.value)
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Bio</Label>
                        <Textarea
                          placeholder="Brief biography"
                          value={member.bio}
                          onChange={(e) =>
                            updateTeamMember(index, "bio", e.target.value)
                          }
                          rows={2}
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Profile Image</Label>
                          <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.preventDefault();
                              if (e.dataTransfer.files?.[0]) {
                                const file = e.dataTransfer.files[0];
                                handleTeamMemberImageChange(
                                  index,
                                  file,
                                  URL.createObjectURL(file)
                                );
                              }
                            }}
                            className="relative flex h-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/40 bg-muted/30 transition hover:border-primary"
                          >
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,.webp"
                              className="absolute inset-0 cursor-pointer opacity-0"
                              onChange={(e) =>
                                e.target.files &&
                                handleTeamMemberImageChange(
                                  index,
                                  e.target.files[0],
                                  URL.createObjectURL(e.target.files[0])
                                )
                              }
                            />
                            {teamMemberImagePreviews[index] ? (
                              <div className="relative h-full w-full">
                                <Image
                                  src={teamMemberImagePreviews[index]!}
                                  alt="member"
                                  fill
                                  className="rounded-lg object-cover"
                                />
                              </div>
                            ) : (
                              <UploadCloud className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Social Links</Label>
                          <Input
                            placeholder="Facebook URL"
                            value={member.facebook}
                            onChange={(e) =>
                              updateTeamMember(index, "facebook", e.target.value)
                            }
                            className="mb-2"
                          />
                          <Input
                            placeholder="LinkedIn URL"
                            value={member.linkedin}
                            onChange={(e) =>
                              updateTeamMember(index, "linkedin", e.target.value)
                            }
                            className="mb-2"
                          />
                          <Input
                            placeholder="Twitter URL"
                            value={member.twitter}
                            onChange={(e) =>
                              updateTeamMember(index, "twitter", e.target.value)
                            }
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTeamMember(index)}
                          className="text-red-500 hover:text-red-600"
                          disabled={teamMembers.length <= 1}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove Member
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Scholars Tab */}
            <TabsContent value="scholars" className="space-y-4">
              <div className="space-y-2">
                <Label>
                  Scholars Section Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="e.g., Our Scholars"
                  value={scholarSectionTitle}
                  onChange={(e) => setScholarSectionTitle(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Scholars</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addScholar}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Scholar
                </Button>
              </div>

              {scholars.map((scholar, index) => (
                <Card key={index} className="relative border">
                  <CardContent className="pt-6">
                    <div className="grid gap-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Name</Label>
                          <Input
                            placeholder="Scholar name"
                            value={scholar.name}
                            onChange={(e) =>
                              updateScholar(index, "name", e.target.value)
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Title</Label>
                          <Input
                            placeholder="e.g., Research Fellow"
                            value={scholar.title}
                            onChange={(e) =>
                              updateScholar(index, "title", e.target.value)
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          placeholder="Brief description"
                          value={scholar.description}
                          onChange={(e) =>
                            updateScholar(index, "description", e.target.value)
                          }
                          rows={2}
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Profile Image</Label>
                          <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.preventDefault();
                              if (e.dataTransfer.files?.[0]) {
                                const file = e.dataTransfer.files[0];
                                handleScholarImageChange(
                                  index,
                                  file,
                                  URL.createObjectURL(file)
                                );
                              }
                            }}
                            className="relative flex h-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/40 bg-muted/30 transition hover:border-primary"
                          >
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,.webp"
                              className="absolute inset-0 cursor-pointer opacity-0"
                              onChange={(e) =>
                                e.target.files &&
                                handleScholarImageChange(
                                  index,
                                  e.target.files[0],
                                  URL.createObjectURL(e.target.files[0])
                                )
                              }
                            />
                            {scholarImagePreviews[index] ? (
                              <div className="relative h-full w-full">
                                <Image
                                  src={scholarImagePreviews[index]!}
                                  alt="scholar"
                                  fill
                                  className="rounded-lg object-cover"
                                />
                              </div>
                            ) : (
                              <UploadCloud className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeScholar(index)}
                          className="text-red-500 hover:text-red-600"
                          disabled={scholars.length <= 1}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove Scholar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Stats Tab */}
            <TabsContent value="stats" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Statistics</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addStat}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Stat
                </Button>
              </div>

              {stats.map((stat, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 rounded-lg border p-4">
                  <div className="col-span-5">
                    <Input
                      placeholder="Stat title (e.g., Years of Experience)"
                      value={stat.title}
                      onChange={(e) => updateStat(index, "title", e.target.value)}
                    />
                  </div>
                  <div className="col-span-5">
                    <Input
                      placeholder="Stat value (e.g., 10+)"
                      value={stat.value}
                      onChange={(e) => updateStat(index, "value", e.target.value)}
                    />
                  </div>
                  <div className="col-span-2 flex items-center justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeStat(index)}
                      className="text-red-500 hover:text-red-600"
                      disabled={stats.length <= 1}
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
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {isLastTab ? (
              <Button
                onClick={handleSubmit}
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
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}