// src/components/SettingsSidebar.tsx
import React from "react";

export interface SettingsTab {
  id: string;
  label: string;
}

interface SettingsSidebarProps {
  tabs: SettingsTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function SettingsSidebar({
  tabs,
  activeTab,
  onTabChange,
}: SettingsSidebarProps) {
  return (
    <nav className="flex flex-col gap-1.5 w-full md:w-52 font-sans shrink-0">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`w-full text-left px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 focus:outline-none ${
              isActive
                ? "bg-[#5b642a] text-white shadow-sm"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-800"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
