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
                {children}
            </div>
        </>
    );
};

// Sticky tab button on the right edge - lower on the screen
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

// Settings section with tabs
const DisplaySettings = ({
    fontSize,
    setFontSize,
    fontFamily,
    setFontFamily,
    translations = [],
    setLocaleAndUpdateHistory,
    theme,
    setTheme,
    onClose
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
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="4 7 4 4 20 4 20 7" />
                    <line x1="9" y1="20" x2="15" y2="20" />
                    <line x1="12" y1="4" x2="12" y2="20" />
                </svg>
            ),
            label: formatMessage({ id: "textSettings" })
        },
        {
            id: 'appearance',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
            ),
            label: formatMessage({ id: "appearance" })
        },
        {
            id: 'language',
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
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
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

    // Export notes to a JSON file
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

    // Import notes from a JSON file
    const handleImportNotes = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importData = JSON.parse(e.target.result);

                // Structure validation
                if (!importData.verseNotes && !importData.generalNotes) {
                    throw new Error('Invalid file format');
                }

                // Merge with existing notes
                const existingNotes = loadNotes();
                const existingGeneral = JSON.parse(localStorage.getItem('rbiblia_general_notes') || '[]');

                // Merge verse notes (new items overwrite existing ones)
                const mergedNotes = { ...existingNotes, ...importData.verseNotes };
                saveNotes(mergedNotes);

                // Merge general notes (add new items at the beginning, avoiding duplicates)
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

    // Count total notes
    const getNotesCount = () => {
        const notes = loadNotes();
        const generalNotes = JSON.parse(localStorage.getItem('rbiblia_general_notes') || '[]');
        return Object.keys(notes).length + generalNotes.length;
    };

    // Filter only favorite translations
    const favoriteTranslationsList = translations.filter(t => favoriteTranslations.includes(t.id));

    return (
        <>
            {/* Side Menu Dock */}
            <div className="side-menu-dock">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`side-menu-dock-item ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                        title={tab.label}
                    >
                        {tab.icon}
                    </button>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="side-menu-main">
                <div className="side-menu-header">
                    <h3 className="side-menu-title">
                        {tabs.find(t => t.id === activeTab)?.label}
                    </h3>
                    {onClose && (
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
                    )}
                </div>

                <div className="side-menu-content">

                    {/* Text settings tab */}
                    {activeTab === 'text' && (
                        <div className="side-menu-section animate-slide-up">
                            <h4 className="side-menu-section-title">
                                {formatMessage({ id: "textSettings" })}
                            </h4>

                            {/* Font size setting */}
                            <div className="setting-group stagger-1">
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

                            {/* Font family setting */}
                            {setFontFamily && (
                                <div className="setting-group stagger-2">
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

                    {/* Appearance settings tab */}
                    {activeTab === 'appearance' && (
                        <div className="side-menu-section animate-slide-up">
                            <h4 className="side-menu-section-title">
                                {formatMessage({ id: "appearance" })}
                            </h4>

                            {/* Theme (Light/Dark/System) */}
                            {setTheme && (
                                <div className="setting-group stagger-1">
                                    <label className="setting-label">{formatMessage({ id: "theme" })}</label>
                                    <div className="setting-tiles-grid">
                                        {themes.map((t) => (
                                            <button
                                                key={t.value}
                                                className={`setting-tile ${theme === t.value ? 'active' : ''}`}
                                                onClick={() => setTheme(t.value)}
                                                title={t.label}
                                            >
                                                <span className="tile-icon">{t.icon}</span>
                                                <span className="tile-label">{t.label}</span>
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

                            <div className="setting-group stagger-1">
                                <label className="setting-label">{formatMessage({ id: "selectLanguage" })}</label>
                                <div className="setting-tiles-grid grid-2">
                                    {['pl', 'en', 'de'].map(lang => (
                                        <button
                                            key={lang}
                                            className={`setting-tile ${locale === lang ? 'active' : ''}`}
                                            onClick={() => setLocaleAndUpdateHistory(lang)}
                                        >
                                            <span className="tile-icon">
                                                {lang === 'pl' && "🇵🇱"}
                                                {lang === 'en' && "🇬🇧"}
                                                {lang === 'de' && "🇩🇪"}
                                            </span>
                                            <span className="tile-label">
                                                {lang === 'pl' && "Polski"}
                                                {lang === 'en' && "English"}
                                                {lang === 'de' && "Deutsch"}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Favorites tab */}
                    {activeTab === 'favorites' && (
                        <div className="animate-slide-up">
                            {/* Translation comparison section */}
                            <div className="side-menu-section stagger-1">
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

                            {/* Favorite translations list */}
                            <div className="side-menu-section stagger-2">
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

                            <p className="setting-hint stagger-1">
                                {formatMessage({ id: "notesCount" }, { count: getNotesCount() })}
                            </p>

                            <div className="setting-group stagger-2">
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
                </div> {/* end side-menu-content */}
            </div> {/* end side-menu-main */}
        </>
    );
};

export { SideMenu, SideMenuTab, DisplaySettings, getComparisonLimit, getFavoriteTranslations, saveFavoriteTranslations };
