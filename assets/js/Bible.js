import React, { useCallback, useEffect, useRef, useState } from "react";
import Navigator from "./Navigator";
import Reader from "./Reader";
import StatusBar from "./StatusBar";
import { injectIntl } from "react-intl";
import getDataFromCurrentPathname from "./getDataFromCurrentPathname";
import AppError from "./AppError";
import AppLoading from "./AppLoading";
import updateHistory from "./updateHistory";
import getAppropriateBook from "./getAppropriateBook";
import SelectionGrid from "./SelectionGrid";
import ComparisonGrid from "./ComparisonGrid";
import BottomNavigation from "./BottomNavigation";
import useSwipeNavigation from "./useSwipeNavigation";
import { SideMenu, SideMenuTab, DisplaySettings } from "./SideMenu";
import { NotesPanel, NoteEditor } from "./Notes";
import SearchPanel from "./SearchPanel";
import useVersesCache from "./useVersesCache";

const Bible = ({ intl, setLocale }) => {
    const [error, setError] = useState(null);
    const [isBooksLoading, setIsBooksLoading] = useState(true);
    const [isTranslationsLoading, setIsTranslationsLoading] = useState(true);
    const [isStructureLoading, setIsStructureLoading] = useState(true);
    const [showVerses, setShowVerses] = useState(false);
    const [isSelectionOpen, setIsSelectionOpen] = useState(false);
    const [comparedVerse, setComparedVerse] = useState(null);

    // Cache wersetów dla szybszego ładowania
    const versesCache = useVersesCache(intl.locale);

    // Side menu states
    const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
    const [isNotesOpen, setIsNotesOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Note editor state
    const [editingNoteVerse, setEditingNoteVerse] = useState(null);
    const [notesVersion, setNotesVersion] = useState(0);  // Increment to refresh note indicators

    // Font size (saved to localStorage)
    const [fontSize, setFontSize] = useState(() => {
        return localStorage.getItem('rbiblia-font-size') || 'medium';
    });

    // Font family (saved to localStorage)
    const [fontFamily, setFontFamily] = useState(() => {
        return localStorage.getItem('rbiblia-font-family') || 'serif';
    });

    // Save font size to localStorage and apply to CSS variable
    useEffect(() => {
        localStorage.setItem('rbiblia-font-size', fontSize);
        const sizeMap = {
            small: '0.9rem',
            medium: '1.15rem',
            large: '1.4rem',
            xlarge: '1.7rem'
        };
        document.documentElement.style.setProperty('--verse-font-size', sizeMap[fontSize]);
    }, [fontSize]);

    // Save font family to localStorage and apply to CSS variable
    useEffect(() => {
        localStorage.setItem('rbiblia-font-family', fontFamily);
        const familyMap = {
            serif: 'Georgia, "Times New Roman", serif',
            sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            mono: '"Fira Code", "Cascadia Code", Consolas, monospace'
        };
        document.documentElement.style.setProperty('--verse-font-family', familyMap[fontFamily]);
    }, [fontFamily]);

    // Note: It contains all books available - not only translation specific
    const [books, setBooks] = useState([]);
    const [translations, setTranslations] = useState([]);
    const [structure, setStructure] = useState(null);
    const [verses, setVerses] = useState([]);
    const [selectedTranslation, setSelectedTranslation] = useState(
        getDataFromCurrentPathname().translation
    );
    const [selectedBook, setSelectedBook] = useState(
        getDataFromCurrentPathname().book
    );
    const [selectedChapter, setSelectedChapter] = useState(
        getDataFromCurrentPathname().chapter
    );

    useEffect(() => {
        // Jeśli użytkownik wchodzi na stronę główną (ścieżka /), otwórz wybór ksiąg
        if (window.location.pathname === "/" || window.location.pathname === "") {
            setIsSelectionOpen(true);
        }

        const handlePopState = () => {
            const data = getDataFromCurrentPathname();
            setSelectedTranslation(data.translation);
            setSelectedBook(data.book);
            setSelectedChapter(data.chapter);
        };

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, []);

    const keepChapterIfPossible = useRef(false);
    const startFromLastVerse = useRef(false);

    const chapters =
        structure && selectedBook && structure[selectedBook]
            ? structure[selectedBook]
            : [];

    const changeSelectedTranslation = useCallback((newTranslation) => {
        setShowVerses(false);
        setIsStructureLoading(true);
        keepChapterIfPossible.current = true;
        versesCache.clearCache();  // Wyczyść cache przy zmianie tłumaczenia
        setSelectedTranslation(newTranslation);
    }, [versesCache]);

    const setLocaleAndUpdateHistory = (locale) => {
        const { chapter, book, translation } = getDataFromCurrentPathname();

        setLocale(locale);
        updateHistory(locale, translation, book, chapter);
    };

    const changeSelectedBook = (newSelectedBook) => {
        keepChapterIfPossible.current = newSelectedBook === selectedBook;
        setSelectedBook(newSelectedBook);
    };

    useEffect(() => {
        if (!structure || chapters.length === 0) {
            return;
        }
        changeSelectedChapter(
            getAppropriateChapter(
                keepChapterIfPossible.current,
                startFromLastVerse.current
            )
        );
        keepChapterIfPossible.current = false;
        startFromLastVerse.current = false;
    }, [selectedBook, structure]);

    const getAppropriateChapter = (
        keepChapterIfPossible,
        startFromLastVerse
    ) => {
        if (
            keepChapterIfPossible &&
            structure[selectedBook].some(
                (chapter) => chapter == selectedChapter
            )
        ) {
            return selectedChapter;
        }

        if (startFromLastVerse) {
            return structure[selectedBook][structure[selectedBook].length - 1];
        }

        return structure[selectedBook][0];
    };

    const changeSelectedChapter = async (newSelectedChapter) => {
        const { locale } = intl;

        updateHistory(
            locale,
            selectedTranslation,
            selectedBook,
            newSelectedChapter
        );

        // Sprawdź czy mamy dane w cache - jeśli tak, pokaż natychmiast
        const isInCache = versesCache.isInCache(selectedTranslation, selectedBook, newSelectedChapter);

        if (!isInCache) {
            setShowVerses(false);
        }

        try {
            const result = await versesCache.getVerses(
                selectedTranslation,
                selectedBook,
                newSelectedChapter
            );

            setSelectedChapter(newSelectedChapter);
            setVerses(result.data);
            setShowVerses(true);

            // Prefetch następnych i poprzednich rozdziałów w tle
            versesCache.prefetchAdjacent(
                selectedTranslation,
                selectedBook,
                newSelectedChapter,
                structure
            );
        } catch (error) {
            setError(error);
        }
    };

    const loadTranslationsAndBooks = () => {
        const { locale } = intl;

        setIsTranslationsLoading(true);
        setIsBooksLoading(true);

        Promise.all([
            fetch(`/api/${locale}/translation`)
                .then((res) => res.json())
                .then(
                    (result) => {
                        setTranslations(result.data);
                    },
                    (error) => {
                        setError(error);
                    }
                )
                .finally(() => {
                    setIsTranslationsLoading(false);
                }),
            fetch(`/api/${locale}/book`)
                .then((res) => res.json())
                .then(
                    (result) => {
                        setBooks(result.data);
                    },
                    (error) => {
                        setError(error);
                    }
                )
                .finally(() => {
                    setIsBooksLoading(false);
                }),
        ]);
    };

    useEffect(() => {
        if (!isBooksLoading && !isTranslationsLoading) {
            changeSelectedTranslation(selectedTranslation);
        }
    }, [isBooksLoading, isTranslationsLoading]);

    useEffect(() => {
        loadTranslationsAndBooks();
    }, [intl.locale]); // Added dependencies based on variables used inside useEffect.
    // Other useEffect hooks as needed for componentDidUpdate logic

    // Note: parseInt is here because sometimes selectedChapter is a string.
    //    Probably when chapter is parsed from the URL during first load it become a string
    const getChapterIndex = () =>
        chapters.findIndex((value) => value === parseInt(selectedChapter));

    const isNextChapterAvailable = () =>
        !isStructureLoading &&
        typeof chapters[getChapterIndex() + 1] !== "undefined";

    const isPrevChapterAvailable = () => {
        return !isStructureLoading && getChapterIndex() !== 0;
    };

    const getBookIndex = () =>
        Object.keys(structure).findIndex((bookKey) => bookKey === selectedBook);

    const isNextBookAvailable = () => {
        return (
            !isStructureLoading &&
            typeof structure[Object.keys(structure)[getBookIndex() + 1]] !==
            "undefined"
        );
    };

    const isPrevBookAvailable = () => {
        return !isStructureLoading && getBookIndex() !== 0;
    };

    const nextChapter = () => {
        if (isNextChapterAvailable()) {
            changeSelectedChapter(chapters[getChapterIndex() + 1]);
            return;
        }
        nextBook();
    };

    const prevChapter = () => {
        if (isPrevChapterAvailable()) {
            changeSelectedChapter(chapters[getChapterIndex() - 1]);
            return;
        }

        prevBook(true);
    };

    const nextBook = () => {
        if (isNextBookAvailable()) {
            setSelectedBook();
            changeSelectedBook(Object.keys(structure)[getBookIndex() + 1]);
        }
    };

    const prevBook = (_startFromLastVerse = false) => {
        if (!isPrevBookAvailable()) {
            return;
        }
        startFromLastVerse.current = _startFromLastVerse;

        setSelectedBook(Object.keys(structure)[getBookIndex() - 1]);
    };

    useEffect(() => {
        if (startFromLastVerse.current) {
            startFromLastVerse.current = false;
        }
    }, [selectedBook]);

    useEffect(() => {
        const fetchStructure = async () => {
            try {
                const response = await fetch(
                    `/api/${intl.locale}/translation/${selectedTranslation}`
                );
                if (!response.ok)
                    throw new Error("Network response was not ok.");
                const result = await response.json();
                setStructure(result.data);
                setSelectedBook((_selectedBook) =>
                    getAppropriateBook(result.data, _selectedBook)
                );
            } catch (error) {
                setError(error);
            } finally {
                setIsStructureLoading(false);
            }
        };
        if (!isBooksLoading && !isTranslationsLoading && !error) {
            fetchStructure();
        }
    }, [isBooksLoading, isTranslationsLoading, selectedTranslation]);

    // Swipe navigation - disabled when overlays are open
    useSwipeNavigation(
        nextChapter,  // Swipe left -> next chapter
        prevChapter,  // Swipe right -> previous chapter
        {
            threshold: 80,
            enabled: !isSelectionOpen && !comparedVerse && showVerses
        }
    );

    // Render content
    if (error) {
        return <AppError message={error.message} />;
    }
    if (isTranslationsLoading || isBooksLoading) {
        return <AppLoading />;
    }

    return (
        <>
            <Navigator
                books={books}
                translations={translations}
                selectedTranslation={selectedTranslation}
                selectedChapter={selectedChapter}
                selectedBook={selectedBook}
                structure={structure}
                chapters={chapters}
                isStructureLoading={isStructureLoading}
                changeSelectedTranslation={changeSelectedTranslation}
                changeSelectedBook={changeSelectedBook}
                changeSelectedChapter={changeSelectedChapter}
                prevChapter={prevChapter}
                nextChapter={nextChapter}
                prevBook={prevBook}
                nextBook={nextBook}
                isPrevBookAvailable={isPrevBookAvailable}
                isNextBookAvailable={isNextBookAvailable}
                isPrevChapterAvailable={isPrevChapterAvailable}
                isNextChapterAvailable={isNextChapterAvailable}
                onOpenSelection={() => setIsSelectionOpen(true)}
            />
            {isSelectionOpen && (
                <SelectionGrid
                    books={books}
                    structure={structure}
                    currentBook={selectedBook}
                    onSelectChapter={(book, chapter) => {
                        changeSelectedBook(book);
                        changeSelectedChapter(chapter);
                    }}
                    onClose={() => setIsSelectionOpen(false)}
                />
            )}
            {comparedVerse && (
                <ComparisonGrid
                    verseId={comparedVerse}
                    bookId={selectedBook}
                    chapterId={selectedChapter}
                    translations={translations}
                    currentTranslation={selectedTranslation}
                    onClose={() => setComparedVerse(null)}
                />
            )}
            <Reader
                showVerses={showVerses}
                selectedBook={selectedBook}
                selectedChapter={selectedChapter}
                verses={verses}
                onVerseClick={(verseId) => setComparedVerse(verseId)}
                onVerseLongPress={(verseId) => setEditingNoteVerse(verseId)}
                notesVersion={notesVersion}
            />
            <BottomNavigation
                onPrevChapter={prevChapter}
                onNextChapter={nextChapter}
                onOpenSelection={() => setIsSelectionOpen(true)}
                onOpenNotes={() => setIsNotesOpen(true)}
                onOpenSearch={() => setIsSearchOpen(true)}
                isPrevAvailable={isPrevChapterAvailable() || isPrevBookAvailable()}
                isNextAvailable={isNextChapterAvailable() || isNextBookAvailable()}
                currentBook={books[selectedBook]?.name}
                currentChapter={selectedChapter}
            />
            <StatusBar
                setLocaleAndUpdateHistory={setLocaleAndUpdateHistory}
                translations={translations}
            />

            {/* Panel notatek */}
            <NotesPanel
                isOpen={isNotesOpen}
                onClose={() => setIsNotesOpen(false)}
                selectedBook={selectedBook}
                selectedChapter={selectedChapter}
                books={books}
                onNavigateToVerse={(book, chapter, verse) => {
                    changeSelectedBook(book);
                    changeSelectedChapter(chapter);
                }}
            />

            {/* Panel wyszukiwania */}
            <SearchPanel
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                selectedTranslation={selectedTranslation}
                books={books}
                onNavigateToVerse={(book, chapter, verse) => {
                    changeSelectedBook(book);
                    changeSelectedChapter(chapter);
                }}
            />

            {/* Boczna zakładka i menu */}
            <SideMenuTab onClick={() => setIsSideMenuOpen(true)} />
            <SideMenu
                isOpen={isSideMenuOpen}
                onClose={() => setIsSideMenuOpen(false)}
            >
                <DisplaySettings
                    fontSize={fontSize}
                    setFontSize={setFontSize}
                    fontFamily={fontFamily}
                    setFontFamily={setFontFamily}
                />
            </SideMenu>

            {/* Edytor notatek */}
            <NoteEditor
                isOpen={editingNoteVerse !== null}
                onClose={() => setEditingNoteVerse(null)}
                onSave={() => setNotesVersion(v => v + 1)}
                book={selectedBook}
                chapter={selectedChapter}
                verse={editingNoteVerse}
                bookName={books[selectedBook]?.name}
            />
        </>
    );
};

export default injectIntl(Bible);
