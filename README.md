# BMW Experience Studio Website

A premium, multi-page BMW showcase website featuring model discovery, innovation technology, photo gallery, heritage timeline, comparison tools, and test drive booking.

---

## 🚀 Quick Start

1. Open `index.html` in your web browser
2. Navigate using the header menu (Models, Innovation, Gallery, Heritage, Compare, Book Drive)
3. Click any model's "View Specs" button to see detailed information
4. Explore the heritage timeline with era filters
5. Browse the photo gallery with full-screen viewer

---

## 📁 Project Structure

```
BMW/
├── index.html              # Home page + About + Book a Drive
├── models.html             # Model catalog with search/filter
├── innovation.html         # Technology & configurator
├── gallery.html            # Photo gallery with lightbox
├── heritage.html           # Timeline (1916-2025)
├── compare.html            # Standalone comparison page
├── css/
│   └── style.css           # Shared stylesheet for all pages
├── js/
│   ├── catalog.js          # Shared data (42 models, 27 heritage entries)
│   └── script.js           # Shared controller for page interactions
├── image/                  # 42 model photos + BMW M logo SVG
└── docs/                   # Technical documentation
    ├── 01_PRD.md
    ├── 02_TRD.md
    ├── 03_UI_UX_SPEC.md
    ├── 04_ARCHITECTURE.md
    ├── 05_BACKEND_SCHEMA.md
    └── 06_TECH_STACK.md
```

---

## ✨ Features

### 🏠 Home Page (index.html)
- Hero section with responsive imagery
- Quick search finder
- About BMW (origin & ownership)
- BMW Group story and company facts
- Book a test drive form with first/middle/last name, email, country-code phone, optional gender and contact preference, schedule, current vehicle, and message

### 🚗 Models (models.html)
- 42 BMW models (electric, M, SUV, sedan, classic)
- Search by keyword
- Filter by category (Electric, M, SUV, Luxury, Sedan, Classic)
- Detailed spec dialog with:
  - Performance specs
  - Key highlights (3-4 features per model)
  - Fun facts
  - Origin & ownership info
- Catalogue-driven compare table and regional BMW websites

### 💡 Innovation (innovation.html)
- Technology showcase (Curved Display, eDrive, Neue Klasse, xDrive)
- Interactive configurator (paint, drive mode, performance bias)
- Innovation cards

### 📸 Gallery (gallery.html)
- All 42 model photos
- Category filters
- Full-screen lightbox viewer
- Keyboard navigation (arrow keys, escape)

### 📜 Heritage (heritage.html)
- **27 timeline entries** (1916 → 2025)
- Era filters (Origins, Rebirth, Motorsport, Modern, Electric)
- Images and historical facts
- Milestone badges

### ⚖️ Compare
- Side-by-side model comparison integrated into the Models page
- Standalone `compare.html` remains available
- Power, drive, acceleration, character, price
- Flagged models table

---

## 📊 Data Layer ([js/catalog.js](./js/catalog.js))

Every page loads `js/catalog.js` first, then `js/script.js`. The catalog is the
single source of truth; each page provides the relevant HTML containers and
`data-*` hooks. `css/style.css` styles those shared page components, while
`image/` contains the source photos and logo referenced by the HTML, catalog,
and stylesheet.

### Models Array (42 vehicles)
Each model includes:
- Basic info (name, series, category, tags)
- Performance specs (power, acceleration, drive)
- Extended details (engine, top speed, production years, origin, price)
- **NEW:** `highlights` array (3-4 key features)
- **NEW:** `funFact` string (interesting trivia)
- Images

### Heritage Timeline (27 entries)
Comprehensive history from BMW founding (1916) to Neue Klasse (2025):
- 1916-1944: Origins (founding, first motorcycle, first car, 303)
- 1945-1979: Rebirth (post-war recovery, Isetta, Neue Klasse)
- 1980-1999: Motorsport era (M1, M3, 8 Series, E46)
- 2000-2014: Modern era (X5 SAV, Rolls-Royce, i3)
- 2015+: Electric future (i7, iX, XM, Neue Klasse)

### Brand Information
- Parent company details
- Ownership structure (Quandt family ~46.7%)
- Founded 1916, Munich
- Headquarters location
- Stock listing (XETRA: BMW)
- CEO/Chairman
- Sub-brands (MINI, Rolls-Royce, Motorrad, M, Alpina)

### About Section
Six origin/ownership cards plus six company stats, including:
- Revenue (2023): €155.5 billion
- Employees: 154,000+ worldwide
- Vehicles sold: 2.55 million (2023)
- Electric vehicles: 376,183 (2023)
- R&D investment: €7.4 billion annually
- Six BMW Group brand cards

---

