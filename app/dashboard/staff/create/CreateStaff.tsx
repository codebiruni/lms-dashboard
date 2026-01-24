/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, UploadCloud, UserPlus } from "lucide-react";
import { toast } from "sonner";
import POSTDATA from "@/app/default/functions/Post";
import Image from "next/image";

interface CreateStaffPayload {
  name: string;
  email?: string;
  phone?: string;
  password: string;
  image?: string;
}

export default function CreateStaff() {
  const [loading, setLoading] = useState(false);
   const [image, setImage] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)



  const [formData, setFormData] = useState<CreateStaffPayload>({
  name: "",
  email: "",
  phone: "",
  password: "",
  image: "",
});


  const handleFile = (file: File) => {
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }



  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev, 
      [e.target.name]: e.target.value,
    }));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }


 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!formData.name || !formData.password) {
    toast.error("Name and password are required");
    return;
  }

  try {
    setLoading(true);

    const payload = new FormData();

    payload.append("name", formData.name);
    payload.append("password", formData.password);

    if (formData.email) payload.append("email", formData.email);
    if (formData.phone) payload.append("phone", formData.phone);
    if (image) payload.append("image", image);

    const res = await POSTDATA("/v1/staff", payload);

    if (!res.success) {
      throw new Error(res?.message || "Failed to create staff");
    }

    toast.success("Staff created successfully 🎉 OTP sent to email");

    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      image: "",
    });
    setImage(null);
    setPreview(null);
  } catch (error: any) {
    toast.error(error.message || "Failed to create staff");
  } finally {
    setLoading(false);
  }
};


  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Create New Staff
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-1">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="staff@example.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              placeholder="+8801XXXXXXXXX"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* -------- IMAGE -------- */}
                    <div className="space-y-2">
                      <Label>Profile Image (optional)</Label>
          
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        className="relative flex h-52 cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed border-muted-foreground/40 bg-muted/30 transition hover:border-primary"
                      >
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.webp,.gif"
                          className="absolute inset-0 cursor-pointer opacity-0"
                          onChange={(e) =>
                            e.target.files && handleFile(e.target.files[0])
                          }
                        />
          
                        {preview ? (
                          <Image
                            src={preview}
                            alt="preview"
                            fill
                            className="rounded object-cover"
                          />
                        ) : (
                          <>
                            <UploadCloud className="mb-2 h-8 w-8 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              Drag & drop image here or click to upload
                            </p>
                          </>
                        )}
                      </div>
                    </div>

          {/* Submit */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Staff"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
