"use client";

import React from "react";
import Image from "next/image";
import {
  IoClose,
  IoImageOutline,
  IoChevronForward,
  IoFolderOpenOutline,
  IoSearchOutline,
} from "react-icons/io5";

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

interface SearchResultsProps {
  results: SearchResult[];
  isSearching: boolean;
  searchQuery: string;
  hasSearched: boolean;
  onClose: () => void;
  onNavigateToPath: (path: string) => void;
  onImageClick: (result: SearchResult) => void;
}

export default function SearchResults({
  results,
  isSearching,
  searchQuery,
  hasSearched,
  onClose,
  onNavigateToPath,
  onImageClick,
}: SearchResultsProps) {
  if (!hasSearched && !isSearching) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-96 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <IoSearchOutline className="h-5 w-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {isSearching
              ? "Searching..."
              : `Search Results for "${searchQuery}"`}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <IoClose className="h-5 w-5" />
        </button>
      </div>

      {/* Loading State */}
      {isSearching && (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Searching through your files...
          </p>
        </div>
      )}

      {/* No Results */}
      {!isSearching && hasSearched && results.length === 0 && (
        <div className="p-8 text-center">
          <IoSearchOutline className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No results found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try searching with different keywords or check your spelling.
          </p>
        </div>
      )}

      {/* Search Results */}
      {!isSearching && results.length > 0 && (
        <div className="max-h-80 overflow-y-auto">
          <div className="p-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
              Found {results.length} result{results.length !== 1 ? "s" : ""}
            </p>
          </div>
          {results.map((result) => (
            <div
              key={result.id}
              className="group border-b border-gray-100 dark:border-gray-700 last:border-b-0"
            >
              {/* Image Result */}
              <div className="p-3 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer">
                <div className="flex items-center space-x-3">
                  {/* Image Thumbnail */}
                  <div
                    className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-600 flex-shrink-0"
                    onClick={() => onImageClick(result)}
                  >
                    <Image
                      src={result.image_url}
                      alt={result.name}
                      fill
                      className="object-cover hover:scale-110 transition-transform duration-200"
                      sizes="48px"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200"></div>
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <IoImageOutline className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <h4
                        className="text-sm font-medium text-gray-900 dark:text-white truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                        onClick={() => onImageClick(result)}
                      >
                        {result.name}
                      </h4>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(result.uploaded_at).toLocaleDateString()}
                    </p>

                    {/* Breadcrumb Path */}
                    <div className="flex items-center space-x-1 mt-2 text-xs text-gray-600 dark:text-gray-400">
                      <button
                        onClick={() => onNavigateToPath(result.path)}
                        className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <IoFolderOpenOutline className="h-3 w-3" />
                        <span>Open location</span>
                      </button>
                    </div>

                    {/* Full Path Preview */}
                    <div className="flex items-center space-x-1 mt-1 text-xs text-gray-500 dark:text-gray-500 overflow-hidden">
                      {result.breadcrumbs.map((crumb, index) => (
                        <React.Fragment key={index}>
                          {index > 0 && (
                            <IoChevronForward className="h-3 w-3 flex-shrink-0" />
                          )}
                          <span
                            className="truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                            onClick={() => onNavigateToPath(crumb.path)}
                          >
                            {crumb.name}
                          </span>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* Navigate Button */}
                  <button
                    onClick={() => onNavigateToPath(result.path)}
                    className="flex-shrink-0 p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                    title="Navigate to location"
                  >
                    <IoChevronForward className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
