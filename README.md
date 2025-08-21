# Geffter Web App - Custom Countertop Quote Generator

A modern web application for generating custom countertop quotes for kitchens and bathrooms. Built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Features

### Multi-Step Quote Generation Flow
1. **Homepage** - Landing page with call-to-action
2. **Room Selection** - Choose between Kitchen or Bathroom
3. **Layout Selection** - Select countertop shapes (L-shape, U-shape, Straight, Island, etc.)
4. **Measurements** - Dynamic measurement inputs with wall toggles and backsplash options
5. **Material Selection** - Choose from various countertop materials
6. **Edge Selection** - Select edge styles for non-wall measurements
7. **Project Summary** - Final quote with pricing breakdown

### Key Features
- **Responsive Design** - Works perfectly on mobile and desktop
- **Dynamic SVG Rendering** - Real-time measurement visualization
- **Auto-Calculation Engine** - Automatic pricing based on area and materials
- **State Management** - Persistent project state using Zustand
- **Modern UI/UX** - Beautiful animations and smooth transitions
- **Project Summary** - Collapsible project details throughout the flow

### Technical Features
- **TypeScript** - Full type safety
- **Next.js 14** - App Router with server-side rendering
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Zustand** - Lightweight state management
- **Lucide React** - Beautiful icons

## 📱 Mobile-First Design

The application is designed with mobile-first principles and provides an excellent user experience on:
- Smartphones (iOS/Android)
- Tablets
- Desktop computers

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gefter-web-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
gefter-web-app/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page component
├── components/            # React components
│   ├── HomePage.tsx       # Landing page
│   ├── RoomSelection.tsx  # Room type selection
│   ├── LayoutSelection.tsx # Shape selection
│   ├── MeasurementsPage.tsx # Measurement inputs
│   ├── MaterialSelection.tsx # Material selection
│   ├── EdgeSelection.tsx  # Edge style selection
│   └── ProjectSummary.tsx # Final quote summary
├── store/                 # State management
│   └── useProjectStore.ts # Zustand store
├── types/                 # TypeScript types
│   └── index.ts           # Type definitions
├── data/                  # Mock data
│   └── mockData.ts        # Sample data for development
└── public/                # Static assets
```

## 🎯 How It Works

### 1. User Flow
1. User lands on homepage and clicks "Get Started"
2. Selects room type (Kitchen/Bathroom)
3. Chooses one or more countertop shapes
4. Enters measurements for each shape with wall toggles
5. Selects material for all shapes
6. Chooses edge style for non-wall measurements
7. Reviews final quote and can download/share

### 2. Pricing Calculation
- **Material Cost**: Area (sq ft) × Material price per sq ft
- **Edge Cost**: Non-wall perimeter × Edge price per linear ft
- **Backsplash Cost**: Perimeter × Height × Material price per sq ft
- **Total**: Sum of all costs

### 3. State Management
- Uses Zustand for persistent state management
- Stores all user selections and measurements
- Automatically calculates pricing in real-time
- Maintains state across browser sessions

## 🎨 Design System

### Colors
- **Primary**: Blue (#0ea5e9)
- **Gray Scale**: 50-900 range
- **Success**: Green (#10b981)
- **Warning**: Yellow (#f59e0b)
- **Error**: Red (#ef4444)

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700

### Components
- **Cards**: Rounded corners, subtle shadows
- **Buttons**: Consistent styling with hover states
- **Inputs**: Focus states with blue ring
- **Toggles**: Smooth sliding animations

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file for environment-specific settings:

```env
NEXT_PUBLIC_APP_NAME=Geffter
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Tailwind Configuration
The app uses a custom Tailwind configuration with:
- Custom color palette
- Responsive breakpoints
- Custom font family

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Deploy automatically

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- DigitalOcean App Platform
- Railway

## 📊 Database Integration

The current version uses mock data. To integrate with a real database:

1. **Update data sources** in `data/mockData.ts`
2. **Add API routes** in `app/api/`
3. **Update store** to fetch from API
4. **Add authentication** if required

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support or questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- [ ] Real database integration
- [ ] User authentication
- [ ] PDF quote generation
- [ ] Email quote sharing
- [ ] Advanced pricing rules
- [ ] 3D visualization
- [ ] Installation scheduling
- [ ] Payment integration 