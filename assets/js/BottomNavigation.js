import React from "react";
import { useIntl } from "react-intl";

const BottomNavigation = ({
    onPrevChapter,
    onNextChapter,
    onOpenSelection,
    onOpenNotes,
    onOpenSearch,
    isPrevAvailable,
    isNextAvailable,
    currentBook,
    currentChapter,
}) => {
    const { formatMessage } = useIntl();

    return (
        <nav className="bottom-nav d-lg-none">
            {/* Strzałka w lewo - skrajnie lewa pozycja */}
            <button
                className="bottom-nav-btn bottom-nav-arrow"
                onClick={onPrevChapter}
                disabled={!isPrevAvailable}
                aria-label={formatMessage({ id: "previousChapter" })}
            >
                <svg className="bottom-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
            </button>

            {/* Notatki - lewa strona środka */}
            <button
                className="bottom-nav-btn"
                onClick={onOpenNotes}
                aria-label={formatMessage({ id: "notes" })}
            >
                <svg className="bottom-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                <span className="bottom-nav-label">{formatMessage({ id: "notes" })}</span>
            </button>

            {/* Wybór księgi - centrum */}
            <button
                className="bottom-nav-btn bottom-nav-btn-center"
                onClick={onOpenSelection}
                aria-label={formatMessage({ id: "selectBook" })}
            >
                <svg className="bottom-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
                <span className="bottom-nav-label bottom-nav-location">
                    {currentBook ? `${currentBook} ${currentChapter}` : "..."}
                </span>
            </button>

            {/* Wyszukiwanie - prawa strona środka */}
            <button
                className="bottom-nav-btn"
                onClick={onOpenSearch}
                aria-label={formatMessage({ id: "search" })}
            >
                <svg className="bottom-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <span className="bottom-nav-label">{formatMessage({ id: "search" })}</span>
            </button>

            {/* Strzałka w prawo - skrajnie prawa pozycja */}
            <button
                className="bottom-nav-btn bottom-nav-arrow"
                onClick={onNextChapter}
                disabled={!isNextAvailable}
                aria-label={formatMessage({ id: "nextChapter" })}
            >
                <svg className="bottom-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </button>
        </nav>
    );
};

export default BottomNavigation;
