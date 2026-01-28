# Implementation Plan - SideMenu Performance & Animation Polish

The goal is to fix visual glitches where SideMenu elements appear to "relocate" and to improve overall animation smoothness (60fps) on both mobile and desktop views, following the **Mobile Design System** and **Scroll Experience** doctrines.

## 1. Technical Strategy

### GPU Acceleration & Smooth Motion
- Replace `right` property transitions with `transform: translateX()`. This moves the animation from the Layout thread to the Compositor/GPU thread.
- Apply `will-change: transform, opacity` to the `.side-menu-panel` to hint the browser for optimization.
- Use a more sophisticated `cubic-bezier` for that "premium" feel.

### Fixing "Relocation" Glitch
- Ensure the panel's initial position is absolute/fixed and explicitly defined before the transition begins.
- Use `visibility: hidden` and `pointer-events: none` when closed to prevent interaction but keep the element "warmed up" in the DOM if needed, OR ensure the entry animation has a reliable starting point.
- Consolidate layout calculations to prevent mid-animation shifts.

### Mobile-Specific Polish
- Ensure momentum scrolling (`-webkit-overflow-scrolling: touch`) is optimized (though mostly default now, explicit check).
- Optimize `backdrop-filter` usage to prevent battery drain and jank on low-end devices.

## 2. Proposed Changes

### SCSS Refactoring (`assets/scss/app.scss` & `_mixins.scss`)
- **[Mixins]**: Add a `gpu-accelerate` mixin.
- **[SideMenu Panel]**: 
    - Set `right: 0` as the base.
    - Control visibility with `transform: translateX(calc(100% + 12px))`.
    - Set `&.open { transform: translateX(-12px); }` (accounting for the 12px gap in the floating design).
    - Update responsive media queries to use percentages for transform.

### Component Logic (`assets/js/SideMenu.js`)
- Ensure the component doesn't re-calculate expensive logic during the transition.
- Stagger the rendering of sections if possible, or use CSS transitions to fade them in once the panel is open.

## 3. Verification Plan

### Manual Testing
- **Desktop**: Check opening/closing in Chrome/Firefox. Verify no "flash" of content.
- **Mobile**: Test on mobile emulator (iOS/Android). Verify 60fps smoothness during scroll and open/close.
- **Dark Mode**: Check no border transparency glitches during movement.

### Performance Audit
- Check "Paint" and "Layout" events in Browser DevTools. Expect zero Layout shifts during SideMenu animation.
