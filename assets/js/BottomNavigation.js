import React from "react";
import { useIntl } from "react-intl";

const BottomNavigation = ({
    onPrevChapter,
    onNextChapter,
    onOpenSelection,
    isPrevAvailable,
    isNextAvailable,
    currentBook,
    currentChapter,
}) => {
    const { formatMessage } = useIntl();

    return (
        <nav className="bottom-nav d-lg-none">
            <button
                className="bottom-nav-btn"
                onClick={onPrevChapter}
                disabled={!isPrevAvailable}
                aria-label={formatMessage({ id: "previousChapter" })}
            >
                <svg className="bottom-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                <span className="bottom-nav-label">{formatMessage({ id: "prev" })}</span>
            </button>

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

            <button
                className="bottom-nav-btn"
                onClick={onNextChapter}
                disabled={!isNextAvailable}
                aria-label={formatMessage({ id: "nextChapter" })}
            >
                <span className="bottom-nav-label">{formatMessage({ id: "next" })}</span>
                <svg className="bottom-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </button>
        </nav>
    );
};

export default BottomNavigation;
