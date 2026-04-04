"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import { UploadCloud, VideoIcon, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import POSTDATA from "@/app/default/functions/Post";
import useFetchLessons from "@/app/default/custom-component/useFeatchLesson";
import useFetchCourses from "@/app/default/custom-component/useFeatchCourse";

interface Quiz {
  question: string;
  options: string[];
  correctAnswer: string;
}

export default function UploadVideo() {
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [video, setVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([
    { question: "", options: ["", "", "", ""], correctAnswer: "" },
  ]);
  const [loading, setLoading] = useState(false);

  // Fetch courses using React Query
  const {
    courses,
    isLoading: loadingCourses,
    error: coursesError,
  } = useFetchCourses({
    page: 1,
    limit: 100,
    deleted: false,
    sortBy: "createdAt",
    sortOrder: -1,
  });

  // Fetch lessons when course is selected
  const {
    lessons,
    isLoading: loadingLessons,
    error: lessonsError,
    refetch: refetchLessons,
  } = useFetchLessons({
    courseSection: selectedCourseId,
    page: 1,
    limit: 100,
    deleted: false,
    published: true,
    sortBy: "order",
    sortOrder: 1,
  });

  // Show error toasts if any
  useEffect(() => {
    if (coursesError) {
      toast.error("Failed to fetch courses");
    }
  }, [coursesError]);

  useEffect(() => {
    if (lessonsError) {
      toast.error("Failed to fetch lessons");
    }
  }, [lessonsError]);

  // Reset selected lesson when course changes
  useEffect(() => {
    setSelectedLessonId("");
  }, [selectedCourseId]);

  /* -------------------- VIDEO HANDLERS -------------------- */
  const handleVideoFile = (file: File) => {
    // Validate video type
    const validTypes = [
      "video/mp4",
      "video/mpeg",
      "video/quicktime",
      "video/x-msvideo",
    ];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid video file (MP4, MPEG, MOV, AVI)");
      return;
    }

    // Validate video size (max 500MB)
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Video size should be less than 500MB");
      return;
    }

    setVideo(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      handleVideoFile(e.dataTransfer.files[0]);
    }
  };

  /* -------------------- QUIZ HANDLERS -------------------- */
  const addQuiz = () => {
    setQuizzes([
      ...quizzes,
      { question: "", options: ["", "", "", ""], correctAnswer: "" },
    ]);
  };

  const removeQuiz = (index: number) => {
    if (quizzes.length > 1) {
      setQuizzes(quizzes.filter((_, i) => i !== index));
    } else {
      toast.error("At least one quiz is required");
    }
  };

  const updateQuizQuestion = (index: number, value: string) => {
    const updated = [...quizzes];
    updated[index].question = value;
    setQuizzes(updated);
  };

  const updateQuizOption = (
    quizIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const updated = [...quizzes];
    updated[quizIndex].options[optionIndex] = value;
    setQuizzes(updated);
  };

  const updateCorrectAnswer = (quizIndex: number, value: string) => {
    const updated = [...quizzes];
    updated[quizIndex].correctAnswer = value;
    setQuizzes(updated);
  };

  /* -------------------- SUBMIT -------------------- */
  const handleSubmit = async () => {
    // Validation
    if (!selectedCourseId) {
      toast.error("Please select a course");
      return;
    }
    if (!selectedLessonId) {
      toast.error("Please select a lesson");
      return;
    }
    if (!serialNumber) {
      toast.error("Serial number is required");
      return;
    }
    if (!title) {
      toast.error("Video title is required");
      return;
    }
    if (!description) {
      toast.error("Video description is required");
      return;
    }
    if (!video) {
      toast.error("Please upload a video file");
      return;
    }

    // Validate quizzes
    for (let i = 0; i < quizzes.length; i++) {
      const quiz = quizzes[i];
      if (!quiz.question) {
        toast.error(`Please enter question for quiz ${i + 1}`);
        return;
      }
      for (let j = 0; j < quiz.options.length; j++) {
        if (!quiz.options[j]) {
          toast.error(`Please fill all options for quiz ${i + 1}`);
          return;
        }
      }
      if (!quiz.correctAnswer) {
        toast.error(`Please select correct answer for quiz ${i + 1}`);
        return;
      }
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("courseId", selectedCourseId);
      formData.append("lesson", selectedLessonId);
      formData.append("serialNumber", serialNumber);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("videoUrl", video);
      formData.append("quiz", JSON.stringify(quizzes));

      const res = await POSTDATA(`/v1/upload-video/single`, formData);

      if (!res.success) {
        throw new Error(res?.message || "Failed to upload video");
      }

      toast.success("Video uploaded successfully 🎉");

      // Reset form
      setSelectedCourseId("");
      setSelectedLessonId("");
      setSerialNumber("");
      setTitle("");
      setDescription("");
      setVideo(null);
      setVideoPreview(null);
      setQuizzes([
        { question: "", options: ["", "", "", ""], correctAnswer: "" },
      ]);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Card className="rounded shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Upload Video to Lesson
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* ---------------- COURSE SELECTION ---------------- */}
          <div className="space-y-2">
            <Label>Select Course *</Label>
            <Select
              value={selectedCourseId}
              onValueChange={setSelectedCourseId}
              disabled={loadingCourses}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course._id} value={course._id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {loadingCourses && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading courses...
              </div>
            )}
          </div>

          {/* ---------------- LESSON SELECTION ---------------- */}
          <div className="space-y-2">
            <Label>Select Lesson *</Label>
            <Select
              value={selectedLessonId}
              onValueChange={setSelectedLessonId}
              disabled={!selectedCourseId || loadingLessons}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a lesson" />
              </SelectTrigger>
              <SelectContent>
                {lessons.map((lesson) => (
                  <SelectItem key={lesson._id} value={lesson._id}>
                    Lesson {lesson.order}: {lesson.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {loadingLessons && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading lessons...
              </div>
            )}
            {selectedCourseId && lessons.length === 0 && !loadingLessons && (
              <p className="text-sm text-yellow-600">
                No lessons found for this course. Please add lessons first.
              </p>
            )}
          </div>

          {/* ---------------- SERIAL NUMBER ---------------- */}
          <div className="space-y-2">
            <Label>Serial Number *</Label>
            <Input
              type="number"
              placeholder="e.g., 1, 2, 3..."
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              The order of this video within the lesson
            </p>
          </div>

          {/* ---------------- VIDEO TITLE ---------------- */}
          <div className="space-y-2">
            <Label>Video Title *</Label>
            <Input
              placeholder="e.g., Introduction to React"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* ---------------- VIDEO DESCRIPTION ---------------- */}
          <div className="space-y-2">
            <Label>Video Description *</Label>
            <Textarea
              placeholder="Describe what students will learn in this video..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          {/* ---------------- VIDEO UPLOAD ---------------- */}
          <div className="space-y-2">
            <Label>Video File *</Label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="relative flex h-64 cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed border-muted-foreground/40 bg-muted/30 transition hover:border-primary"
            >
              <input
                type="file"
                accept=".mp4,.mov,.avi,.mpeg"
                className="absolute inset-0 cursor-pointer opacity-0"
                onChange={(e) =>
                  e.target.files && handleVideoFile(e.target.files[0])
                }
              />

              {videoPreview ? (
                <video
                  src={videoPreview}
                  controls
                  className="h-full w-full rounded object-contain"
                />
              ) : (
                <>
                  <VideoIcon className="mb-2 h-12 w-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Drag & drop video here or click to upload
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Supports: MP4, MOV, AVI, MPEG (Max 500MB)
                  </p>
                </>
              )}
            </div>
          </div>

          {/* ---------------- QUIZZES SECTION ---------------- */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Quizzes</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addQuiz}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Quiz
              </Button>
            </div>

            {quizzes.map((quiz, quizIndex) => (
              <Card key={quizIndex} className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-medium">Quiz {quizIndex + 1}</h4>
                  {quizzes.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuiz(quizIndex)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>

                {/* Question */}
                <div className="mb-4 space-y-2">
                  <Label>Question</Label>
                  <Input
                    placeholder="Enter your question"
                    value={quiz.question}
                    onChange={(e) =>
                      updateQuizQuestion(quizIndex, e.target.value)
                    }
                  />
                </div>

                {/* Options */}
                <div className="mb-4 space-y-2">
                  <Label>Options</Label>
                  {quiz.options.map((option, optIndex) => (
                    <Input
                      key={optIndex}
                      placeholder={`Option ${optIndex + 1}`}
                      value={option}
                      onChange={(e) =>
                        updateQuizOption(quizIndex, optIndex, e.target.value)
                      }
                      className="mb-2"
                    />
                  ))}
                </div>

                {/* Correct Answer */}
                <div className="space-y-2">
                  <Label>Correct Answer</Label>
                  <Select
                    value={quiz.correctAnswer}
                    onValueChange={(value) =>
                      updateCorrectAnswer(quizIndex, value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select correct answer" />
                    </SelectTrigger>
                    <SelectContent>
                      {quiz.options.map(
                        (option, optIndex) =>
                          option && (
                            <SelectItem key={optIndex} value={option}>
                              {option}
                            </SelectItem>
                          )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </Card>
            ))}
          </div>

          {/* ---------------- SUBMIT ---------------- */}
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading Video...
              </>
            ) : (
              <>
                <UploadCloud className="mr-2 h-4 w-4" />
                Upload Video
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}