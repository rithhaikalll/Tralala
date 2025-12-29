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
  const { theme, preferences, updateInterface, resetInterface } =
    useUserPreferences();
  const isMs = preferences.language_code === "ms";

  const [items, setItems] = useState<string[]>(
    preferences.dashboard_order || []
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
      alert(
        isMs
          ? "Susunan Dashboard berjaya disimpan!"
          : "Dashboard arrangement saved!"
      );
    } catch (error) {
      alert(isMs ? "Ralat semasa menyimpan." : "Error saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (
      window.confirm(
        isMs ? "Set semula susunan dashboard?" : "Reset dashboard arrangement?"
      )
    ) {
      await resetInterface("dashboard");
      // UI akan sync melalui useEffect
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
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
    </div>
  );
}
