import React, { useState, useEffect } from "react";
import { useIntl } from "react-intl";

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
const SideMenuTab = ({ onClick }) => {
    const { formatMessage } = useIntl();

    return (
        <button
            className="side-menu-tab"
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

// Sekcja ustawień wyświetlania z rozmiarem i rodzajem czcionki
const DisplaySettings = ({ fontSize, setFontSize, fontFamily, setFontFamily }) => {
    const { formatMessage } = useIntl();

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

    return (
        <div className="side-menu-section">
            <h4 className="side-menu-section-title">
                {formatMessage({ id: "displaySettings" })}
            </h4>

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
    );
};

export { SideMenu, SideMenuTab, DisplaySettings };
