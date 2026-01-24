# Challenge Suite - Web Frontend

A modern, premium dark-themed challenge platform built with Next.js 15, React 19, and TypeScript.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
cd photobox_web

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
photobox_web/
├── public/images/          # AI-generated challenge images
├── src/
│   ├── app/
│   │   ├── (user)/        # User-facing pages
│   │   ├── (admin)/       # Admin panel
│   │   └── globals.css    # Design system
│   └── components/        # Reusable components
└── package.json
```

## 🎨 Features

### User Pages
- **Dashboard** - Overview with KPIs, challenges, and leaderboard
- **Challenges** - Browse and filter all challenges
- **My Challenges** - Track personal progress
- **Leaderboards** - Global rankings
- **Winners** - Completed challenge winners
- **Subscriptions** - Premium plans
- **Profile** - User profile and submissions

### Admin Panel
- **Dashboard** - Platform statistics and analytics
- **Challenge Management** - Create and manage challenges
- **User Analytics** - Track user engagement

## 🎨 Design System

### Colors
- Primary: `#0a0f1c` (Deep blue-black)
- Accent: `#6366f1` (Indigo)
- Success: `#10b981` (Green)

### Typography
- Headings: Outfit
- Body: Inter

### Effects
- Glassmorphism cards
- Smooth animations
- Gradient accents

## 🖼️ AI Images

All challenge images are AI-generated and located in `/public/images/`:
- fitness.png
- photography.png
- reading.png
- cooking.png
- step.png
- mindfulness.png
- pet.png

## 🔧 Tech Stack

- **Framework:** Next.js 15.1.6 (App Router)
- **UI Library:** React 19.0.0
- **Language:** TypeScript
- **Styling:** CSS Modules (Vanilla CSS)
- **Fonts:** Google Fonts (Outfit, Inter)

## 📱 Responsive Design

Fully responsive across all devices:
- Desktop (1920px+)
- Laptop (1024px - 1920px)
- Tablet (768px - 1024px)
- Mobile (320px - 768px)

## 🔌 Backend Integration

### Required API Endpoints

See `PROJECT_SUMMARY.md` for complete API specification.

Key endpoints:
- `/api/auth/*` - Authentication
- `/api/challenges/*` - Challenge CRUD
- `/api/user/*` - User profile and stats
- `/api/leaderboards/*` - Rankings
- `/api/admin/*` - Admin operations

### Data Models

```typescript
interface Challenge {
  id: string;
  title: string;
  description: string;
  image: string;
  badge: 'Prize' | 'Normal';
  status: 'active' | 'upcoming' | 'ended';
  participants: number;
  // ... more fields
}
```

See `PROJECT_SUMMARY.md` for all data models.

## 📝 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Create production build
npm start        # Start production server
npm run lint     # Run ESLint
```

### Adding New Pages

1. Create folder in `src/app/(user)/` or `src/app/(admin)/`
2. Add `page.tsx` and `page.module.css`
3. Update navigation in `Sidebar.tsx` or `AdminSidebar.tsx`

### Styling Guidelines

- Use CSS Modules for component styles
- Reference design tokens from `globals.css`
- Follow glassmorphism pattern for cards
- Use consistent spacing (rem units)

## 🎯 Current Status

✅ **Frontend: 100% Complete**
- All 8 user pages implemented
- Admin dashboard ready
- AI images integrated
- Production build successful
- Fully responsive

⏳ **Backend: Ready for Integration**
- API endpoints defined
- Data models specified
- Authentication flow planned

## 📚 Documentation

- `PROJECT_SUMMARY.md` - Complete feature documentation
- `README.md` - This file
- Inline code comments for complex logic

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## 📄 License

Private project - All rights reserved

## 👥 Team

- Frontend Developer: [Your Name]
- Designer: [Designer Name]
- Backend Developer: [Backend Dev Name]

## 🔗 Links

- Production: TBD
- Staging: TBD
- Design: [Figma Link]

---

**Built with ❤️ using Next.js and React**
