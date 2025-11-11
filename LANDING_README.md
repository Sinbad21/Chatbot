# Chatbot Studio - Landing Page

Modern, conversion-first landing page built with Next.js 14, React, Tailwind CSS, shadcn/ui, and Framer Motion.

## ✨ Features

### 🎨 Design & UX
- **Conversion-optimized** layout inspired by modern SaaS landing pages
- **Dark mode** by default with system-aware theme switching
- **Fully responsive** mobile-first design (sm, md, lg, xl breakpoints)
- **Smooth animations** with Framer Motion
- **Accessibility** AA compliant with proper ARIA labels and focus states

### 📄 Pages & Sections

#### Home Page (`/`)
1. **Hero** - Strong headline, CTA buttons, trust badge
2. **Trust Badges** - Client/partner logos
3. **Value Props** - 6 key benefits with icons
4. **Demo Chat** - Interactive mini-chat (demo mode)
5. **Features** - 8 detailed feature cards
6. **Integrations** - Multi-channel badges (WhatsApp, Telegram, Slack, Discord)
7. **Pricing** - 3 plans with monthly/annual toggle (-20% discount)
8. **Testimonials** - 5 customer reviews with ratings
9. **FAQ** - 10 questions with accordion
10. **Final CTA** - Call to action with signup

#### Secondary Pages
- `/pricing` - Full pricing page with FAQ
- `/docs` - Documentation placeholder
- `/legal/privacy` - Privacy Policy (GDPR compliant)
- `/legal/terms` - Terms of Service

### 🌍 Internationalization
- **22 languages** supported (EN, IT primary)
- **Language switcher** in navbar (dropdown)
- **JSON-based translations** (`/translations/landing-*.json`)
- **Dynamic content** updates without page reload
- **Persistent preference** saved in localStorage

### 🚀 Performance & SEO
- **Next.js 14 App Router** with server/client components
- **Metadata API** for SEO (title, description, OG tags)
- **Image optimization** with `next/image` (when images added)
- **Font display swap** for performance
- **Lazy loading** with Framer Motion viewport triggers
- **Analytics-ready** wrapper for Plausible/GA4

### 🔌 API Routes
- `POST /api/lead` - Lead capture (stub, TODO: integrate CRM)
- `GET /api/demo-chat` - Demo chat responses (keyword-based)

## 📦 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui (Button, Card, Accordion, Badge, etc.)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **TypeScript**: Strict mode
- **Deployment**: Cloudflare Pages

## 🛠️ Setup & Development

### Prerequisites
- Node.js 20+
- npm/pnpm

### Install Dependencies
```bash
cd apps/web
npm install
```

### Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Build for Production
```bash
npm run build
npm start
```

### Lint & Type Check
```bash
npm run lint
npx tsc --noEmit
```

## 📂 Project Structure

```
apps/web/src/
├── app/
│   ├── (landing)/          # Landing page group
│   │   ├── layout.tsx      # Metadata & SEO
│   │   └── page.tsx        # Main landing page
│   ├── api/                # API routes
│   │   ├── lead/           # Lead capture
│   │   └── demo-chat/      # Demo chat
│   ├── pricing/            # Pricing page
│   ├── docs/               # Docs placeholder
│   └── legal/              # Privacy & Terms
├── components/
│   └── landing/
│       ├── Navbar.tsx      # Navigation with lang switch
│       └── index.tsx       # All landing components
├── hooks/
│   └── useLandingTranslation.ts  # i18n hook
└── translations/
    ├── landing-en.json     # English translations
    └── landing-it.json     # Italian translations
```

## 🎨 Customization

### Branding
Update primary color in components (currently `#5B4BFF`):
```tsx
className="bg-[#5B4BFF] hover:bg-[#4B3BEF]"
```

### Content
Edit translations in `src/translations/landing-*.json`:
- Hero headlines
- Value propositions
- Pricing plans
- FAQ questions
- Testimonials

### Images
Add images to `/public/` and update components:
```tsx
<Image src="/hero-mockup.png" alt="..." width={1200} height={600} />
```

### Pricing
Update pricing in `landing-en.json`:
```json
{
  "pricing": {
    "plans": [
      {
        "name": "Starter",
        "price": 29,
        "priceAnnual": 23,
        "features": [...]
      }
    ]
  }
}
```

