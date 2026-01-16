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
}) {
    const isNextChapterOrBookAvailable =
        isNextChapterAvailable() || isNextBookAvailable();
    const isPrevChapterOrBookAvailable =
        isPrevChapterAvailable() || isPrevBookAvailable();

    const handlePrevChapter = useCallback(() => prevChapter(), [prevChapter]);

    return (
        <header className="container sticky-top pt-2 pb-2 user-select-none">
            <div className="row align-items-center">
                <div className="col-12 col-lg-4">
                    <TranslationSelector
                        selectedTranslation={selectedTranslation}
                        translations={translations}
                        changeSelectedTranslation={changeSelectedTranslation}
                    />
                </div>

                <div className="col-1 d-none d-lg-flex justify-content-center p-0">
                    <DirectionalNavigationButton
                        direction="left"
                        onClick={handlePrevChapter}
                        disabled={!isPrevChapterOrBookAvailable}
                    />
                </div>

                <div className="col-6 d-none d-lg-block text-center">
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
            </div>
        </header>
    );
}
