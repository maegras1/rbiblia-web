# Visual Dependency Diagrams

This document contains Mermaid diagrams that visualize the architecture and dependencies of the mobile improvements feature. These diagrams can be rendered directly on GitHub.

## Component Dependency Graph

```mermaid
graph TD
    A[Bible.js<br/>Main Component] --> B[useKeyboardNavigation<br/>NEW HOOK]
    A --> C[safeJsonParse<br/>NEW UTILITY]
    A --> D[getSigla<br/>ENHANCED]
    A --> E[useSwipeNavigation<br/>EXISTING]
    A --> F[useVersesCache<br/>ENHANCED]
    
    G[ComparisonGrid.js<br/>ENHANCED] --> C
    G --> D
    G --> H[Keyboard Events<br/>Internal]
    
    I[SearchPanel.js<br/>ENHANCED] --> C
    J[SelectionGrid.js<br/>ENHANCED] --> C
    F --> C
    
    B --> K[Window Events]
    E --> L[Touch Events]
    
    style B fill:#90EE90
    style C fill:#90EE90
    style D fill:#FFD700
    style F fill:#FFD700
    style G fill:#FFD700
    style I fill:#FFD700
    style J fill:#FFD700
```

**Legend:**
- 🟢 Green = New Component/Hook
- 🟡 Yellow = Enhanced/Modified Component
- ⚪ White = Existing Component (unchanged)

---

## Data Flow - Keyboard Navigation

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Hook as useKeyboardNavigation
    participant Bible as Bible.js
    participant API
    participant UI
    
    User->>Browser: Press Arrow Right
    Browser->>Hook: keydown event
    
    Hook->>Hook: Check if enabled
    Hook->>Hook: Check if input focused
    Hook->>Hook: Determine direction
    
    Hook->>Bible: nextChapter()
    Bible->>Bible: Check if next chapter exists
    
    alt Next chapter exists
        Bible->>Bible: changeSelectedChapter()
        Bible->>API: Fetch verses
        API-->>Bible: Return verse data
        Bible->>UI: Update display
    else At last chapter
        Bible->>Bible: Check if next book exists
        Bible->>Bible: nextBook()
        Bible->>API: Fetch first chapter
        API-->>Bible: Return verse data
        Bible->>UI: Update display
    end
    
    UI-->>User: Show new chapter
