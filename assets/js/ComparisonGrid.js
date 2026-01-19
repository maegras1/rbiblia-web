import React, { useEffect, useState, useCallback, useRef } from "react";
import { useIntl } from "react-intl";
import { getComparisonLimit, getFavoriteTranslations } from "./SideMenu";

const ComparisonGrid = ({
    verseId,
    bookId,
    chapterId,
    currentTranslation,
    translations,
    onClose,
    onNavigateVerse,  // callback(direction) - 'prev' or 'next'
    totalVerses = 0,  // total verses in chapter for navigation limits
}) => {
    const { formatMessage, locale } = useIntl();
    const comparisonLimit = getComparisonLimit();
    const favoriteTranslations = getFavoriteTranslations();

    // Get favorites that exist in translations (excluding current)
    const getAvailableFavorites = () => {
        return translations
            .filter(t => t.id !== currentTranslation && favoriteTranslations.includes(t.id))
            .slice(0, comparisonLimit)
            .map(t => t.id);
    };

    // Initialize selected translations with favorites
    const [selectedTranslations, setSelectedTranslations] = useState(() => {
        const favorites = getAvailableFavorites();
        return [
            ...favorites,
            ...Array(Math.max(0, comparisonLimit - favorites.length)).fill("")
        ].slice(0, comparisonLimit);
    });

    const [comparedVerses, setComparedVerses] = useState({});
    const [loading, setLoading] = useState({});

    // Use ref to track current verse for async operations
    const currentVerseIdRef = useRef(verseId);

    // Fetch verse for a translation
    const fetchTranslationVerse = useCallback((translationId, forVerseId) => {
        setLoading((prev) => ({ ...prev, [translationId]: true }));

        fetch(`/api/${locale}/translation/${translationId}/book/${bookId}/chapter/${chapterId}`)
            .then((res) => res.json())
            .then((result) => {
                // Only update if we're still on the same verse
                if (currentVerseIdRef.current === forVerseId) {
                    if (result.data && result.data[forVerseId]) {
                        setComparedVerses((prev) => ({
                            ...prev,
                            [translationId]: result.data[forVerseId],
                        }));
                    } else {
                        setComparedVerses((prev) => ({
                            ...prev,
                            [translationId]: null,
                        }));
                    }
                }
            })
            .catch(() => {
                if (currentVerseIdRef.current === forVerseId) {
                    setComparedVerses((prev) => ({
                        ...prev,
                        [translationId]: null,
                    }));
                }
            })
            .finally(() => {
                setLoading((prev) => ({ ...prev, [translationId]: false }));
            });
    }, [locale, bookId, chapterId]);

    // Load verses when verseId changes
    useEffect(() => {
        // Update ref
        currentVerseIdRef.current = verseId;

        // Clear previous verses and loading states
        setComparedVerses({});
        setLoading({});

        // Fetch current translation
        fetchTranslationVerse(currentTranslation, verseId);

        // Fetch all selected translations
        selectedTranslations.forEach(id => {
            if (id) fetchTranslationVerse(id, verseId);
        });
    }, [verseId, bookId, chapterId, currentTranslation, fetchTranslationVerse]);

    // Update selections when favorites change
    useEffect(() => {
        const favorites = getAvailableFavorites();
        const newSelections = [
            ...favorites,
            ...Array(Math.max(0, comparisonLimit - favorites.length)).fill("")
        ].slice(0, comparisonLimit);
        setSelectedTranslations(newSelections);
    }, [comparisonLimit]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                handlePrevVerse();
            } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                handleNextVerse();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [verseId, totalVerses]);

    // Handle translation selection change for a specific slot
    const handleTranslationChange = (index, translationId) => {
        const newSelections = [...selectedTranslations];
        newSelections[index] = translationId;
        setSelectedTranslations(newSelections);

        if (translationId && !comparedVerses[translationId]) {
            fetchTranslationVerse(translationId, verseId);
        }
    };

    // Convert to integers for comparison
    const currentVerseNum = parseInt(verseId, 10);
    const totalVersesNum = parseInt(totalVerses, 10);

    // Navigation handlers
    const handlePrevVerse = () => {
        if (currentVerseNum > 1 && onNavigateVerse) {
            onNavigateVerse('prev');
        }
    };

    const handleNextVerse = () => {
        if (currentVerseNum < totalVersesNum && onNavigateVerse) {
            onNavigateVerse('next');
        }
    };

    const canGoPrev = currentVerseNum > 1;
    const canGoNext = currentVerseNum < totalVersesNum;

    // Get available translations for a specific selector
    const getAvailableTranslations = (currentSlotIndex) => {
        const usedTranslations = selectedTranslations.filter(
            (t, i) => t && i !== currentSlotIndex
        );
        const available = translations.filter(
            (t) => t.id !== currentTranslation && !usedTranslations.includes(t.id)
        );

        return available.sort((a, b) => {
            const aIsFav = favoriteTranslations.includes(a.id);
            const bIsFav = favoriteTranslations.includes(b.id);
            if (aIsFav && !bIsFav) return -1;
            if (!aIsFav && bIsFav) return 1;
            return a.name.localeCompare(b.name);
        });
    };

    // Render translation selector
    const renderTranslationSelector = (index) => {
        const available = getAvailableTranslations(index);
        const selectedId = selectedTranslations[index];

        return (
            <div key={index} className="comparison-slot mb-4">
                <div className="comparison-slot-header">
                    <span className="comparison-slot-number">{index + 1}</span>
                    <select
                        className="form-select"
                        value={selectedId}
                        onChange={(e) => handleTranslationChange(index, e.target.value)}
                    >
                        <option value="">{formatMessage({ id: "chooseTranslation" })}...</option>

                        {available.filter(t => favoriteTranslations.includes(t.id)).length > 0 && (
                            <optgroup label={`★ ${formatMessage({ id: "favorites" })}`}>
                                {available
                                    .filter(t => favoriteTranslations.includes(t.id))
                                    .map(t => (
                                        <option key={t.id} value={t.id}>
                                            {t.name} ({t.language.toUpperCase()})
                                        </option>
                                    ))
                                }
                            </optgroup>
                        )}

                        {available.filter(t => !favoriteTranslations.includes(t.id)).length > 0 && (
                            <optgroup label={formatMessage({ id: "allTranslations" })}>
                                {available
                                    .filter(t => !favoriteTranslations.includes(t.id))
                                    .map(t => (
                                        <option key={t.id} value={t.id}>
                                            {t.name} ({t.language.toUpperCase()})
                                        </option>
                                    ))
                                }
                            </optgroup>
                        )}
                    </select>
                </div>

                {selectedId && (
                    <div className="comparison-box comparison-box-secondary mt-2">
                        <div className="comparison-box-title">
                            {translations.find(t => t.id === selectedId)?.name}
                        </div>
                        {loading[selectedId] ? (
                            <div className="comparison-loading">
                                <div className="spinner-border spinner-border-sm" role="status"></div>
                            </div>
                        ) : comparedVerses[selectedId] ? (
                            <p className="comparison-text">
                                {comparedVerses[selectedId].replaceAll("//", "\n")}
                            </p>
                        ) : comparedVerses[selectedId] === null ? (
                            <p className="comparison-not-found">
                                {formatMessage({ id: "verseNotFoundInTranslation" })}
                            </p>
                        ) : null}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="selection-overlay comparison-overlay">
            <div className="selection-content container">
                <div className="selection-header d-flex justify-content-between align-items-center mb-4 pt-4">
                    {/* Navigation and title */}
                    <div className="comparison-nav-header">
                        <button
                            className="comparison-nav-btn"
                            onClick={handlePrevVerse}
                            disabled={!canGoPrev}
                            title={formatMessage({ id: "previousVerse" })}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                        </button>

                        <h2 className="comparison-title">
                            {formatMessage({ id: "compareVerse" })} {chapterId}:{verseId}
                        </h2>

                        <button
                            className="comparison-nav-btn"
                            onClick={handleNextVerse}
                            disabled={!canGoNext}
                            title={formatMessage({ id: "nextVerse" })}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                        <span className="comparison-keyboard-hint d-none d-lg-block">
                            ← → {formatMessage({ id: "navigateVerses" })}
                        </span>
                        <button className="btn btn-close" onClick={onClose}></button>
                    </div>
                </div>

                <div className="selection-body pb-5">
                    {/* Original verse */}
                    <div className="comparison-original mb-4">
                        <div className="comparison-box comparison-box-primary">
                            <div className="comparison-box-title comparison-box-title-primary">
                                {translations.find(t => t.id === currentTranslation)?.name || currentTranslation}
                                <span className="comparison-current-badge">
                                    {formatMessage({ id: "currentTranslation" })}
                                </span>
                            </div>
                            {comparedVerses[currentTranslation] ? (
                                <p className="comparison-text comparison-text-primary">
                                    {comparedVerses[currentTranslation].replaceAll("//", "\n")}
                                </p>
                            ) : (
                                <div className="comparison-loading">
                                    <div className="spinner-border spinner-border-sm" role="status"></div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="comparison-divider">
                        <span>{formatMessage({ id: "compareWith" })}</span>
                    </div>

                    {/* Translation selectors */}
                    <div className="comparison-selectors">
                        {Array.from({ length: comparisonLimit }, (_, i) =>
                            renderTranslationSelector(i)
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComparisonGrid;
