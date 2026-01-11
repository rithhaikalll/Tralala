import { useState, useEffect } from "react";
import {
  ArrowLeft,
  GripVertical,
  RotateCcw,
  Save,
  LayoutDashboard,
  Loader2,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  TouchSensor,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useUserPreferences } from "../lib/UserPreferencesContext";
import { toast } from "sonner";

function SortableItem({ id, label, theme }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const combinedStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: theme.cardBg,
    borderColor: isDragging ? theme.primary : theme.border,
    zIndex: isDragging ? 50 : 0,
    boxShadow: isDragging ? "0 8px 20px rgba(0,0,0,0.15)" : "none",
  };

  return (
    <div
      ref={setNodeRef}
      style={combinedStyle}
      className="flex items-center gap-4 p-4 border rounded-xl mb-3 shadow-sm transition-colors touch-none"
    >
      <div
        {...listeners}
        {...attributes}
        className="cursor-grab active:cursor-grabbing p-2 bg-gray-50 dark:bg-zinc-800 rounded-lg"
      >
        <GripVertical size={20} style={{ color: theme.primary }} />
      </div>
      <span className="font-medium flex-1" style={{ color: theme.text }}>
        {label}
      </span>
    </div>
  );
}

export function InterfaceSettingsScreen({ onBack }: { onBack: () => void }) {
  const { theme, preferences, updateInterface, resetInterface, t } =
    useUserPreferences();
  const isMs = preferences.language_code === "ms";

  const [items, setItems] = useState<string[]>(
    preferences.dashboard_order || []
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  // Sync state apabila preferences berubah (termasuk selepas reset)
  useEffect(() => {
    if (preferences.dashboard_order) {
      setItems(preferences.dashboard_order);
      setHasChanges(false);
    }
  }, [preferences.dashboard_order]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const widgetLabels: Record<string, string> = {
    upcoming: isMs ? "Tempahan Akan Datang" : "Upcoming Bookings",
    recommended: isMs ? "Syor Fasiliti" : "Facility Recommendations",
    tracking: isMs ? "Jejak Aktiviti" : "Activity Tracking",
    news: isMs ? "Berita Sukan" : "Sports News",
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.indexOf(active.id as string);
        const newIndex = prev.indexOf(over.id as string);
        const newOrder = arrayMove(prev, oldIndex, newIndex);
        setHasChanges(
          JSON.stringify(newOrder) !==
          JSON.stringify(preferences.dashboard_order)
        );
        return newOrder;
      });
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateInterface("dashboard", items);
      setHasChanges(false);
      toast.success(
        isMs
          ? "Susunan Dashboard berjaya disimpan!"
          : "Dashboard arrangement saved!"
      );
    } catch (error) {
      toast.error(isMs ? "Ralat semasa menyimpan." : "Error saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    setShowResetDialog(true);
  };

  const confirmReset = async () => {
    await resetInterface("dashboard");
    setShowResetDialog(false);
    toast.success(isMs ? "Dashboard telah ditetapkan semula." : "Dashboard reset to default.");
  };

  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{ backgroundColor: theme.background }}
    >
      <div
        className="px-6 py-6 border-b flex items-center justify-between sticky top-0 z-10"
        style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            style={{ color: theme.primary }}
            className="active:scale-90 transition-transform"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="font-bold text-xl" style={{ color: theme.text }}>
            {isMs ? "Susunan Dashboard" : "Dashboard Settings"}
          </h2>
        </div>
        <button
          onClick={handleReset}
          className="active:rotate-[-90deg] transition-transform"
        >
          <RotateCcw size={20} style={{ color: theme.primary }} />
        </button>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        <div
          className="flex items-center gap-3 mb-6 p-4 rounded-2xl"
          style={{ backgroundColor: theme.primary + "10" }}
        >
          <LayoutDashboard style={{ color: theme.primary }} />
          <div>
            <h3 className="font-bold text-sm" style={{ color: theme.text }}>
              {isMs ? "Susun Semula Dashboard" : "Rearrange Dashboard"}
            </h3>
            <p className="text-xs" style={{ color: theme.textSecondary }}>
              {isMs
                ? "Tarik ikon untuk ubah kedudukan widget."
                : "Drag icon to change widget positions."}
            </p>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            {items.map((id) => (
              <SortableItem
                key={id}
                id={id}
                label={widgetLabels[id]}
                theme={theme}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <div
        className="p-6 border-t shadow-lg"
        style={{ borderColor: theme.border, backgroundColor: theme.cardBg }}
      >
        <button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className="w-full h-12 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
          style={{ backgroundColor: theme.primary }}
        >
          {isSaving ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <Save size={20} />
          )}
          {isMs ? "Simpan Susunan" : "Save Arrangement"}
        </button>
      </div>

      {/* Confirmation Modal */}
      {showResetDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-sm rounded-[2rem] p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200"
            style={{ backgroundColor: theme.cardBg }}
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4" style={{ backgroundColor: theme.primary + '15' }}>
              <RotateCcw size={32} style={{ color: theme.primary }} />
            </div>

            <h3 className="text-xl font-bold text-center mb-2" style={{ color: theme.text }}>
              {isMs ? "Tetapkan Semula?" : "Reset Layout?"}
            </h3>

            <p className="text-center mb-8" style={{ color: theme.textSecondary }}>
              {isMs
                ? "Adakah anda pasti mahu menetapkan semula susunan dashboard kepada asal?"
                : "Are you sure you want to reset the dashboard arrangement to default?"}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowResetDialog(false)}
                className="flex-1 h-12 rounded-xl font-bold transition-transform active:scale-95"
                style={{ backgroundColor: theme.border, color: theme.text }}
              >
                {t('cancel')}
              </button>
              <button
                onClick={confirmReset}
                className="flex-1 h-12 rounded-xl font-bold text-white transition-transform active:scale-95 shadow-lg shadow-orange-500/20"
                style={{ backgroundColor: theme.primary }}
              >
                {isMs ? "Ya, Tetapkan" : "Yes, Reset"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
