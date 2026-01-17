import { useRef, useCallback } from "react";

/**
 * Hook do cachowania wersetów - zapobiega ponownemu pobieraniu już pobranych rozdziałów
 * i umożliwia prefetching następnych/poprzednich rozdziałów
 */
const useVersesCache = (locale) => {
    // Cache: Map<cacheKey, versesData>
    const cacheRef = useRef(new Map());

    // Maksymalna liczba elementów w cache (aby nie zużywać za dużo pamięci)
    const MAX_CACHE_SIZE = 50;

    /**
     * Generuj klucz cache
     */
    const getCacheKey = useCallback((translation, book, chapter) => {
        return `${translation}_${book}_${chapter}`;
    }, []);

    /**
     * Pobierz wersety z cache lub z API
     */
    const getVerses = useCallback(async (translation, book, chapter) => {
        const cacheKey = getCacheKey(translation, book, chapter);

        // Sprawdź cache
        if (cacheRef.current.has(cacheKey)) {
            return {
                data: cacheRef.current.get(cacheKey),
                fromCache: true
            };
        }

        // Pobierz z API
        try {
            const response = await fetch(
                `/api/${locale}/translation/${translation}/book/${book}/chapter/${chapter}`
            );
            const result = await response.json();

            // Zapisz do cache
            if (result.data) {
                // Usuń najstarsze elementy jeśli cache jest pełny
                if (cacheRef.current.size >= MAX_CACHE_SIZE) {
                    const firstKey = cacheRef.current.keys().next().value;
                    cacheRef.current.delete(firstKey);
                }
                cacheRef.current.set(cacheKey, result.data);
            }

            return {
                data: result.data,
                fromCache: false
            };
        } catch (error) {
            throw error;
        }
    }, [locale, getCacheKey]);

    /**
     * Prefetch rozdziału w tle (nie blokuje UI)
     */
    const prefetch = useCallback((translation, book, chapter) => {
        const cacheKey = getCacheKey(translation, book, chapter);

        // Nie pobieraj jeśli już w cache
        if (cacheRef.current.has(cacheKey)) {
            return;
        }

        // Pobierz w tle z niskim priorytetem
        requestIdleCallback(() => {
            fetch(
                `/api/${locale}/translation/${translation}/book/${book}/chapter/${chapter}`
            )
                .then(res => res.json())
                .then(result => {
                    if (result.data && cacheRef.current.size < MAX_CACHE_SIZE) {
                        cacheRef.current.set(cacheKey, result.data);
                    }
                })
                .catch(() => {
                    // Cichy błąd - prefetch nie jest krytyczny
                });
        }, { timeout: 2000 });
    }, [locale, getCacheKey]);

    /**
     * Prefetch następnych i poprzednich rozdziałów
     */
    const prefetchAdjacent = useCallback((translation, book, chapter, structure) => {
        if (!structure || !structure[book]) return;

        const chapters = structure[book];
        const currentIndex = chapters.indexOf(chapter);

        // Prefetch następny rozdział
        if (currentIndex < chapters.length - 1) {
            prefetch(translation, book, chapters[currentIndex + 1]);
        }

        // Prefetch poprzedni rozdział
        if (currentIndex > 0) {
            prefetch(translation, book, chapters[currentIndex - 1]);
        }
    }, [prefetch]);

    /**
     * Wyczyść cache (np. przy zmianie tłumaczenia)
     */
    const clearCache = useCallback(() => {
        cacheRef.current.clear();
    }, []);

    /**
     * Sprawdź czy rozdział jest w cache
     */
    const isInCache = useCallback((translation, book, chapter) => {
        const cacheKey = getCacheKey(translation, book, chapter);
        return cacheRef.current.has(cacheKey);
    }, [getCacheKey]);

    return {
        getVerses,
        prefetch,
        prefetchAdjacent,
        clearCache,
        isInCache
    };
};

// Polyfill dla requestIdleCallback (Safari)
if (typeof window !== 'undefined' && !window.requestIdleCallback) {
    window.requestIdleCallback = (cb, options) => {
        const timeout = options?.timeout || 1000;
        return setTimeout(() => {
            cb({
                didTimeout: false,
                timeRemaining: () => Math.max(0, 50)
            });
        }, Math.min(100, timeout));
    };
    window.cancelIdleCallback = (id) => clearTimeout(id);
}

export default useVersesCache;
