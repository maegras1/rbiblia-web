import React, { useState, useEffect } from "react";
import { useIntl } from "react-intl";

const NotesSidePanel = ({
    isOpen,
    onClose,
    bookId,
    chapterId,
    activeVerseId,
    onVerseNoteClose
}) => {
    const { formatMessage } = useIntl();
    const [chapterNote, setChapterNote] = useState("");
    const [verseNotes, setVerseNotes] = useState({});

    // LocalStorage key for chapter note
    const chapterKey = `note_chapter_${bookId}_${chapterId}`;
    // Prefix key for verse notes
    const verseKeyPrefix = `note_verse_${bookId}_${chapterId}_`;

    // Load notes when opening or changing chapter
    useEffect(() => {
        if (isOpen) {
            const savedChapterNote = localStorage.getItem(chapterKey) || "";
            setChapterNote(savedChapterNote);

            // Load verse notes
            const loadedVerseNotes = {};
            // This is simplified - we search localStorage for keys matching the pattern
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(verseKeyPrefix)) {
                    const verseId = key.replace(verseKeyPrefix, "");
                    loadedVerseNotes[verseId] = localStorage.getItem(key);
                }
            }
            setVerseNotes(loadedVerseNotes);
        }
    }, [isOpen, bookId, chapterId]);

    const handleChapterNoteChange = (e) => {
        const text = e.target.value;
        setChapterNote(text);
        localStorage.setItem(chapterKey, text);
    };

    const handleVerseNoteChange = (verseId, text) => {
        const newNotes = { ...verseNotes, [verseId]: text };
        setVerseNotes(newNotes);
        if (text.trim() === "") {
            localStorage.removeItem(verseKeyPrefix + verseId);
        } else {
            localStorage.setItem(verseKeyPrefix + verseId, text);
        }
    };

    return (
        <>
            <div
                className={`notes-overlay ${isOpen ? 'active' : ''}`}
                onClick={onClose}
            />

            <div className={`notes-panel ${isOpen ? 'open' : ''}`}>
                <div className="notes-header">
                    <h3 className="notes-title">
                        {formatMessage({ id: "notes" })} - {chapterId}
                    </h3>
                    <button
                        className="notes-close"
                        onClick={onClose}
                        aria-label={formatMessage({ id: "close" })}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div className="notes-content">
                    {/* Chapter note section */}
                    <div className="notes-section">
                        <label className="notes-label">
                            {formatMessage({ id: "chapterNote" })}
                        </label>
                        <textarea
                            className="notes-textarea"
                            value={chapterNote}
                            onChange={handleChapterNoteChange}
                            placeholder={formatMessage({ id: "notePlaceholder" })}
                        />
                    </div>

                    {/* Verse notes section (existing ones or current edit) */}
                    <div className="notes-section">
                        <label className="notes-label">
                            {formatMessage({ id: "verseNotes" })}
                        </label>

                        {/* If a specific verse is selected for editing */}
                        {activeVerseId && (
                            <div className="verse-note-editor active">
                                <div className="verse-badge">{activeVerseId}</div>
                                <textarea
                                    className="notes-textarea small"
                                    value={verseNotes[activeVerseId] || ""}
                                    onChange={(e) => handleVerseNoteChange(activeVerseId, e.target.value)}
                                    placeholder={formatMessage({ id: "verseNotePlaceholder" })}
                                    autoFocus
                                />
                            </div>
                        )}

                        {/* List of remaining verse notes */}
                        {Object.entries(verseNotes).map(([vId, text]) => {
                            if (vId === activeVerseId || !text) return null;
                            return (
                                <div key={vId} className="verse-note-item">
                                    <div className="verse-badge">{vId}</div>
                                    <textarea
                                        className="notes-textarea small"
                                        value={text}
                                        onChange={(e) => handleVerseNoteChange(vId, e.target.value)}
                                    />
                                </div>
                            );
                        })}

                        {Object.keys(verseNotes).length === 0 && !activeVerseId && (
                            <p className="text-muted text-center text-sm">
                                {formatMessage({ id: "noVerseNotes" })}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default NotesSidePanel;
