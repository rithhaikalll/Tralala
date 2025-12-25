import { useState } from "react";
import { ArrowLeft, GripVertical, RotateCcw, Save, LayoutDashboard } from "lucide-react";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  TouchSensor,
  type DragEndEvent 
} from "@dnd-kit/core";
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable
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
    isDragging
  } = useSortable({ id });

  const combinedStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: theme.cardBg,
    borderColor: isDragging ? theme.primary : theme.border,
    zIndex: isDragging ? 1 : 0
  };

  return (
    <div
      ref={setNodeRef}
      style={combinedStyle}
      className="flex items-center gap-4 p-4 border rounded-xl mb-3 shadow-sm transition-colors touch-none"
      {...attributes}
    >
      <div {...listeners} className="cursor-grab active:cursor-grabbing p-1">
        <GripVertical size={20} style={{ color: theme.textSecondary }} />
      </div>
      <span className="font-medium flex-1" style={{ color: theme.text }}>
        {label}
      </span>
    </div>
  );
}

export function InterfaceSettingsScreen({ onBack }: { onBack: () => void }) {
  const { theme, preferences, updateInterface, resetInterface } = useUserPreferences();
  const isMs = preferences.language_code === 'ms';

  const [items, setItems] = useState(preferences.dashboard_order);
  const [hasChanges, setHasChanges] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const widgetLabels: Record<string, string> = {
    upcoming: isMs ? "Tempahan Akan Datang" : "Upcoming Bookings",
    recommended: isMs ? "Syor Fasiliti" : "Facility Recommendations",
    tracking: isMs ? "Jejak Aktiviti" : "Activity Tracking",
    news: isMs ? "Berita Sukan" : "Sports News"
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.indexOf(active.id as string);
        const newIndex = prev.indexOf(over.id as string);
        const newOrder = arrayMove(prev, oldIndex, newIndex);
        setHasChanges(true);
        return newOrder;
      });
    }
  };

  const handleSave = async () => {
    await updateInterface('dashboard', items); 
    setHasChanges(false);
    alert(isMs ? "Susunan berjaya disimpan!" : "Arrangement saved successfully!");
  };

  return (
    <div className="min-h-screen transition-colors duration-300 flex flex-col" style={{ backgroundColor: theme.background }}>
      <div className="px-6 py-6 border-b flex items-center justify-between sticky top-0 z-10" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} style={{ color: theme.primary }}><ArrowLeft size={24} /></button>
          <h2 className="font-bold text-xl" style={{ color: theme.text }}>{isMs ? "Susunan Antaramuka" : "Interface Settings"}</h2>
        </div>
        <button onClick={async () => { if(window.confirm(isMs ? "Set semula?" : "Reset?")) { await resetInterface(); setItems(preferences.dashboard_order); } }} className="p-2"><RotateCcw size={20} style={{ color: theme.primary }} /></button>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl" style={{ backgroundColor: theme.primary + '10' }}>
          <LayoutDashboard style={{ color: theme.primary }} />
          <div>
            <h3 className="font-bold text-sm" style={{ color: theme.text }}>{isMs ? "Susun Dashboard" : "Rearrange Dashboard"}</h3>
            <p className="text-xs" style={{ color: theme.textSecondary }}>{isMs ? "Tarik item untuk ubah kedudukan." : "Drag items to change positions."}</p>
          </div>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            {items.map((id) => <SortableItem key={id} id={id} label={widgetLabels[id]} theme={theme} />)}
          </SortableContext>
        </DndContext>
      </div>

      <div className="mt-auto p-6 border-t" style={{ borderColor: theme.border, backgroundColor: theme.cardBg }}>
        <button onClick={handleSave} disabled={!hasChanges} className="w-full h-12 rounded-xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50" style={{ backgroundColor: theme.primary }}>
          <Save size={20} /> {isMs ? "Simpan Susunan" : "Save Arrangement"}
        </button>
      </div>
    </div>
  );
}