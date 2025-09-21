"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { createComment } from "@/app/actions/commentActions";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ImagePlus, X } from "lucide-react";
import Rating from "@mui/material/Rating";
import axios from "axios";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type Comment = {
  _id: string;
  text: string;
  rating: number;
  authorClerkId?: string;
  authorName?: string;
  images?: any[];
  _createdAt: string;
};

export default function CommentSection({ productId }: { productId: string }) {
  const { isSignedIn, user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [comments, setComments] = useState<Comment[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form state
  const [text, setText] = useState("");
  const [textError, setTextError] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Full-view image modal
  const [openImage, setOpenImage] = useState<string | null>(null);

  useEffect(() => {
    fetchComments(page);
  }, [page]);

  function handleFileClick() {
    fileInputRef.current?.click();
  }

  function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(e.target.files || []);

    // Validate files (type + size)
    const validFiles = selectedFiles.filter((f) => {
      const isValidType = ["image/jpeg", "image/png", "image/webp"].includes(f.type);
      if (!isValidType) {
        alert(`${f.name} is not a supported format (only jpg, png, webp allowed).`);
        return false;
      }

      if (f.size > 0.5 * 1024 * 1024) {
        alert(`${f.name} is larger than 0.5MB and will be skipped.`);
        return false;
      }
      return true;
    });

    // Update states
    setFiles((prev) => [...prev, ...validFiles]);
    setPreviewUrls((prev) => [
      ...prev,
      ...validFiles.map((f) => URL.createObjectURL(f)),
    ]);
  }

  function removePreview(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  }

  async function fetchComments(pageNum: number) {
    setLoading(true);
    try {
      const res = await axios.get("/api/comments", {
        params: { productId, page: pageNum, limit: 5 },
      });
      setComments(res.data.comments);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isSignedIn) return alert("Sign in first");

    if (!text.trim()) {
      setTextError(true);
      return;
    }
    setTextError(false);

    if (!rating) return alert("Rating required");

    const formData = new FormData();
    formData.append("productId", productId);
    formData.append("text", text);
    formData.append("rating", rating.toString());
    files.forEach((f) => formData.append("images", f));

    try {
      setUploadProgress(10);

      await createComment(formData);

      // Optimistically add comment
      const newComment: Comment = {
        _id: "temp-" + Math.random().toString(36).substring(2),
        text,
        rating,
        authorClerkId: user?.id,
        authorName: user?.fullName || "You",
        images: previewUrls,
        _createdAt: new Date().toISOString(),
      };

      setComments([newComment, ...comments]);
      setText("");
      setRating(null);
      setFiles([]);
      setPreviewUrls([]);
      setUploadProgress(0);
    } catch (err) {
      console.error(err);
      alert("Failed to add comment");
      setUploadProgress(0);
    }
  }

  return (
    <div className="space-y-6 flex flex-col justify-center items-center">
      {/* Form */}
      {isSignedIn && (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Add a review</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex flex-col">
                <Textarea
                  placeholder="Write your comment..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  required
                />
                {textError && (
                  <span className="text-red-600 text-sm mt-1">
                    Comment text is required
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Rating
                  value={rating}
                  precision={0.5}
                  onChange={(_, v) => setRating(v)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleFileClick}
                >
                  <ImagePlus className="mr-2 h-4 w-4" /> Add Images
                </Button>
                <input
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp"
                  hidden
                  ref={fileInputRef}
                  onChange={handleFilesChange}
                />
              </div>

              {/* Preview selected images */}
              {previewUrls.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-2">
                  {previewUrls.map((url, i) => (
                    <div key={i} className="relative w-20 h-20">
                      <img
                        src={url}
                        alt="preview"
                        className="w-full h-full object-cover rounded"
                      />
                      <Button
                        type="button"
                        className="absolute top-0 right-0 bg-black bg-opacity-50 text-white rounded-full p-1"
                        onClick={() => removePreview(i)}
                      >
                        <X size={12} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {uploadProgress > 0 && (
                <Progress value={uploadProgress} className="mt-2" />
              )}

              <Button type="submit">Submit</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Comments */}
      <div className="space-y-4">
        {loading && <div>Loading...</div>}
        {!loading && comments.length === 0 && <div>No comments yet.</div>}
        {comments.map((c) => {
          const isCurrentUser = c.authorClerkId === user?.id;
          return (
            <Card key={c._id} className="w-full p-4">
              <div className="flex gap-3">
                <Avatar />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      {c.authorName || "Anonymous"}{" "}
                      {isCurrentUser && (
                        <span className="text-blue-600 font-semibold text-sm">
                          (You)
                        </span>
                      )}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(c._createdAt).toLocaleString()}
                    </span>
                  </div>
                  <Rating
                    value={c.rating}
                    precision={0.5}
                    readOnly
                    size="small"
                  />
                  <p className="mt-1">{c.text}</p>

                  {/* Images */}
                  {(c.images?.length as number) > 0 && (
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {c?.images?.map((img: any, i: number) => (
                        <img
                          key={i}
                          src={img}
                          alt="comment-img"
                          className="w-28 h-20 object-cover rounded cursor-pointer"
                          onClick={() => setOpenImage(img)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </Button>
            <span>
              Page {page} / {totalPages}
            </span>
            <Button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Full-view modal */}
      <Dialog
        open={!!openImage}
        onOpenChange={(open) => !open && setOpenImage(null)}
      >
        <DialogContent className="p-0 max-w-3xl">
          {openImage && (
            <img
              src={openImage}
              alt="full-view"
              className="w-full h-auto object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
