import { useState, useCallback } from "react";

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

interface SearchResponse {
  results: SearchResult[];
  query: string;
  total: number;
}

export function useSearch() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setSearchQuery(query);

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}`
      );
      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data: SearchResponse = await response.json();
      setSearchResults(data.results);
      setHasSearched(true);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setSearchQuery("");
    setHasSearched(false);
  }, []);

  return {
    searchResults,
    isSearching,
    searchQuery,
    hasSearched,
    performSearch,
    clearSearch,
  };
}
