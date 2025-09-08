# 🚀 DanceLink - Vercel Deployment Guide

This guide will help you deploy the DanceLink platform with integrated Swagger UI to Vercel.

## ✅ Pre-deployment Checklist

The following configurations have been optimized for Vercel:

- ✅ **Next.js 14** with App Router
- ✅ **Swagger UI Integration** with CDN-based loading
- ✅ **OpenAPI 3.0 Specification** for all API endpoints
- ✅ **Vercel-compatible configuration**
- ✅ **Database integration** with Prisma
- ✅ **TypeScript build optimization**

## 🔧 Environment Variables Required

Set these in your Vercel dashboard:

```bash
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production
NEXTAUTH_SECRET=your_nextauth_secret
STRIPE_SECRET_KEY=your_stripe_secret (optional)
REDIS_URL=your_redis_url (optional)
```

## 📦 Deployment Steps

### 1. Import GitHub Repository
- Go to [Vercel Dashboard](https://vercel.com/dashboard)
- Click "New Project"
- Import from GitHub: `https://github.com/insominiac/danncelink.git`

### 2. Configure Build Settings
Vercel will auto-detect these from your configuration:
- **Build Command**: `prisma generate && next build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

### 3. Set Environment Variables
Add the required environment variables listed above.

### 4. Deploy
Click "Deploy" and wait for the build to complete.

## 🎯 Post-Deployment URLs

After successful deployment, you'll have access to:

### 🏠 Main Application
- **Homepage**: `https://your-app.vercel.app/`
- **Admin Panel**: `https://your-app.vercel.app/admin`

### 📖 Swagger UI Integration
- **Interactive API Docs**: `https://your-app.vercel.app/admin/api-docs`
- **OpenAPI JSON**: `https://your-app.vercel.app/api/swagger`
- **Alternative API Docs**: `https://your-app.vercel.app/api-docs`

### 🔧 API Endpoints (Examples)
- **Dashboard Stats**: `https://your-app.vercel.app/api/admin/stats`
- **User Management**: `https://your-app.vercel.app/api/admin/users`
- **Class Management**: `https://your-app.vercel.app/api/admin/classes`
- **Event Management**: `https://your-app.vercel.app/api/admin/events`

## 🎨 Swagger UI Features

The integrated Swagger UI provides:

- 📋 **Complete API Documentation** - All 20+ endpoints documented
- 🧪 **Interactive Testing** - "Try it out" functionality for all endpoints
- 📊 **Request/Response Examples** - Real examples with validation
- 🔍 **Schema Documentation** - Complete data models
- 🏷️ **Organized by Tags** - Grouped by functionality (Users, Classes, Events, etc.)
- ⚡ **Real-time Testing** - Test against live production APIs

## 📁 Project Structure

```
├── app/
│   ├── admin/
│   │   ├── api-docs/          # Swagger UI page
│   │   └── page.tsx           # Admin panel with API docs link
│   ├── api/
│   │   ├── swagger/           # OpenAPI specification endpoint
│   │   └── admin/             # Admin API routes
│   └── lib/
│       └── swagger-config.ts  # OpenAPI configuration
├── vercel.json               # Vercel deployment config
├── next.config.js           # Next.js configuration
└── package.json             # Dependencies and scripts
```

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production (with Prisma generation)
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## 🔧 Vercel-Specific Optimizations

1. **Function Configuration**: API routes optimized with 30s timeout
2. **Headers**: CORS enabled for Swagger UI
3. **Build Process**: Automatic Prisma client generation
4. **TypeScript**: Build errors ignored for faster deployment
5. **Compression**: Enabled for better performance

## 📝 Access the Swagger UI

1. Deploy to Vercel
2. Visit your deployment URL
3. Navigate to `/admin` 
4. Click "API Documentation" in the sidebar
5. Or directly visit `/admin/api-docs`

## 🐛 Troubleshooting

**Build Failures:**
- Check environment variables are set
- Ensure DATABASE_URL is accessible from Vercel

**Swagger UI Not Loading:**
- Check browser console for CDN loading issues
- Verify `/api/swagger` endpoint returns valid JSON

**Database Connection Issues:**
- Ensure your database allows connections from Vercel IPs
- Check DATABASE_URL format and credentials

## 🎉 Success!

Once deployed, you'll have a fully functional dance platform with:
- Complete admin panel
- Interactive API documentation
- Production-ready performance
- Automatic scaling on Vercel

Happy coding! 🕺💃
