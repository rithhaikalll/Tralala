import { useState, useEffect } from "react";
import { ArrowLeft, MoveVertical, RotateCcw, Save, Home, MessageSquare, Book, Compass, User, Loader2 } from "lucide-react";
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
import { toast } from "sonner";

function SortableNavItem({ id, label, icon: Icon, theme }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: theme.cardBg,
    borderColor: isDragging ? theme.primary : theme.border,
    zIndex: isDragging ? 50 : 0
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 p-5 border-2 rounded-2xl mb-4 transition-all touch-none"
    >
      <div {...attributes} {...listeners}
        className="flex items-center justify-center w-12 h-12 rounded-xl active:scale-95 cursor-grab"
        style={{ backgroundColor: theme.primary + '15', color: theme.primary }}>
        <MoveVertical size={24} />
      </div>

      <Icon size={22} style={{ color: theme.primary }} />
      <span className="font-bold text-lg flex-1" style={{ color: theme.text }}>{label}</span>
    </div>
  );
}

export function NavbarSettingsScreen({ onBack }: { onBack: () => void }) {
  const { theme, preferences, updateNavOrder, resetInterface, t } = useUserPreferences();
  const isMs = preferences.language_code === 'ms';

  const [items, setItems] = useState<string[]>(preferences.nav_order || []);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  useEffect(() => {
    if (preferences.nav_order) {
      setItems(preferences.nav_order);
      setHasChanges(false);
    }
  }, [preferences.nav_order]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const navMeta: Record<string, { label: string, icon: any }> = {
    home: { label: t('nav_home'), icon: Home },
    discussion: { label: t('nav_discuss'), icon: MessageSquare },
    book: { label: t('nav_book'), icon: Book },
    activity: { label: t('nav_activity'), icon: Compass },
    profile: { label: t('nav_profile'), icon: User }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.indexOf(active.id as string);
        const newIndex = prev.indexOf(over.id as string);
        const newOrder = arrayMove(prev, oldIndex, newIndex);
        setHasChanges(JSON.stringify(newOrder) !== JSON.stringify(preferences.nav_order));
        return newOrder;
      });
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateNavOrder(items);
      setHasChanges(false);
      toast.success(isMs ? "Susunan Navbar berjaya disimpan!" : "Navbar order saved!");
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
    await resetInterface('nav');
    setShowResetDialog(false);
    toast.success(isMs ? "Navbar telah ditetapkan semula." : "Navbar reset to default.");
  };

  return (
    <div className="min-h-screen flex flex-col relative" style={{ backgroundColor: theme.background }}>
      <div className="px-6 py-6 border-b flex items-center justify-between sticky top-0 z-10"
        style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} style={{ color: theme.primary }} className="active:scale-90 transition-transform">
            <ArrowLeft size={28} />
          </button>
          <h2 className="font-bold text-xl" style={{ color: theme.text }}>
            {isMs ? "Susun Menu Bawah" : "Reorder Navbar"}
          </h2>
        </div>
        <button onClick={handleReset} className="active:rotate-[-90deg] transition-transform">
          <RotateCcw size={22} style={{ color: theme.primary }} />
        </button>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            <div className="space-y-1">
              {items.map((id) => (
                <SortableNavItem key={id} id={id} label={navMeta[id]?.label || id} icon={navMeta[id]?.icon || Compass} theme={theme} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div className="p-6 border-t shadow-lg" style={{ borderColor: theme.border, backgroundColor: theme.cardBg }}>
        <button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className="w-full h-14 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
          style={{ backgroundColor: theme.primary }}
        >
          {isSaving ? <Loader2 className="animate-spin" size={22} /> : <Save size={22} />}
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
                ? "Adakah anda pasti mahu menetapkan semula susunan navbar kepada asal?"
                : "Are you sure you want to reset the navbar arrangement to default?"}
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