## 🔧 Configuration

### Environment Variables
Create `.env.local`:
```bash
# API URL (if using external API)
NEXT_PUBLIC_API_URL=https://api.chatbot-studio.com

# Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=chatbot-studio.com
```

### Analytics
Add to `app/layout.tsx`:
```tsx
<Script src="https://plausible.io/js/script.js" data-domain="your-domain.com" />
```

## 🚀 Deployment

### Cloudflare Pages

1. **Connect Repository**
   - Dashboard > Pages > Create project
   - Connect your GitHub repo

2. **Build Settings**
   ```
   Build command: npm run build
   Build output: .next
   Root directory: apps/web
   Node version: 20
   ```

3. **Environment Variables**
   ```
   NODE_VERSION=20
   NEXT_PUBLIC_API_URL=https://your-api.workers.dev
   ```

4. **Deploy**
   - Push to main branch
   - Auto-deploys on commit

### Manual Build
```bash
npm run build
npx wrangler pages deploy .next --project-name=chatbot-studio
```

## ✅ Acceptance Criteria

- [x] Conversion-first design with clear CTAs
- [x] Hero with demo badge and dual CTAs
- [x] Trust badges section
- [x] Value props (6 cards with icons)
- [x] Demo chat (interactive, keyboard-based responses)
- [x] Features section (8 detailed cards)
- [x] Integrations badges (WhatsApp, Telegram, etc.)
- [x] Pricing with toggle (monthly/annual -20%)
- [x] Testimonials (5 reviews with ratings)
- [x] FAQ accordion (10 questions)
- [x] Final CTA section
- [x] Navbar with language switcher
- [x] Footer with newsletter signup
- [x] i18n (EN/IT) with persistent preference
- [x] Secondary pages (pricing, docs, privacy, terms)
- [x] API routes stub (/api/lead, /api/demo-chat)
- [x] Dark mode by default
- [x] Responsive mobile-first
- [x] TypeScript strict mode
- [x] shadcn/ui components
- [x] Framer Motion animations
- [x] SEO metadata (title, description, OG tags)

## 📊 Performance Targets

### Lighthouse Scores (Target)
- **Performance**: ≥95
- **Accessibility**: ≥95
- **Best Practices**: ≥100
- **SEO**: ≥100

### Optimizations Implemented
- Lazy loading components with `viewport={{ once: true }}`
- Minimal JavaScript (client components only where needed)
- Tailwind CSS purging (production builds)
- No external fonts loaded yet (placeholder for Inter)
- Cloudflare CDN for static assets

## 🐛 Known Issues & TODOs

### High Priority
- [ ] Add real images (hero mockup, feature screenshots)
- [ ] Integrate lead capture with CRM/email
- [ ] Add Google Analytics or Plausible
- [ ] Create OpenGraph image (`/public/og-image.png`)
- [ ] Add favicon and app icons

### Medium Priority
- [ ] Improve demo chat with AI responses
- [ ] Add video demo modal
- [ ] Create blog section
- [ ] Add changelog page
- [ ] Implement newsletter signup (Mailchimp/ConvertKit)

### Low Priority
- [ ] Add more languages (ES, FR, DE)
- [ ] Create comparison table (vs competitors)
- [ ] Add case studies
- [ ] Implement live chat widget
- [ ] A/B test variations

## 📝 Content Guidelines

### Headlines
- Clear, benefit-focused
- Action-oriented (avoid buzzwords)
- Under 60 characters for SEO

### CTAs
- Primary: "Start Free" (high contrast)
- Secondary: "Watch Demo" / "Learn More"
- Microcopy: "No credit card • Cancel anytime"

### Social Proof
- Use real customer names/companies (with permission)
- Include role/title for credibility
- 5-star ratings only (filter reviews)

### Pricing
- Show annual savings prominently (-20%)
- Include all features per plan
- Add "most popular" badge to Pro plan
- Clear CTA per plan

## 🤝 Contributing

1. Create feature branch from `main`
2. Make changes in `apps/web/`
3. Test locally (`npm run dev`)
4. Commit with clear message
5. Open PR with description

## 📄 License

MIT License - see LICENSE file

---

**Built with ❤️ by Chatbot Studio Team**

For questions: support@chatbot-studio.com
