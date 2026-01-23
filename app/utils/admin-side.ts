import {
  BookOpen,
  ClipboardList,
  PlusCircle,
  Presentation,
  ClipboardCheck,
  Layers,
  Award,
  MessageSquare,
  HelpCircle,
  Users,
  Settings2,
} from "lucide-react";

export const adminNavItems = [
  /* =====================================================
     ACADEMIC — BROWSE / MANAGE
  ===================================================== */
  {
    title: "Academic",
    url: "#",
    icon: BookOpen,
    items: [
      { title: "Courses", url: "/dashboard/course" },
      { title: "Course Sections", url: "/dashboard/course-section" },
      { title: "Lessons", url: "/dashboard/lesson" },
      { title: "Assignments", url: "/dashboard/assignment" },
      { title: "Quizzes", url: "/dashboard/quiz" },
      { title: "Quiz Submissions", url: "/dashboard/quiz-submission" },
    ],
  },

  /* =====================================================
     ACADEMIC — CREATE
  ===================================================== */
  {
    title: "Create Content",
    url: "#",
    icon: PlusCircle,
    items: [
      { title: "Create Course", url: "/dashboard/course/create" },
      { title: "Create Section", url: "/dashboard/course-section/create" },
      { title: "Create Lesson", url: "/dashboard/lesson/create" },
      { title: "Create Assignment", url: "/dashboard/assignment/create" },
      { title: "Create Quiz", url: "/dashboard/quiz/create" },
      { title: "Create Quiz Submission", url: "/dashboard/quiz-submission/create" },
    ],
  },

  /* =====================================================
     CLASSES & DELIVERY
  ===================================================== */
  {
    title: "Classes & Delivery",
    url: "#",
    icon: Presentation,
    items: [
      { title: "Live Classes", url: "/dashboard/live-class" },
      { title: "Meetings", url: "/dashboard/meeting" },
      { title: "Recordings", url: "/dashboard/recording" },
    ],
  },

  /* =====================================================
     CLASS CREATION
  ===================================================== */
  {
    title: "Schedule & Upload",
    url: "#",
    icon: ClipboardList,
    items: [
      { title: "Create Live Class", url: "/dashboard/live-class/create" },
      { title: "Create Meeting", url: "/dashboard/meeting/create" },
      { title: "Upload Recording", url: "/dashboard/recording/create" },
    ],
  },

  /* =====================================================
     PROGRESS & ATTENDANCE
  ===================================================== */
  {
    title: "Progress & Tracking",
    url: "#",
    icon: ClipboardCheck,
    items: [
      { title: "Attendance", url: "/dashboard/attendance" },
      { title: "Course Progress", url: "/dashboard/course-progress" },
      { title: "Enrollment", url: "/dashboard/enrollment" },
    ],
  },

  /* =====================================================
     PROGRESS — CREATE / UPDATE
  ===================================================== */
  {
    title: "Update Records",
    url: "#",
    icon: PlusCircle,
    items: [
      { title: "Create Attendance", url: "/dashboard/attendance/create" },
      { title: "Create Progress", url: "/dashboard/course-progress/create" },
      { title: "Create Enrollment", url: "/dashboard/enrollment/create" },
    ],
  },

  /* =====================================================
     CATEGORIES & CERTIFICATION
  ===================================================== */
  {
    title: "Structure",
    url: "#",
    icon: Layers,
    items: [
      { title: "Categories", url: "/dashboard/category" },
      { title: "Sub Categories", url: "/dashboard/sub-category" },
      { title: "Certificates", url: "/dashboard/certificate" },
    ],
  },

  /* =====================================================
     STRUCTURE — CREATE
  ===================================================== */
  {
    title: "Build Structure",
    url: "#",
    icon: Award,
    items: [
      { title: "Create Category", url: "/dashboard/category/create" },
      { title: "Create Sub Category", url: "/dashboard/sub-category/create" },
      { title: "Create Certificate", url: "/dashboard/certificate/create" },
    ],
  },

  /* =====================================================
     ENGAGEMENT & FEEDBACK
  ===================================================== */
  {
    title: "Engagement",
    url: "#",
    icon: MessageSquare,
    items: [
      { title: "Leads", url: "/dashboard/lead" },
      { title: "Follow Ups", url: "/dashboard/follow-up" },
      { title: "Reviews", url: "/dashboard/review" },
      { title: "Questions", url: "/dashboard/question" },
    ],
  },

  /* =====================================================
     ENGAGEMENT — CREATE
  ===================================================== */
  {
    title: "Respond & Create",
    url: "#",
    icon: HelpCircle,
    items: [
      { title: "Create Lead", url: "/dashboard/lead/create" },
      { title: "Create Follow Up", url: "/dashboard/follow-up/create" },
      { title: "Create Review", url: "/dashboard/review/create" },
      { title: "Create Question", url: "/dashboard/question/create" },
    ],
  },

  /* =====================================================
     USER MANAGEMENT
  ===================================================== */
  {
    title: "User Management",
    url: "#",
    icon: Users,
    items: [
      { title: "Students", url: "/dashboard/student" },
      { title: "Instructors", url: "/dashboard/instructor" },
      { title: "Staff", url: "/dashboard/staff" },
      { title: "Users", url: "/dashboard/user" },
    ],
  },

  /* =====================================================
     USER — CREATE
  ===================================================== */
  {
    title: "Add Users",
    url: "#",
    icon: PlusCircle,
    items: [
      { title: "Create Student", url: "/dashboard/student/create" },
      { title: "Create Instructor", url: "/dashboard/instructor/create" },
      { title: "Create Staff", url: "/dashboard/staff/create" },
      { title: "Create User", url: "/dashboard/user/create" },
    ],
  },

  /* =====================================================
     SYSTEM
  ===================================================== */
  {
    title: "System",
    url: "#",
    icon: Settings2,
    items: [{ title: "Settings", url: "/dashboard/settings" }],
  },
];
