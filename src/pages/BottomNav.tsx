import { Home, MessageCircle, Calendar, Clock, User } from "lucide-react";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "discussion", label: "Discussion", icon: MessageCircle },
    { id: "book", label: "Book", icon: Calendar },
    { id: "upcoming", label: "Upcoming", icon: Clock },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t z-50"
      style={{
        borderColor: "#E5E5E5",
        paddingTop: "8px",
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 10px)",
        paddingLeft: "8px",
        paddingRight: "8px",
        minHeight: "var(--nav-h)",
        boxSizing: "border-box",
      }}
    >
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center gap-1 px-3 py-2 flex-1"
            >
              <tab.icon
                className="w-5 h-5"
                style={{ color: isActive ? "#7A0019" : "#888888" }}
                strokeWidth={1.5}
              />
              <span
                className="text-xs"
                style={{
                  color: isActive ? "#7A0019" : "#888888",
                  fontWeight: isActive ? "500" : "400",
                  fontSize: "11px",
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
