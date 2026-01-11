import { ArrowLeft, Upload, X } from "lucide-react";
import { useState } from "react";
import { useUserPreferences } from "../../lib/UserPreferencesContext";

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
  const { theme, t } = useUserPreferences();
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

    if (!facilityName) newErrors.facilityName = t('err_select_facility');
    if (!category) newErrors.category = t('err_select_category');
    if (!title.trim()) newErrors.title = t('err_enter_title');
    if (!description.trim())
      newErrors.description = t('err_enter_desc');

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
    <div className="min-h-screen pb-20" style={{ backgroundColor: theme.background }}>
      {/* Header */}
      <div
        className="sticky top-0 z-40 px-6 py-6 border-b"
        style={{
          backgroundColor: theme.background,
          borderColor: theme.border
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate("facility-complaints")}
            style={{ color: theme.primary }}
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <h2 style={{ color: theme.text, fontWeight: "600", fontSize: "20px" }}>
            {t('submit_facility_complaint')}
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-5">
        {/* Facility Selection */}
        <div>
          <label
            className="block mb-2 text-sm"
            style={{ color: theme.text, fontWeight: "500" }}
          >
            {t('select_facility')} <span style={{ color: "#DC2626" }}>*</span>
          </label>
          <select
            value={facilityName}
            onChange={(e) => setFacilityName(e.target.value)}
            className="w-full h-11 px-3 border"
            style={{
              borderColor: errors.facilityName ? "#DC2626" : theme.border,
              borderRadius: "8px",
              color: theme.text,
              backgroundColor: theme.cardBg
            }}
          >
            <option value="">{t('choose_facility')}</option>
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
            style={{ color: theme.text, fontWeight: "500" }}
          >
            {t('complaint_category')} <span style={{ color: "#DC2626" }}>*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full h-11 px-3 border"
            style={{
              borderColor: errors.category ? "#DC2626" : theme.border,
              borderRadius: "8px",
              color: theme.text,
              backgroundColor: theme.cardBg
            }}
          >
            <option value="">{t('choose_category')}</option>
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
            style={{ color: theme.text, fontWeight: "500" }}
          >
            {t('complaint_title_label')} <span style={{ color: "#DC2626" }}>*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('complaint_title_placeholder')}
            className="w-full h-11 px-3 border"
            style={{
              borderColor: errors.title ? "#DC2626" : theme.border,
              borderRadius: "8px",
              color: theme.text,
              backgroundColor: theme.cardBg
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
            style={{ color: theme.text, fontWeight: "500" }}
          >
            {t('complaint_desc_label')} <span style={{ color: "#DC2626" }}>*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('complaint_desc_placeholder')}
            rows={5}
            className="w-full px-3 py-3 border resize-none"
            style={{
              borderColor: errors.description ? "#DC2626" : theme.border,
              borderRadius: "8px",
              color: theme.text,
              backgroundColor: theme.cardBg
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
            style={{ color: theme.text, fontWeight: "500" }}
          >
            {t('photo_evidence_optional')}
          </label>

          {!photoEvidence ? (
            <label
              className="w-full h-32 border-2 border-dashed flex flex-col items-center justify-center cursor-pointer"
              style={{
                borderColor: theme.border,
                borderRadius: "8px",
                backgroundColor: theme.mode === 1 ? "#1E1E1E" : "#FAFAFA",
              }}
            >
              <Upload
                className="w-8 h-8 mb-2"
                style={{ color: theme.textSecondary }}
                strokeWidth={1.5}
              />
              <span className="text-sm" style={{ color: theme.textSecondary }}>
                {t('tap_to_upload')}
              </span>
              <span className="text-xs mt-1" style={{ color: theme.textSecondary }}>
                {t('upload_format_hint')}
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
                style={{
                  borderColor: theme.border,
                  borderRadius: "8px"
                }}
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
              backgroundColor: theme.primary,
              color: "#FFFFFF",
              borderRadius: "14px",
              fontWeight: "500",
              fontSize: "15px",
            }}
          >
            {t('submit_complaint_btn')}
          </button>
          <button
            onClick={() => onNavigate("facility-complaints")}
            className="w-full h-12 border"
            style={{
              borderColor: theme.border,
              borderRadius: "14px",
              color: theme.textSecondary,
              fontWeight: "500",
              fontSize: "15px",
            }}
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
