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
  HelpCircle,
  HeadphonesIcon,
  MessageCircle,
  LifeBuoy,
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
interface FAQ {
  question: string;
  answer: string;
  link: string;
}

interface SupportCategory {
  title: string;
  description: string;
  icon: string;
}

interface ContactOption {
  title: string;
  description: string;
  value: string;
  link: string;
  icon: string;
}

interface SupportHubData {
  _id?: string;
  baseText: string;
  bannerText: {
    blackText: string;
    colorText: string;
  };
  bannerImage: string | null;
  shortDescription: string;
  helpSectionTitle: string;
  helpSectionDescription: string;
  supportCategories: SupportCategory[];
  contactSectionTitle: string;
  contactOptions: ContactOption[];
  faqSectionTitle: string;
  faq: FAQ[];
}

// Tab order for navigation
const TAB_ORDER = [
  "basic",
  "banner",
  "help-section",
  "categories",
  "contact",
  "faq",
];

export default function ManageSupportHubPage() {
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

  // Help section fields
  const [helpSectionTitle, setHelpSectionTitle] = useState("");
  const [helpSectionDescription, setHelpSectionDescription] = useState("");

  // Support Categories
  const [supportCategories, setSupportCategories] = useState<SupportCategory[]>([
    { title: "", description: "", icon: "" },
  ]);

  // Contact section
  const [contactSectionTitle, setContactSectionTitle] = useState("");
  const [contactOptions, setContactOptions] = useState<ContactOption[]>([
    { title: "", description: "", value: "", link: "", icon: "" },
  ]);

  // FAQ section
  const [faqSectionTitle, setFaqSectionTitle] = useState("");
  const [faq, setFaq] = useState<FAQ[]>([
    { question: "", answer: "", link: "" },
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
      const response = await GETDATA("/v1/support-hub-page");

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

        // Set help section fields
        setHelpSectionTitle(data.helpSectionTitle || "");
        setHelpSectionDescription(data.helpSectionDescription || "");

        // Set support categories
        if (data.supportCategories?.length > 0) {
          setSupportCategories(data.supportCategories);
        }

        // Set contact section
        setContactSectionTitle(data.contactSectionTitle || "");
        if (data.contactOptions?.length > 0) {
          setContactOptions(data.contactOptions);
        }

        // Set FAQ section
        setFaqSectionTitle(data.faqSectionTitle || "");
        if (data.faq?.length > 0) {
          setFaq(data.faq);
        }

        // Mark all tabs as validated since we have existing data
        setValidatedTabs(new Set(TAB_ORDER));
      }
    } catch (error: any) {
      console.error("Error fetching page data:", error);
      toast.error("Failed to fetch support hub data");
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

  // Support Category handlers
  const addSupportCategory = () => {
    setSupportCategories((prev) => [
      ...prev,
      { title: "", description: "", icon: "" },
    ]);
  };

  const removeSupportCategory = (index: number) => {
    setSupportCategories((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const updateSupportCategory = (
    index: number,
    field: keyof SupportCategory,
    value: string
  ) => {
    setSupportCategories((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Contact Option handlers
  const addContactOption = () => {
    setContactOptions((prev) => [
      ...prev,
      { title: "", description: "", value: "", link: "", icon: "" },
    ]);
  };

  const removeContactOption = (index: number) => {
    setContactOptions((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const updateContactOption = (
    index: number,
    field: keyof ContactOption,
    value: string
  ) => {
    setContactOptions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // FAQ handlers
  const addFaq = () => {
    setFaq((prev) => [
      ...prev,
      { question: "", answer: "", link: "" },
    ]);
  };

  const removeFaq = (index: number) => {
    setFaq((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const updateFaq = (
    index: number,
    field: keyof FAQ,
    value: string
  ) => {
    setFaq((prev) => {
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

  const validateHelpSectionTab = (): boolean => {
    if (!helpSectionTitle.trim()) {
      toast.error("Help section title is required");
      return false;
    }

    if (!helpSectionDescription.trim()) {
      toast.error("Help section description is required");
      return false;
    }

    return true;
  };

  const validateCategoriesTab = (): boolean => {
    // Check if at least one category has data
    const hasValidCategory = supportCategories.some(
      cat => cat.title.trim() || cat.description.trim()
    );

    if (!hasValidCategory) {
      toast.error("At least one support category is required");
      return false;
    }

    return true;
  };

  const validateContactTab = (): boolean => {
    if (!contactSectionTitle.trim()) {
      toast.error("Contact section title is required");
      return false;
    }

    // Check if at least one contact option has data
    const hasValidContact = contactOptions.some(
      opt => opt.title.trim() || opt.value.trim()
    );

    if (!hasValidContact) {
      toast.error("At least one contact option is required");
      return false;
    }

    return true;
  };

  const validateFaqTab = (): boolean => {
    if (!faqSectionTitle.trim()) {
      toast.error("FAQ section title is required");
      return false;
    }

    // Check if at least one FAQ has data
    const hasValidFaq = faq.some(
      item => item.question.trim() || item.answer.trim()
    );

    if (!hasValidFaq) {
      toast.error("At least one FAQ is required");
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
      case "help-section":
        isValid = validateHelpSectionTab();
        break;
      case "categories":
        isValid = validateCategoriesTab();
        break;
      case "contact":
        isValid = validateContactTab();
        break;
      case "faq":
        isValid = validateFaqTab();
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
    if (!validateHelpSectionTab()) return;
    if (!validateCategoriesTab()) return;
    if (!validateContactTab()) return;
    if (!validateFaqTab()) return;

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

      // Append help section fields
      formData.append("helpSectionTitle", helpSectionTitle);
      formData.append("helpSectionDescription", helpSectionDescription);

      // Append support categories
      formData.append("supportCategories", JSON.stringify(supportCategories));

      // Append contact section
      formData.append("contactSectionTitle", contactSectionTitle);
      formData.append("contactOptions", JSON.stringify(contactOptions));

      // Append FAQ section
      formData.append("faqSectionTitle", faqSectionTitle);
      formData.append("faq", JSON.stringify(faq));

      let response;

      if (pageId) {
        response = await PATCHDATA(`/v1/support-hub-page/${pageId}`, formData);
      } else {
        response = await POSTDATA("/v1/support-hub-page", formData);
      }

      if (!response?.success) {
        throw new Error(response?.message || "Failed to save support hub");
      }

      toast.success(`Support hub ${pageId ? "updated" : "created"} successfully!`);
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

  const isLastTab = activeTab === "faq";
  const isFirstTab = activeTab === "basic";

  return (
    <div className="container mx-auto py-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Manage Support Hub Page {pageId ? "(Edit Mode)" : "(Create New)"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure your support hub page. Only one configuration will be saved.
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
                value="help-section"
                className={validatedTabs.has("help-section") ? "border-green-500 border" : ""}
              >
                Help Section {validatedTabs.has("help-section") && "✓"}
              </TabsTrigger>
              <TabsTrigger 
                value="categories"
                className={validatedTabs.has("categories") ? "border-green-500 border" : ""}
              >
                Categories {validatedTabs.has("categories") && "✓"}
              </TabsTrigger>
              <TabsTrigger 
                value="contact"
                className={validatedTabs.has("contact") ? "border-green-500 border" : ""}
              >
                Contact {validatedTabs.has("contact") && "✓"}
              </TabsTrigger>
              <TabsTrigger 
                value="faq"
                className={validatedTabs.has("faq") ? "border-green-500 border" : ""}
              >
                FAQ {validatedTabs.has("faq") && "✓"}
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
                    placeholder="Enter base text for the support hub page"
                    value={baseText}
                    onChange={(e) => setBaseText(e.target.value)}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Main heading or introduction text for the support hub
                  </p>
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
                    placeholder="e.g., Support"
                    value={bannerBlackText}
                    onChange={(e) => setBannerBlackText(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Banner Color Text <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="e.g., Hub"
                    value={bannerColorText}
                    onChange={(e) => setBannerColorText(e.target.value)}
                  />
                </div>
              </div>

              <div className="rounded-lg bg-muted/30 p-4">
                <p className="text-sm font-medium">Preview:</p>
                <p className="text-xl">
                  <span className="text-foreground">{bannerBlackText || "Support"}</span>{" "}
                  <span className="text-primary">{bannerColorText || "Hub"}</span>
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

            {/* Help Section Tab */}
            <TabsContent value="help-section" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>
                    Help Section Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="e.g., How Can We Help You?"
                    value={helpSectionTitle}
                    onChange={(e) => setHelpSectionTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Help Section Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    placeholder="Enter description for the help section"
                    value={helpSectionDescription}
                    onChange={(e) => setHelpSectionDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Support Categories Tab */}
            <TabsContent value="categories" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Support Categories</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSupportCategory}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </div>

              {supportCategories.map((category, index) => (
                <Card key={index} className="relative border">
                  <CardContent className="pt-6">
                    <div className="grid gap-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Title</Label>
                          <Input
                            placeholder="Category title"
                            value={category.title}
                            onChange={(e) =>
                              updateSupportCategory(index, "title", e.target.value)
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Icon (optional)</Label>
                          <Input
                            placeholder="Icon name or URL"
                            value={category.icon}
                            onChange={(e) =>
                              updateSupportCategory(index, "icon", e.target.value)
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          placeholder="Category description"
                          value={category.description}
                          onChange={(e) =>
                            updateSupportCategory(index, "description", e.target.value)
                          }
                          rows={2}
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSupportCategory(index)}
                          className="text-red-500 hover:text-red-600"
                          disabled={supportCategories.length <= 1}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove Category
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <p className="text-sm text-muted-foreground">
                At least one support category is required
              </p>
            </TabsContent>

            {/* Contact Options Tab */}
            <TabsContent value="contact" className="space-y-4">
              <div className="space-y-2">
                <Label>
                  Contact Section Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="e.g., Get in Touch"
                  value={contactSectionTitle}
                  onChange={(e) => setContactSectionTitle(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Contact Options</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addContactOption}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Contact Option
                </Button>
              </div>

              {contactOptions.map((option, index) => (
                <Card key={index} className="relative border">
                  <CardContent className="pt-6">
                    <div className="grid gap-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Title</Label>
                          <Input
                            placeholder="e.g., Email Support"
                            value={option.title}
                            onChange={(e) =>
                              updateContactOption(index, "title", e.target.value)
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Icon (optional)</Label>
                          <Input
                            placeholder="Icon name or URL"
                            value={option.icon}
                            onChange={(e) =>
                              updateContactOption(index, "icon", e.target.value)
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                          placeholder="Brief description"
                          value={option.description}
                          onChange={(e) =>
                            updateContactOption(index, "description", e.target.value)
                          }
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Value</Label>
                          <Input
                            placeholder="e.g., support@example.com"
                            value={option.value}
                            onChange={(e) =>
                              updateContactOption(index, "value", e.target.value)
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Link (optional)</Label>
                          <Input
                            placeholder="URL or mailto link"
                            value={option.link}
                            onChange={(e) =>
                              updateContactOption(index, "link", e.target.value)
                            }
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeContactOption(index)}
                          className="text-red-500 hover:text-red-600"
                          disabled={contactOptions.length <= 1}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove Option
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <p className="text-sm text-muted-foreground">
                At least one contact option is required
              </p>
            </TabsContent>

            {/* FAQ Tab */}
            <TabsContent value="faq" className="space-y-4">
              <div className="space-y-2">
                <Label>
                  FAQ Section Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="e.g., Frequently Asked Questions"
                  value={faqSectionTitle}
                  onChange={(e) => setFaqSectionTitle(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>FAQs</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addFaq}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add FAQ
                </Button>
              </div>

              {faq.map((item, index) => (
                <Card key={index} className="relative border">
                  <CardContent className="pt-6">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label>Question</Label>
                        <Input
                          placeholder="Enter question"
                          value={item.question}
                          onChange={(e) =>
                            updateFaq(index, "question", e.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Answer</Label>
                        <Textarea
                          placeholder="Enter answer"
                          value={item.answer}
                          onChange={(e) =>
                            updateFaq(index, "answer", e.target.value)
                          }
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Link (optional)</Label>
                        <Input
                          placeholder="Related article link"
                          value={item.link}
                          onChange={(e) =>
                            updateFaq(index, "link", e.target.value)
                          }
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFaq(index)}
                          className="text-red-500 hover:text-red-600"
                          disabled={faq.length <= 1}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove FAQ
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <p className="text-sm text-muted-foreground">
                At least one FAQ is required
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
                    {pageId ? "Update Support Hub" : "Create Support Hub"}
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