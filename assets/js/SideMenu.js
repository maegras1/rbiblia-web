import React, { useState, useEffect, useRef } from "react";
import { useIntl } from "react-intl";
import { loadNotes, saveNotes } from "./Notes";

const SideMenu = ({ isOpen, onClose, children }) => {
    const { formatMessage } = useIntl();

    return (
        <>
            {/* Overlay */}
            <div
                className={`side-menu-overlay ${isOpen ? 'active' : ''}`}
                onClick={onClose}
            />

            {/* Panel */}
            <div className={`side-menu-panel ${isOpen ? 'open' : ''}`}>
                <div className="side-menu-header">
                    <h3 className="side-menu-title">{formatMessage({ id: "menu" })}</h3>
                    <button
                        className="side-menu-close"
                        onClick={onClose}
                        aria-label={formatMessage({ id: "close" })}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div className="side-menu-content">
                    {children}
                </div>
            </div>
        </>
    );
};

// Przycisk-zakładka przyklejony do krawędzi - niżej na ekranie
const SideMenuTab = ({ onClick, className = "" }) => {
    const { formatMessage } = useIntl();

    return (
        <button
            className={`side-menu-tab ${className}`}
            onClick={onClick}
            aria-label={formatMessage({ id: "openMenu" })}
        >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
        </button>
    );
};

// Helper functions for settings
const getComparisonLimit = () => {
    return parseInt(localStorage.getItem('rbiblia_comparison_limit') || '4', 10);
};

const setComparisonLimitValue = (limit) => {
    localStorage.setItem('rbiblia_comparison_limit', limit.toString());
};

const getFavoriteTranslations = () => {
    try {
        return JSON.parse(localStorage.getItem('rbiblia_favorite_translations') || '[]');
    } catch {
        return [];
    }
};

const saveFavoriteTranslations = (favorites) => {
    localStorage.setItem('rbiblia_favorite_translations', JSON.stringify(favorites));
};

