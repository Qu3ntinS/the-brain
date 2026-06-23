/** Brain CI colors + typography for Scalar (standalone + embedded). */
export const brainScalarThemeCss = `
.dark-mode {
  --scalar-color-1: #f8f4ff;
  --scalar-color-2: #b8a9d9;
  --scalar-color-3: #8a7aad;
  --scalar-color-accent: #ff6bcb;

  --scalar-background-1: #0d0221;
  --scalar-background-2: #1a0a3e;
  --scalar-background-3: #24104f;
  --scalar-background-accent: #2a1455;

  --scalar-border-color: rgba(184, 169, 217, 0.15);

  --scalar-button-1: #ff6bcb;
  --scalar-button-1-color: #0d0221;
  --scalar-button-1-hover: #e855b8;

  --scalar-color-green: #00f5d4;
  --scalar-color-red: #ff8fab;
  --scalar-color-yellow: #ffe066;
  --scalar-color-blue: #7dd3fc;
  --scalar-color-orange: #fb892c;
  --scalar-color-purple: #c44dff;

  --scalar-scrollbar-color: rgba(184, 169, 217, 0.2);
  --scalar-scrollbar-color-active: rgba(0, 245, 212, 0.35);

  --scalar-font: 'DM Sans', system-ui, sans-serif;
  --scalar-font-code: ui-monospace, 'Cascadia Code', monospace;
}

.dark-mode .t-doc__sidebar {
  --scalar-sidebar-background-1: #12082a;
  --scalar-sidebar-color-1: #f8f4ff;
  --scalar-sidebar-color-2: #b8a9d9;
  --scalar-sidebar-border-color: rgba(184, 169, 217, 0.12);
  --scalar-sidebar-item-hover-background: #24104f;
  --scalar-sidebar-item-hover-color: #00f5d4;
  --scalar-sidebar-item-active-background: rgba(255, 107, 203, 0.14);
  --scalar-sidebar-color-active: #ff6bcb;
  --scalar-sidebar-search-background: transparent;
  --scalar-sidebar-search-color: #b8a9d9;
  --scalar-sidebar-search-border-color: rgba(184, 169, 217, 0.2);
}

.dark-mode .section-header,
.dark-mode h1,
.dark-mode h2 {
  font-family: 'Syne', system-ui, sans-serif;
}
`.trim()

/**
 * Dashboard embed only — keep Scalar inside its slot; content pane scrolls, not the shell.
 * Modern layout defaults to 100dvh + document scroll, which jumps the whole dashboard pane.
 */
export const brainScalarEmbeddedLayoutCss = `
.brain-scalar-embedded,
.brain-scalar-embedded-root {
  --full-height: var(--brain-scalar-height, 100%) !important;
}

.brain-scalar-embedded-root.references-layout,
.brain-scalar-embedded .references-layout {
  height: var(--brain-scalar-height, 100%) !important;
  max-height: var(--brain-scalar-height, 100%) !important;
  min-height: 0 !important;
  overflow: hidden !important;
  grid-template-rows: var(--scalar-header-height, 0px) minmax(0, 1fr) auto !important;
}

.brain-scalar-embedded-root .references-rendered,
.brain-scalar-embedded .references-rendered {
  overflow-x: hidden !important;
  overflow-y: auto !important;
  overscroll-behavior: contain;
  min-height: 0 !important;
  max-height: 100% !important;
}

.brain-scalar-embedded-root .t-doc__sidebar,
.brain-scalar-embedded .t-doc__sidebar {
  position: relative !important;
  top: auto !important;
  max-height: 100% !important;
  min-height: 0 !important;
  overflow: hidden !important;
}

.brain-scalar-embedded-root .t-doc__sidebar .custom-scroll,
.brain-scalar-embedded .t-doc__sidebar .custom-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overscroll-behavior: contain;
}
`.trim()
