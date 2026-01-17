import React, { useRef, useState, useEffect, memo } from "react";
import { useIntl } from "react-intl";
import { loadNotes, getVerseKey } from "./Notes";

const LONG_PRESS_DURATION = 500; // ms

const Verse = memo(function Verse({
    verseContent,
    bookId,
    chapterId,
    verseId,
    onClick,
    onLongPress,
    notesVersion = 0  // Increment to force note indicator refresh
}) {
    const { formatMessage } = useIntl();
    const appLink = "bib://" + bookId + chapterId + ":" + verseId;
    const appVerse = chapterId + ":" + verseId;

    const longPressTimer = useRef(null);
    const [isPressing, setIsPressing] = useState(false);
    const [hasNote, setHasNote] = useState(false);

    // Check if this verse has a note
    useEffect(() => {
        const notes = loadNotes();
        const key = getVerseKey(bookId, chapterId, verseId);
        setHasNote(!!notes[key]);
    }, [bookId, chapterId, verseId, notesVersion]);

    const handleTouchStart = (e) => {
        setIsPressing(true);
        longPressTimer.current = setTimeout(() => {
            setIsPressing(false);
            onLongPress?.(verseId);
        }, LONG_PRESS_DURATION);
    };

    const handleTouchEnd = () => {
        setIsPressing(false);
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };

    const handleTouchMove = () => {
        // Cancel long press if user moves finger
        setIsPressing(false);
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };

    // Mouse events for desktop
    const handleMouseDown = () => {
        setIsPressing(true);
        longPressTimer.current = setTimeout(() => {
            setIsPressing(false);
            onLongPress?.(verseId);
        }, LONG_PRESS_DURATION);
    };

    const handleMouseUp = () => {
        setIsPressing(false);
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
        }
    };

    const handleMouseLeave = () => {
        setIsPressing(false);
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (longPressTimer.current) {
                clearTimeout(longPressTimer.current);
            }
        };
    }, []);

    return (
        <div className={`row line ${isPressing ? 'pressing' : ''} ${hasNote ? 'has-note' : ''}`}>
            <div className="col-2 col-lg-1 d-flex align-items-center justify-content-center">
                <a
                    href={appLink}
                    title={formatMessage({ id: "linkOpenInRBibliaApp" })}
                    onClick={(e) => e.stopPropagation()}
                >
                    {appVerse}
                </a>
                {hasNote && (
                    <span className="note-indicator" title={formatMessage({ id: "hasNote" })}>
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </span>
                )}
            </div>
            <div
                className="col-10 col-lg-11 verse"
                onClick={onClick}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchMove}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                style={{ cursor: 'pointer' }}
            >
                {verseContent.replaceAll("//", "\u000A")}
            </div>
        </div>
    );
});

export default Verse;
