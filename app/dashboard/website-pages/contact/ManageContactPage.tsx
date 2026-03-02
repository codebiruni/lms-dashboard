/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import {
  Loader2,
  Plus,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  MessageCircle,
  MessageSquare,
  Send,
  ChevronRight,
  ChevronLeft,
  Save,
} from "lucide-react";
import { toast } from "sonner";

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
interface ContactMember {
  name: string;
  position: string;
  number: string;
}

// Tab order for navigation
const TAB_ORDER = ["basic", "banner", "contact", "social", "members"];

export default function ManageContactPage() {
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [contactPageId, setContactPageId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("basic");

  // Basic fields
  const [baseText, setBaseText] = useState("");
  const [marqueeText, setMarqueeText] = useState("");

  // Banner text (object)
  const [bannerBlackText, setBannerBlackText] = useState("");
  const [bannerColorText, setBannerColorText] = useState("");

  // Arrays for contact info
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([""]);
  const [emails, setEmails] = useState<string[]>([""]);
  const [addresses, setAddresses] = useState<string[]>([""]);

  // Social links
  const [facebookLink, setFacebookLink] = useState("");
  const [twitterLink, setTwitterLink] = useState("");
  const [linkedinLink, setLinkedinLink] = useState("");
  const [instagramLink, setInstagramLink] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [discordLink, setDiscordLink] = useState("");
  const [telegramNumber, setTelegramNumber] = useState("");

  // Contact members array
  const [contactMembers, setContactMembers] = useState<ContactMember[]>([
    { name: "", position: "", number: "" },
  ]);

  // Track which tabs have been visited/validated
  const [validatedTabs, setValidatedTabs] = useState<Set<string>>(new Set());

  // Fetch existing contact page data on component mount
  useEffect(() => {
    fetchContactPageData();
  }, []);

  const fetchContactPageData = async () => {
    try {
      setFetchLoading(true);
      const response = await GETDATA("/v1/contact-page");

      if (response?.success && response?.data) {
        const data = response.data;
        setContactPageId(data._id || null);

        // Set basic fields
        setBaseText(data.baseText || "");
        setMarqueeText(data.marqueeText || "");

        // Set banner text
        setBannerBlackText(data.bannerText?.blackText || "");
        setBannerColorText(data.bannerText?.colorText || "");

        // Set arrays with proper defaults
        setPhoneNumbers(
          data.number?.length > 0 ? data.number : [""]
        );
        setEmails(
          data.email?.length > 0 ? data.email : [""]
        );
        setAddresses(
          data.address?.length > 0 ? data.address : [""]
        );

        // Set social links
        setFacebookLink(data.facebookLink || "");
        setTwitterLink(data.twitterLink || "");
        setLinkedinLink(data.linkedinLink || "");
        setInstagramLink(data.instagramLink || "");
        setWhatsappNumber(data.whatsappNumber || "");
        setDiscordLink(data.discordLink || "");
        setTelegramNumber(data.telegramNumber || "");

        // Set contact members
        setContactMembers(
          data.contactMembers?.length > 0
            ? data.contactMembers
            : [{ name: "", position: "", number: "" }]
        );

        // Mark all tabs as validated since we have existing data
        setValidatedTabs(new Set(TAB_ORDER));
      }
    } catch (error: any) {
      console.error("Error fetching contact page data:", error);
      toast.error("Failed to fetch contact page data");
    } finally {
      setFetchLoading(false);
    }
  };

  // Array item handlers
  const addArrayItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    emptyItem: string = ""
  ) => {
    setter((prev) => [...prev, emptyItem]);
  };

  const removeArrayItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number
  ) => {
    setter((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const updateArrayItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number,
    value: string
  ) => {
    setter((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  // Contact member handlers
  const addContactMember = () => {
    setContactMembers((prev) => [...prev, { name: "", position: "", number: "" }]);
  };

  const removeContactMember = (index: number) => {
    setContactMembers((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const updateContactMember = (
    index: number,
    field: keyof ContactMember,
    value: string
  ) => {
    setContactMembers((prev) => {
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

    if (!marqueeText.trim()) {
      toast.error("Marquee text is required");
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

    return true;
  };

  const validateContactTab = (): boolean => {
    // Validate at least one phone number
    if (!phoneNumbers.some(phone => phone.trim())) {
      toast.error("At least one phone number is required");
      return false;
    }

    // Validate at least one email
    if (!emails.some(email => email.trim())) {
      toast.error("At least one email is required");
      return false;
    }

    // Validate at least one address
    if (!addresses.some(address => address.trim())) {
      toast.error("At least one address is required");
      return false;
    }

    return true;
  };

  const validateSocialTab = (): boolean => {
    // Social links are optional, always valid
    return true;
  };

  const validateMembersTab = (): boolean => {
    // Contact members are optional, but if provided, validate they have at least name
    const hasInvalidMember = contactMembers.some(
      member => (member.name.trim() || member.position.trim() || member.number.trim()) && 
                !member.name.trim()
    );

    if (hasInvalidMember) {
      toast.error("Contact members with data must have a name");
      return false;
    }

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
      case "banner":
        isValid = validateBannerTab();
        break;
      case "contact":
        isValid = validateContactTab();
        break;
      case "social":
        isValid = validateSocialTab();
        break;
      case "members":
        isValid = validateMembersTab();
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
    if (!validateBannerTab()) return;
    if (!validateContactTab()) return;
    if (!validateSocialTab()) return;
    if (!validateMembersTab()) return;

    try {
      setLoading(true);

      // Prepare data object (no FormData needed as there are no file uploads)
      const data = {
        baseText,
        bannerText: {
          blackText: bannerBlackText,
          colorText: bannerColorText,
        },
        number: phoneNumbers.filter(phone => phone.trim() !== ""),
        email: emails.filter(email => email.trim() !== ""),
        address: addresses.filter(address => address.trim() !== ""),
        facebookLink,
        twitterLink,
        linkedinLink,
        instagramLink,
        whatsappNumber,
        discordLink,
        telegramNumber,
        contactMembers: contactMembers.filter(
          member => member.name.trim() || member.position.trim() || member.number.trim()
        ),
        marqueeText,
      };

      let response;

      if (contactPageId) {
        // Update existing contact page
        response = await PATCHDATA(`/v1/contact-page/${contactPageId}`, data);
      } else {
        // Create new contact page
        response = await POSTDATA("/v1/contact-page", data);
      }

      if (!response?.success) {
        throw new Error(response?.message || "Failed to save contact page");
      }

      toast.success(`Contact page ${contactPageId ? "updated" : "created"} successfully!`);
      
      // Refresh data to get latest
      fetchContactPageData();
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

  const isLastTab = activeTab === "members";
  const isFirstTab = activeTab === "basic";

  return (
    <div className="container mx-auto py-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Manage Contact Page {contactPageId ? "(Edit Mode)" : "(Create New)"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure your contact page. Only one contact page configuration will be saved.
          </p>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
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
                Banner Text {validatedTabs.has("banner") && "✓"}
              </TabsTrigger>
              <TabsTrigger 
                value="contact"
                className={validatedTabs.has("contact") ? "border-green-500 border" : ""}
              >
                Contact Info {validatedTabs.has("contact") && "✓"}
              </TabsTrigger>
              <TabsTrigger 
                value="social"
                className={validatedTabs.has("social") ? "border-green-500 border" : ""}
              >
                Social Links {validatedTabs.has("social") && "✓"}
              </TabsTrigger>
              <TabsTrigger 
                value="members"
                className={validatedTabs.has("members") ? "border-green-500 border" : ""}
              >
                Contact Members {validatedTabs.has("members") && "✓"}
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
                    placeholder="Enter base text for the contact page"
                    value={baseText}
                    onChange={(e) => setBaseText(e.target.value)}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    This appears as the main description/text on the contact page
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>
                    Marquee Text <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="Enter marquee text (scrolling text)"
                    value={marqueeText}
                    onChange={(e) => setMarqueeText(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    This text will scroll across the page (e.g., `Get in touch with us today!`)
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Banner Text Tab */}
            <TabsContent value="banner" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>
                    Banner Black Text <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="e.g., Contact"
                    value={bannerBlackText}
                    onChange={(e) => setBannerBlackText(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    This text will appear in black color
                  </p>
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
                  <p className="text-xs text-muted-foreground">
                    This text will appear in your brand color
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-muted/30 p-4">
                <p className="text-sm font-medium">Preview:</p>
                <p className="text-xl">
                  <span className="text-foreground">{bannerBlackText || "Contact"}</span>{" "}
                  <span className="text-primary">{bannerColorText || "Us"}</span>
                </p>
              </div>
            </TabsContent>

            {/* Contact Info Tab */}
            <TabsContent value="contact" className="space-y-6">
              {/* Phone Numbers */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    <Label>
                      Phone Numbers <span className="text-red-500">*</span>
                    </Label>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem(setPhoneNumbers)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Phone
                  </Button>
                </div>

                {phoneNumbers.map((phone, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Enter phone number"
                      value={phone}
                      onChange={(e) => updateArrayItem(setPhoneNumbers, index, e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeArrayItem(setPhoneNumbers, index)}
                      className="text-red-500 hover:text-red-600"
                      disabled={phoneNumbers.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <p className="text-sm text-muted-foreground">
                  At least one phone number is required
                </p>
              </div>

              <Separator />

              {/* Emails */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    <Label>
                      Email Addresses <span className="text-red-500">*</span>
                    </Label>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem(setEmails)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Email
                  </Button>
                </div>

                {emails.map((email, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Enter email address"
                      type="email"
                      value={email}
                      onChange={(e) => updateArrayItem(setEmails, index, e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeArrayItem(setEmails, index)}
                      className="text-red-500 hover:text-red-600"
                      disabled={emails.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <p className="text-sm text-muted-foreground">
                  At least one email address is required
                </p>
              </div>

              <Separator />

              {/* Addresses */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <Label>
                      Addresses <span className="text-red-500">*</span>
                    </Label>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem(setAddresses)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Address
                  </Button>
                </div>

                {addresses.map((address, index) => (
                  <div key={index} className="flex gap-2">
                    <Textarea
                      placeholder="Enter address"
                      value={address}
                      onChange={(e) => updateArrayItem(setAddresses, index, e.target.value)}
                      className="flex-1"
                      rows={2}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeArrayItem(setAddresses, index)}
                      className="text-red-500 hover:text-red-600"
                      disabled={addresses.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <p className="text-sm text-muted-foreground">
                  At least one address is required
                </p>
              </div>
            </TabsContent>

            {/* Social Links Tab */}
            <TabsContent value="social" className="space-y-4">
              <Label>Social Media Links (Optional)</Label>
              <div className="grid gap-4 md:grid-cols-2">
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
                  <MessageCircle className="h-5 w-5 text-green-600" />
                  <Input
                    placeholder="WhatsApp Number (with country code)"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-indigo-600" />
                  <Input
                    placeholder="Discord Link"
                    value={discordLink}
                    onChange={(e) => setDiscordLink(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-blue-500" />
                  <Input
                    placeholder="Telegram Number/Username"
                    value={telegramNumber}
                    onChange={(e) => setTelegramNumber(e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Contact Members Tab */}
            <TabsContent value="members" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Contact Team Members (Optional)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addContactMember}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Member
                </Button>
              </div>

              {contactMembers.map((member, index) => (
                <Card key={index} className="relative border">
                  <CardContent className="pt-6">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          placeholder="Member name"
                          value={member.name}
                          onChange={(e) =>
                            updateContactMember(index, "name", e.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Position</Label>
                        <Input
                          placeholder="e.g., Support Manager"
                          value={member.position}
                          onChange={(e) =>
                            updateContactMember(index, "position", e.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Contact number"
                            value={member.number}
                            onChange={(e) =>
                              updateContactMember(index, "number", e.target.value)
                            }
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeContactMember(index)}
                            className="text-red-500 hover:text-red-600"
                            disabled={contactMembers.length <= 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {contactMembers.length === 0 && (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <p className="text-muted-foreground">No contact members added yet</p>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Contact members are optional. If added, name is required.
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
                    {contactPageId ? "Update Contact Page" : "Create Contact Page"}
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