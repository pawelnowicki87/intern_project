"use client";

import {
  Send,
  Search,
  PlusSquare,
  Home,
  Compass,
  User,
  Settings,
  Moon,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import NotificationsDropdown from "@/components/NotificationsDropdown";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { useEffect, useState } from "react";

interface HeaderProps {
  onCreatePost?: () => void;
}

export default function Header({ onCreatePost }: HeaderProps) {
  const { user, logout } = useAuth();
  const { unreadCount } = useSocket();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const handleLogout = () => {
    logout();
    setProfileMenuOpen(false);
  };

  const applyTheme = (nextTheme: "light" | "dark") => {
    const root = document.documentElement;
    if (nextTheme === "dark") {
      root.classList.add("theme-dark");
    } else {
      root.classList.remove("theme-dark");
    }
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      const nextTheme = saved === "dark" ? "dark" : "light";
      setTheme(nextTheme);
      applyTheme(nextTheme);
    } catch {
      applyTheme("light");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);
    try {
      localStorage.setItem("theme", nextTheme);
    } catch {
      void 0;
    }
  };

  return (
    <header className="bg-white border-b border-gray-300 sticky top-0 z-10">
      <div className="max-w-[935px] mx-auto px-4 py-2 md:py-3 flex items-center justify-between">
        <Link href="/feed">
          <h1 className="text-2xl md:text-3xl font-serif italic cursor-pointer">
            Innogram
          </h1>
        </Link>

        <div className="hidden md:block flex-1 max-w-xs mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-4 py-1.5 bg-gray-100 rounded-lg text-sm focus:outline-none focus:bg-gray-200"
            />
          </div>
        </div>

        <div className="hidden md:flex items-center gap-5">
          <Link href="/feed">
            <Home className="w-6 h-6 hover:text-gray-600 transition-colors" />
          </Link>
          <Link href="/chat" className="relative">
            <Send className="w-6 h-6 hover:text-gray-600 transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center pointer-events-none">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>
          <button onClick={onCreatePost} type="button">
            <PlusSquare className="w-6 h-6 hover:text-gray-600 transition-colors" />
          </button>
          <button type="button">
            <Compass className="w-6 h-6 hover:text-gray-600 transition-colors" />
          </button>
          <NotificationsDropdown />

          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="w-7 h-7 rounded-full overflow-hidden border border-gray-200 hover:border-gray-400 transition-colors"
              type="button"
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="block w-full h-full bg-gradient-to-br from-blue-500 to-pink-500" />
              )}
            </button>

            {profileMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <Link
                    href="/profile"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-5 h-5 text-gray-700" />
                    <span className="text-sm font-medium">Profile</span>
                  </Link>

                  <Link
                    href="/profile/edit"
                    onClick={() => setProfileMenuOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-5 h-5 text-gray-700" />
                    <span className="text-sm font-medium">Edit Profile</span>
                  </Link>

                  <button
                    onClick={() => {
                      toggleTheme();
                      setProfileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    type="button"
                  >
                    <Moon className="w-5 h-5 text-gray-700" />
                    <span className="text-sm font-medium">Switch Theme</span>
                  </button>

                  <div className="border-t border-gray-200" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-red-600"
                    type="button"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm font-medium">Log Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex md:hidden items-center gap-4">
          <button onClick={onCreatePost} type="button">
            <PlusSquare className="w-6 h-6" />
          </button>
          <NotificationsDropdown />
          <Link href="/chat">
            <Send className="w-6 h-6" />
          </Link>

          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="w-7 h-7 rounded-full overflow-hidden border border-gray-200"
              type="button"
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="block w-full h-full bg-gradient-to-br from-blue-500 to-pink-500" />
              )}
            </button>

            {profileMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <Link
                    href="/profile"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-5 h-5 text-gray-700" />
                    <span className="text-sm font-medium">Profile</span>
                  </Link>

                  <Link
                    href="/profile/edit"
                    onClick={() => setProfileMenuOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-5 h-5 text-gray-700" />
                    <span className="text-sm font-medium">Edit Profile</span>
                  </Link>

                  <button
                    onClick={() => {
                      toggleTheme();
                      setProfileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    type="button"
                  >
                    <Moon className="w-5 h-5 text-gray-700" />
                    <span className="text-sm font-medium">Switch Theme</span>
                  </button>

                  <div className="border-t border-gray-200" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-red-600"
                    type="button"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm font-medium">Log Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
