"use client";

import { useState, useEffect, useRef } from "react";
import { IoSearch, IoClose } from "react-icons/io5";
import { useSearch } from "@/hooks/useSearch";
import SearchResults from "./SearchResults";

interface SearchResult {
  id: string;
  name: string;
  type: "image";
  image_url: string;
  uploaded_at: string;
  product_type: string;
  path: string;
  breadcrumbs: Array<{ name: string; path: string }>;
}

interface AppBarProps {
  onNavigateToPath?: (path: string) => void;
  onImageSelect?: (image: SearchResult) => void;
}

export default function AppBar({
  onNavigateToPath,
  onImageSelect,
}: AppBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    searchResults,
    isSearching,
    hasSearched,
    performSearch,
    clearSearch,
  } = useSearch();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      performSearch(searchQuery.trim());
      setShowResults(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Auto-search with debounce
    if (value.trim()) {
      setShowResults(true);
      const timeoutId = setTimeout(() => {
        performSearch(value.trim());
      }, 300);

      // Cleanup previous timeout
      return () => clearTimeout(timeoutId);
    } else {
      setShowResults(false);
      clearSearch();
    }
  };

  const handleCloseResults = () => {
    setShowResults(false);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setShowResults(false);
    clearSearch();
    inputRef.current?.focus();
  };

  const handleNavigateToPath = (path: string) => {
    setShowResults(false);
    // Use global navigation method
    if (window.navigateToFolder) {
      window.navigateToFolder(path);
    }
    onNavigateToPath?.(path);
  };

  const handleImageClick = (image: SearchResult) => {
    setShowResults(false);
    onImageSelect?.(image);
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }

      // Escape to close search results
      if (e.key === "Escape") {
        setShowResults(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center px-4 md:px-6">
      <div className="flex items-center justify-center w-full max-w-7xl mx-auto gap-8">
        {/* Center: Search Bar */}
        <div className="flex-1 max-w-2xl relative" ref={searchRef}>
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IoSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                placeholder="Search files... (Ctrl+K)"
                spellCheck={false}
                autoComplete="off"
                data-ms-editor="false"
                className="block w-full pl-10 pr-12 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <IoClose className="h-4 w-4" />
                </button>
              )}
            </div>
          </form>

          {/* Search Results */}
          {showResults && (
            <SearchResults
              results={searchResults}
              isSearching={isSearching}
              searchQuery={searchQuery}
              hasSearched={hasSearched}
              onClose={handleCloseResults}
              onNavigateToPath={handleNavigateToPath}
              onImageClick={handleImageClick}
            />
          )}
        </div>
      </div>
    </header>
  );
}
