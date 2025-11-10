# Butterfly App

A comprehensive client management system designed to support organizations providing services to individuals with disabilities. Built with modern web technologies to facilitate seamless communication and care coordination between guardians, staff members, and administrators.

## Concept

The Butterfly App serves as a digital hub for organizations working with disabled individuals. The platform enables:

- **Guardian Management**: Family members and caretakers can manage their clients' profiles, track progress, and stay informed about care activities
- **Staff Coordination**: Organization personnel can efficiently deliver services, document interactions, and collaborate with guardians
- **Administrative Oversight**: System administrators maintain full control over user management, role assignments, and system configuration

The application uses a role-based access control (RBAC) system to ensure appropriate access levels while maintaining privacy and security for sensitive client information.

## Key Features

- Secure authentication and authorization system
- Role-based access control with three user levels (Guardian, Staff, Admin)
- Client profile management
- Guardian-to-client assignment system
- Real-time updates and synchronization
- Responsive design for desktop and mobile devices
- Modern, accessible user interface

## User Roles

The system distinguishes between **Users** (who can log in) and **Clients** (individuals receiving services):

### System Users (Can Log In)

1. **Guardian**
   - Caretakers or family members
   - Manage assigned client profiles
   - View and update client information
   - Default role for new signups

2. **Staff**
   - Organization personnel providing services
   - Access to multiple client profiles
   - Document service delivery and interactions
   - Higher access level than guardians

3. **Admin**
   - System administrators
   - Full system access
   - User role management
   - System configuration

### Clients (Cannot Log In)

- Disabled individuals receiving services
- Each client is assigned to a guardian
- Profiles managed by guardians and staff
- Information stored securely in the database

**Role Hierarchy**: Guardian < Staff < Admin

## Accessing the Software

### Live Demo

[\[Live Demo\]](https://butterfly-dusky.vercel.app)

### Local Development

#### Prerequisites

- Node.js 18.x or higher
- npm, yarn, pnpm, or bun
- Supabase account (free tier available)

#### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Butterfly-App/butterfly.git
   cd butterfly
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Configure environment variables**

   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

   Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Run database migrations**

   Set up the database schema using the Supabase CLI or dashboard:
   - Run migrations from `supabase/migrations/` in order
   - Or use: `supabase db push` if using Supabase CLI

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

#### Default Access

On first signup, users are automatically assigned the **Guardian** role. Admins can upgrade user roles through the admin panel.

## Technical Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **Lucide Icons** - Modern icon library

### Backend & Database
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Row Level Security (RLS)
  - Real-time subscriptions
  - Authentication & authorization

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Geist Font** - Optimized typography

## Architecture Overview

### Authentication Flow

The app uses three separate Supabase client patterns for optimal security:

- **Client Components**: Browser-based authentication (`lib/supabase/client.ts`)
- **Server Components/Actions**: Server-side authentication with Next.js cookies (`lib/supabase/server.ts`)
- **Middleware**: Session management and route protection (`lib/supabase/middleware.ts`)

### Authorization System

**Server-Side (Security-Critical)**
- `lib/auth/roles-server.ts` - Use in Server Components, Server Actions, and API Routes
- Functions: `getUserRole()`, `hasRole()`, `requireRole()`, `hasMinimumRole()`

**Client-Side (UI Only)**
- `hooks/use-role.ts` - React hooks for conditional rendering
- `lib/auth/roles-client.ts` - Promise-based functions for event handlers
- `components/auth/role-gate.tsx` - RoleGate component for conditional rendering

**Security Rule**: Always use server-side checks for authorization. Client-side checks are for UI purposes only.

### Database Schema

Key tables:
- `profiles` - User profiles with role assignments
- `clients` - Client/patient information
- `auth.users` - Supabase authentication (built-in)

Database migrations located in `supabase/migrations/`:
- `001_create_roles_system.sql` - Initial RBAC setup
- `002_add_guardian_role.sql` - Guardian role addition
- `005_create_clients_table.sql` - Client management
- `006_remove_user_role.sql` - Role system cleanup

### Project Structure

```
butterfly/
├── app/                    # Next.js App Router
│   ├── auth/              # Authentication pages & actions
│   ├── login/             # Login page
│   └── signup/            # Signup page
├── components/            # React components
│   ├── auth/              # Auth-related components
│   └── ui/                # shadcn/ui components
├── hooks/                 # Custom React hooks
│   └── use-role.ts        # Role management hooks
├── lib/                   # Utilities & helpers
│   ├── auth/              # Authorization utilities
│   ├── supabase/          # Supabase clients
│   └── types/             # TypeScript types
├── supabase/              # Database & backend
│   └── migrations/        # SQL migration files
└── public/                # Static assets
```

## Development Commands

```bash
# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Type checking
npx tsc --noEmit
```

## Deployment

### Vercel (Recommended)

The easiest way to deploy is using the [Vercel Platform](https://vercel.com/new):

1. Push your code to GitHub/GitLab/Bitbucket
2. Import your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The app can be deployed to any platform supporting Next.js:
- Netlify
- Railway
- AWS
- Digital Ocean
- Self-hosted with Node.js

See [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for details.

## Environment Variables

Required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=     # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY= # Your Supabase anonymous key
```

These can be found in your Supabase project settings under API.

## Additional Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features
- [Supabase Documentation](https://supabase.com/docs) - Backend & database guide
- [shadcn/ui Components](https://ui.shadcn.com/) - UI component library
- [Tailwind CSS](https://tailwindcss.com/docs) - Styling documentation

### Presentation Materials

[\[PowerPoint presentations\]](https://www.canva.com/design/DAG4KyqA2Qo/_CzmNlSuhxuyEAbPZit1Og/edit?utm_content=DAG4KyqA2Qo&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)  
[\[Photo Collection\]](https://drive.google.com/drive/folders/1Hirek0H0KSUvY5G045Q0RRww7YC8lTfW?usp=drive_link)
### Demo & Trial

[\[Signin signup link\]](https://butterfly-dusky.vercel.app/login)

## Security Considerations

- All authentication handled by Supabase with industry-standard security
- Row Level Security (RLS) policies enforce data access rules
- Server-side authorization checks prevent unauthorized access
- Environment variables keep sensitive credentials secure
- HTTPS encryption in production (via Vercel/hosting platform)

## Credits

Built with:
- [Next.js](https://nextjs.org/) by Vercel
- [React](https://react.dev/) by Meta
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [Tailwind CSS](https://tailwindcss.com/) by Tailwind Labs
- [shadcn/ui](https://ui.shadcn.com/) by shadcn
- [Lucide Icons](https://lucide.dev/) - Beautiful open source icons

## Support

For questions, issues, or feature requests:
- [\[GitHub Issues link\]](https://github.com/Butterfly-App/butterfly/issues)
- [\[Documentation site link\]](https://github.com/Butterfly-App/butterfly/issues)

---

**Note**: This application handles sensitive information about individuals with disabilities. Ensure all deployments comply with relevant data protection regulations (GDPR, HIPAA, etc.) in your jurisdiction.
