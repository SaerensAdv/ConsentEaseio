# ConsentEase Design Guidelines

## Design Approach
**System-Based Approach** using **Material Design** principles - ideal for professional compliance tools requiring clear information hierarchy, trustworthy presentation, and intuitive workflows.

## Typography
- **Primary Font**: Inter (Google Fonts)
- **Headings**: font-semibold to font-bold, text-2xl to text-4xl
- **Body**: font-normal, text-base
- **Labels/Meta**: font-medium, text-sm
- **Legal/Fine Print**: text-xs

## Layout System
**Spacing Units**: Use Tailwind units of **2, 4, 6, 8, 12, 16**
- Tight spacing: p-2, gap-2 (buttons, compact lists)
- Standard spacing: p-4, gap-4 (cards, form fields)
- Section spacing: p-8 to p-16 (page sections)
- Max container width: max-w-7xl with mx-auto

## Component Library

### Navigation
- Fixed top navbar with max-w-7xl container
- Left: Logo + product name
- Right: Navigation links + CTA button ("Get Started")
- Mobile: Hamburger menu with slide-in drawer

### Hero Section
- Two-column layout (lg:grid-cols-2)
- Left: Headline (text-4xl font-bold) + subheading + dual CTA buttons
- Right: Dashboard preview image or consent flow mockup
- Background: Subtle gradient or geometric pattern overlay

### Feature Sections
- Three-column grid (grid-cols-1 md:grid-cols-3) for feature cards
- Each card: Icon, title (text-xl font-semibold), description (text-base)
- Consistent card padding: p-6
- Subtle border or shadow for depth

### Dashboard/Admin Views
- Sidebar navigation (w-64, fixed left)
- Main content area with breadcrumbs
- Data tables with sortable headers
- Status indicators (badges) for compliance states
- Action buttons in table rows

### Forms
- Clear label hierarchy (text-sm font-medium)
- Input fields with border and focus states
- Helper text below inputs (text-xs)
- Error states with red accent
- Toggle switches for consent preferences
- Grouped related fields with visual separation (border-t, pt-4)

### Consent Modal/Banner
- Fixed bottom or top positioning
- Clear accept/decline actions
- Collapsible "Manage Preferences" section
- Cookie category toggles with descriptions

### Trust Elements
- Compliance badges section (grid-cols-2 md:grid-cols-4)
- Security certifications display
- Client logos with opacity hover effect

### Footer
- Four-column layout (grid-cols-1 md:grid-cols-4)
- Columns: Product links, Resources, Legal, Contact
- Newsletter signup with inline form
- Social media icons
- Legal disclaimers in text-xs

## Images
**Hero Image**: Dashboard interface mockup showing consent analytics - clean, professional screenshot with subtle shadow
**Feature Images**: UI component screenshots illustrating key features
**Trust Section**: Company/client logos in grayscale (hover: full color)

No decorative images - focus on product screenshots and UI demonstrations to build credibility.

## Animations
- Minimal: Smooth transitions on hover states (transition-all duration-200)
- Modal/drawer entrance: slide-in animations
- Avoid distracting scroll-based animations