## 🎨 Design System

### Colors
- **Ink:** `#101216` (primary text)
- **Paper:** `#f5f5f1` (background)
- **BMW Blue:** `#1267d8` (brand accent)
- **M Red:** `#c41f35` (M series accent)
- **Teal:** `#0c8b86` (innovation accent)

### Typography
- **Font:** Inter (400, 500, 600, 700, 800)
- **Responsive sizing** via clamp()

### Components
- Header with scroll effects
- Responsive navigation
- Model cards with hover effects
- Modal dialogs (specs, lightbox)
- Timeline with scroll reveal animations
- Filter chips
- Forms with validation

---

## 🌐 Footer (All Pages)

### Contact
- Headquarters address
- Global hotline: +49 89 382-0
- Investor relations: ir@bmwgroup.com
- Media enquiries: presse@bmw.de
- Customer service contact form

### Social Media (8 platforms)
- Instagram
- X (Twitter)
- Facebook
- YouTube
- LinkedIn
- TikTok
- Threads
- Pinterest

### Global Regions (14 countries)
Global, Germany, UK, USA, Canada, France, India, Australia, China, Singapore, Japan, Brazil, South Africa, UAE

---

## 💻 Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design (mobile, tablet, desktop)
- Graceful degradation for older browsers
- Reduced motion support
- Keyboard navigation

---

## 🔧 Technical Details

### JavaScript Architecture
- Single-page application feel with multi-page structure
- Data-driven rendering from `BMW_CATALOG` global
- Modular script with guarded sections
- Event delegation for performance
- Intersection Observer for scroll reveals

### Performance
- Lazy loading for images
- Preload critical assets
- Optimized asset delivery
- Efficient DOM manipulation

### Accessibility
- Semantic HTML5
- ARIA labels and roles
- Keyboard navigation
- Focus management
- Screen reader friendly

---

## 📝 Recent Improvements (Oct 2026)

### Latest layout updates
- Added a historical BMW photo and six compact origin/ownership cards to Home.
- Added a BMW Group story section with six company stats and brand cards.
- Removed the Home Explore panel and integrated Compare into the Models page.
- Added a Home link to the navigation on every page.
- Removed the footer Explore column; the remaining columns are BMW Group, Contact, then Follow BMW worldwide.
- Moved regional BMW links to Models.
- Expanded the test-drive form with an optional message and saved it with each request.
- Organized the test-drive form into clear rows and added name parts, phone country codes, gender preference, and preferred contact method.

### 1. Enhanced Spec Dialog
- Added key highlights section (3-4 features per model)
- Added fun facts with special styling
- Expanded origin & ownership information
- Better visual hierarchy

### 2. Heritage Timeline Expansion
- **+10 new entries** (17 → 27 total)
- Comprehensive coverage 1916-2025
- Added missing milestones (1916, 1936, 1962, 1975, 1986, 1999, 2003, 2014, 2018, 2022)

### 3. Footer Enhancement
- Added Threads and Pinterest social links
- Added 4 new global regions (Japan, Brazil, South Africa, UAE)
- Improved contact labels and descriptions
- Better information architecture

### 4. Booking Form Improvements
- **+9 new cities** (12 → 21 total)
- Removed placeholder phone numbers
- Better contact text and CTAs
- Made location field required

### 5. Data Enrichment
- All 42 models have highlights arrays
- All 42 models have fun facts
- 5 new company statistics added
- Richer corporate information

---

## 🎯 Use Cases

### For Potential Customers
- Browse and compare BMW models
- Learn about BMW technology and innovation
- Book a test drive at your local retailer
- Understand BMW's heritage and values

### For BMW Enthusiasts
- Explore comprehensive heritage timeline
- Discover interesting facts about each model
- Browse high-quality vehicle photography
- Learn technical specifications

### For Researchers
- Access BMW company information
- Study BMW's technology evolution
- Review model lineup and positioning
- Understand BMW Group structure

---

## 📄 License & Disclaimer

**© 2026 BMW Experience Studio** — An independent design concept.

**Not affiliated with or endorsed by BMW AG.**

This is a showcase website demonstrating web design and development capabilities. All BMW trademarks, logos, and vehicle images remain the property of Bayerische Motoren Werke AG.

---

## 🤝 Credits

- **Design & Development:** BMW Experience Studio Concept
- **Content:** Based on public BMW information and specifications
- **Images:** BMW press materials and Wikimedia Commons
- **Typography:** Inter font family by Rasmus Andersson

---

## 📞 Support

For questions about this website project, refer to:
- Technical documentation in `docs/`
- `IMPROVEMENTS_SUMMARY.md` for recent changes
- Inline code comments for implementation details

---

**Built with attention to detail, performance, and user experience.**
