/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Image from "next/image";
import { UploadCloud, ImageIcon, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import POSTDATA from "@/app/default/functions/Post";

export default function CreateUser() {
  /* -------------------- STATE -------------------- */
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<string>("");

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /* -------------------- IMAGE HANDLERS -------------------- */
  const handleFile = (file: File) => {
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  /* -------------------- SUBMIT -------------------- */
  const handleSubmit = async () => {
    if (!name || !password || !role) {
      toast.error("Name, password and role are required");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", name);
      formData.append("password", password);
      formData.append("role", role);

      if (email) formData.append("email", email);
      if (phone) formData.append("phone", phone);
      if (image) formData.append("image", image);

      const res = await POSTDATA("/v1/user", formData);

      if (!res.success) {
        throw new Error(res?.message || "Failed to create user");
      }

      toast.success("User created successfully 🎉 OTP sent to email");

      /* RESET */
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setRole("");
      setImage(null);
      setPreview(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- UI -------------------- */
  return (
    <div className="mx-auto max-w-xl">
      <Card className="rounded shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <UserPlus className="h-5 w-5" />
            Create New User
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* NAME */}
          <div className="space-y-2">
            <Label>Full Name *</Label>
            <Input
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* EMAIL */}
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* PHONE */}
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input
              placeholder="+8801XXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* PASSWORD */}
          <div className="space-y-2">
            <Label>Password *</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* ROLE */}
          <div className="space-y-2">
            <Label>Role *</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="instructor">Instructor</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* IMAGE */}
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

          {/* SUBMIT */}
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <ImageIcon className="mr-2 h-4 w-4" />
                Create User
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
