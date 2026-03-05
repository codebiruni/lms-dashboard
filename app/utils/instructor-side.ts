import {
  BookOpen,
  ClipboardList,
  PlusCircle,
  Presentation,
  ClipboardCheck,
  MessageSquare,
  HelpCircle,
  Settings2,
} from "lucide-react";

export const instructorNavItems = [
  /* =====================================================
     MY COURSES
  ===================================================== */
  {
    title: "My Courses",
    url: "#",
    icon: BookOpen,
    items: [
      { title: "Courses", url: "/instructor/course" },
      { title: "Course Sections", url: "/instructor/course-section" },
      { title: "Lessons", url: "/instructor/lesson" },
      { title: "Assignments", url: "/instructor/assignment" },
      { title: "Quizzes", url: "/instructor/quiz" },
      { title: "Quiz Submissions", url: "/instructor/quiz-submission" },
    ],
  },

  /* =====================================================
     CREATE CONTENT
  ===================================================== */
  {
    title: "Create Content",
    url: "#",
    icon: PlusCircle,
    items: [
      { title: "Create Section", url: "/instructor/course-section/create" },
      { title: "Create Lesson", url: "/instructor/lesson/create" },
      { title: "Create Assignment", url: "/instructor/assignment/create" },
      { title: "Create Quiz", url: "/instructor/quiz/create" },
    ],
  },

  /* =====================================================
     CLASSES
  ===================================================== */
  {
    title: "Classes",
    url: "#",
    icon: Presentation,
    items: [
      { title: "Live Classes", url: "/instructor/live-class" },
      { title: "Meetings", url: "/instructor/meeting" },
      { title: "Recordings", url: "/instructor/recording" },
    ],
  },

  /* =====================================================
     SCHEDULE
  ===================================================== */
  {
    title: "Schedule",
    url: "#",
    icon: ClipboardList,
    items: [
      { title: "Create Live Class", url: "/instructor/live-class/create" },
      { title: "Create Meeting", url: "/instructor/meeting/create" },
      { title: "Upload Recording", url: "/instructor/recording/create" },
    ],
  },

  /* =====================================================
     STUDENT PROGRESS
  ===================================================== */
  {
    title: "Student Progress",
    url: "#",
    icon: ClipboardCheck,
    items: [
      { title: "Attendance", url: "/instructor/attendance" },
      { title: "Course Progress", url: "/instructor/course-progress" },
      { title: "Enrollments", url: "/instructor/enrollment" },
    ],
  },

  /* =====================================================
     STUDENT ENGAGEMENT
  ===================================================== */
  {
    title: "Student Interaction",
    url: "#",
    icon: MessageSquare,
    items: [
      { title: "Reviews", url: "/instructor/review" },
      { title: "Questions", url: "/instructor/question" },
    ],
  },

  /* =====================================================
     RESPOND
  ===================================================== */
  {
    title: "Respond",
    url: "#",
    icon: HelpCircle,
    items: [
      { title: "Answer Questions", url: "/instructor/question/respond" },
      { title: "Reply Reviews", url: "/instructor/review/respond" },
    ],
  },

  /* =====================================================
     SETTINGS
  ===================================================== */
  {
    title: "Settings",
    url: "#",
    icon: Settings2,
    items: [
      { title: "Profile Settings", url: "/instructor/settings/profile" },
      { title: "Account Settings", url: "/instructor/settings/account" },
    ],
  },
];