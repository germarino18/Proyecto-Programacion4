---
name: Artisanal Brew System
colors:
  surface: '#fff8f3'
  surface-dim: '#e6d8c5'
  surface-bright: '#fff8f3'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff2e2'
  surface-container: '#fbecd9'
  surface-container-high: '#f5e6d3'
  surface-container-highest: '#efe0cd'
  on-surface: '#221a0f'
  on-surface-variant: '#44474d'
  inverse-surface: '#372f22'
  inverse-on-surface: '#feefdb'
  outline: '#74777e'
  outline-variant: '#c4c6ce'
  surface-tint: '#4c5f7f'
  primary: '#354867'
  on-primary: '#ffffff'
  primary-container: '#4d6080'
  on-primary-container: '#c8dbff'
  inverse-primary: '#b4c7ec'
  secondary: '#695c4e'
  on-secondary: '#ffffff'
  secondary-container: '#f1e0ce'
  on-secondary-container: '#6f6254'
  tertiary: '#5f4225'
  on-tertiary: '#ffffff'
  tertiary-container: '#79593a'
  on-tertiary-container: '#fdd2ab'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d5e3ff'
  primary-fixed-dim: '#b4c7ec'
  on-primary-fixed: '#051c38'
  on-primary-fixed-variant: '#344766'
  secondary-fixed: '#f1e0ce'
  secondary-fixed-dim: '#d4c4b3'
  on-secondary-fixed: '#231a0f'
  on-secondary-fixed-variant: '#504538'
  tertiary-fixed: '#ffdcbe'
  tertiary-fixed-dim: '#e8bf99'
  on-tertiary-fixed: '#2c1601'
  on-tertiary-fixed-variant: '#5d4124'
  background: '#fff8f3'
  on-background: '#221a0f'
  surface-variant: '#efe0cd'
typography:
  display-lg:
    fontFamily: Bricolage Grotesque
    fontSize: 64px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Bricolage Grotesque
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Bricolage Grotesque
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Bricolage Grotesque
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style

The design system is defined by a "Crafted Modernist" aesthetic. It balances the soulful, organic curves of specialty coffee culture with the rigorous structure of a premium SaaS interface. The brand personality is artisanal, sophisticated, and intentional, evoking the warmth of a morning cafe ritual while maintaining the efficiency of a high-end digital tool.

The visual style leans heavily into **Minimalism** with a **Tactile** touch. It utilizes expansive whitespace (or "cream-space") to let product photography and hand-drawn illustrations breathe. Subtle shadows and soft-radius containers prevent the interface from feeling clinical, ensuring a welcoming, human-centric experience.

## Colors

The palette is anchored by **Slate Blue (#4D6080)**, used for high-importance structural elements like navigation bars, primary action buttons, and core typography. This provides a professional, stable foundation.

The background ecosystem is dominated by **Warm Cream (#FFEDDB)**, which serves as the primary canvas. Unlike a harsh white, this cream tone reduces eye strain and reinforces the "roasted" artisanal theme. 

- **Primary:** Slate Blue. Used for branding, primary CTAs, and active states.
- **Secondary:** Warm Cream. Used for global backgrounds and large surface areas.
- **Accent:** Roasted Tan (#C7A07C). Used sparingly for highlights, status indicators, or illustrative accents.
- **Surface:** Pale Sand (#F5E6D3). Used for card backgrounds and input fields to create a soft contrast against the secondary background.

## Typography

This design system uses a high-contrast typographic pairing to mirror the "Artisanal vs. Modern" narrative. 

**Bricolage Grotesque** is selected for headlines. Its quirky, expressive terminals and variable-width characteristics echo the "groovy/retro" feel of the logo while remaining legible in a modern context. It should be used for large titles and "moment" text.

**Manrope** is the workhorse for body text and UI elements. Its clean, geometric sans-serif construction ensures maximum readability in data-heavy environments like administration tables and checkout forms. 

Use tight line-heights for headlines to maintain impact, and generous line-heights (1.6) for body text to support the minimalist, airy aesthetic.

## Layout & Spacing

The layout follows a **Fluid Grid** philosophy with generous inner padding to maintain the "premium" feel. 

- **Desktop:** 12-column grid with 24px gutters. Content is centered with a max-width of 1280px to prevent excessive line lengths on ultra-wide monitors.
- **Tablet:** 8-column grid with 24px gutters and 32px side margins.
- **Mobile:** 4-column grid with 16px gutters and 16px side margins.

Spacing follows an 8px base unit. For artisanal product grids, use asymmetrical spacing where possible (e.g., larger padding on one side of a product image) to break the "boxed-in" feel of standard e-commerce.

## Elevation & Depth

Depth is achieved through **Tonal Layering** and **Soft Ambient Shadows**. Avoid heavy black shadows; instead, use shadows tinted with the primary Slate Blue or a deep coffee brown to keep the interface feeling "warm."

1.  **Level 0 (Base):** Warm Cream (#FFEDDB).
2.  **Level 1 (Cards/Inputs):** Pale Sand (#F5E6D3) with a very thin (1px) border in a slightly darker cream or a 5% opacity Slate Blue.
3.  **Level 2 (Dropdowns/Popovers):** Slate Blue background with white text, or White with a soft, diffused shadow (Blur: 20px, Y: 10px, Opacity: 8%).

Interfaces should feel "flat but lifted," like high-quality stationary resting on a wooden table.

## Shapes

The shape language is consistently **Rounded**. This mirrors the organic nature of coffee beans and the fluid lines found in the brand's logo. 

- **Standard Buttons & Inputs:** 0.5rem (8px) corner radius.
- **Product Cards & Modal Containers:** 1rem (16px) corner radius.
- **Pills/Chips:** Fully rounded (32px+) to create a soft, interactable feel.

Avoid sharp corners entirely to maintain the "approachable premium" brand voice.

## Components

### Buttons
- **Primary:** Slate Blue (#4D6080) background, White or Cream text. Heavy weight, 0.5rem radius.
- **Secondary:** Transparent background, Slate Blue border (1.5px), Slate Blue text.
- **Tertiary:** Slate Blue text, no border/background, 0.05em letter spacing.

### Admin Tables
To maintain the premium look in data-heavy views:
- Remove vertical grid lines.
- Use Slate Blue for headers with `label-md` typography.
- Alternating row highlights using a 3% opacity Slate Blue.
- "Status" chips should use the Pill-shape with desaturated background tints.

### Product Grids
- Images should feature soft-focus backgrounds or be isolated on the Warm Cream color.
- Titles in `headline-md`, prices in a slightly bolder Manrope weight.
- Add-to-cart buttons appear on hover or as a subtle "+" icon in the corner.

### Forms & Login
- Input fields use the Pale Sand (#F5E6D3) surface to distinguish from the background.
- Focus states are indicated by a 2px Slate Blue border.
- Error states use a muted terracotta red rather than a bright "system" red to stay within the artisanal palette.

### Shopping Cart Cards
- Use a horizontal layout for cart items.
- Include a small thumbnail with the 0.5rem radius.
- Use Slate Blue for quantity selectors to ensure they are easily clickable and discoverable.