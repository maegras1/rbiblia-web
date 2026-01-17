# Wyszukiwanie - TODO

## Status: ⏸️ Wstrzymane (brak bazy danych)

Data: 2026-01-17

## Co zostało zaimplementowane

### Frontend (gotowe ✅)
- `assets/js/SearchPanel.js` - kompletny komponent wyszukiwania
- Style CSS w `assets/scss/app.scss` (sekcja "Search Panel Styles")
- Integracja z `Bible.js` i `BottomNavigation.js`
- Tłumaczenia w `assets/translations/pl.json`

### Funkcje UI:
- Panel wyszukiwania otwierany z dolnego menu (ikona lupy)
- Pole wyszukiwania z debounce (500ms)
- Minimum 3 znaki do rozpoczęcia wyszukiwania
- Instrukcja pomocy przy pierwszym otwarciu
- Podświetlanie znalezionych fraz
- Skracanie długich wersetów wokół trafienia
- Nawigacja do wersetu po kliknięciu wyniku
- Obsługa błędów i stanów ładowania

---

## Co jest potrzebne do uruchomienia

### 1. Baza danych MySQL/MariaDB

Struktura z `docs/db_structure.sql`:

```sql
CREATE TABLE `translation` (
  `id` varchar(40) NOT NULL,
  `language` varchar(2) NOT NULL,
  `shortname` text NOT NULL,
  `name` text NOT NULL,
  `description` text NOT NULL,
  `authorised` tinyint(1) NOT NULL,
  `date` text NOT NULL,
  `hash` varchar(32) NOT NULL,
  `file` text NOT NULL,
  PRIMARY KEY (`id`)
);
```

**Dodatkowo dla każdego tłumaczenia** (np. `pl_pubg`, `en_kjv`):

```sql
CREATE TABLE `pl_pubg` (
  `book` varchar(10) NOT NULL,
  `chapter` int NOT NULL,
  `verse` int NOT NULL,
  `content` text NOT NULL,
  PRIMARY KEY (`book`, `chapter`, `verse`)
);
```

### 2. Konfiguracja `src/config/app.php`

Na podstawie `src/config/app.php.dist`:

```php
<?php declare(strict_types=1);

return [
    'bibx_folder' => '/ścieżka/do/plików/bibx',
    'security_query_limit' => 0,
    
    'db_driver' => 'pdo_mysql',
    'db_name' => 'rbiblia',
    'db_host' => 'localhost',
    'db_user' => 'user',
    'db_pass' => 'password',
    
    'stats_class' => '',
];
```

### 3. Import danych

Należy zaimportować wersety do tabel bazy danych.
Każda tabela tłumaczenia powinna zawierać wszystkie wersety z pliku .bibx.

---

## API Endpoint

```
POST /api/{language}/search
Content-Type: application/json

{
    "translation": "pl_pubg",
    "query": "miłość"
}
```

Odpowiedź:
```json
{
    "code": 200,
    "translation": "pl_pubg",
    "query": "miłość",
    "results": [
        {
            "book": "1co",
            "chapter": 13,
            "verse": 4,
            "content": "Miłość cierpliwa jest..."
        }
    ]
}
```

---

## Aktualny błąd

Przy próbie wyszukiwania API zwraca:
```json
{"code": 404, "message": "Błąd łączenia z bazą danych"}
```

---

## Alternatywne rozwiązania (do rozważenia)

1. **Wyszukiwanie po stronie klienta** - załadować wszystkie wersety rozdziału/księgi i przeszukiwać w JS (ograniczone do bieżącego zakresu)

2. **Indeksowanie z plików .bibx** - stworzyć endpoint który parsuje pliki .bibx i szuka w nich

3. **SQLite** - użyć lokalnej bazy SQLite zamiast MySQL

---

## Pliki do przejrzenia

- `src/core/Controller/SearchController.php` - logika wyszukiwania
- `src/core/Provider/SearchQueryProvider.php` - parsowanie zapytania
- `docs/api/openapi.yaml` - pełna dokumentacja API
