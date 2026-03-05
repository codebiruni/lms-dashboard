/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import {
  UploadCloud,
  Loader2,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Save,
  Star,
  Users,
  BookOpen,
  Smartphone,
  Award,
  BarChart,
  MessageCircle,
  Target,
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
interface FeatureItem {
  title: string;
  description: string;
  icon: string;
}

interface FeatureSection {
  title: string;
  description: string;
  image: string | null;
  features: FeatureItem[];
}

interface Stat {
  title: string;
  value: string;
}

interface Testimonial {
  name: string;
  role: string;
  image: string | null;
  message: string;
}

interface FeaturesPageData {
  _id?: string;
  baseText: string;
  bannerText: {
    blackText: string;
    colorText: string;
  };
  bannerImage: string | null;
  shortDescription: string;
  overviewTitle: string;
  overviewDescription: string;
  overviewImage: string | null;
  platformFeatures: FeatureSection[];
  instructorFeatures: FeatureSection[];
  studentFeatures: FeatureSection[];
  mobileAppFeatures: FeatureSection[];
  whyChooseUs: FeatureItem[];
  stats: Stat[];
  testimonials: Testimonial[];
  ctaTitle: string;
  ctaDescription: string;
  ctaButtonText: string;
  ctaImage: string | null;
}

// Tab order for navigation
const TAB_ORDER = [
  "basic",
  "banner",
  "overview",
  "platform",
  "instructor",
  "student",
  "mobile",
  "why-choose",
  "stats",
  "testimonials",
  "cta",
];

export default function ManageFeaturesPage() {
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

  // Overview fields
  const [overviewTitle, setOverviewTitle] = useState("");
  const [overviewDescription, setOverviewDescription] = useState("");
  const [overviewImage, setOverviewImage] = useState<File | null>(null);
  const [overviewImagePreview, setOverviewImagePreview] = useState<string | null>(null);

  // Feature sections
  const [platformFeatures, setPlatformFeatures] = useState<FeatureSection[]>([
    { title: "", description: "", image: null, features: [{ title: "", description: "", icon: "" }] },
  ]);

  const [instructorFeatures, setInstructorFeatures] = useState<FeatureSection[]>([
    { title: "", description: "", image: null, features: [{ title: "", description: "", icon: "" }] },
  ]);

  const [studentFeatures, setStudentFeatures] = useState<FeatureSection[]>([
    { title: "", description: "", image: null, features: [{ title: "", description: "", icon: "" }] },
  ]);

  const [mobileAppFeatures, setMobileAppFeatures] = useState<FeatureSection[]>([
    { title: "", description: "", image: null, features: [{ title: "", description: "", icon: "" }] },
  ]);

  // Why Choose Us
  const [whyChooseUs, setWhyChooseUs] = useState<FeatureItem[]>([
    { title: "", description: "", icon: "" },
  ]);

  // Stats
  const [stats, setStats] = useState<Stat[]>([
    { title: "", value: "" },
  ]);

  // Testimonials
  const [testimonials, setTestimonials] = useState<Testimonial[]>([
    { name: "", role: "", image: null, message: "" },
  ]);
  const [testimonialImages, setTestimonialImages] = useState<(File | null)[]>([null]);
  const [testimonialImagePreviews, setTestimonialImagePreviews] = useState<(string | null)[]>([null]);

  // CTA fields
  const [ctaTitle, setCtaTitle] = useState("");
  const [ctaDescription, setCtaDescription] = useState("");
  const [ctaButtonText, setCtaButtonText] = useState("");
  const [ctaImage, setCtaImage] = useState<File | null>(null);
  const [ctaImagePreview, setCtaImagePreview] = useState<string | null>(null);

  // Track which tabs have been visited/validated
  const [validatedTabs, setValidatedTabs] = useState<Set<string>>(new Set());

  // Fetch existing data on component mount
  useEffect(() => {
    fetchPageData();
  }, []);

  const fetchPageData = async () => {
    try {
      setFetchLoading(true);
      const response = await GETDATA("/v1/featres-page");

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

        // Set overview fields
        setOverviewTitle(data.overviewTitle || "");
        setOverviewDescription(data.overviewDescription || "");
        setOverviewImagePreview(data.overviewImage || null);

        // Set feature sections
        if (data.platformFeatures?.length > 0) {
          setPlatformFeatures(data.platformFeatures);
        }
        if (data.instructorFeatures?.length > 0) {
          setInstructorFeatures(data.instructorFeatures);
        }
        if (data.studentFeatures?.length > 0) {
          setStudentFeatures(data.studentFeatures);
        }
        if (data.mobileAppFeatures?.length > 0) {
          setMobileAppFeatures(data.mobileAppFeatures);
        }

        // Set why choose us
        if (data.whyChooseUs?.length > 0) {
          setWhyChooseUs(data.whyChooseUs);
        }

        // Set stats
        if (data.stats?.length > 0) {
          setStats(data.stats);
        }

        // Set testimonials
        if (data.testimonials?.length > 0) {
          setTestimonials(data.testimonials);
          setTestimonialImages(new Array(data.testimonials.length).fill(null));
          setTestimonialImagePreviews(
            data.testimonials.map((t: Testimonial) => t.image || null)
          );
        }

        // Set CTA fields
        setCtaTitle(data.ctaTitle || "");
        setCtaDescription(data.ctaDescription || "");
        setCtaButtonText(data.ctaButtonText || "");
        setCtaImagePreview(data.ctaImage || null);

        // Mark all tabs as validated since we have existing data
        setValidatedTabs(new Set(TAB_ORDER));
      }
    } catch (error: any) {
      console.error("Error fetching page data:", error);
      toast.error("Failed to fetch features page data");
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

  // Feature Section handlers
  const addFeatureSection = (
    setter: React.Dispatch<React.SetStateAction<FeatureSection[]>>
  ) => {
    setter((prev) => [
      ...prev,
      { title: "", description: "", image: null, features: [{ title: "", description: "", icon: "" }] },
    ]);
  };

  const removeFeatureSection = (
    setter: React.Dispatch<React.SetStateAction<FeatureSection[]>>,
    index: number
  ) => {
    setter((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const updateFeatureSection = (
    setter: React.Dispatch<React.SetStateAction<FeatureSection[]>>,
    index: number,
    field: keyof FeatureSection,
    value: any
  ) => {
    setter((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Feature Item handlers (inside sections)
  const addFeatureItem = (
    setter: React.Dispatch<React.SetStateAction<FeatureSection[]>>,
    sectionIndex: number
  ) => {
    setter((prev) => {
      const updated = [...prev];
      updated[sectionIndex].features.push({ title: "", description: "", icon: "" });
      return updated;
    });
  };

  const removeFeatureItem = (
    setter: React.Dispatch<React.SetStateAction<FeatureSection[]>>,
    sectionIndex: number,
    itemIndex: number
  ) => {
    setter((prev) => {
      const updated = [...prev];
      if (updated[sectionIndex].features.length <= 1) return prev;
      updated[sectionIndex].features = updated[sectionIndex].features.filter(
        (_, i) => i !== itemIndex
      );
      return updated;
    });
  };

  const updateFeatureItem = (
    setter: React.Dispatch<React.SetStateAction<FeatureSection[]>>,
    sectionIndex: number,
    itemIndex: number,
    field: keyof FeatureItem,
    value: string
  ) => {
    setter((prev) => {
      const updated = [...prev];
      updated[sectionIndex].features[itemIndex] = {
        ...updated[sectionIndex].features[itemIndex],
        [field]: value,
      };
      return updated;
    });
  };

  // Why Choose Us handlers
  const addWhyChooseItem = () => {
    setWhyChooseUs((prev) => [...prev, { title: "", description: "", icon: "" }]);
  };

  const removeWhyChooseItem = (index: number) => {
    setWhyChooseUs((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const updateWhyChooseItem = (
    index: number,
    field: keyof FeatureItem,
    value: string
  ) => {
    setWhyChooseUs((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
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

  // Testimonial handlers
  const addTestimonial = () => {
    setTestimonials((prev) => [...prev, { name: "", role: "", image: null, message: "" }]);
    setTestimonialImages((prev) => [...prev, null]);
    setTestimonialImagePreviews((prev) => [...prev, null]);
  };

  const removeTestimonial = (index: number) => {
    setTestimonials((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
    setTestimonialImages((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
    setTestimonialImagePreviews((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const updateTestimonial = (
    index: number,
    field: keyof Testimonial,
    value: string
  ) => {
    setTestimonials((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleTestimonialImageChange = (
    index: number,
    file: File,
    preview: string
  ) => {
    setTestimonialImages((prev) => {
      const updated = [...prev];
      updated[index] = file;
      return updated;
    });
    setTestimonialImagePreviews((prev) => {
      const updated = [...prev];
      updated[index] = preview;
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

  const validateOverviewTab = (): boolean => {
    if (!overviewTitle.trim()) {
      toast.error("Overview title is required");
      return false;
    }

    if (!overviewDescription.trim()) {
      toast.error("Overview description is required");
      return false;
    }

    if (!overviewImagePreview && !overviewImage) {
      toast.error("Overview image is required");
      return false;
    }

    return true;
  };

  const validateFeatureSection = (sections: FeatureSection[], sectionName: string): boolean => {
    if (sections.length === 0) {
      toast.error(`At least one ${sectionName} section is required`);
      return false;
    }

    const hasValidSection = sections.some(
      section => section.title.trim() || section.description.trim()
    );

    if (!hasValidSection) {
      toast.error(`At least one ${sectionName} section with data is required`);
      return false;
    }

    return true;
  };

  const validateWhyChooseTab = (): boolean => {
    const hasValidItem = whyChooseUs.some(
      item => item.title.trim() || item.description.trim()
    );

    if (!hasValidItem) {
      toast.error("At least one 'Why Choose Us' item is required");
      return false;
    }

    return true;
  };

  const validateStatsTab = (): boolean => {
    const hasValidStat = stats.some(
      stat => stat.title.trim() && stat.value.trim()
    );

    if (!hasValidStat) {
      toast.error("At least one statistic with title and value is required");
      return false;
    }

    return true;
  };

  const validateTestimonialsTab = (): boolean => {
    const hasValidTestimonial = testimonials.some(
      t => t.name.trim() || t.message.trim()
    );

    if (!hasValidTestimonial) {
      toast.error("At least one testimonial is required");
      return false;
    }

    return true;
  };

  const validateCtaTab = (): boolean => {
    if (!ctaTitle.trim()) {
      toast.error("CTA title is required");
      return false;
    }

    if (!ctaDescription.trim()) {
      toast.error("CTA description is required");
      return false;
    }

    if (!ctaButtonText.trim()) {
      toast.error("CTA button text is required");
      return false;
    }

    if (!ctaImagePreview && !ctaImage) {
      toast.error("CTA image is required");
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
      case "overview":
        isValid = validateOverviewTab();
        break;
      case "platform":
        isValid = validateFeatureSection(platformFeatures, "platform");
        break;
      case "instructor":
        isValid = validateFeatureSection(instructorFeatures, "instructor");
        break;
      case "student":
        isValid = validateFeatureSection(studentFeatures, "student");
        break;
      case "mobile":
        isValid = validateFeatureSection(mobileAppFeatures, "mobile app");
        break;
      case "why-choose":
        isValid = validateWhyChooseTab();
        break;
      case "stats":
        isValid = validateStatsTab();
        break;
      case "testimonials":
        isValid = validateTestimonialsTab();
        break;
      case "cta":
        isValid = validateCtaTab();
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
    if (!validateOverviewTab()) return;
    if (!validateFeatureSection(platformFeatures, "platform")) return;
    if (!validateFeatureSection(instructorFeatures, "instructor")) return;
    if (!validateFeatureSection(studentFeatures, "student")) return;
    if (!validateFeatureSection(mobileAppFeatures, "mobile app")) return;
    if (!validateWhyChooseTab()) return;
    if (!validateStatsTab()) return;
    if (!validateTestimonialsTab()) return;
    if (!validateCtaTab()) return;

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

      // Append overview fields
      formData.append("overviewTitle", overviewTitle);
      formData.append("overviewDescription", overviewDescription);
      if (overviewImage) {
        formData.append("overviewImage", overviewImage);
      }

      // Append feature sections
      formData.append("platformFeatures", JSON.stringify(platformFeatures));
      formData.append("instructorFeatures", JSON.stringify(instructorFeatures));
      formData.append("studentFeatures", JSON.stringify(studentFeatures));
      formData.append("mobileAppFeatures", JSON.stringify(mobileAppFeatures));

      // Append why choose us
      formData.append("whyChooseUs", JSON.stringify(whyChooseUs));

      // Append stats
      formData.append("stats", JSON.stringify(stats));

      // Append testimonials
      const processedTestimonials = testimonials.map((testimonial, index) => ({
        ...testimonial,
        image: testimonialImagePreviews[index]?.startsWith('blob:') ? null : testimonialImagePreviews[index],
      }));
      formData.append("testimonials", JSON.stringify(processedTestimonials));

      // Append testimonial images
      testimonialImages.forEach((image, index) => {
        if (image) {
          formData.append(`testimonialImages`, image);
        }
      });

      // Append CTA fields
      formData.append("ctaTitle", ctaTitle);
      formData.append("ctaDescription", ctaDescription);
      formData.append("ctaButtonText", ctaButtonText);
      if (ctaImage) {
        formData.append("ctaImage", ctaImage);
      }

      let response;

      if (pageId) {
        response = await PATCHDATA(`/v1/featres-page/${pageId}`, formData);
      } else {
        response = await POSTDATA("/v1/featres-page", formData);
      }

      if (!response?.success) {
        throw new Error(response?.message || "Failed to save features page");
      }

      toast.success(`Features page ${pageId ? "updated" : "created"} successfully!`);
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

  const isLastTab = activeTab === "cta";
  const isFirstTab = activeTab === "basic";

  // Helper component for feature sections
  const FeatureSectionRenderer = ({
    sections,
    setter,
    title,
    icon: Icon,
  }: {
    sections: FeatureSection[];
    setter: React.Dispatch<React.SetStateAction<FeatureSection[]>>;
    title: string;
    icon: any;
  }) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addFeatureSection(setter)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Section
        </Button>
      </div>

      {sections.map((section, sectionIndex) => (
        <Card key={sectionIndex} className="relative border">
          <CardContent className="pt-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Section Title</Label>
                <Input
                  placeholder="Enter section title"
                  value={section.title}
                  onChange={(e) =>
                    updateFeatureSection(setter, sectionIndex, "title", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Section Description</Label>
              <Textarea
                placeholder="Enter section description"
                value={section.description}
                onChange={(e) =>
                  updateFeatureSection(setter, sectionIndex, "description", e.target.value)
                }
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Section Image (optional)</Label>
              <div className="relative flex h-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/40 bg-muted/30 transition hover:border-primary">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  className="absolute inset-0 cursor-pointer opacity-0"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      const file = e.target.files[0];
                      updateFeatureSection(setter, sectionIndex, "image", file);
                      // Handle preview separately if needed
                    }
                  }}
                />
                {section.image ? (
                  <span className="text-sm">Image selected</span>
                ) : (
                  <>
                    <UploadCloud className="mb-1 h-5 w-5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Upload image</p>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Features</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => addFeatureItem(setter, sectionIndex)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Feature
                </Button>
              </div>

              {section.features.map((feature, featureIndex) => (
                <Card key={featureIndex} className="border bg-muted/20">
                  <CardContent className="p-4 space-y-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <Input
                        placeholder="Feature title"
                        value={feature.title}
                        onChange={(e) =>
                          updateFeatureItem(setter, sectionIndex, featureIndex, "title", e.target.value)
                        }
                      />
                      <Input
                        placeholder="Icon (optional)"
                        value={feature.icon}
                        onChange={(e) =>
                          updateFeatureItem(setter, sectionIndex, featureIndex, "icon", e.target.value)
                        }
                      />
                    </div>
                    <Textarea
                      placeholder="Feature description"
                      value={feature.description}
                      onChange={(e) =>
                        updateFeatureItem(setter, sectionIndex, featureIndex, "description", e.target.value)
                      }
                      rows={2}
                    />
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFeatureItem(setter, sectionIndex, featureIndex)}
                        className="text-red-500 hover:text-red-600"
                        disabled={section.features.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFeatureSection(setter, sectionIndex)}
                className="text-red-500 hover:text-red-600"
                disabled={sections.length <= 1}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Section
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto py-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Manage Features Page {pageId ? "(Edit Mode)" : "(Create New)"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure your features page. Only one configuration will be saved.
          </p>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 lg:grid-cols-11">
              <TabsTrigger value="basic" className="text-xs px-2">
                Basic {validatedTabs.has("basic") && "✓"}
              </TabsTrigger>
              <TabsTrigger value="banner" className="text-xs px-2">
                Banner {validatedTabs.has("banner") && "✓"}
              </TabsTrigger>
              <TabsTrigger value="overview" className="text-xs px-2">
                Overview {validatedTabs.has("overview") && "✓"}
              </TabsTrigger>
              <TabsTrigger value="platform" className="text-xs px-2">
                Platform {validatedTabs.has("platform") && "✓"}
              </TabsTrigger>
              <TabsTrigger value="instructor" className="text-xs px-2">
                Instructor {validatedTabs.has("instructor") && "✓"}
              </TabsTrigger>
              <TabsTrigger value="student" className="text-xs px-2">
                Student {validatedTabs.has("student") && "✓"}
              </TabsTrigger>
              <TabsTrigger value="mobile" className="text-xs px-2">
                Mobile {validatedTabs.has("mobile") && "✓"}
              </TabsTrigger>
              <TabsTrigger value="why-choose" className="text-xs px-2">
                Why Us {validatedTabs.has("why-choose") && "✓"}
              </TabsTrigger>
              <TabsTrigger value="stats" className="text-xs px-2">
                Stats {validatedTabs.has("stats") && "✓"}
              </TabsTrigger>
              <TabsTrigger value="testimonials" className="text-xs px-2">
                Reviews {validatedTabs.has("testimonials") && "✓"}
              </TabsTrigger>
              <TabsTrigger value="cta" className="text-xs px-2">
                CTA {validatedTabs.has("cta") && "✓"}
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
                    placeholder="Enter base text for the features page"
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
                    placeholder="Enter a brief description"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    rows={2}
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
                    placeholder="e.g., Powerful"
                    value={bannerBlackText}
                    onChange={(e) => setBannerBlackText(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Banner Color Text <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="e.g., Features"
                    value={bannerColorText}
                    onChange={(e) => setBannerColorText(e.target.value)}
                  />
                </div>
              </div>

              <div className="rounded-lg bg-muted/30 p-4">
                <p className="text-sm font-medium">Preview:</p>
                <p className="text-xl">
                  <span className="text-foreground">{bannerBlackText || "Powerful"}</span>{" "}
                  <span className="text-primary">{bannerColorText || "Features"}</span>
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

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>
                    Overview Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="e.g., Platform Overview"
                    value={overviewTitle}
                    onChange={(e) => setOverviewTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Overview Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    placeholder="Enter overview description"
                    value={overviewDescription}
                    onChange={(e) => setOverviewDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Overview Image <span className="text-red-500">*</span>
                  </Label>
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleImageDrop(e, setOverviewImage, setOverviewImagePreview)}
                    className="relative flex h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/40 bg-muted/30 transition hover:border-primary"
                  >
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      className="absolute inset-0 cursor-pointer opacity-0"
                      onChange={(e) =>
                        e.target.files &&
                        handleImageChange(e.target.files[0], setOverviewImage, setOverviewImagePreview)
                      }
                    />

                    {overviewImagePreview ? (
                      <div className="relative h-full w-full">
                        <Image
                          src={overviewImagePreview}
                          alt="overview preview"
                          fill
                          className="rounded-lg object-cover"
                        />
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="mb-2 h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Upload overview image
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Platform Features Tab */}
            <TabsContent value="platform">
              <FeatureSectionRenderer
                sections={platformFeatures}
                setter={setPlatformFeatures}
                title="Platform Features"
                icon={Target}
              />
            </TabsContent>

            {/* Instructor Features Tab */}
            <TabsContent value="instructor">
              <FeatureSectionRenderer
                sections={instructorFeatures}
                setter={setInstructorFeatures}
                title="Instructor Features"
                icon={Users}
              />
            </TabsContent>

            {/* Student Features Tab */}
            <TabsContent value="student">
              <FeatureSectionRenderer
                sections={studentFeatures}
                setter={setStudentFeatures}
                title="Student Features"
                icon={BookOpen}
              />
            </TabsContent>

            {/* Mobile App Features Tab */}
            <TabsContent value="mobile">
              <FeatureSectionRenderer
                sections={mobileAppFeatures}
                setter={setMobileAppFeatures}
                title="Mobile App Features"
                icon={Smartphone}
              />
            </TabsContent>

            {/* Why Choose Us Tab */}
            <TabsContent value="why-choose" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Why Choose Us Items</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addWhyChooseItem}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>

              {whyChooseUs.map((item, index) => (
                <Card key={index} className="relative border">
                  <CardContent className="pt-6 space-y-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <Input
                        placeholder="Item title"
                        value={item.title}
                        onChange={(e) => updateWhyChooseItem(index, "title", e.target.value)}
                      />
                      <Input
                        placeholder="Icon (optional)"
                        value={item.icon}
                        onChange={(e) => updateWhyChooseItem(index, "icon", e.target.value)}
                      />
                    </div>
                    <Textarea
                      placeholder="Item description"
                      value={item.description}
                      onChange={(e) => updateWhyChooseItem(index, "description", e.target.value)}
                      rows={2}
                    />
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeWhyChooseItem(index)}
                        className="text-red-500 hover:text-red-600"
                        disabled={whyChooseUs.length <= 1}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove Item
                      </Button>
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
                      placeholder="Stat title (e.g., Active Users)"
                      value={stat.title}
                      onChange={(e) => updateStat(index, "title", e.target.value)}
                    />
                  </div>
                  <div className="col-span-5">
                    <Input
                      placeholder="Stat value (e.g., 10K+)"
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
            </TabsContent>

            {/* Testimonials Tab */}
            <TabsContent value="testimonials" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Testimonials</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTestimonial}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Testimonial
                </Button>
              </div>

              {testimonials.map((testimonial, index) => (
                <Card key={index} className="relative border">
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          placeholder="Person's name"
                          value={testimonial.name}
                          onChange={(e) => updateTestimonial(index, "name", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Input
                          placeholder="e.g., CEO, Student"
                          value={testimonial.role}
                          onChange={(e) => updateTestimonial(index, "role", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Message</Label>
                      <Textarea
                        placeholder="Testimonial message"
                        value={testimonial.message}
                        onChange={(e) => updateTestimonial(index, "message", e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Profile Image (optional)</Label>
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (e.dataTransfer.files?.[0]) {
                            const file = e.dataTransfer.files[0];
                            handleTestimonialImageChange(
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
                            handleTestimonialImageChange(
                              index,
                              e.target.files[0],
                              URL.createObjectURL(e.target.files[0])
                            )
                          }
                        />
                        {testimonialImagePreviews[index] ? (
                          <div className="relative h-full w-full">
                            <Image
                              src={testimonialImagePreviews[index]!}
                              alt="testimonial"
                              fill
                              className="rounded-lg object-cover"
                            />
                          </div>
                        ) : (
                          <>
                            <UploadCloud className="mb-1 h-5 w-5 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">Upload image</p>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTestimonial(index)}
                        className="text-red-500 hover:text-red-600"
                        disabled={testimonials.length <= 1}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove Testimonial
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* CTA Tab */}
            <TabsContent value="cta" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>
                    CTA Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="e.g., Ready to Get Started?"
                    value={ctaTitle}
                    onChange={(e) => setCtaTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    CTA Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    placeholder="Enter CTA description"
                    value={ctaDescription}
                    onChange={(e) => setCtaDescription(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Button Text <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="e.g., Get Started"
                    value={ctaButtonText}
                    onChange={(e) => setCtaButtonText(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    CTA Image <span className="text-red-500">*</span>
                  </Label>
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleImageDrop(e, setCtaImage, setCtaImagePreview)}
                    className="relative flex h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/40 bg-muted/30 transition hover:border-primary"
                  >
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      className="absolute inset-0 cursor-pointer opacity-0"
                      onChange={(e) =>
                        e.target.files &&
                        handleImageChange(e.target.files[0], setCtaImage, setCtaImagePreview)
                      }
                    />

                    {ctaImagePreview ? (
                      <div className="relative h-full w-full">
                        <Image
                          src={ctaImagePreview}
                          alt="CTA preview"
                          fill
                          className="rounded-lg object-cover"
                        />
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="mb-2 h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Upload CTA image
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
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
                    {pageId ? "Update Features Page" : "Create Features Page"}
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