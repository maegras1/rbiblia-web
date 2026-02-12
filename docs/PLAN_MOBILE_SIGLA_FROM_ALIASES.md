# Plan migracji `bookSigla` -> `aliases` dla mobile

## 1. Cel

Zastapic statyczny slownik `bookSigla` danymi z API (`aliases`) tak, aby skroty ksiag (sigla) na mobile byly budowane dynamicznie na podstawie `/api/{language}/book`.

## 2. Stan obecny (na 2026-02-12)

Backend:
- Routing endpointu ksiazek: `src/core/App/WebApp.php:41` (`GET /api/{language}/book`).
- Kontroler zwraca `getAliases()`: `src/core/Controller/BookController.php:13` i `src/core/Controller/BookController.php:15`.
- Zrodlo danych: `src/core/Provider/LanguageProvider.php:30`.

Frontend:
- Statyczne mapy sigli sa w `assets/js/bookSigla.js:6` (`siglaByLocale`).
- Funkcja uzywana do wyswietlania skrotow: `assets/js/bookSigla.js:258` (`getSigla`).
- Uzycie na mobile w siatce wyboru ksiag: `assets/js/SelectionGrid.js:29` i `assets/js/SelectionGrid.js:31`.
- Uzycie w naglowku porownania wersetow: `assets/js/Bible.js:476` -> `assets/js/ComparisonGrid.js:262`.

Weryfikacja endpointu:
- `https://web.rbiblia.toborek.info/api/pl/book` zwraca `data.{bookId}.name`, `group`, `aliases[]`.
- Analogicznie dla `en`, `de` endpoint zawiera aliasy, ale ich kolejnosc i styl sa nastawione glownie na rozpoznawanie nazw (parser), nie zawsze na UI.

## 3. Wniosek techniczny

`aliases[]` mozna wykorzystac do generowania sigli, ale nie wszystkie aliasy nadaja sie do wyswietlania:
- wystepuja wartosci techniczne (`vol46`, `46`),
- sa pelne nazwy zamiast krotkich form,
- czesc skrotow ma rozne style (`1Cor`, `1 kor`, `jud`, `jde`).

Dlatego migracja powinna uzyc:
- **automatycznego wyboru sigla z `aliases[]`**,
- **malej warstwy override** dla wyjatkow,
- **fallbacku** do obecnego `bookSigla` na czas przejsciowy.

## 4. Docelowy model

1. Po pobraniu `/api/{locale}/book` budujemy runtime mape:
   - `derivedSigla[bookId] = chosenAlias`.
2. UI mobile korzysta najpierw z `derivedSigla`.
3. Jesli dla ksiazki nie da sie wybrac dobrego aliasu:
   - fallback do starego `getSigla(bookId, locale)`,
   - ostateczny fallback: `bookId.toUpperCase()`.

## 5. Algorytm wyboru sigla z `aliases[]`

Proponowana kolejnosc:
1. Wez `aliases[]` dla `bookId`.
2. Odrzuc aliasy:
   - czysto numeryczne (`^\d+$`),
   - techniczne (`^vol\d+$`),
   - zbyt dlugie (np. > 12 znakow),
   - zdania/frazy (np. wiele slow, przecinki, nawiasy).
3. Preferuj aliasy krotkie (2-6 znakow) i czytelne:
   - najpierw formy z numerem dla ksiag typu `1co`, `2jo` (`1 Kor`, `2 J` itp.),
   - potem klasyczne skroty literowe (`Gen`, `Rev`, `Lk`).
4. Gdy jest kilka kandydatow, wybierz wg rankingow:
   - zgodnosc z locale,
   - krotsza forma,
   - stabilnosc (ta sama forma dla danego `bookId` miedzy sesjami).
5. Jesli brak kandydata -> fallback.

Uwaga: jakosc danych `aliases` moze wymagac kilku wyjatkow per locale. Dlatego potrzebny jest maly `siglaOverrides` (znacznie mniejszy niz obecny pelny slownik).

## 6. Plan wdrozenia (etapy)

### Etap 1: Warstwa posrednia (bez ryzyka regresji)
- Dodac helper np. `assets/js/buildSiglaFromAliases.js`:
  - `buildSiglaMapFromBooks(books, locale)`,
  - `getSiglaFromBooks(bookId, books, locale, fallbackGetSigla)`.
- Nie usuwac jeszcze `bookSigla.js`.

### Etap 2: Integracja w miejscach mobile
- `assets/js/SelectionGrid.js`:
  - zamiast bezposredniego `getSigla(bookId, locale)` uzyc sigla wyliczonego z `books`.
- `assets/js/Bible.js` + `assets/js/ComparisonGrid.js`:
  - `bookSigil` liczyc z nowej warstwy.
- Zachowac fallback na stary mechanizm.

### Etap 3: Testy i korekty jakosci
- Testy jednostkowe algorytmu wyboru sigli:
  - przypadki: `gen`, `luk`, `1co`, `phm`, `jud`, `rev`.
- Testy regresji UI mobile:
  - ekran wyboru ksiag,
  - naglowek porownania wersetow,
  - przelaczanie locale `pl/en/de`.
- Spisac liste wyjatkow do `siglaOverrides`.

### Etap 4: Uporzadkowanie
- Po potwierdzeniu jakosci:
  - ograniczyc `bookSigla.js` do fallbacku/compat,
  - docelowo usunac pelna statyczna mape.
- Zaktualizowac dokumentacje API i frontend (obecnie `openapi.yaml` nie opisuje `/api/{language}/book`).

## 7. Kryteria akceptacji

- Na mobile sigla sa generowane z danych API (`aliases`) dla `pl`, `en`, `de`.
- Brak regresji funkcjonalnej przy wyborze ksiag i porownaniu wersetow.
- Dla brakujacych/nieczytelnych aliasow dziala fallback.
- Liczba twardo zakodowanych wpisow jest znaczaco mniejsza niz obecnie.

## 8. Ryzyka i mitigacje

- Ryzyko: aliasy parserowe nie sa idealnymi siglami UI.
  - Mitigacja: ranking + `siglaOverrides`.
- Ryzyko: roznice jakosci miedzy locale.
  - Mitigacja: osobne testy per locale.
- Ryzyko: chwilowy brak danych z API.
  - Mitigacja: fallback do starego `bookSigla` + `bookId.toUpperCase()`.

## 9. Rekomendacja dlugoterminowa (opcjonalna)

Najczystsze rozwiazanie: backend zwraca dodatkowe pole displayowe, np. `sigla`, obok `aliases`.
Wtedy frontend nie musi zgadywac, ktory alias jest najlepszy do UI, a `aliases` zostaja do wyszukiwania/parsowania.
