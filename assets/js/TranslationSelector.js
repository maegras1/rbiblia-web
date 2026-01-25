import React, { useState, useRef, useEffect } from "react";
import { useIntl } from "react-intl";
import { getFavoriteTranslations, saveFavoriteTranslations } from "./SideMenu";

const TranslationSelector = ({
    translations,
    selectedTranslation,
    changeSelectedTranslation,
    isLoading,
}) => {
    const { locale, formatMessage } = useIntl();
    const [isOpen, setIsOpen] = useState(false);
    const [favorites, setFavorites] = useState(getFavoriteTranslations());
    const [hoveredId, setHoveredId] = useState(null);
    const dropdownRef = useRef(null);

    const languageNames = new Intl.DisplayNames([locale], {
        type: "language",
    });

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Reload favorites when dropdown opens
    useEffect(() => {
        if (isOpen) {
            setFavorites(getFavoriteTranslations());
        }
    }, [isOpen]);

    const handleSelect = (id) => {
        changeSelectedTranslation(id);
        setIsOpen(false);
    };

    const toggleFavorite = (e, id) => {
        e.stopPropagation();
        const newFavorites = favorites.includes(id)
            ? favorites.filter(fid => fid !== id)
            : [...favorites, id];
        setFavorites(newFavorites);
        saveFavoriteTranslations(newFavorites);
    };

    // Separate favorites and rest
    const favoriteTranslations = translations.filter(t => favorites.includes(t.id));
    const otherTranslations = translations.filter(t => !favorites.includes(t.id));

    // Group other translations by language
    const translationList = [];
    const map = {};

    otherTranslations.forEach((trans) => {
        if (!map[trans.language]) {
            const languageGroup = {
                languageName: languageNames.of(trans.language),
                children: [],
            };
            map[trans.language] = languageGroup.children;
            translationList.push(languageGroup);
        }
        map[trans.language].push(trans);
    });

    const currentTranslation = translations.find(t => t.id === selectedTranslation);

    const renderTranslationItem = (t, showStar = true) => (
        <div
            key={t.id}
            className={`translation-item ${t.id === selectedTranslation ? 'selected' : ''}`}
            onClick={() => handleSelect(t.id)}
            onMouseEnter={() => setHoveredId(t.id)}
            onMouseLeave={() => setHoveredId(null)}
        >
            <span className="translation-name">
                {t.name} {t.date ? `[${t.date}]` : ''}
            </span>
            {showStar && (
                <button
                    className={`translation-star ${favorites.includes(t.id) ? 'is-favorite' : ''} ${hoveredId === t.id || favorites.includes(t.id) ? 'visible' : ''}`}
                    onClick={(e) => toggleFavorite(e, t.id)}
                    title={favorites.includes(t.id) ? formatMessage({ id: "removeFromFavorites" }) : formatMessage({ id: "addToFavorites" })}
                >
                    {favorites.includes(t.id) ? '★' : '☆'}
                </button>
            )}
        </div>
    );

    return (
        <div className="translation-selector" ref={dropdownRef}>
            <button
                className={`translation-selector-trigger form-control ${isLoading ? 'disabled' : ''}`}
                onClick={() => !isLoading && setIsOpen(!isOpen)}
                type="button"
                disabled={isLoading}
            >
                <span className="translation-selector-value">
                    {isLoading ? (
                        <span className="d-flex align-items-center gap-2">
                            <span className="spinner-border spinner-border-sm text-secondary" role="status"></span>
                            <span>{selectedTranslation}...</span>
                        </span>
                    ) : (
                        currentTranslation ? currentTranslation.name : selectedTranslation
                    )}
                </span>
                <span className="translation-selector-arrow">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </span>
            </button>

            {isOpen && (
                <div className="translation-dropdown">
                    {/* Favorites group */}
                    {favoriteTranslations.length > 0 && (
                        <div className="translation-group">
                            <div className="translation-group-label">★ {formatMessage({ id: "favorites" })}</div>
                            {favoriteTranslations
                                .sort((a, b) => a.name.localeCompare(b.name))
                                .map(t => renderTranslationItem(t))}
                        </div>
                    )}

                    {/* Other translations grouped by language */}
                    {translationList.map(({ languageName, children }, index) => (
                        <div className="translation-group" key={index}>
                            <div className="translation-group-label">{languageName}</div>
                            {children
                                .sort((a, b) => a.name.localeCompare(b.name))
                                .map(t => renderTranslationItem(t))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TranslationSelector;
