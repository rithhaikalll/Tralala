import { ArrowLeft, X, Save, Send, Image as ImageIcon } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "../../lib/supabaseClient";

interface CreateNewsPostScreenProps {
  onNavigate: (screen: string) => void;
}

export function CreateNewsPostScreen({ onNavigate }: CreateNewsPostScreenProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Announcements");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ title?: string; content?: string; image?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = ["Facilities", "Events", "Maintenance", "Features", "Announcements"];

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "Facilities":
        return { bg: "#F0F9FF", text: "#0369A1" };
      case "Events":
        return { bg: "#FFF7ED", text: "#C2410C" };
      case "Maintenance":
        return { bg: "#FEF2F2", text: "#991B1B" };
      case "Features":
        return { bg: "#F0FDF4", text: "#15803D" };
      case "Announcements":
        return { bg: "#F5F3FF", text: "#6D28D9" };
      default:
        return { bg: "#F5F5F5", text: "#6A6A6A" };
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setErrors({ ...errors, image: "Invalid file format. Please upload image only." });
      toast.error("Invalid file format. Please upload image only.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size too large (max 5MB).");
      return;
    }

    setImageFile(file);
    setErrors({ ...errors, image: undefined });

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setUploadedImage(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = () => {
    const newErrors: { title?: string; content?: string } = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!content.trim()) newErrors.content = "Content is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePublish = async () => {
    if (!validateForm()) {
      toast.error("Please complete all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Get User
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      let finalImageUrl = null;

      // 2. Upload Image if exists
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('news-images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('news-images')
          .getPublicUrl(filePath);
        
        finalImageUrl = publicUrl;
      }

      // 3. Insert into Database
      const { error: insertError } = await supabase
        .from('news_posts')
        .insert({
          title,
          content,
          category,
          image_url: finalImageUrl,
          user_id: user.id,
          author_name: user.user_metadata?.fullName || "Staff",
          created_at: new Date().toISOString()
        });

      if (insertError) throw insertError;

      toast.success("News post published successfully!");
      onNavigate("news-feed");

    } catch (error: any) {
      console.error("Error publishing news:", error);
      toast.error(error.message || "Failed to publish news.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-8">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white px-6 py-6 border-b" style={{ borderColor: "#E5E5E5" }}>
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate("news-feed")}
            className="flex items-center gap-2"
            style={{ color: "#7A0019" }}
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
            <span style={{ fontSize: "15px", fontWeight: "500" }}>Cancel</span>
          </button>
          <h1
            style={{
              color: "#7A0019",
              fontWeight: "600",
              fontSize: "18px",
              letterSpacing: "-0.01em"
            }}
          >
            Create News Post
          </h1>
          <div style={{ width: "60px" }} />
        </div>
      </div>

      {/* Form */}
      <div className="px-6 py-6 max-w-3xl mx-auto space-y-6">
        {/* Title Field */}
        <div>
          <label htmlFor="title" className="block mb-2" style={{ color: "#1A1A1A", fontSize: "15px", fontWeight: "500" }}>
            Title <span style={{ color: "#991B1B" }}>*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setErrors({ ...errors, title: undefined }); }}
            placeholder="Enter news title..."
            className="w-full px-4 py-3 border bg-white"
            style={{ borderColor: errors.title ? "#991B1B" : "#E5E5E5", borderRadius: "12px", fontSize: "15px", color: "#1A1A1A" }}
          />
          {errors.title && <p className="mt-1.5" style={{ color: "#991B1B", fontSize: "13px" }}>{errors.title}</p>}
        </div>

        {/* Category Field */}
        <div>
          <label className="block mb-2" style={{ color: "#1A1A1A", fontSize: "15px", fontWeight: "500" }}>
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isSelected = category === cat;
              const categoryStyle = getCategoryColor(cat);
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className="px-4 py-2 transition-all"
                  style={{
                    backgroundColor: isSelected ? categoryStyle.bg : "#F5F5F5",
                    color: isSelected ? categoryStyle.text : "#6A6A6A",
                    border: isSelected ? `2px solid ${categoryStyle.text}` : "2px solid transparent",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: "500"
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Field */}
        <div>
          <label htmlFor="content" className="block mb-2" style={{ color: "#1A1A1A", fontSize: "15px", fontWeight: "500" }}>
            Content <span style={{ color: "#991B1B" }}>*</span>
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => { setContent(e.target.value); setErrors({ ...errors, content: undefined }); }}
            placeholder="Write your news content here..."
            rows={8}
            className="w-full px-4 py-3 border bg-white resize-none"
            style={{ borderColor: errors.content ? "#991B1B" : "#E5E5E5", borderRadius: "12px", fontSize: "15px", color: "#1A1A1A", lineHeight: "1.6" }}
          />
          {errors.content && <p className="mt-1.5" style={{ color: "#991B1B", fontSize: "13px" }}>{errors.content}</p>}
        </div>

        {/* Image Upload */}
        <div>
          <label className="block mb-2" style={{ color: "#1A1A1A", fontSize: "15px", fontWeight: "500" }}>
            Featured Image (Optional)
          </label>

          {uploadedImage ? (
            <div className="relative border overflow-hidden" style={{ borderColor: "#E5E5E5", borderRadius: "12px" }}>
              <img src={uploadedImage} alt="Preview" className="w-full h-64 object-cover" />
              <button
                onClick={removeImage}
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white shadow-lg transition-colors"
                style={{ borderRadius: "8px", color: "#991B1B" }}
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed py-12 flex flex-col items-center gap-3 transition-colors"
              style={{ borderColor: "#E5E5E5", borderRadius: "12px", backgroundColor: "#FAFAFA" }}
            >
              <div className="w-12 h-12 flex items-center justify-center" style={{ backgroundColor: "#FFFFFF", borderRadius: "10px" }}>
                <ImageIcon className="w-6 h-6" style={{ color: "#7A0019" }} strokeWidth={1.5} />
              </div>
              <div>
                <p style={{ color: "#1A1A1A", fontSize: "14px", fontWeight: "500", marginBottom: "4px" }}>Click to upload image</p>
                <p style={{ color: "#888888", fontSize: "13px" }}>PNG, JPG, GIF up to 5MB</p>
              </div>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handlePublish}
            disabled={isSubmitting}
            className="flex-1 py-3 flex items-center justify-center gap-2 transition-colors"
            style={{
              backgroundColor: isSubmitting ? "#999999" : "#7A0019",
              color: "#FFFFFF",
              borderRadius: "12px",
              fontSize: "15px",
              fontWeight: "500",
              opacity: isSubmitting ? 0.5 : 1
            }}
          >
            <Send className="w-5 h-5" strokeWidth={1.5} />
            {isSubmitting ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}