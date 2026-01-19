import React from "react";
import { useIntl } from "react-intl";
import { getFavoriteTranslations } from "./SideMenu";

const TranslationSelector = ({
    translations,
    selectedTranslation,
    changeSelectedTranslation,
}) => {
    const { locale, formatMessage } = useIntl();
    const onSelect = (event) => {
        changeSelectedTranslation(event.target.value);
    };

    const favorites = getFavoriteTranslations();
    const languageNames = new Intl.DisplayNames([locale], {
        type: "language",
    });

    // Separate favorites and rest
    const favoriteTranslations = translations.filter(t => favorites.includes(t.id));
    const otherTranslations = translations.filter(t => !favorites.includes(t.id));

    // Group other translations by language
    const translationList = [];
    const map = {};

    otherTranslations.forEach((trans) => {
        if (!map[trans.language]) {
            const languageGroup = {
                languageName: languageNames.of(trans.language),
                children: [],
            };
            map[trans.language] = languageGroup.children;
            translationList.push(languageGroup);
        }

        map[trans.language].push(trans);
    });

    return (
        <select
            className="form-control"
            onChange={onSelect}
            value={selectedTranslation}
        >
            {/* Favorites group */}
            {favoriteTranslations.length > 0 && (
                <optgroup label={`★ ${formatMessage({ id: "favorites" })}`}>
                    {favoriteTranslations
                        .sort((a, b) => (a.name > b.name ? 1 : -1))
                        .map(({ id, name, date }) => (
                            <option value={id} key={id}>
                                {name} {date === "" ? "" : `[${date}]`}
                            </option>
                        ))}
                </optgroup>
            )}

            {/* Other translations grouped by language */}
            {translationList.map(({ languageName, children }, index) => (
                <optgroup label={languageName} key={index}>
                    {children
                        .sort((a, b) => (a.name > b.name ? 1 : -1))
                        .map(({ id, name, date }) => (
                            <option value={id} key={id}>
                                {name} {date === "" ? "" : `[${date}]`}
                            </option>
                        ))}
                </optgroup>
            ))}
        </select>
    );
};

export default TranslationSelector;
