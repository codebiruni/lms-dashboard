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
  Instagram,
  Youtube,
  ChevronRight,
  ChevronLeft,
  Save,
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
interface QuickLink {
  name: string;
  link: string;
}

interface PopularCategory {
  name: string;
  sels: string;
  link: string;
}

interface GetInTouch {
  email: string;
  phone: string;
  address: string;
}

interface OfficeHour {
  name: string;
  time: string;
}

// Tab order for navigation
const TAB_ORDER = ["basic", "quickLinks", "categories", "contact", "hours", "social"];

export default function ManageFooter() {
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [footerId, setFooterId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("basic");

  // State for all footer fields
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Arrays for dynamic fields
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([
    { name: "", link: "" },
  ]);
  const [popularCategories, setPopularCategories] = useState<
    PopularCategory[]
  >([{ name: "", sels: "", link: "" }]);
  const [getInTouch, setGetInTouch] = useState<GetInTouch[]>([
    { email: "", phone: "", address: "" },
  ]);
  const [officeHours, setOfficeHours] = useState<OfficeHour[]>([
    { name: "", time: "" },
  ]);

  // Social links
  const [boxText, setBoxText] = useState("");
  const [facebookLink, setFacebookLink] = useState("");
  const [twitterLink, setTwitterLink] = useState("");
  const [linkedinLink, setLinkedinLink] = useState("");
  const [instagramLink, setInstagramLink] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");

  // Track which tabs have been visited/validated
  const [validatedTabs, setValidatedTabs] = useState<Set<string>>(new Set());

  // Fetch existing footer data on component mount
  useEffect(() => {
    fetchFooterData();
  }, []);

  const fetchFooterData = async () => {
    try {
      setFetchLoading(true);
      const response = await GETDATA("/v1/footer");

      if (response?.success && response?.data) {
        const data = response.data;
        setFooterId(data._id || null);

        // Set basic info
        setName(data.name || "");
        setDescription(data.description || "");
        setBoxText(data.boxText || "");
        setLogoPreview(data.logo || null);

        // Set social links
        setFacebookLink(data.facebookLink || "");
        setTwitterLink(data.twitterLink || "");
        setLinkedinLink(data.linkedinLink || "");
        setInstagramLink(data.instagramLink || "");
        setYoutubeLink(data.youtubeLink || "");

        // Set arrays with proper defaults
        setQuickLinks(
          data.quickLinks?.length > 0 ? data.quickLinks : [{ name: "", link: "" }]
        );
        setPopularCategories(
          data.popularCategories?.length > 0
            ? data.popularCategories
            : [{ name: "", sels: "", link: "" }]
        );
        setGetInTouch(
          data.getInTouch?.length > 0
            ? data.getInTouch
            : [{ name: "", phone: "", address: "" }]
        );
        setOfficeHours(
          data.officeHours?.length > 0
            ? data.officeHours
            : [{ name: "", time: "" }]
        );
      }
    } catch (error: any) {
      console.error("Error fetching footer data:", error);
      toast.error("Failed to fetch footer data");
    } finally {
      setFetchLoading(false);
    }
  };

  // Image handlers
  const handleLogoChange = (file: File) => {
    setLogo(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleLogoDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      handleLogoChange(e.dataTransfer.files[0]);
    }
  };

  // Array item handlers
  const addArrayItem = <T,>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    emptyItem: T
  ) => {
    setter((prev) => [...prev, emptyItem]);
  };

  const removeArrayItem = <T,>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    index: number
  ) => {
    setter((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const updateArrayItem = <T,>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    index: number,
    field: keyof T,
    value: string
  ) => {
    setter((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Validation functions for each tab
  const validateBasicTab = (): boolean => {
    if (!logo && !logoPreview) {
      toast.error("Logo is required");
      return false;
    }

    if (!name.trim()) {
      toast.error("Site name is required");
      return false;
    }

    if (!description.trim()) {
      toast.error("Description is required");
      return false;
    }

    return true;
  };

  const validateQuickLinksTab = (): boolean => {
    // Check if at least one quick link has data
    const hasValidLink = quickLinks.some(
      link => link.name.trim() && link.link.trim()
    );
    
    if (!hasValidLink) {
      toast.error("At least one quick link with name and URL is required");
      return false;
    }

    return true;
  };

  const validateCategoriesTab = (): boolean => {
    // Check if at least one category has data
    const hasValidCategory = popularCategories.some(
      cat => cat.name.trim() && cat.link.trim()
    );
    
    if (!hasValidCategory) {
      toast.error("At least one category with name and link is required");
      return false;
    }

    return true;
  };

  const validateContactTab = (): boolean => {
    // Check if at least one contact has data
    const hasValidContact = getInTouch.some(
      contact => contact.email.trim() || contact.phone.trim() || contact.address.trim()
    );
    
    if (!hasValidContact) {
      toast.error("At least one contact method is required");
      return false;
    }

    return true;
  };

  const validateHoursTab = (): boolean => {
    // Check if at least one office hour has data
    const hasValidHour = officeHours.some(
      hour => hour.name.trim() && hour.time.trim()
    );
    
    if (!hasValidHour) {
      toast.error("At least one office hour entry is required");
      return false;
    }

    return true;
  };

  const validateSocialTab = (): boolean => {
    // Social links are optional, always valid
    return true;
  };

  // Navigation handlers
  const handleNext = () => {
    const currentIndex = TAB_ORDER.indexOf(activeTab);
    
    // Validate current tab based on which tab it is
    let isValid = false;
    
    switch (activeTab) {
      case "basic":
        isValid = validateBasicTab();
        break;
      case "quickLinks":
        isValid = validateQuickLinksTab();
        break;
      case "categories":
        isValid = validateCategoriesTab();
        break;
      case "contact":
        isValid = validateContactTab();
        break;
      case "hours":
        isValid = validateHoursTab();
        break;
      case "social":
        isValid = validateSocialTab();
        break;
      default:
        isValid = true;
    }

    if (isValid) {
      // Mark current tab as validated
      setValidatedTabs(prev => new Set(prev).add(activeTab));
      
      // Go to next tab if not the last
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
    // Only allow clicking on tabs that have been validated or are the current tab
    if (validatedTabs.has(tab) || tab === activeTab) {
      setActiveTab(tab);
    } else {
      toast.error("Please complete the current tab first");
    }
  };

  // Submit handler (only on last tab)
  const handleSubmit = async () => {
    // Validate all tabs before submission
    if (!validateBasicTab()) return;
    if (!validateQuickLinksTab()) return;
    if (!validateCategoriesTab()) return;
    if (!validateContactTab()) return;
    if (!validateHoursTab()) return;

    try {
      setLoading(true);

      // Prepare form data
      const formData = new FormData();

      // Append logo if new file is selected
      if (logo) {
        formData.append("logo", logo);
      }

      // Append basic fields
      formData.append("name", name);
      formData.append("description", description);
      formData.append("boxText", boxText);

      // Append arrays as JSON strings
      formData.append("quickLinks", JSON.stringify(quickLinks));
      formData.append("popularCategories", JSON.stringify(popularCategories));
      formData.append("getInTouch", JSON.stringify(getInTouch));
      formData.append("officeHours", JSON.stringify(officeHours));

      // Append social links
      formData.append("facebookLink", facebookLink);
      formData.append("twitterLink", twitterLink);
      formData.append("linkedinLink", linkedinLink);
      formData.append("instagramLink", instagramLink);
      formData.append("youtubeLink", youtubeLink);

      let response;

      if (footerId) {
        // Update existing footer
        response = await PATCHDATA(`/v1/footer/${footerId}`, formData);
      } else {
        // Create new footer
        response = await POSTDATA("/v1/footer", formData);
      }

      if (!response?.success) {
        throw new Error(response?.message || "Failed to save footer");
      }

      toast.success(`Footer ${footerId ? "updated" : "created"} successfully!`);
      
      // Refresh data to get latest
      fetchFooterData();
      
      // Clear logo file state but keep preview
      setLogo(null);
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

  const isLastTab = activeTab === "social";
  const isFirstTab = activeTab === "basic";

  return (
    <div className="container mx-auto py-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Manage Footer {footerId ? "(Edit Mode)" : "(Create New)"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure your website footer. Only one footer configuration will be
            saved.
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
                value="quickLinks"
                className={validatedTabs.has("quickLinks") ? "border-green-500 border" : ""}
              >
                Quick Links {validatedTabs.has("quickLinks") && "✓"}
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
                Get In Touch {validatedTabs.has("contact") && "✓"}
              </TabsTrigger>
              <TabsTrigger 
                value="hours"
                className={validatedTabs.has("hours") ? "border-green-500 border" : ""}
              >
                Office Hours {validatedTabs.has("hours") && "✓"}
              </TabsTrigger>
              <TabsTrigger 
                value="social"
                className={validatedTabs.has("social") ? "border-green-500 border" : ""}
              >
                Social Links {validatedTabs.has("social") && "✓"}
              </TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-6">
              {/* Logo Upload */}
              <div className="space-y-2">
                <Label>
                  Logo <span className="text-red-500">*</span>
                </Label>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleLogoDrop}
                  className="relative flex h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/40 bg-muted/30 transition hover:border-primary"
                >
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.svg"
                    className="absolute inset-0 cursor-pointer opacity-0"
                    onChange={(e) =>
                      e.target.files && handleLogoChange(e.target.files[0])
                    }
                  />

                  {logoPreview ? (
                    <div className="relative h-full w-full">
                      <Image
                        src={logoPreview}
                        alt="logo preview"
                        fill
                        className="rounded-lg object-contain p-2"
                      />
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="mb-2 h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Drag & drop logo here or click to upload
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Name and Description */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>
                    Site Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="Enter your site name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    placeholder="Enter footer description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Box Text (Optional)</Label>
                  <Textarea
                    placeholder="Enter box text"
                    value={boxText}
                    onChange={(e) => setBoxText(e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Quick Links Tab */}
            <TabsContent value="quickLinks" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Quick Links <span className="text-red-500">*</span></Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    addArrayItem(setQuickLinks, { name: "", link: "" })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Link
                </Button>
              </div>

              {quickLinks.map((link, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 rounded-lg border p-4">
                  <div className="col-span-5">
                    <Input
                      placeholder="Link name (e.g., About Us)"
                      value={link.name}
                      onChange={(e) =>
                        updateArrayItem(setQuickLinks, index, "name", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-span-5">
                    <Input
                      placeholder="URL (e.g., /about)"
                      value={link.link}
                      onChange={(e) =>
                        updateArrayItem(setQuickLinks, index, "link", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-span-2 flex items-center justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeArrayItem(setQuickLinks, index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <p className="text-sm text-muted-foreground">
                At least one quick link with name and URL is required
              </p>
            </TabsContent>

            {/* Popular Categories Tab */}
            <TabsContent value="categories" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Popular Categories <span className="text-red-500">*</span></Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    addArrayItem(setPopularCategories, {
                      name: "",
                      sels: "",
                      link: "",
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </div>

              {popularCategories.map((category, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 rounded-lg border p-4">
                  <div className="col-span-4">
                    <Input
                      placeholder="Category name"
                      value={category.name}
                      onChange={(e) =>
                        updateArrayItem(
                          setPopularCategories,
                          index,
                          "name",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      placeholder="Sales (e.g., 10+)"
                      value={category.sels}
                      onChange={(e) =>
                        updateArrayItem(
                          setPopularCategories,
                          index,
                          "sels",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      placeholder="Link URL"
                      value={category.link}
                      onChange={(e) =>
                        updateArrayItem(
                          setPopularCategories,
                          index,
                          "link",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className="col-span-2 flex items-center justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeArrayItem(setPopularCategories, index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <p className="text-sm text-muted-foreground">
                At least one category with name and link is required
              </p>
            </TabsContent>

            {/* Get In Touch Tab */}
            <TabsContent value="contact" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Contact Information <span className="text-red-500">*</span></Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    addArrayItem(setGetInTouch, { email: "", phone: "", address: "" })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Contact
                </Button>
              </div>

              {getInTouch.map((contact, index) => (
                <div key={index} className="space-y-2 rounded-lg border p-4">
                  <Input
                    placeholder="Email address"
                    value={contact.email}
                    onChange={(e) =>
                      updateArrayItem(setGetInTouch, index, "email", e.target.value)
                    }
                    className="mb-2"
                  />
                  <Input
                    placeholder="Phone number"
                    value={contact.phone}
                    onChange={(e) =>
                      updateArrayItem(setGetInTouch, index, "phone", e.target.value)
                    }
                    className="mb-2"
                  />
                  <div className="flex gap-2">
                    <Input
                      placeholder="Address"
                      value={contact.address}
                      onChange={(e) =>
                        updateArrayItem(
                          setGetInTouch,
                          index,
                          "address",
                          e.target.value
                        )
                      }
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeArrayItem(setGetInTouch, index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <p className="text-sm text-muted-foreground">
                At least one contact method is required
              </p>
            </TabsContent>

            {/* Office Hours Tab */}
            <TabsContent value="hours" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Office Hours <span className="text-red-500">*</span></Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    addArrayItem(setOfficeHours, { name: "", time: "" })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Hours
                </Button>
              </div>

              {officeHours.map((hour, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 rounded-lg border p-4">
                  <div className="col-span-5">
                    <Input
                      placeholder="Day (e.g., Monday-Friday)"
                      value={hour.name}
                      onChange={(e) =>
                        updateArrayItem(setOfficeHours, index, "name", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-span-5">
                    <Input
                      placeholder="Time (e.g., 9:00 AM - 5:00 PM)"
                      value={hour.time}
                      onChange={(e) =>
                        updateArrayItem(setOfficeHours, index, "time", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-span-2 flex items-center justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeArrayItem(setOfficeHours, index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <p className="text-sm text-muted-foreground">
                At least one office hour entry is required
              </p>
            </TabsContent>

            {/* Social Links Tab */}
            <TabsContent value="social" className="space-y-4">
              <Label>Social Media Links (Optional)</Label>
              <div className="grid gap-4">
                <div className="flex items-center gap-2">
                  <Facebook className="h-5 w-5 text-blue-600" />
                  <Input
                    placeholder="Facebook URL"
                    value={facebookLink}
                    onChange={(e) => setFacebookLink(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Twitter className="h-5 w-5 text-sky-500" />
                  <Input
                    placeholder="Twitter URL"
                    value={twitterLink}
                    onChange={(e) => setTwitterLink(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Linkedin className="h-5 w-5 text-blue-700" />
                  <Input
                    placeholder="LinkedIn URL"
                    value={linkedinLink}
                    onChange={(e) => setLinkedinLink(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Instagram className="h-5 w-5 text-pink-600" />
                  <Input
                    placeholder="Instagram URL"
                    value={instagramLink}
                    onChange={(e) => setInstagramLink(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Youtube className="h-5 w-5 text-red-600" />
                  <Input
                    placeholder="YouTube URL"
                    value={youtubeLink}
                    onChange={(e) => setYoutubeLink(e.target.value)}
                  />
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
                    {footerId ? "Update Footer" : "Create Footer"}
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