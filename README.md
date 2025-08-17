# CarBD - Car Dealership Platform

A modern, full-stack car dealership platform built with Next.js, Supabase, and TypeScript. Features include user authentication, car inventory management, shopping cart, favorites, and admin dashboard.

## Features

### User Features
- **Authentication**: Secure login/register with Supabase Auth
- **Car Browsing**: Search, filter, and sort cars by various criteria
- **Shopping Cart**: Add cars to cart with quantity management
- **Favorites**: Save cars for later viewing
- **Responsive Design**: Mobile-first design that works on all devices

### Admin Features
- **Dashboard**: Overview of inventory, users, and orders
- **Car Management**: Full CRUD operations for car inventory
- **Real-time Updates**: Live inventory updates across all users
- **Role-based Access**: Secure admin-only features

### Technical Features
- **Real-time**: Supabase real-time subscriptions for live updates
- **Security**: Row Level Security (RLS) policies
- **Performance**: Optimized queries and lazy loading
- **Type Safety**: Full TypeScript implementation

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: React Context API
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd carbd-platform
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up Supabase**
   - Create a new Supabase project
   - Copy your project URL and anon key
   - Run the database setup scripts in the Supabase SQL editor

4. **Environment Variables**
   Create a \`.env.local\` file:
   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   \`\`\`

5. **Database Setup**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the scripts in \`scripts/database-setup.sql\`
   - Optionally run \`scripts/sample-data.sql\` for sample data

6. **Create Admin User**
   - Register a new account through the app
   - In Supabase dashboard, go to Table Editor > profiles
   - Update the user's role from 'user' to 'admin'

7. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

### Tables

- **profiles**: User profiles with roles (user/admin)
- **cars**: Car inventory with details and stock
- **cart_items**: User shopping cart items
- **favorites**: User favorite cars

### Security

All tables use Row Level Security (RLS):
- Users can only access their own cart items and favorites
- Only admins can manage car inventory
- All users can view car listings

## API Routes

The application uses Supabase client-side SDK for all database operations. No custom API routes are needed.

## Deployment

### Vercel (Recommended)

1. **Deploy to Vercel**
   \`\`\`bash
   npm run build
   vercel --prod
   \`\`\`

2. **Set Environment Variables**
   Add your Supabase credentials in Vercel dashboard under Settings > Environment Variables.

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform

## Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   ├── admin/             # Admin dashboard
│   ├── cars/              # Car browsing pages
│   ├── cart/              # Shopping cart
│   └── favorites/         # User favorites
├── components/            # Reusable components
│   ├── admin/             # Admin-specific components
│   ├── cars/              # Car-related components
│   ├── home/              # Homepage components
│   ├── layout/            # Layout components
│   ├── providers/         # Context providers
│   └── ui/                # shadcn/ui components
├── lib/                   # Utility functions
│   ├── auth.ts            # Authentication helpers
│   └── supabase.ts        # Supabase client
└── scripts/               # Database setup scripts
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue on GitHub or contact the development team.
