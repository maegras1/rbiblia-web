import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";

const ComparisonGrid = ({
    verseId,
    bookId,
    chapterId,
    currentTranslation,
    translations,
    onClose,
}) => {
    const { formatMessage, locale } = useIntl();
    const [selectedCompareTranslation, setSelectedCompareTranslation] = useState("");
    const [comparedVerses, setComparedVerses] = useState({});
    const [loading, setLoading] = useState({});

    useEffect(() => {
        // Load the current translation verse by default
        fetchTranslationVerse(currentTranslation);
    }, [verseId, bookId, chapterId, currentTranslation]);

    const handleTranslationChange = (e) => {
        const translationId = e.target.value;
        setSelectedCompareTranslation(translationId);
        if (translationId) {
            fetchTranslationVerse(translationId);
        }
    };

    const fetchTranslationVerse = (translationId) => {
        if (comparedVerses[translationId] || loading[translationId]) return;

        setLoading((prev) => ({ ...prev, [translationId]: true }));
        fetch(`/api/${locale}/translation/${translationId}/book/${bookId}/chapter/${chapterId}`)
            .then((res) => res.json())
            .then((result) => {
                if (result.data && result.data[verseId]) {
                    setComparedVerses((prev) => ({
                        ...prev,
                        [translationId]: result.data[verseId],
                    }));
                }
            })
            .finally(() => {
                setLoading((prev) => ({ ...prev, [translationId]: false }));
            });
    };

    return (
        <div className="selection-overlay comparison-overlay">
            <div className="selection-content container">
                <div className="selection-header d-flex justify-content-between align-items-center mb-4 pt-4">
                    <h2>
                        {formatMessage({ id: "compareVerse" })} {chapterId}:{verseId}
                    </h2>
                    <button className="btn btn-close" onClick={onClose}></button>
                </div>

                <div className="selection-body pb-5">
                    {/* Oryginalny werset */}
                    <div className="row mb-4">
                        <div className="col-12">
                            <h4 className="section-title mb-2">
                                {translations.find(t => t.id === currentTranslation)?.name || currentTranslation}
                            </h4>
                            <div className="comparison-box p-4 rounded shadow-sm border bg-light">
                                {comparedVerses[currentTranslation] ? (
                                    <p className="lead mb-0">{comparedVerses[currentTranslation].replaceAll("//", "\n")}</p>
                                ) : (
                                    <div className="text-center">{formatMessage({ id: "loading" })}...</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="divider mb-4"></div>

                    {/* Wybór i wynik porównania */}
                    <div className="row">
                        <div className="col-12">
                            <h4 className="section-title mb-3">{formatMessage({ id: "selectTranslationToCompare" })}</h4>
                            <select
                                className="form-select form-select-lg mb-4"
                                value={selectedCompareTranslation}
                                onChange={handleTranslationChange}
                            >
                                <option value="">{formatMessage({ id: "chooseTranslation" })}...</option>
                                {translations
                                    .filter(t => t.id !== currentTranslation)
                                    .map(t => (
                                        <option key={t.id} value={t.id}>
                                            {t.name} ({t.language.toUpperCase()})
                                        </option>
                                    ))
                                }
                            </select>

                            {selectedCompareTranslation && (
                                <div className="comparison-result-container animate-slide-up">
                                    <h4 className="section-title mb-2">
                                        {translations.find(t => t.id === selectedCompareTranslation)?.name}
                                    </h4>
                                    <div className="comparison-box p-4 rounded shadow-sm border bg-white border-primary">
                                        {loading[selectedCompareTranslation] ? (
                                            <div className="text-center py-2">
                                                <div className="spinner-border text-primary" role="status"></div>
                                            </div>
                                        ) : comparedVerses[selectedCompareTranslation] ? (
                                            <p className="lead mb-0 text-primary">
                                                {comparedVerses[selectedCompareTranslation].replaceAll("//", "\n")}
                                            </p>
                                        ) : (
                                            <div className="text-muted italic">{formatMessage({ id: "verseNotFoundInTranslation" })}</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComparisonGrid;