// Sekcja ustawień z zakładkami
const DisplaySettings = ({
    fontSize,
    setFontSize,
    fontFamily,
    setFontFamily,
    translations = [],
    setLocaleAndUpdateHistory,
    theme,
    setTheme
}) => {
    const { formatMessage, locale } = useIntl();
    const fileInputRef = useRef(null);
    const [importStatus, setImportStatus] = useState(null);
    const [comparisonLimit, setComparisonLimit] = useState(getComparisonLimit);
    const [favoriteTranslations, setFavoriteTranslationsState] = useState(getFavoriteTranslations);
    const [activeTab, setActiveTab] = useState('text');

    const fontSizes = [
        { value: 'small', label: 'A', size: '0.9rem' },
        { value: 'medium', label: 'A', size: '1.15rem' },
        { value: 'large', label: 'A', size: '1.4rem' },
        { value: 'xlarge', label: 'A', size: '1.7rem' },
    ];

    const fontFamilies = [
        { value: 'serif', label: 'Serif', preview: 'Georgia, serif' },
        { value: 'sans', label: 'Sans', preview: 'Inter, sans-serif' },
        { value: 'mono', label: 'Mono', preview: 'monospace' },
    ];

    const themes = [
        { value: 'system', label: formatMessage({ id: 'themeSystem' || 'System' }), icon: '⚙️' },
        { value: 'light', label: formatMessage({ id: 'themeLight' || 'Light' }), icon: '☀️' },
        { value: 'dark', label: formatMessage({ id: 'themeDark' || 'Dark' }), icon: '🌙' },
    ];

    const comparisonOptions = [2, 3, 4, 5, 6];

    // Tabs configuration
    const tabs = [
        {
            id: 'text',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="4 20 10 4 16 20"></polyline>
                    <line x1="6" y1="16" x2="14" y2="16"></line>
                    <circle cx="18" cy="16" r="4"></circle>
                    <line x1="22" y1="12" x2="22" y2="20"></line>
                </svg>
            ),
            label: formatMessage({ id: "textSettings" })
        },
        {
            id: 'language', // New Language Tab
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
            ),
            label: formatMessage({ id: "language" })
        },
        {
            id: 'favorites',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            ),
            label: formatMessage({ id: "favoriteTranslations" })
        },
        {
            id: 'backup',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1-2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
            ),
            label: formatMessage({ id: "notesBackup" })
        }
    ];

    // Handle comparison limit change
    const comparisonLimitValue = comparisonLimit;
    const handleComparisonLimitChange = (limit) => {
        setComparisonLimit(limit);
        setComparisonLimitValue(limit);
    };

    // Toggle favorite translation
    const toggleFavorite = (translationId) => {
        const newFavorites = favoriteTranslations.includes(translationId)
            ? favoriteTranslations.filter(id => id !== translationId)
            : [...favoriteTranslations, translationId];
        setFavoriteTranslationsState(newFavorites);
        saveFavoriteTranslations(newFavorites);
    };

    // Eksport notatek do pliku JSON
    const handleExportNotes = () => {
        const notes = loadNotes();
        const generalNotes = JSON.parse(localStorage.getItem('rbiblia_general_notes') || '[]');

        const exportData = {
            version: 1,
            exportDate: new Date().toISOString(),
            verseNotes: notes,
            generalNotes: generalNotes
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rbiblia-notatki-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Import notatek z pliku JSON
    const handleImportNotes = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importData = JSON.parse(e.target.result);

                // Walidacja struktury
                if (!importData.verseNotes && !importData.generalNotes) {
                    throw new Error('Invalid file format');
                }

                // Merge z istniejącymi notatkami
                const existingNotes = loadNotes();
                const existingGeneral = JSON.parse(localStorage.getItem('rbiblia_general_notes') || '[]');

                // Merge verse notes (nowe nadpisują istniejące)
                const mergedNotes = { ...existingNotes, ...importData.verseNotes };
                saveNotes(mergedNotes);

                // Merge general notes (dodaj nowe na początek, unikając duplikatów)
                if (importData.generalNotes && Array.isArray(importData.generalNotes)) {
                    const existingIds = new Set(existingGeneral.map(n => n.id));
                    const newNotes = importData.generalNotes.filter(n => !existingIds.has(n.id));
                    const mergedGeneral = [...newNotes, ...existingGeneral];
                    localStorage.setItem('rbiblia_general_notes', JSON.stringify(mergedGeneral));
                }

                setImportStatus('success');
                setTimeout(() => setImportStatus(null), 3000);
            } catch (err) {
                console.error('Import error:', err);
                setImportStatus('error');
                setTimeout(() => setImportStatus(null), 3000);
            }
        };
        reader.readAsText(file);

        // Reset input
        event.target.value = '';
    };

    // Zlicz notatki
    const getNotesCount = () => {
        const notes = loadNotes();
        const generalNotes = JSON.parse(localStorage.getItem('rbiblia_general_notes') || '[]');
        return Object.keys(notes).length + generalNotes.length;
    };

    // Filtruj tylko ulubione tłumaczenia
    const favoriteTranslationsList = translations.filter(t => favoriteTranslations.includes(t.id));

    return (
        <>
            {/* Tab navigation */}
            <div className="settings-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                        title={tab.label}
                    >
                        {tab.icon}
                    </button>
                ))}
            </div>

            {/* Text settings tab */}
            {activeTab === 'text' && (
                <div className="side-menu-section animate-slide-up">
                    <h4 className="side-menu-section-title">
                        {formatMessage({ id: "displaySettings" })}
                    </h4>

                    {/* Motyw (Theme) */}
                    {setTheme && (
                        <div className="setting-group">
                            <label className="setting-label">{formatMessage({ id: "theme" })}</label>
                            <div className="language-buttons d-flex gap-2">
                                {themes.map((t) => (
                                    <button
                                        key={t.value}
                                        className={`font-family-btn ${theme === t.value ? 'active' : ''}`}
                                        onClick={() => setTheme(t.value)}
                                        title={t.label}
                                    >
                                        <span className="me-1">{t.icon}</span>
                                        <span className="d-none d-sm-inline">{t.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Rozmiar czcionki */}
                    <div className="setting-group">
                        <label className="setting-label">{formatMessage({ id: "fontSize" })}</label>
                        <div className="font-size-buttons">
                            {fontSizes.map((fs) => (
                                <button
                                    key={fs.value}
                                    className={`font-size-btn ${fontSize === fs.value ? 'active' : ''}`}
                                    onClick={() => setFontSize(fs.value)}
                                    style={{ fontSize: fs.size }}
                                >
                                    {fs.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Rodzaj czcionki */}
                    {setFontFamily && (
                        <div className="setting-group">
                            <label className="setting-label">{formatMessage({ id: "fontFamily" })}</label>
                            <div className="font-family-buttons">
                                {fontFamilies.map((ff) => (
                                    <button
                                        key={ff.value}
                                        className={`font-family-btn ${fontFamily === ff.value ? 'active' : ''}`}
                                        onClick={() => setFontFamily(ff.value)}
                                        style={{ fontFamily: ff.preview }}
                                    >
                                        {ff.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Language settings tab */}
            {activeTab === 'language' && setLocaleAndUpdateHistory && (
                <div className="side-menu-section animate-slide-up">
                    <h4 className="side-menu-section-title">
                        {formatMessage({ id: "appLanguage" })}
                    </h4>

                    <div className="setting-group">
                        <label className="setting-label">{formatMessage({ id: "selectLanguage" })}</label>
                        <div className="language-buttons d-flex flex-column gap-2">

                            {['pl', 'en', 'de'].map(lang => (
                                <button
                                    key={lang}
                                    className={`font-family-btn w-100 justify-content-start px-3 ${locale === lang ? 'active' : ''}`}
                                    onClick={() => setLocaleAndUpdateHistory(lang)}
                                >
                                    {lang === 'pl' && "🇵🇱 Polski"}
                                    {lang === 'en' && "🇬🇧 English"}
                                    {lang === 'de' && "🇩🇪 Deutsch"}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Favorites tab */}
            {activeTab === 'favorites' && (
                <div className="animate-slide-up">
                    {/* Sekcja porównywania tłumaczeń */}
                    <div className="side-menu-section">
                        <h4 className="side-menu-section-title">
                            {formatMessage({ id: "comparisonSettings" })}
                        </h4>

                        <div className="setting-group">
                            <label className="setting-label">{formatMessage({ id: "comparisonLimit" })}</label>
                            <div className="comparison-limit-buttons">
                                {comparisonOptions.map((num) => (
                                    <button
                                        key={num}
                                        className={`comparison-limit-btn ${comparisonLimit === num ? 'active' : ''}`}
                                        onClick={() => handleComparisonLimitChange(num)}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Lista ulubionych tłumaczeń */}
                    <div className="side-menu-section">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <h4 className="side-menu-section-title mb-0">
                                {formatMessage({ id: "favoriteTranslations" })}
                            </h4>
                            {/* Counter moved here */}
                            <span className="badge bg-light text-dark">
                                {formatMessage({ id: "availableTranslationsCounter" })} {translations.length}
                            </span>
                        </div>

                        <p className="setting-hint">
                            {formatMessage({ id: "favoriteTranslationsComparisonHint" })}
                        </p>

                        {favoriteTranslationsList.length > 0 ? (
                            <div className="favorite-translations-list">
                                {favoriteTranslationsList.map((t) => (
                                    <div
                                        key={t.id}
                                        className="favorite-translation-item is-favorite"
                                        onClick={() => toggleFavorite(t.id)}
                                    >
                                        <span className="favorite-star">★</span>
                                        <span className="favorite-name">{t.name}</span>
                                        <button
                                            className="favorite-remove"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFavorite(t.id);
                                            }}
                                            title={formatMessage({ id: "removeFromFavorites" })}
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                <line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-favorites-hint">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                                <p>{formatMessage({ id: "noFavorites" })}</p>
                                <span>{formatMessage({ id: "noFavoritesHint" })}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Backup tab */}
            {activeTab === 'backup' && (
                <div className="side-menu-section animate-slide-up">
                    <h4 className="side-menu-section-title">
                        {formatMessage({ id: "notesBackup" })}
                    </h4>

                    <p className="setting-hint">
                        {formatMessage({ id: "notesCount" }, { count: getNotesCount() })}
                    </p>

                    <div className="setting-group">
                        <div className="notes-backup-buttons">
                            <button
                                className="backup-btn backup-export"
                                onClick={handleExportNotes}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7 10 12 15 17 10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                                {formatMessage({ id: "exportNotes" })}
                            </button>

                            <button
                                className="backup-btn backup-import"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="17 8 12 3 7 8"></polyline>
                                    <line x1="12" y1="3" x2="12" y2="15"></line>
                                </svg>
                                {formatMessage({ id: "importNotes" })}
                            </button>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".json"
                                onChange={handleImportNotes}
                                style={{ display: 'none' }}
                            />
                        </div>

                        {importStatus === 'success' && (
                            <p className="import-status import-success">
                                ✓ {formatMessage({ id: "importSuccess" })}
                            </p>
                        )}
                        {importStatus === 'error' && (
                            <p className="import-status import-error">
                                ✗ {formatMessage({ id: "importError" })}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export { SideMenu, SideMenuTab, DisplaySettings, getComparisonLimit, getFavoriteTranslations, saveFavoriteTranslations };
