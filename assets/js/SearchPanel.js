import React, { useState, useCallback, useRef } from "react";
import { useIntl } from "react-intl";

/**
 * Search Panel - Full-text search across Bible verses
 */
const SearchPanel = ({
    isOpen,
    onClose,
    selectedTranslation,
    books,
    onNavigateToVerse,
}) => {
    const { formatMessage, locale } = useIntl();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [error, setError] = useState(null);
    const abortControllerRef = useRef(null);

    // Debounced search
    const searchTimeoutRef = useRef(null);

    // Get book name
    const getBookName = (bookId) => {
        return books[bookId]?.name || bookId;
    };

    // Perform search via API
    const performSearch = useCallback(async (searchQuery) => {
        if (!searchQuery.trim() || searchQuery.length < 3) {
            setResults([]);
            setHasSearched(false);
            return;
        }

        // Cancel previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        setIsSearching(true);
        setError(null);

        try {
            // API endpoint: POST /api/{language}/search
            // Body: { query: string, translation: string }
            const response = await fetch(
                `/api/${locale}/search`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        query: searchQuery,
                        translation: selectedTranslation,
                    }),
                    signal: abortControllerRef.current.signal,
                }
            );

            const data = await response.json();

            if (!response.ok) {
                // API returns { code, message } on error
                throw new Error(data.message || data.error || "Search failed");
            }

            // API returns { code, data: { translation, query, results } }
            // Handle both nested and flat response structures
            const resultsData = data.data?.results || data.results || [];

            // Map API response to our format
            const mappedResults = resultsData.map(item => ({
                book: item.book,
                chapter: parseInt(item.chapter),
                verse: parseInt(item.verse),
                text: item.content || item.text || "",
            }));

            setResults(mappedResults);
            setHasSearched(true);
        } catch (err) {
            if (err.name !== "AbortError") {
                console.error("Search error:", err);
                // Show user-friendly message
                const errorMsg = err.message || formatMessage({ id: "searchError" });
                setError(errorMsg);
                setResults([]);
                setHasSearched(true);
            }
        } finally {
            setIsSearching(false);
        }
    }, [selectedTranslation, locale, formatMessage]);

    // Handle input change with debounce
    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            performSearch(value);
        }, 500);  // 500ms debounce
    };

    // Handle form submit
    const handleSubmit = (e) => {
        e.preventDefault();
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        performSearch(query);
    };

    // Navigate to result
    const handleResultClick = (result) => {
        onNavigateToVerse?.(result.book, result.chapter, result.verse);
        onClose();
    };

    // Clear search
    const clearSearch = () => {
        setQuery("");
        setResults([]);
        setHasSearched(false);
        setError(null);
    };

    // Highlight matching text
    const highlightMatch = (text, searchTerm) => {
        if (!searchTerm.trim() || !text) return text;

        try {
            const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
            const parts = text.split(regex);

            return parts.map((part, i) =>
                regex.test(part) ? (
                    <mark key={i} className="search-highlight">{part}</mark>
                ) : part
            );
        } catch {
            return text;
        }
    };

    // Truncate text around match
    const getTruncatedText = (text, searchTerm, maxLength = 150) => {
        if (!text) return "";
        if (text.length <= maxLength) return text;

        const lowerText = text.toLowerCase();
        const lowerSearch = searchTerm.toLowerCase();
        const matchIndex = lowerText.indexOf(lowerSearch);

        if (matchIndex === -1) {
            return text.substring(0, maxLength) + "...";
        }

        const start = Math.max(0, matchIndex - 50);
        const end = Math.min(text.length, matchIndex + searchTerm.length + 100);

        let result = text.substring(start, end);
        if (start > 0) result = "..." + result;
        if (end < text.length) result = result + "...";

        return result;
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div className="search-overlay" onClick={onClose} />

            {/* Panel */}
            <div className="search-panel">
                <div className="search-header">
                    <h3 className="search-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        {formatMessage({ id: "search" })}
                    </h3>
                    <button className="search-close" onClick={onClose}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {/* Search input */}
                <form className="search-form" onSubmit={handleSubmit}>
                    <div className="search-input-wrapper">
                        <svg className="search-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input
                            type="text"
                            className="search-input"
                            value={query}
                            onChange={handleInputChange}
                            placeholder={formatMessage({ id: "searchPlaceholder" })}
                            autoFocus
                        />
                        {query && (
                            <button
                                type="button"
                                className="search-clear-btn"
                                onClick={clearSearch}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        )}
                    </div>
                    {query.length > 0 && query.length < 3 && (
                        <p className="search-hint">{formatMessage({ id: "searchMinChars" })}</p>
                    )}
                </form>

                {/* Results */}
                <div className="search-content">
                    {isSearching && (
                        <div className="search-loading">
                            <div className="search-spinner"></div>
                            <p>{formatMessage({ id: "searching" })}</p>
                        </div>
                    )}

                    {error && (
                        <div className="search-error">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            <p>{error}</p>
                        </div>
                    )}

                    {!isSearching && !error && hasSearched && results.length === 0 && (
                        <div className="search-empty">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                            <p>{formatMessage({ id: "noResults" })}</p>
                            <span className="search-empty-hint">
                                {formatMessage({ id: "noResultsHint" })}
                            </span>
                        </div>
                    )}

                    {!isSearching && results.length > 0 && (
                        <>
                            <div className="search-results-header">
                                <span className="search-results-count">
                                    {formatMessage({ id: "resultsCount" }, { count: results.length })}
                                </span>
                            </div>
                            <ul className="search-results">
                                {results.map((result, index) => (
                                    <li
                                        key={`${result.book}_${result.chapter}_${result.verse}_${index}`}
                                        className="search-result-item"
                                        onClick={() => handleResultClick(result)}
                                    >
                                        <div className="search-result-header">
                                            <span className="search-result-reference">
                                                {getBookName(result.book)} {result.chapter}:{result.verse}
                                            </span>
                                        </div>
                                        <p className="search-result-text">
                                            {highlightMatch(
                                                getTruncatedText(result.text, query),
                                                query
                                            )}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}

                    {!isSearching && !hasSearched && !error && (
                        <div className="search-initial">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                            <p className="search-initial-title">{formatMessage({ id: "searchInitialHint" })}</p>
                            <div className="search-help">
                                <p className="search-help-text">
                                    {formatMessage({ id: "searchHelpText" })}
                                </p>
                                <ul className="search-help-list">
                                    <li>{formatMessage({ id: "searchHelpTip1" })}</li>
                                    <li>{formatMessage({ id: "searchHelpTip2" })}</li>
                                    <li>{formatMessage({ id: "searchHelpTip3" })}</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default SearchPanel;
