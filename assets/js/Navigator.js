import React, { useCallback } from "react";
import { useIntl } from "react-intl";
import TranslationSelector from "./TranslationSelector";
import BookSelector from "./BookSelector";
import ChapterSelector from "./ChapterSelector";
import DirectionalNavigationButton from "./DirectionalNavigationButton";
import Icon from "./Icon";

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
    const { formatMessage } = useIntl();
    const isNextChapterOrBookAvailable =
        isNextChapterAvailable() || isNextBookAvailable();
    const isPrevChapterOrBookAvailable =
        isPrevChapterAvailable() || isPrevBookAvailable();

    const handlePrevChapter = useCallback(() => prevChapter(), [prevChapter]);

    return (
        <header className={`container sticky-top pt-2 pb-2 user-select-none ${className}`}>
            <div className="row align-items-center">
                <div className="col-12 col-lg-3 translation-col">
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

                <div className="col-4 d-none d-lg-block text-center location-col">
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
                        <Icon name="chevron-down" className="ms-2" size={16} />
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
                        title={formatMessage({ id: "selectBook" })}
                    >
                        <Icon name="book-marked" size={20} />
                    </button>
                    <button
                        className="nav-action-btn"
                        onClick={onOpenSearch}
                        title={formatMessage({ id: "search" })}
                    >
                        <Icon name="search" size={20} />
                    </button>
                    <button
                        className="nav-action-btn"
                        onClick={onOpenNotes}
                        title={formatMessage({ id: "notes" })}
                    >
                        <Icon name="file-text" size={20} />
                    </button>
                    <button
                        className="nav-action-btn"
                        onClick={onOpenSettings}
                        title={formatMessage({ id: "settings" })}
                    >
                        <Icon name="settings" size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
}
