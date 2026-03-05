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
  Award,
  Target,
  Heart,
  MessageCircle,
  CheckCircle,
  Search,
  X,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import POSTDATA from "@/app/default/functions/Post";
import GETDATA from "@/app/default/functions/GetData";
import PATCHDATA from "@/app/default/functions/Patch";
import useFetchCourseSections from "@/app/default/custom-component/useCouesSection";
import useFetchCategory from "@/app/default/custom-component/useFeatchCategory";

// Types based on the schema
interface BannerSection {
  baseText: string;
  title: {
    highlightText: string;
    blackText: string;
  };
  descRiption: string;
  bannerPng: string | null;
  bottomBaseText: {
    firstText: string;
    secondText: string;
  };
  list: {
    firstList: string;
    secondList: string;
    thirdList: string;
  };
}

interface CourseSection {
  title: {
    highlightText: string;
    blackText: string;
  };
  description: string;
  courseList: Array<{
    courseId: {
      _id: string;
      title: string;
    };
  }>;
}

interface CategorySection {
  title: {
    highlightText: string;
    blackText: string;
  };
  description: string;
  categoryList: Array<{
    categoryId: {
      _id: string;
      name: string;
    };
  }>;
}

interface WelcomeSection {
  title: {
    highlightText: string;
    blackText: string;
  };
  description: string;
  image: string | null;
  video: string;
}

interface FeatureSection {
  title: {
    highlightText: string;
    blackText: string;
  };
  description: string;
  features: Array<{
    title: string;
    description: string;
    image: string | null;
  }>;
}

interface WhyChooseUsSection {
  title: {
    highlightText: string;
    blackText: string;
  };
  description: string;
  cards: Array<{
    title: string;
    description: string;
    image: string | null;
  }>;
}

interface InstructorSection {
  title: {
    highlightText: string;
    blackText: string;
  };
  description: string;
  list: Array<{
    firstList: string;
    secondList: string;
    thirdList: string;
  }>;
}

interface TestimonialSection {
  title: {
    highlightText: string;
    blackText: string;
  };
  description: string;
  testimonials: Array<{
    name: string;
    feedback: string;
    image: string | null;
    stars: number;
  }>;
}

interface HomePageData {
  _id?: string;
  bannerSection: BannerSection;
  courseSection: CourseSection;
  categorySection: CategorySection;
  welcomeSection: WelcomeSection;
  fetureSection: FeatureSection;
  whyChooseUsSection: WhyChooseUsSection;
  instructorSection: InstructorSection;
  testimonialSection: TestimonialSection;
}

