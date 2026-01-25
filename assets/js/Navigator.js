import React, { useCallback } from "react";
import TranslationSelector from "./TranslationSelector";
import BookSelector from "./BookSelector";
import ChapterSelector from "./ChapterSelector";
import DirectionalNavigationButton from "./DirectionalNavigationButton";

export default function Navigator({
    translations,
    books,
    structure,
    chapters,
    isStructureLoading,
    listsLoading,
    changeSelectedTranslation,
    changeSelectedBook,
    changeSelectedChapter,
    selectedTranslation,
    selectedBook,
    selectedChapter,
    prevChapter,
    nextChapter,
    prevBook,
    nextBook,
    isNextBookAvailable,
    isPrevBookAvailable,
    isNextChapterAvailable,
    isPrevChapterAvailable,
    onOpenSelection,
    onOpenNotes,
    onOpenSearch,
    onOpenSettings,
    className = "",
}) {
    const isNextChapterOrBookAvailable =
        isNextChapterAvailable() || isNextBookAvailable();
    const isPrevChapterOrBookAvailable =
        isPrevChapterAvailable() || isPrevBookAvailable();

    const handlePrevChapter = useCallback(() => prevChapter(), [prevChapter]);

    return (
        <header className={`container sticky-top pt-2 pb-2 user-select-none ${className}`}>
            <div className="row align-items-center">
                <div className="col-12 col-lg-3">
                    <TranslationSelector
                        selectedTranslation={selectedTranslation}
                        translations={translations}
                        changeSelectedTranslation={changeSelectedTranslation}
                        isLoading={listsLoading}
                    />
                </div>

                <div className="col-1 d-none d-lg-flex justify-content-center p-0">
                    <DirectionalNavigationButton
                        direction="left"
                        onClick={handlePrevChapter}
                        disabled={!isPrevChapterOrBookAvailable}
                    />
                </div>

                <div className="col-4 d-none d-lg-block text-center">
                    <button
                        className="btn btn-location p-0 w-100"
                        onClick={onOpenSelection}
                        disabled={isStructureLoading}
                        title={books[selectedBook] ? books[selectedBook].name : ""}
                    >
                        <span className="location-text">
                            {books[selectedBook]
                                ? `${books[selectedBook].name} ${selectedChapter}`
                                : "..."}
                        </span>
                        <i className="icon-expand ms-2"></i>
                    </button>
                </div>

                <div className="col-1 d-none d-lg-flex justify-content-center p-0">
                    <DirectionalNavigationButton
                        direction="right"
                        onClick={nextChapter}
                        disabled={!isNextChapterOrBookAvailable}
                    />
                </div>

                {/* Desktop action buttons */}
                <div className="col-3 d-none d-lg-flex justify-content-end gap-2">
                    <button
                        className="nav-action-btn"
                        onClick={onOpenSelection}
                        title="Wybierz księgę"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                        </svg>
                    </button>
                    <button
                        className="nav-action-btn"
                        onClick={onOpenSearch}
                        title="Szukaj"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </button>
                    <button
                        className="nav-action-btn"
                        onClick={onOpenNotes}
                        title="Notatki"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button
                        className="nav-action-btn"
                        onClick={onOpenSettings}
                        title="Ustawienia"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </header>
    );
}
