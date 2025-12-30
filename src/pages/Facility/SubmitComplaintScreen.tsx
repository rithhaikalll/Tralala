import { ArrowLeft, Upload, X } from "lucide-react";
import { useState } from "react";

interface SubmitComplaintScreenProps {
  onNavigate: (screen: string) => void;
  onSubmitComplaint: (complaint: {
    facilityName: string;
    category: string;
    title: string;
    description: string;
    photoEvidence?: string;
  }) => void;
}

export function SubmitComplaintScreen({
  onNavigate,
  onSubmitComplaint,
}: SubmitComplaintScreenProps) {
  const [facilityName, setFacilityName] = useState("");
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photoEvidence, setPhotoEvidence] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const facilities = [
    "Badminton Court",
    "Ping Pong Hall",
    "Volleyball Court",
    "Futsal Field",
    "Gym Facility",
  ];

  const categories = [
    "Equipment",
    "Cleanliness",
    "Safety",
    "Facility Condition",
    "Other",
  ];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoEvidence(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!facilityName) newErrors.facilityName = "Please select a facility";
    if (!category) newErrors.category = "Please select a category";
    if (!title.trim()) newErrors.title = "Please enter a complaint title";
    if (!description.trim())
      newErrors.description = "Please enter a description";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmitComplaint({
        facilityName,
        category,
        title: title.trim(),
        description: description.trim(),
        photoEvidence: photoEvidence || undefined,
      });
      onNavigate("facility-complaints");
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-white">
      {/* Header */}
      <div
        className="sticky top-0 z-40 bg-white px-6 py-6 border-b"
        style={{ borderColor: "#E5E5E5" }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate("facility-complaints")}
            style={{ color: "#7A0019" }}
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <h2 style={{ color: "#1A1A1A", fontWeight: "600", fontSize: "20px" }}>
            Submit Facility Complaint
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-5">
        {/* Facility Selection */}
        <div>
          <label
            className="block mb-2 text-sm"
            style={{ color: "#1A1A1A", fontWeight: "500" }}
          >
            Select Facility <span style={{ color: "#DC2626" }}>*</span>
          </label>
          <select
            value={facilityName}
            onChange={(e) => setFacilityName(e.target.value)}
            className="w-full h-11 px-3 border bg-white"
            style={{
              borderColor: errors.facilityName ? "#DC2626" : "#E5E5E5",
              borderRadius: "8px",
              color: "#1A1A1A",
            }}
          >
            <option value="">Choose facility</option>
            {facilities.map((facility) => (
              <option key={facility} value={facility}>
                {facility}
              </option>
            ))}
          </select>
          {errors.facilityName && (
            <p className="mt-1 text-xs" style={{ color: "#DC2626" }}>
              {errors.facilityName}
            </p>
          )}
        </div>

        {/* Category Selection */}
        <div>
          <label
            className="block mb-2 text-sm"
            style={{ color: "#1A1A1A", fontWeight: "500" }}
          >
            Complaint Category <span style={{ color: "#DC2626" }}>*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full h-11 px-3 border bg-white"
            style={{
              borderColor: errors.category ? "#DC2626" : "#E5E5E5",
              borderRadius: "8px",
              color: "#1A1A1A",
            }}
          >
            <option value="">Choose category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-xs" style={{ color: "#DC2626" }}>
              {errors.category}
            </p>
          )}
        </div>

        {/* Complaint Title */}
        <div>
          <label
            className="block mb-2 text-sm"
            style={{ color: "#1A1A1A", fontWeight: "500" }}
          >
            Complaint Title <span style={{ color: "#DC2626" }}>*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief summary of the issue"
            className="w-full h-11 px-3 border bg-white"
            style={{
              borderColor: errors.title ? "#DC2626" : "#E5E5E5",
              borderRadius: "8px",
              color: "#1A1A1A",
            }}
          />
          {errors.title && (
            <p className="mt-1 text-xs" style={{ color: "#DC2626" }}>
              {errors.title}
            </p>
          )}
        </div>

        {/* Complaint Description */}
        <div>
          <label
            className="block mb-2 text-sm"
            style={{ color: "#1A1A1A", fontWeight: "500" }}
          >
            Complaint Description <span style={{ color: "#DC2626" }}>*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue in detail..."
            rows={5}
            className="w-full px-3 py-3 border bg-white resize-none"
            style={{
              borderColor: errors.description ? "#DC2626" : "#E5E5E5",
              borderRadius: "8px",
              color: "#1A1A1A",
            }}
          />
          {errors.description && (
            <p className="mt-1 text-xs" style={{ color: "#DC2626" }}>
              {errors.description}
            </p>
          )}
        </div>

        {/* Photo Evidence (Optional) */}
        <div>
          <label
            className="block mb-2 text-sm"
            style={{ color: "#1A1A1A", fontWeight: "500" }}
          >
            Photo Evidence (Optional)
          </label>

          {!photoEvidence ? (
            <label
              className="w-full h-32 border-2 border-dashed flex flex-col items-center justify-center cursor-pointer"
              style={{
                borderColor: "#E5E5E5",
                borderRadius: "8px",
                backgroundColor: "#FAFAFA",
              }}
            >
              <Upload
                className="w-8 h-8 mb-2"
                style={{ color: "#888888" }}
                strokeWidth={1.5}
              />
              <span className="text-sm" style={{ color: "#555555" }}>
                Tap to upload photo
              </span>
              <span className="text-xs mt-1" style={{ color: "#888888" }}>
                JPG, PNG up to 5MB
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          ) : (
            <div className="relative">
              <img
                src={photoEvidence}
                alt="Evidence"
                className="w-full h-48 object-cover border"
                style={{ borderColor: "#E5E5E5", borderRadius: "8px" }}
              />
              <button
                onClick={() => setPhotoEvidence(null)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
              >
                <X
                  className="w-5 h-5"
                  style={{ color: "#FFFFFF" }}
                  strokeWidth={1.5}
                />
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <button
            onClick={handleSubmit}
            className="w-full h-12"
            style={{
              backgroundColor: "#7A0019",
              color: "#FFFFFF",
              borderRadius: "14px",
              fontWeight: "500",
              fontSize: "15px",
            }}
          >
            Submit Complaint
          </button>
          <button
            onClick={() => onNavigate("facility-complaints")}
            className="w-full h-12 border"
            style={{
              borderColor: "#E5E5E5",
              borderRadius: "14px",
              color: "#555555",
              fontWeight: "500",
              fontSize: "15px",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
