# PollApp - Interactive Polling Platform

A modern, full-stack polling application built with Next.js 15, TypeScript, Supabase, and shadcn/ui components.

## 🚀 Features

### Core Functionality
- **Create Polls**: Beautiful, intuitive poll creation with multiple options
- **Real-time Voting**: Live vote counting with instant results
- **User Authentication**: Secure sign-up/sign-in with email verification
- **Anonymous Voting**: Optional anonymous voting for maximum participation
- **Poll Management**: Full CRUD operations for poll creators
- **Categories**: Organize polls with color-coded categories
- **Responsive Design**: Mobile-first, works on all device sizes

### Advanced Features
- **User Profiles**: Complete profile management with avatars and bios
- **My Polls**: View and manage your created polls
- **Settings**: Comprehensive user settings (security, notifications, privacy)
- **Real-time Statistics**: Live poll statistics on homepage
- **Protected Routes**: Authentication-based access control
- **Modern UI**: Glass morphism effects, animations, and gradients

## 🛠 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and better DX
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern, accessible component library
- **Lucide Icons** - Beautiful icon library

### Backend & Database
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Real-time subscriptions
  - Row Level Security (RLS)
  - Authentication & authorization
- **Server Actions** - Next.js server-side functions
- **API Routes** - RESTful API endpoints

### Development & Deployment
- **ESLint & Prettier** - Code quality and formatting
- **TypeScript** - Static type checking
- **Git** - Version control

## 📁 Project Structure

```
src/
├── app/                    # App Router pages and layouts
│   ├── (auth)/            # Authentication pages
│   ├── polls/             # Poll-related pages
│   ├── profile/           # User profile page
│   ├── settings/          # User settings page
│   └── api/               # API routes
├── components/            # Reusable UI components
│   ├── auth/              # Authentication components
│   ├── layout/            # Layout components
│   ├── polls/             # Poll-specific components
│   └── ui/                # shadcn/ui components
├── lib/                   # Utility functions and configurations
│   ├── api/               # API functions and server actions
│   ├── auth/              # Authentication utilities
│   └── supabase/          # Supabase client and types
├── providers/             # React context providers
└── database/              # Database schema and migrations
```

## 🗄️ Database Schema

### Tables
- **profiles** - User profile information
- **polls** - Poll metadata and configuration
- **poll_options** - Individual poll choices
- **votes** - User votes (with RLS)
- **categories** - Poll categorization

### Security
- Row Level Security (RLS) enabled on all tables
- Users can only modify their own data
- Anonymous voting supported with optional user association

## 🎨 Design System

### Color Scheme
- **Primary**: Blue gradient (#3B82F6 to #1E40AF)
- **Secondary**: Subtle grays for text and borders
- **Accent**: Category-specific colors
- **Success**: Green (#22C55E)
- **Destructive**: Red (#EF4444)

### UI Patterns
- **Glass Morphism**: Translucent cards with backdrop blur
- **Animations**: Smooth slide-up and fade-in animations
- **Hover Effects**: Scale transforms and shadow changes
- **Loading States**: Skeleton loading and spinners
- **Responsive Grid**: 1-2-3-4 column layouts

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Run type checking
npm run type-check
```

## 🔑 Environment Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 🚀 Deployment

### Prerequisites
1. Supabase project set up with tables and RLS policies
2. Environment variables configured
3. Domain configured (for production)

### Steps
1. Run database migration: `database/schema.sql`
2. Configure environment variables
3. Deploy to Vercel/Netlify/your preferred platform
4. Update Supabase auth redirect URLs

## 📱 Key Components

### Poll Creation (`/polls/create`)
- Multi-step form with validation
- Real-time preview
- Category selection
- Anonymous/authenticated voting options
- Responsive design with mobile optimization

### Poll Voting (`/polls/[id]`)
- Real-time vote counting
- Results visualization
- Authentication-aware voting
- Mobile-friendly interface

### User Profile (`/profile`)
- Profile editing with avatar support
- Activity statistics
- Recent polls overview
- Tabbed interface

### Settings (`/settings`)
- Security settings (password management)
- Notification preferences
- Privacy controls
- Account management

## 🔐 Authentication Flow

1. **Sign Up**: Email + password with email verification
2. **Sign In**: Email + password authentication
3. **Profile Creation**: Automatic profile creation on first sign-in
4. **Session Management**: Persistent sessions with refresh tokens
5. **Protected Routes**: Route-level authentication checks

## 📊 Features Roadmap

### Implemented ✅
- [x] User authentication and profiles
- [x] Poll creation and management
- [x] Real-time voting
- [x] Responsive design
- [x] User settings
- [x] Category system
- [x] Anonymous voting

### Planned 🚧
- [ ] Real-time notifications
- [ ] Poll sharing (social media)
- [ ] Advanced analytics
- [ ] Poll templates
- [ ] Bulk poll operations
- [ ] Export functionality
- [ ] Admin dashboard

## 🐛 Common Issues & Solutions

### Authentication Issues
```bash
# If getting "Authentication required" errors:
1. Check cookie settings in browser
2. Verify Supabase URL and keys
3. Check RLS policies are correctly configured
4. Ensure middleware is properly set up
```

### Build Issues
```bash
# If getting TypeScript errors:
npm run type-check

# If getting lint errors:
npm run lint --fix
```

### Database Issues
```bash
# If getting database connection errors:
1. Verify Supabase project is active
2. Check environment variables
3. Ensure database tables exist
4. Verify RLS policies allow access
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Supabase](https://supabase.io/) - The open source Firebase alternative
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [Lucide](https://lucide.dev/) - Beautiful & consistent icons

---

Built with ❤️ using modern web technologies.