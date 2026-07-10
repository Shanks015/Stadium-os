---
name: Neubrutalist Bento
colors:
  surface: '#fdf7ff'
  surface-dim: '#ded8e1'
  surface-bright: '#fdf7ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f8f1fb'
  surface-container: '#f2ecf5'
  surface-container-high: '#ece6ef'
  surface-container-highest: '#e6e0ea'
  on-surface: '#1d1b21'
  on-surface-variant: '#494551'
  inverse-surface: '#322f36'
  inverse-on-surface: '#f5eff8'
  outline: '#7a7583'
  outline-variant: '#cbc4d3'
  surface-tint: '#684cae'
  primary: '#684cae'
  on-primary: '#ffffff'
  primary-container: '#b497ff'
  on-primary-container: '#46288a'
  inverse-primary: '#d0bcff'
  secondary: '#576400'
  on-secondary: '#ffffff'
  secondary-container: '#d1ed19'
  on-secondary-container: '#5b6900'
  tertiary: '#b22c00'
  on-tertiary: '#ffffff'
  tertiary-container: '#ff8564'
  on-tertiary-container: '#771a00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#d0bcff'
  on-primary-fixed: '#23005c'
  on-primary-fixed-variant: '#503395'
  secondary-fixed: '#d4f01e'
  secondary-fixed-dim: '#b9d300'
  on-secondary-fixed: '#191e00'
  on-secondary-fixed-variant: '#414c00'
  tertiary-fixed: '#ffdbd1'
  tertiary-fixed-dim: '#ffb5a1'
  on-tertiary-fixed: '#3c0800'
  on-tertiary-fixed-variant: '#881f00'
  background: '#fdf7ff'
  on-background: '#1d1b21'
  surface-variant: '#e6e0ea'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 72px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.03em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '500'
    lineHeight: '1.5'
    letterSpacing: -0.01em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '500'
    lineHeight: '1.5'
    letterSpacing: 0em
  label-bold:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  mono-label:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0em
spacing:
  grid-margin: 32px
  grid-gutter: 24px
  container-padding: 24px
  element-gap: 16px
  border-width: 4px
  shadow-offset: 8px
---

## Brand & Style
The brand personality is uncompromising, direct, and hyper-functional. It targets a tech-literate audience that values structural clarity and efficiency over organic softness. This design system leverages **Neubrutalism**, emphasizing the "raw" architecture of the UI. It utilizes a bento-grid layout to compartmentalize information into distinct, high-contrast modules. The emotional response should be one of digital confidence, technical precision, and high energy. Whitespace is used not for elegance, but for structural separation, ensuring that every element feels deliberate and grounded.

## Colors
The palette is built on a high-contrast foundation with aggressive, saturated accents. 
- **Background:** An off-white (#F4F4F0) reduces pure-white eye strain while maintaining maximum contrast.
- **Base:** Pure black (#000000) for borders and shadows, with a deep charcoal (#111827) for primary text to retain legibility.
- **Accents:** 
    - **AI Action (Primary):** #B497FF (Lavender) for cognitive or generative features.
    - **Status (Secondary):** #E2FF32 (Electric Lime) for confirmations and state changes.
    - **Alert (Tertiary):** #FF4911 (Vivid Orange) for warnings and critical interactions.
    - **Simulation/Interaction:** #00E5FF (Cyan) reserved exclusively for hover states and active simulators.

## Typography
Typography is bold and tightly tracked to reinforce the "packed" aesthetic of the bento grid. **Plus Jakarta Sans** provides a modern, geometric feel for headings and body copy, while **Space Grotesk** is used for technical labels and data points to inject a hint of "engineering" utility. Headlines must always be bold or extra-bold. Avoid any weight lighter than 500. All text should utilize tight letter-spacing to create a dense, impactful visual rhythm.

## Layout & Spacing
The layout follows a strict **Bento Grid** philosophy. Every module is a distinct container with a 4px black border and a hard 8px shadow.
- **Grid:** Use a 12-column fluid grid for desktop and a 1-column stack for mobile.
- **Rhythm:** Spacing between grid items (gutters) must match the internal container padding for a perfectly aligned visual block system.
- **Responsiveness:** On mobile, shadows should be reduced to 4px 4px to maintain balance on smaller viewports, while borders remain at a constant 4px width.

## Elevation & Depth
Depth is strictly two-dimensional and binary. There are no gradients, blurs, or soft shadows. 
- **Hard-Edged Shadows:** Use a 100% opacity black shadow offset by 8px on both X and Y axes. This creates a "lifted card" effect typical of neubrutalism.
- **Active State:** On click or press, the shadow offset should reduce to 0, and the element should translate +8px X and +8px Y to simulate a physical button being pressed into the page.
- **Layers:** Use the secondary accent color (#E2FF32) as a background for high-priority containers to break the off-white monotony.

## Shapes
This design system utilizes a **strictly sharp** shape language. All corners are 0px (rounded-none). This applies to buttons, input fields, cards, and even selection indicators. The lack of curves emphasizes the structural, grid-based nature of the content. Icons should be chosen with sharp terminals and 90-degree angles wherever possible to harmonize with the container shapes.

## Components
- **Buttons:** 4px black border, sharp corners. Default state uses primary (#B497FF) or background color. Hover state shifts to #00E5FF with no shadow (pressed effect).
- **Cards (Bento Boxes):** Background #FFFFFF. 4px black border. Always features the 8px hard shadow. Titles inside cards use `label-bold` styling.
- **Input Fields:** Thick 4px borders. Text is `body-md`. On focus, the background changes to #E2FF32 (Status) to indicate readiness.
- **Chips/Labels:** No rounded edges. Use high-contrast fills (Alert or Status colors) with black text.
- **Checkboxes/Radios:** Square 24px boxes with 4px borders. Checkmarks are 4px thick lines.
- **Lists:** Items are separated by a 4px horizontal black line. No padding between items; they should sit flush to the container edge.