```

---

## Data Flow - Safe JSON Parsing

```mermaid
flowchart TD
    A[API Request] --> B[Server Response]
    B --> C{Response OK?}
    
    C -->|No| D[Throw HTTP Error]
    C -->|Yes| E[Get Response Text]
    
    E --> F{Try JSON.parse}
    F -->|Success| G[Return Data ✅]
    F -->|Fail| H{Try Regex Match #1}
    
    H -->|Match Found| I{Try JSON.parse}
    I -->|Success| G
    I -->|Fail| J{Try Regex Match #2}
    
    H -->|No Match| J
    J -->|Match Found| K{Try JSON.parse}
    K -->|Success| G
    K -->|Fail| L[Throw Parse Error]
    
    J -->|No Match| L
    
    D --> M[Error Handler]
    L --> M
    M --> N[Show Error Toast]
    
    style G fill:#90EE90
    style N fill:#FFB6C1
```

---

## State Management Flow

```mermaid
stateDiagram-v2
    [*] --> Idle
    
    Idle --> Loading: User navigates
    Loading --> FetchingCache: Check cache
    
    FetchingCache --> DisplayCached: Cache hit
    FetchingCache --> FetchingAPI: Cache miss
    
    DisplayCached --> Idle
    
    FetchingAPI --> Parsing: API response
    Parsing --> Success: Valid JSON
    Parsing --> Fallback: Malformed JSON
    
    Fallback --> Success: Extracted valid JSON
    Fallback --> Error: Cannot extract
    
    Success --> UpdateState: Set verses
    UpdateState --> Prefetch: Prefetch adjacent
    Prefetch --> Idle
    
    Error --> ShowToast: Non-critical error
    Error --> ShowError: Critical error
    
    ShowToast --> Idle
    ShowError --> [*]
```

---

## Component Interaction - Keyboard Navigation

```mermaid
graph LR
    A[User Input] --> B{Input Type}
    
    B -->|Keyboard| C[useKeyboardNavigation]
    B -->|Touch| D[useSwipeNavigation]
    
    C --> E{Overlays Open?}
    D --> E
    
    E -->|Yes| F[Suppress Navigation]
    E -->|No| G{Direction}
    
    G -->|Left/Swipe Right| H[prevChapter]
    G -->|Right/Swipe Left| I[nextChapter]
    
    H --> J[Bible.js Logic]
    I --> J
    
    J --> K{Chapter Exists?}
    K -->|Yes| L[Load Chapter]
    K -->|No| M{Book Exists?}
    
    M -->|Yes| N[Load First/Last Chapter]
    M -->|No| O[Do Nothing]
    
    L --> P[Update UI]
    N --> P
    
    style C fill:#90EE90
    style D fill:#87CEEB
```

---

## Error Handling Architecture

```mermaid
graph TD
    A[API Call] --> B{Network Success?}
    
    B -->|No| C[Network Error]
    B -->|Yes| D{HTTP OK?}
    
    D -->|No| E[HTTP Error]
    D -->|Yes| F[safeJsonParse]
    
    F --> G{Valid JSON?}
    G -->|Yes| H[Return Data ✅]
    G -->|No| I{Malformed JSON?}
    
    I -->|Yes - Extractable| J[Extract & Parse]
    I -->|No| K[Parse Error]
    
    J --> L{Extraction Success?}
    L -->|Yes| H
    L -->|No| K
    
    C --> M{Critical?}
    E --> M
    K --> M
    
    M -->|Yes| N[setError<br/>Block UI]
    M -->|No| O[setToastError<br/>Show Toast]
    
    N --> P[AppError Component]
    O --> Q[ErrorToast Component]
    
    Q --> R[Auto-dismiss 5s]
    R --> S[Continue Execution]
    
    style H fill:#90EE90
    style N fill:#FF6B6B
    style O fill:#FFD93D
    style F fill:#90EE90
```

---

## Book Sigla Localization

```mermaid
flowchart LR
    A[User Locale<br/>pl/en/de] --> B{getSigla}
    C[Book ID<br/>e.g., 'gen'] --> B
    
    B --> D{Locale in Map?}
    D -->|Yes| E[Get Locale Map]
    D -->|No| F[Use English Map]
    
    E --> G{Book in Map?}
    F --> G
    
    G -->|Yes| H[Return Sigla<br/>e.g., 'Rdz']
    G -->|No| I[Return Uppercase<br/>e.g., 'GEN']
    
    H --> J[Display in UI]
    I --> J
    
    style B fill:#FFD700
    style H fill:#90EE90
```

---

## Test Coverage Map

```mermaid
graph TD
    A[Test Suite] --> B[Keyboard Navigation<br/>8 tests]
    A --> C[Chapter/Book Navigation<br/>5 tests]
    A --> D[Supporting Logic<br/>4 tests]
    
    B --> E[ArrowLeft/Right]
    B --> F[Input Suppression]
    B --> G[Enable/Disable]
    B --> H[Edge Cases]
    
    C --> I[Next/Prev Chapter]
    C --> J[Next/Prev Book]
    C --> K[Chapter Index]
    C --> L[Cross-book Navigation]
    
    D --> M[Book Sigla]
    D --> N[Swipe Direction]
    D --> O[Debounce Logic]
    D --> P[URL Parsing]
    
    style A fill:#87CEEB
    style B fill:#90EE90
    style C fill:#90EE90
    style D fill:#90EE90
```

---

## Module Boundaries

```mermaid
graph TB
    subgraph Presentation["Presentation Layer (React Components)"]
        A1[Bible.js]
        A2[ComparisonGrid.js]
        A3[SearchPanel.js]
        A4[SelectionGrid.js]
    end
    
    subgraph Business["Business Logic Layer (Custom Hooks)"]
        B1[useKeyboardNavigation]
        B2[useSwipeNavigation]
        B3[useVersesCache]
        B4[useScrollDirection]
    end
    
    subgraph Utility["Utility Layer (Pure Functions)"]
        C1[safeJsonParse]
        C2[getSigla]
        C3[updateHistory]
        C4[getDataFromCurrentPathname]
    end
    
    subgraph External["External APIs"]
        D1[Backend API]
        D2[Browser APIs]
    end
    
    Presentation --> Business
    Business --> Utility
    Utility --> External
    
    style B1 fill:#90EE90
    style C1 fill:#90EE90
    style C2 fill:#FFD700
```

---

## Performance Impact

```mermaid
graph LR
    A[Component Render] --> B{Hook Deps Changed?}
    
    B -->|No| C[Memoized<br/>~0.02ms]
    B -->|Yes| D[Re-compute<br/>~0.6ms]
    
    C --> E[Total Render Time]
    D --> E
    
    F[API Call] --> G[safeJsonParse]
    G --> H{Valid JSON?}
    
    H -->|Yes| I[Fast Path<br/>~5-21ms]
    H -->|No| J[Fallback Path<br/>~5.7-23.1ms]
    
    I --> K[Total API Time]
    J --> K
    
    style C fill:#90EE90
    style I fill:#90EE90
    style J fill:#FFD93D
```

---

## Deployment Flow

```mermaid
flowchart TD
    A[Feature Branch] --> B{Tests Pass?}
    B -->|No| C[Fix Issues]
    C --> A
    
    B -->|Yes| D{Lint Pass?}
    D -->|No| C
    
    D -->|Yes| E{Manual Test OK?}
    E -->|No| C
    
    E -->|Yes| F[Create PR]
    F --> G[Code Review]
    
    G --> H{Approved?}
    H -->|No| I[Address Feedback]
    I --> A
    
    H -->|Yes| J[Merge to Master]
    J --> K[Deploy to Production]
    
    K --> L[Monitor Logs]
    L --> M{Issues Found?}
    
    M -->|Yes| N[Hotfix]
    M -->|No| O[Success ✅]
    
    N --> A
    
    style O fill:#90EE90
    style K fill:#87CEEB
```

---

## Usage Example - Integration

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Comp as Component
    participant Hook as useKeyboardNavigation
    participant DOM as DOM/Browser
    
    Dev->>Comp: Import hook
    Note over Dev,Comp: import { useKeyboardNavigation } from './hooks'
    
    Comp->>Hook: Call hook with callbacks
    Note over Comp,Hook: useKeyboardNavigation(onPrev, onNext, {enabled})
    
    Hook->>Hook: Create memoized handler
    Hook->>DOM: Add event listener
    
    Note over DOM: User presses Arrow Right
    
    DOM->>Hook: keydown event
    Hook->>Hook: Validate conditions
    Hook->>Comp: Call onNext()
    Comp->>Comp: Update state
    Comp->>DOM: Re-render UI
    
    Note over Comp: Component unmounts
    
    Comp->>Hook: Cleanup
    Hook->>DOM: Remove event listener
```

---

**Note:** These diagrams are written in Mermaid syntax and will render automatically on GitHub when viewing this file.

To view these diagrams locally, you can use:
- [Mermaid Live Editor](https://mermaid.live/)
- VS Code with Mermaid extension
- GitHub (renders automatically)