// Searchable dropdown component for courses
const CourseSearchDropdown = ({
  selectedCourses,
  onSelect,
  onRemove,
}: {
  selectedCourses: Array<{ _id: string; title: string }>;
  onSelect: (course: { _id: string; title: string }) => void;
  onRemove: (courseId: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  
  const { courseSections, isLoading } = useFetchCourseSections({
    search,
    limit: 20,
    published: true,
  });

  // Transform course sections to unique courses
  const uniqueCourses = React.useMemo(() => {
    const coursesMap = new Map();
    courseSections.forEach(section => {
      if (section.course && !coursesMap.has(section.course._id)) {
        coursesMap.set(section.course._id, {
          _id: section.course._id,
          title: section.course.title,
        });
      }
    });
    return Array.from(coursesMap.values());
  }, [courseSections]);

  return (
    <div className="space-y-2">
      <Label>Select Courses</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedCourses.length > 0
              ? `${selectedCourses.length} course(s) selected`
              : "Select courses..."}
            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search courses..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>
                {isLoading ? "Loading..." : "No courses found."}
              </CommandEmpty>
              <CommandGroup>
                {uniqueCourses.map((course) => (
                  <CommandItem
                    key={course._id}
                    value={course.title}
                    onSelect={() => {
                      onSelect(course);
                      setOpen(false);
                    }}
                  >
                    <CheckCircle
                      className={`mr-2 h-4 w-4 ${
                        selectedCourses.some(c => c._id === course._id)
                          ? "text-primary"
                          : "opacity-0"
                      }`}
                    />
                    {course.title}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedCourses.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedCourses.map((course) => (
            <Badge key={course._id} variant="secondary" className="gap-1">
              {course.title}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onRemove(course._id)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

// Searchable dropdown component for categories
const CategorySearchDropdown = ({
  selectedCategories,
  onSelect,
  onRemove,
}: {
  selectedCategories: Array<{ _id: string; name: string }>;
  onSelect: (category: { _id: string; name: string }) => void;
  onRemove: (categoryId: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  
  const { categories, isLoading } = useFetchCategory({
    search,
    limit: 20,
  });

  return (
    <div className="space-y-2">
      <Label>Select Categories</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedCategories.length > 0
              ? `${selectedCategories.length} categor(ies) selected`
              : "Select categories..."}
            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search categories..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>
                {isLoading ? "Loading..." : "No categories found."}
              </CommandEmpty>
              <CommandGroup>
                {categories.map((category) => (
                  <CommandItem
                    key={category._id}
                    value={category.name}
                    onSelect={() => {
                      onSelect({ _id: category._id, name: category.name });
                      setOpen(false);
                    }}
                  >
                    <CheckCircle
                      className={`mr-2 h-4 w-4 ${
                        selectedCategories.some(c => c._id === category._id)
                          ? "text-primary"
                          : "opacity-0"
                      }`}
                    />
                    {category.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedCategories.map((category) => (
            <Badge key={category._id} variant="secondary" className="gap-1">
              {category.name}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onRemove(category._id)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

// Tab order for navigation
const TAB_ORDER = [
  "banner",
  "welcome",
  "courses",
  "categories",
  "features",
  "why-choose",
  "instructors",
  "testimonials",
];

export default function ManageHomePage() {
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [pageId, setPageId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("banner");

  // Banner Section
  const [bannerBaseText, setBannerBaseText] = useState("");
  const [bannerHighlightText, setBannerHighlightText] = useState("");
  const [bannerBlackText, setBannerBlackText] = useState("");
  const [bannerDescription, setBannerDescription] = useState("");
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [bannerImagePreview, setBannerImagePreview] = useState<string | null>(null);
  const [bannerFirstBottomText, setBannerFirstBottomText] = useState("");
  const [bannerSecondBottomText, setBannerSecondBottomText] = useState("");
  const [bannerFirstList, setBannerFirstList] = useState("");
  const [bannerSecondList, setBannerSecondList] = useState("");
  const [bannerThirdList, setBannerThirdList] = useState("");

  // Course Section
  const [courseHighlightText, setCourseHighlightText] = useState("");
  const [courseBlackText, setCourseBlackText] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<Array<{ _id: string; title: string }>>([]);

  // Category Section
  const [categoryHighlightText, setCategoryHighlightText] = useState("");
  const [categoryBlackText, setCategoryBlackText] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Array<{ _id: string; name: string }>>([]);

  // Welcome Section
  const [welcomeHighlightText, setWelcomeHighlightText] = useState("");
  const [welcomeBlackText, setWelcomeBlackText] = useState("");
  const [welcomeDescription, setWelcomeDescription] = useState("");
  const [welcomeImage, setWelcomeImage] = useState<File | null>(null);
  const [welcomeImagePreview, setWelcomeImagePreview] = useState<string | null>(null);
  const [welcomeVideo, setWelcomeVideo] = useState("");

  // Feature Section
  const [featureHighlightText, setFeatureHighlightText] = useState("");
  const [featureBlackText, setFeatureBlackText] = useState("");
  const [featureDescription, setFeatureDescription] = useState("");
  const [features, setFeatures] = useState<Array<{ title: string; description: string; image: File | null; preview: string | null }>>([
    { title: "", description: "", image: null, preview: null },
  ]);

  // Why Choose Us Section
  const [whyChooseHighlightText, setWhyChooseHighlightText] = useState("");
  const [whyChooseBlackText, setWhyChooseBlackText] = useState("");
  const [whyChooseDescription, setWhyChooseDescription] = useState("");
  const [whyChooseCards, setWhyChooseCards] = useState<Array<{ title: string; description: string; image: File | null; preview: string | null }>>([
    { title: "", description: "", image: null, preview: null },
  ]);

  // Instructor Section
  const [instructorHighlightText, setInstructorHighlightText] = useState("");
  const [instructorBlackText, setInstructorBlackText] = useState("");
  const [instructorDescription, setInstructorDescription] = useState("");
  const [instructorList, setInstructorList] = useState<Array<{ firstList: string; secondList: string; thirdList: string }>>([
    { firstList: "", secondList: "", thirdList: "" },
  ]);

  // Testimonial Section
  const [testimonialHighlightText, setTestimonialHighlightText] = useState("");
  const [testimonialBlackText, setTestimonialBlackText] = useState("");
  const [testimonialDescription, setTestimonialDescription] = useState("");
  const [testimonials, setTestimonials] = useState<Array<{ name: string; feedback: string; stars: number; image: File | null; preview: string | null }>>([
    { name: "", feedback: "", stars: 5, image: null, preview: null },
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
      const response = await GETDATA("/v1/home-page");

      if (response?.success && response?.data) {
        const data = response.data;
        setPageId(data._id || null);

        // Banner Section
        setBannerBaseText(data.bannerSection?.baseText || "");
        setBannerHighlightText(data.bannerSection?.title?.highlightText || "");
        setBannerBlackText(data.bannerSection?.title?.blackText || "");
        setBannerDescription(data.bannerSection?.descRiption || "");
        setBannerImagePreview(data.bannerSection?.bannerPng || null);
        setBannerFirstBottomText(data.bannerSection?.bottomBaseText?.firstText || "");
        setBannerSecondBottomText(data.bannerSection?.bottomBaseText?.secondText || "");
        setBannerFirstList(data.bannerSection?.list?.firstList || "");
        setBannerSecondList(data.bannerSection?.list?.secondList || "");
        setBannerThirdList(data.bannerSection?.list?.thirdList || "");

        // Course Section
        setCourseHighlightText(data.courseSection?.title?.highlightText || "");
        setCourseBlackText(data.courseSection?.title?.blackText || "");
        setCourseDescription(data.courseSection?.description || "");
        if (data.courseSection?.courseList) {
          setSelectedCourses(
            data.courseSection.courseList.map((item: any) => ({
              _id: item.courseId._id,
              title: item.courseId.title,
            }))
          );
        }

        // Category Section
        setCategoryHighlightText(data.categorySection?.title?.highlightText || "");
        setCategoryBlackText(data.categorySection?.title?.blackText || "");
        setCategoryDescription(data.categorySection?.description || "");
        if (data.categorySection?.categoryList) {
          setSelectedCategories(
            data.categorySection.categoryList.map((item: any) => ({
              _id: item.categoryId._id,
              name: item.categoryId.name,
            }))
          );
        }

        // Welcome Section
        setWelcomeHighlightText(data.welcomeSection?.title?.highlightText || "");
        setWelcomeBlackText(data.welcomeSection?.title?.blackText || "");
        setWelcomeDescription(data.welcomeSection?.description || "");
        setWelcomeImagePreview(data.welcomeSection?.image || null);
        setWelcomeVideo(data.welcomeSection?.video || "");

        // Feature Section
        setFeatureHighlightText(data.fetureSection?.title?.highlightText || "");
        setFeatureBlackText(data.fetureSection?.title?.blackText || "");
        setFeatureDescription(data.fetureSection?.description || "");
        if (data.fetureSection?.features) {
          setFeatures(
            data.fetureSection.features.map((f: any) => ({
              title: f.title,
              description: f.description,
              image: null,
              preview: f.image,
            }))
          );
        }

        // Why Choose Us Section
        setWhyChooseHighlightText(data.whyChooseUsSection?.title?.highlightText || "");
        setWhyChooseBlackText(data.whyChooseUsSection?.title?.blackText || "");
        setWhyChooseDescription(data.whyChooseUsSection?.description || "");
        if (data.whyChooseUsSection?.cards) {
          setWhyChooseCards(
            data.whyChooseUsSection.cards.map((c: any) => ({
              title: c.title,
              description: c.description,
              image: null,
              preview: c.image,
            }))
          );
        }

        // Instructor Section
        setInstructorHighlightText(data.instructorSection?.title?.highlightText || "");
        setInstructorBlackText(data.instructorSection?.title?.blackText || "");
        setInstructorDescription(data.instructorSection?.description || "");
        if (data.instructorSection?.list) {
          setInstructorList(data.instructorSection.list);
        }

        // Testimonial Section
        setTestimonialHighlightText(data.testimonialSection?.title?.highlightText || "");
        setTestimonialBlackText(data.testimonialSection?.title?.blackText || "");
        setTestimonialDescription(data.testimonialSection?.description || "");
        if (data.testimonialSection?.testimonials) {
          setTestimonials(
            data.testimonialSection.testimonials.map((t: any) => ({
              name: t.name,
              feedback: t.feedback,
              stars: t.stars,
              image: null,
              preview: t.image,
            }))
          );
        }

        // Mark all tabs as validated since we have existing data
        setValidatedTabs(new Set(TAB_ORDER));
      }
    } catch (error: any) {
      console.error("Error fetching page data:", error);
      toast.error("Failed to fetch home page data");
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

  // Feature handlers
  const addFeature = () => {
    setFeatures((prev) => [
      ...prev,
      { title: "", description: "", image: null, preview: null },
    ]);
  };

  const removeFeature = (index: number) => {
    setFeatures((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const updateFeature = (
    index: number,
    field: keyof Omit<typeof features[0], "image" | "preview">,
    value: string
  ) => {
    setFeatures((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleFeatureImageChange = (
    index: number,
    file: File,
    preview: string
  ) => {
    setFeatures((prev) => {
      const updated = [...prev];
      updated[index].image = file;
      updated[index].preview = preview;
      return updated;
    });
  };

  // Why Choose handlers
  const addWhyChooseCard = () => {
    setWhyChooseCards((prev) => [
      ...prev,
      { title: "", description: "", image: null, preview: null },
    ]);
  };

  const removeWhyChooseCard = (index: number) => {
    setWhyChooseCards((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const updateWhyChooseCard = (
    index: number,
    field: keyof Omit<typeof whyChooseCards[0], "image" | "preview">,
    value: string
  ) => {
    setWhyChooseCards((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleWhyChooseImageChange = (
    index: number,
    file: File,
    preview: string
  ) => {
    setWhyChooseCards((prev) => {
      const updated = [...prev];
      updated[index].image = file;
      updated[index].preview = preview;
      return updated;
    });
  };

  // Instructor list handlers
  const addInstructorListItem = () => {
    setInstructorList((prev) => [
      ...prev,
      { firstList: "", secondList: "", thirdList: "" },
    ]);
  };

  const removeInstructorListItem = (index: number) => {
    setInstructorList((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const updateInstructorListItem = (
    index: number,
    field: keyof typeof instructorList[0],
    value: string
  ) => {
    setInstructorList((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Testimonial handlers
  const addTestimonial = () => {
    setTestimonials((prev) => [
      ...prev,
      { name: "", feedback: "", stars: 5, image: null, preview: null },
    ]);
  };

  const removeTestimonial = (index: number) => {
    setTestimonials((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const updateTestimonial = (
    index: number,
    field: keyof Omit<typeof testimonials[0], "image" | "preview">,
    value: string | number
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
    setTestimonials((prev) => {
      const updated = [...prev];
      updated[index].image = file;
      updated[index].preview = preview;
      return updated;
    });
  };

  // Validation functions
  const validateBannerTab = (): boolean => {
    if (!bannerBaseText.trim()) {
      toast.error("Banner base text is required");
      return false;
    }
    if (!bannerHighlightText.trim()) {
      toast.error("Banner highlight text is required");
      return false;
    }
    if (!bannerBlackText.trim()) {
      toast.error("Banner black text is required");
      return false;
    }
    if (!bannerDescription.trim()) {
      toast.error("Banner description is required");
      return false;
    }
    if (!bannerImagePreview && !bannerImage) {
      toast.error("Banner image is required");
      return false;
    }
    if (!bannerFirstBottomText.trim() || !bannerSecondBottomText.trim()) {
      toast.error("Both bottom text fields are required");
      return false;
    }
    if (!bannerFirstList.trim() || !bannerSecondList.trim() || !bannerThirdList.trim()) {
      toast.error("All list items are required");
      return false;
    }
    return true;
  };

  const validateWelcomeTab = (): boolean => {
    if (!welcomeHighlightText.trim()) {
      toast.error("Welcome section highlight text is required");
      return false;
    }
    if (!welcomeBlackText.trim()) {
      toast.error("Welcome section black text is required");
      return false;
    }
    if (!welcomeDescription.trim()) {
      toast.error("Welcome section description is required");
      return false;
    }
    if (!welcomeImagePreview && !welcomeImage) {
      toast.error("Welcome section image is required");
      return false;
    }
    return true;
  };

  const validateCoursesTab = (): boolean => {
    if (!courseHighlightText.trim()) {
      toast.error("Course section highlight text is required");
      return false;
    }
    if (!courseBlackText.trim()) {
      toast.error("Course section black text is required");
      return false;
    }
    if (!courseDescription.trim()) {
      toast.error("Course section description is required");
      return false;
    }
    if (selectedCourses.length === 0) {
      toast.error("At least one course must be selected");
      return false;
    }
    return true;
  };

  const validateCategoriesTab = (): boolean => {
    if (!categoryHighlightText.trim()) {
      toast.error("Category section highlight text is required");
      return false;
    }
    if (!categoryBlackText.trim()) {
      toast.error("Category section black text is required");
      return false;
    }
    if (!categoryDescription.trim()) {
      toast.error("Category section description is required");
      return false;
    }
    if (selectedCategories.length === 0) {
      toast.error("At least one category must be selected");
      return false;
    }
    return true;
  };

  const validateFeaturesTab = (): boolean => {
    if (!featureHighlightText.trim()) {
      toast.error("Features section highlight text is required");
      return false;
    }
    if (!featureBlackText.trim()) {
      toast.error("Features section black text is required");
      return false;
    }
    if (!featureDescription.trim()) {
      toast.error("Features section description is required");
      return false;
    }
    
    const hasValidFeature = features.some(
      f => f.title.trim() || f.description.trim()
    );
    if (!hasValidFeature) {
      toast.error("At least one feature is required");
      return false;
    }
    return true;
  };

  const validateWhyChooseTab = (): boolean => {
    if (!whyChooseHighlightText.trim()) {
      toast.error("Why Choose Us section highlight text is required");
      return false;
    }
    if (!whyChooseBlackText.trim()) {
      toast.error("Why Choose Us section black text is required");
      return false;
    }
    if (!whyChooseDescription.trim()) {
      toast.error("Why Choose Us section description is required");
      return false;
    }
    
    const hasValidCard = whyChooseCards.some(
      c => c.title.trim() || c.description.trim()
    );
    if (!hasValidCard) {
      toast.error("At least one why choose us card is required");
      return false;
    }
    return true;
  };

  const validateInstructorsTab = (): boolean => {
    if (!instructorHighlightText.trim()) {
      toast.error("Instructor section highlight text is required");
      return false;
    }
    if (!instructorBlackText.trim()) {
      toast.error("Instructor section black text is required");
      return false;
    }
    if (!instructorDescription.trim()) {
      toast.error("Instructor section description is required");
      return false;
    }
    
    const hasValidItem = instructorList.some(
      item => item.firstList.trim() || item.secondList.trim() || item.thirdList.trim()
    );
    if (!hasValidItem) {
      toast.error("At least one instructor list item is required");
      return false;
    }
    return true;
  };

  const validateTestimonialsTab = (): boolean => {
    if (!testimonialHighlightText.trim()) {
      toast.error("Testimonial section highlight text is required");
      return false;
    }
    if (!testimonialBlackText.trim()) {
      toast.error("Testimonial section black text is required");
      return false;
    }
    if (!testimonialDescription.trim()) {
      toast.error("Testimonial section description is required");
      return false;
    }
    
    const hasValidTestimonial = testimonials.some(
      t => t.name.trim() || t.feedback.trim()
    );
    if (!hasValidTestimonial) {
      toast.error("At least one testimonial is required");
      return false;
    }
    return true;
  };

  // Navigation handlers
  const handleNext = () => {
    const currentIndex = TAB_ORDER.indexOf(activeTab);
    
    let isValid = false;
    
    switch (activeTab) {
      case "banner":
        isValid = validateBannerTab();
        break;
      case "welcome":
        isValid = validateWelcomeTab();
        break;
      case "courses":
        isValid = validateCoursesTab();
        break;
      case "categories":
        isValid = validateCategoriesTab();
        break;
      case "features":
        isValid = validateFeaturesTab();
        break;
      case "why-choose":
        isValid = validateWhyChooseTab();
        break;
      case "instructors":
        isValid = validateInstructorsTab();
        break;
      case "testimonials":
        isValid = validateTestimonialsTab();
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
    if (!validateBannerTab()) return;
    if (!validateWelcomeTab()) return;
    if (!validateCoursesTab()) return;
    if (!validateCategoriesTab()) return;
    if (!validateFeaturesTab()) return;
    if (!validateWhyChooseTab()) return;
    if (!validateInstructorsTab()) return;
    if (!validateTestimonialsTab()) return;

    try {
      setLoading(true);

      const formData = new FormData();
      const images: File[] = [];

      // Prepare the data structure
      const data = {
        bannerSection: {
          baseText: bannerBaseText,
          title: {
            highlightText: bannerHighlightText,
            blackText: bannerBlackText,
          },
          descRiption: bannerDescription,
          bottomBaseText: {
            firstText: bannerFirstBottomText,
            secondText: bannerSecondBottomText,
          },
          list: {
            firstList: bannerFirstList,
            secondList: bannerSecondList,
            thirdList: bannerThirdList,
          },
        },
        courseSection: {
          title: {
            highlightText: courseHighlightText,
            blackText: courseBlackText,
          },
          description: courseDescription,
          courseList: selectedCourses.map(course => ({
            courseId: course._id,
          })),
        },
        categorySection: {
          title: {
            highlightText: categoryHighlightText,
            blackText: categoryBlackText,
          },
          description: categoryDescription,
          categoryList: selectedCategories.map(category => ({
            categoryId: category._id,
          })),
        },
        welcomeSection: {
          title: {
            highlightText: welcomeHighlightText,
            blackText: welcomeBlackText,
          },
          description: welcomeDescription,
          video: welcomeVideo,
        },
        fetureSection: {
          title: {
            highlightText: featureHighlightText,
            blackText: featureBlackText,
          },
          description: featureDescription,
          features: features.map(f => ({
            title: f.title,
            description: f.description,
          })),
        },
        whyChooseUsSection: {
          title: {
            highlightText: whyChooseHighlightText,
            blackText: whyChooseBlackText,
          },
          description: whyChooseDescription,
          cards: whyChooseCards.map(c => ({
            title: c.title,
            description: c.description,
          })),
        },
        instructorSection: {
          title: {
            highlightText: instructorHighlightText,
            blackText: instructorBlackText,
          },
          description: instructorDescription,
          list: instructorList,
        },
        testimonialSection: {
          title: {
            highlightText: testimonialHighlightText,
            blackText: testimonialBlackText,
          },
          description: testimonialDescription,
          testimonials: testimonials.map(t => ({
            name: t.name,
            feedback: t.feedback,
            stars: t.stars,
          })),
        },
      };

      // Add the data as a JSON string
      formData.append("data", JSON.stringify(data));

      // Collect all images in the correct order
      if (bannerImage) images.push(bannerImage);
      if (welcomeImage) images.push(welcomeImage);
      
      features.forEach(f => {
        if (f.image) images.push(f.image);
      });
      
      whyChooseCards.forEach(c => {
        if (c.image) images.push(c.image);
      });
      
      testimonials.forEach(t => {
        if (t.image) images.push(t.image);
      });

      // Append all images
      images.forEach(image => {
        formData.append("images", image);
      });

      let response;

      if (pageId) {
        response = await PATCHDATA(`/v1/home-page/${pageId}`, formData);
      } else {
        response = await POSTDATA("/v1/home-page", formData);
      }

      if (!response?.success) {
        throw new Error(response?.message || "Failed to save home page");
      }

      toast.success(`Home page ${pageId ? "updated" : "created"} successfully!`);
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

  const isLastTab = activeTab === "testimonials";
  const isFirstTab = activeTab === "banner";

  return (
    <div className="container mx-auto py-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Manage Home Page {pageId ? "(Edit Mode)" : "(Create New)"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure your home page. Only one configuration will be saved.
          </p>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
              <TabsTrigger value="banner" className="text-xs px-2">
                Banner {validatedTabs.has("banner") && "✓"}
              </TabsTrigger>
              <TabsTrigger value="welcome" className="text-xs px-2">
                Welcome {validatedTabs.has("welcome") && "✓"}
              </TabsTrigger>
              <TabsTrigger value="courses" className="text-xs px-2">
                Courses {validatedTabs.has("courses") && "✓"}
              </TabsTrigger>
              <TabsTrigger value="categories" className="text-xs px-2">
                Categories {validatedTabs.has("categories") && "✓"}
              </TabsTrigger>
              <TabsTrigger value="features" className="text-xs px-2">
                Features {validatedTabs.has("features") && "✓"}
              </TabsTrigger>
              <TabsTrigger value="why-choose" className="text-xs px-2">
                Why Us {validatedTabs.has("why-choose") && "✓"}
              </TabsTrigger>
              <TabsTrigger value="instructors" className="text-xs px-2">
                Instructors {validatedTabs.has("instructors") && "✓"}
              </TabsTrigger>
              <TabsTrigger value="testimonials" className="text-xs px-2">
                Testimonials {validatedTabs.has("testimonials") && "✓"}
              </TabsTrigger>
            </TabsList>

            {/* Banner Tab */}
            <TabsContent value="banner" className="space-y-6">
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>
                      Base Text <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="e.g., WELCOME TO"
                      value={bannerBaseText}
                      onChange={(e) => setBannerBaseText(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>
                      Highlight Text <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="e.g., EDULEARN"
                      value={bannerHighlightText}
                      onChange={(e) => setBannerHighlightText(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Black Text <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="e.g., PLATFORM"
                      value={bannerBlackText}
                      onChange={(e) => setBannerBlackText(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    placeholder="Enter banner description"
                    value={bannerDescription}
                    onChange={(e) => setBannerDescription(e.target.value)}
                    rows={3}
                  />
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

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>
                      Bottom First Text <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="e.g., 10K+"
                      value={bannerFirstBottomText}
                      onChange={(e) => setBannerFirstBottomText(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Bottom Second Text <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="e.g., Active Students"
                      value={bannerSecondBottomText}
                      onChange={(e) => setBannerSecondBottomText(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>
                      List Item 1 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="e.g., Expert Instructors"
                      value={bannerFirstList}
                      onChange={(e) => setBannerFirstList(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      List Item 2 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="e.g., Live Sessions"
                      value={bannerSecondList}
                      onChange={(e) => setBannerSecondList(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      List Item 3 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="e.g., Certificate"
                      value={bannerThirdList}
                      onChange={(e) => setBannerThirdList(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Welcome Tab */}
            <TabsContent value="welcome" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>
                    Highlight Text <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="e.g., Welcome to"
                    value={welcomeHighlightText}
                    onChange={(e) => setWelcomeHighlightText(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    Black Text <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="e.g., Our Platform"
                    value={welcomeBlackText}
                    onChange={(e) => setWelcomeBlackText(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  placeholder="Enter welcome section description"
                  value={welcomeDescription}
                  onChange={(e) => setWelcomeDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Welcome Image <span className="text-red-500">*</span>
                </Label>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleImageDrop(e, setWelcomeImage, setWelcomeImagePreview)}
                  className="relative flex h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/40 bg-muted/30 transition hover:border-primary"
                >
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    className="absolute inset-0 cursor-pointer opacity-0"
                    onChange={(e) =>
                      e.target.files &&
                      handleImageChange(e.target.files[0], setWelcomeImage, setWelcomeImagePreview)
                    }
                  />

                  {welcomeImagePreview ? (
                    <div className="relative h-full w-full">
                      <Image
                        src={welcomeImagePreview}
                        alt="welcome preview"
                        fill
                        className="rounded-lg object-cover"
                      />
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="mb-2 h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Upload welcome image
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Video URL (optional)</Label>
                <Input
                  placeholder="e.g., https://youtube.com/..."
                  value={welcomeVideo}
                  onChange={(e) => setWelcomeVideo(e.target.value)}
                />
              </div>
            </TabsContent>

            {/* Courses Tab */}
            <TabsContent value="courses" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>
                    Highlight Text <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="e.g., Our Popular"
                    value={courseHighlightText}
                    onChange={(e) => setCourseHighlightText(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    Black Text <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="e.g., Courses"
                    value={courseBlackText}
                    onChange={(e) => setCourseBlackText(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  placeholder="Enter course section description"
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <CourseSearchDropdown
                selectedCourses={selectedCourses}
                onSelect={(course) => {
                  if (!selectedCourses.some(c => c._id === course._id)) {
                    setSelectedCourses([...selectedCourses, course]);
                  }
                }}
                onRemove={(courseId) => {
                  setSelectedCourses(selectedCourses.filter(c => c._id !== courseId));
                }}
              />
            </TabsContent>

            {/* Categories Tab */}
            <TabsContent value="categories" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>
                    Highlight Text <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="e.g., Top"
                    value={categoryHighlightText}
                    onChange={(e) => setCategoryHighlightText(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    Black Text <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="e.g., Categories"
                    value={categoryBlackText}
                    onChange={(e) => setCategoryBlackText(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  placeholder="Enter category section description"
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <CategorySearchDropdown
                selectedCategories={selectedCategories}
                onSelect={(category) => {
                  if (!selectedCategories.some(c => c._id === category._id)) {
                    setSelectedCategories([...selectedCategories, category]);
                  }
                }}
                onRemove={(categoryId) => {
                  setSelectedCategories(selectedCategories.filter(c => c._id !== categoryId));
                }}
              />
            </TabsContent>

            {/* Features Tab */}
            <TabsContent value="features" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>
                    Highlight Text <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="e.g., Platform"
                    value={featureHighlightText}
                    onChange={(e) => setFeatureHighlightText(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    Black Text <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="e.g., Features"
                    value={featureBlackText}
                    onChange={(e) => setFeatureBlackText(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  placeholder="Enter features section description"
                  value={featureDescription}
                  onChange={(e) => setFeatureDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Features</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addFeature}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Feature
                </Button>
              </div>

              {features.map((feature, index) => (
                <Card key={index} className="relative border">
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Feature Title</Label>
                        <Input
                          placeholder="Enter feature title"
                          value={feature.title}
                          onChange={(e) => updateFeature(index, "title", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Feature Description</Label>
                      <Textarea
                        placeholder="Enter feature description"
                        value={feature.description}
                        onChange={(e) => updateFeature(index, "description", e.target.value)}
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Feature Image</Label>
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (e.dataTransfer.files?.[0]) {
                            const file = e.dataTransfer.files[0];
                            handleFeatureImageChange(
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
                            handleFeatureImageChange(
                              index,
                              e.target.files[0],
                              URL.createObjectURL(e.target.files[0])
                            )
                          }
                        />
                        {feature.preview ? (
                          <div className="relative h-full w-full">
                            <Image
                              src={feature.preview}
                              alt="feature"
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
                        onClick={() => removeFeature(index)}
                        className="text-red-500 hover:text-red-600"
                        disabled={features.length <= 1}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove Feature
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Why Choose Us Tab */}
            <TabsContent value="why-choose" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>
                    Highlight Text <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="e.g., Why"
                    value={whyChooseHighlightText}
                    onChange={(e) => setWhyChooseHighlightText(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    Black Text <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="e.g., Choose Us"
                    value={whyChooseBlackText}
                    onChange={(e) => setWhyChooseBlackText(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  placeholder="Enter why choose us description"
                  value={whyChooseDescription}
                  onChange={(e) => setWhyChooseDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Why Choose Us Cards</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addWhyChooseCard}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Card
                </Button>
              </div>

              {whyChooseCards.map((card, index) => (
                <Card key={index} className="relative border">
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Card Title</Label>
                        <Input
                          placeholder="Enter card title"
                          value={card.title}
                          onChange={(e) => updateWhyChooseCard(index, "title", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Card Description</Label>
                      <Textarea
                        placeholder="Enter card description"
                        value={card.description}
                        onChange={(e) => updateWhyChooseCard(index, "description", e.target.value)}
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Card Image</Label>
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (e.dataTransfer.files?.[0]) {
                            const file = e.dataTransfer.files[0];
                            handleWhyChooseImageChange(
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
                            handleWhyChooseImageChange(
                              index,
                              e.target.files[0],
                              URL.createObjectURL(e.target.files[0])
                            )
                          }
                        />
                        {card.preview ? (
                          <div className="relative h-full w-full">
                            <Image
                              src={card.preview}
                              alt="why choose"
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
                        onClick={() => removeWhyChooseCard(index)}
                        className="text-red-500 hover:text-red-600"
                        disabled={whyChooseCards.length <= 1}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove Card
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Instructors Tab */}
            <TabsContent value="instructors" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>
                    Highlight Text <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="e.g., Meet Our"
                    value={instructorHighlightText}
                    onChange={(e) => setInstructorHighlightText(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    Black Text <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="e.g., Instructors"
                    value={instructorBlackText}
                    onChange={(e) => setInstructorBlackText(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  placeholder="Enter instructor section description"
                  value={instructorDescription}
                  onChange={(e) => setInstructorDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Instructor List Items</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addInstructorListItem}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>

              {instructorList.map((item, index) => (
                <Card key={index} className="relative border">
                  <CardContent className="pt-6">
                    <div className="grid gap-4 md:grid-cols-3">
                      <Input
                        placeholder="First list item"
                        value={item.firstList}
                        onChange={(e) =>
                          updateInstructorListItem(index, "firstList", e.target.value)
                        }
                      />
                      <Input
                        placeholder="Second list item"
                        value={item.secondList}
                        onChange={(e) =>
                          updateInstructorListItem(index, "secondList", e.target.value)
                        }
                      />
                      <div className="flex gap-2">
                        <Input
                          placeholder="Third list item"
                          value={item.thirdList}
                          onChange={(e) =>
                            updateInstructorListItem(index, "thirdList", e.target.value)
                          }
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeInstructorListItem(index)}
                          className="text-red-500 hover:text-red-600"
                          disabled={instructorList.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Testimonials Tab */}
            <TabsContent value="testimonials" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>
                    Highlight Text <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="e.g., What Our"
                    value={testimonialHighlightText}
                    onChange={(e) => setTestimonialHighlightText(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    Black Text <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="e.g., Students Say"
                    value={testimonialBlackText}
                    onChange={(e) => setTestimonialBlackText(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  placeholder="Enter testimonial section description"
                  value={testimonialDescription}
                  onChange={(e) => setTestimonialDescription(e.target.value)}
                  rows={3}
                />
              </div>

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
                        <Label>Stars</Label>
                        <Select
                          value={testimonial.stars.toString()}
                          onValueChange={(value) => 
                            updateTestimonial(index, "stars", parseInt(value))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select stars" />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <SelectItem key={star} value={star.toString()}>
                                <div className="flex">
                                  {Array(star).fill(0).map((_, i) => (
                                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  ))}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Feedback</Label>
                      <Textarea
                        placeholder="Testimonial feedback"
                        value={testimonial.feedback}
                        onChange={(e) => updateTestimonial(index, "feedback", e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Profile Image</Label>
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
                        {testimonial.preview ? (
                          <div className="relative h-full w-full">
                            <Image
                              src={testimonial.preview}
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
                    {pageId ? "Update Home Page" : "Create Home Page"}
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