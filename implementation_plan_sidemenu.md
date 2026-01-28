# Implementation Plan - SideMenu Redesign

Redesign the `SideMenu` component to use a floating glassmorphism panel with a dedicated side dock for navigation, as per the modern concept.

## User Review Required

> [!IMPORTANT]
> The redesign changes the layout of the SideMenu from a full-height edge panel to a floating panel with a side dock for navigation. This significantly changes the user experience but improves one-handed usability on mobile.

## Proposed Changes

### Assets & Styles

#### [SCSS] `assets/scss/app.scss`
- Refactor `.side-menu-panel` to be floating with `12px` margins and `24px` border-radius.
- Add styles for `.side-menu-dock` (the vertical navigation bar).
- Enhance glassmorphism effects using the existing mixin.
- Update `.side-menu-content` to handle the new layout.
- Add micro-interactions for tiles and buttons.

### Components

#### [JS] `assets/js/SideMenu.js`
- Update `SideMenu` structure to include a `SideMenuDock` component.
- Integrate dock navigation with the `DisplaySettings` tabs.
- Clean up the `DisplaySettings` component to use the new tile-based layout.
- Ensure icons are consistent (Lucide/Heroicons style).

## Verification Plan

### Automated Tests
- N/A (Visual changes)

### Manual Verification
- Open SideMenu on mobile and desktop.
- Verify floating effect and margins.
- Test navigation through the new side dock.
- Check dark mode consistency and glassmorphism blur.
- Verify font sizing and theme switching functionality.
