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
  link?: string;
}

interface SupportCategory {
  title: string;
  description: string;
  icon?: string;
}

interface ContactOption {
  title: string;
  description: string;
  value: string;
  link?: string;
  icon?: string;
}

interface SupportHubFormData {
  baseText: string;
  bannerText: {
    blackText: string;
    colorText: string;
  };
  shortDescription?: string;
  helpSectionTitle?: string;
  helpSectionDescription?: string;
  supportCategories: SupportCategory[];
  contactSectionTitle?: string;
  contactOptions: ContactOption[];
  faqSectionTitle?: string;
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

  // Initialize react-hook-form
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
    watch,
  } = useForm<SupportHubFormData>({
    defaultValues: {
      baseText: "",
      bannerText: {
        blackText: "",
        colorText: "",
      },
      shortDescription: "",
      helpSectionTitle: "",
      helpSectionDescription: "",
      supportCategories: [{ title: "", description: "", icon: "" }],
      contactSectionTitle: "",
      contactOptions: [{ title: "", description: "", value: "", link: "", icon: "" }],
      faqSectionTitle: "",
      faq: [{ question: "", answer: "", link: "" }],
    },
  });

  // UseFieldArray for dynamic arrays
  const {
    fields: supportCategoryFields,
    append: appendSupportCategory,
    remove: removeSupportCategory,
  } = useFieldArray({
    control,
    name: "supportCategories",
  });

  const {
    fields: contactOptionFields,
    append: appendContactOption,
    remove: removeContactOption,
  } = useFieldArray({
    control,
    name: "contactOptions",
  });

  const {
    fields: faqFields,
    append: appendFaq,
    remove: removeFaq,
  } = useFieldArray({
    control,
    name: "faq",
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
      const response = await GETDATA("/v1/support-hub-page");

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
          helpSectionTitle: data.helpSectionTitle || "",
          helpSectionDescription: data.helpSectionDescription || "",
          supportCategories: data.supportCategories?.length > 0 
            ? data.supportCategories 
            : [{ title: "", description: "", icon: "" }],
          contactSectionTitle: data.contactSectionTitle || "",
          contactOptions: data.contactOptions?.length > 0 
            ? data.contactOptions 
            : [{ title: "", description: "", value: "", link: "", icon: "" }],
          faqSectionTitle: data.faqSectionTitle || "",
          faq: data.faq?.length > 0 
            ? data.faq 
            : [{ question: "", answer: "", link: "" }],
        });

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

  // Validation functions for each tab
  const validateBasicTab = (): boolean => {
    const baseText = watchedValues.baseText;
    if (!baseText?.trim()) {
      toast.error("Base text is required");
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

  const validateHelpSectionTab = (): boolean => {
    // Help section fields are optional
    return true;
  };

  const validateCategoriesTab = (): boolean => {
    const categories = watchedValues.supportCategories;
    const hasValidCategory = categories?.some(
      cat => cat?.title?.trim() || cat?.description?.trim()
    );

    if (!hasValidCategory) {
      toast.error("At least one support category is required");
      return false;
    }

    return true;
  };

  const validateContactTab = (): boolean => {
    const contactOptions = watchedValues.contactOptions;
    const hasValidContact = contactOptions?.some(
      opt => opt?.title?.trim() || opt?.value?.trim()
    );

    if (!hasValidContact) {
      toast.error("At least one contact option is required");
      return false;
    }

    return true;
  };

  const validateFaqTab = (): boolean => {
    const faq = watchedValues.faq;
    const hasValidFaq = faq?.some(
      item => item?.question?.trim() || item?.answer?.trim()
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

  // Submit handler - sends JSON data instead of FormData
  const onSubmit = async (data: SupportHubFormData) => {
    // Validate required tabs
    if (!validateBasicTab()) return;
    if (!validateBannerTab()) return;
    if (!validateCategoriesTab()) return;
    if (!validateContactTab()) return;
    if (!validateFaqTab()) return;

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
        helpSectionTitle: data.helpSectionTitle || undefined,
        helpSectionDescription: data.helpSectionDescription || undefined,
        supportCategories: data.supportCategories
          .filter(cat => cat.title?.trim() || cat.description?.trim())
          .map(cat => ({
            title: cat.title || "",
            description: cat.description || "",
            ...(cat.icon && { icon: cat.icon }),
          })),
        contactSectionTitle: data.contactSectionTitle || undefined,
        contactOptions: data.contactOptions
          .filter(opt => opt.title?.trim() || opt.value?.trim())
          .map(opt => ({
            title: opt.title || "",
            description: opt.description || "",
            value: opt.value || "",
            ...(opt.link && { link: opt.link }),
            ...(opt.icon && { icon: opt.icon }),
          })),
        faqSectionTitle: data.faqSectionTitle || undefined,
        faq: data.faq
          .filter(item => item.question?.trim() || item.answer?.trim())
          .map(item => ({
            question: item.question || "",
            answer: item.answer || "",
            ...(item.link && { link: item.link }),
          })),
      };

      let response;

      if (pageId) {
        response = await PATCHDATA(`/v1/support-hub-page/${pageId}`, cleanedData);
      } else {
        response = await POSTDATA("/v1/support-hub-page", cleanedData);
      }

      if (!response?.success) {
        throw new Error(response?.message || "Failed to save support hub");
      }

      toast.success(`Support hub ${pageId ? "updated" : "created"} successfully!`);
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
                    <p className="text-xs text-muted-foreground">
                      Main heading or introduction text for the support hub (required)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Short Description (Optional)</Label>
                    <Textarea
                      placeholder="Enter a brief description"
                      {...register("shortDescription")}
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
                      placeholder="e.g., Hub"
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
                    <span className="text-foreground">{watchedValues.bannerText?.blackText || "Support"}</span>{" "}
                    <span className="text-primary">{watchedValues.bannerText?.colorText || "Hub"}</span>
                  </p>
                </div>
              </TabsContent>

              {/* Help Section Tab */}
              <TabsContent value="help-section" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Help Section Title (Optional)</Label>
                    <Input
                      placeholder="e.g., How Can We Help You?"
                      {...register("helpSectionTitle")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Help Section Description (Optional)</Label>
                    <Textarea
                      placeholder="Enter description for the help section"
                      {...register("helpSectionDescription")}
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
                    onClick={() => appendSupportCategory({ title: "", description: "", icon: "" })}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Category
                  </Button>
                </div>

                {supportCategoryFields.map((field, index) => (
                  <Card key={field.id} className="relative border">
                    <CardContent className="pt-6">
                      <div className="grid gap-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                              placeholder="Category title"
                              {...register(`supportCategories.${index}.title`)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Icon (Optional)</Label>
                            <Input
                              placeholder="Icon name or URL"
                              {...register(`supportCategories.${index}.icon`)}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            placeholder="Category description"
                            {...register(`supportCategories.${index}.description`)}
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
                            disabled={supportCategoryFields.length <= 1}
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
                  <Label>Contact Section Title (Optional)</Label>
                  <Input
                    placeholder="e.g., Get in Touch"
                    {...register("contactSectionTitle")}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Contact Options</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendContactOption({ title: "", description: "", value: "", link: "", icon: "" })}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Contact Option
                  </Button>
                </div>

                {contactOptionFields.map((field, index) => (
                  <Card key={field.id} className="relative border">
                    <CardContent className="pt-6">
                      <div className="grid gap-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                              placeholder="e.g., Email Support"
                              {...register(`contactOptions.${index}.title`)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Icon (Optional)</Label>
                            <Input
                              placeholder="Icon name or URL"
                              {...register(`contactOptions.${index}.icon`)}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Input
                            placeholder="Brief description"
                            {...register(`contactOptions.${index}.description`)}
                          />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Value</Label>
                            <Input
                              placeholder="e.g., support@example.com"
                              {...register(`contactOptions.${index}.value`)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Link (Optional)</Label>
                            <Input
                              placeholder="URL or mailto link"
                              {...register(`contactOptions.${index}.link`)}
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
                            disabled={contactOptionFields.length <= 1}
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
                  <Label>FAQ Section Title (Optional)</Label>
                  <Input
                    placeholder="e.g., Frequently Asked Questions"
                    {...register("faqSectionTitle")}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>FAQs</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendFaq({ question: "", answer: "", link: "" })}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add FAQ
                  </Button>
                </div>

                {faqFields.map((field, index) => (
                  <Card key={field.id} className="relative border">
                    <CardContent className="pt-6">
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <Label>Question</Label>
                          <Input
                            placeholder="Enter question"
                            {...register(`faq.${index}.question`)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Answer</Label>
                          <Textarea
                            placeholder="Enter answer"
                            {...register(`faq.${index}.answer`)}
                            rows={3}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Link (Optional)</Label>
                          <Input
                            placeholder="Related article link"
                            {...register(`faq.${index}.link`)}
                          />
                        </div>

                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFaq(index)}
                            className="text-red-500 hover:text-red-600"
                            disabled={faqFields.length <= 1}
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