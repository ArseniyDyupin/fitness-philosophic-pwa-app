# AI Trainer PWA

A Progressive Web App for offline-first fitness tracking with AI coaching capabilities.

## Features

- **Offline-First**: Works completely offline with IndexedDB storage
- **Workout Tracking**: Log and track various types of workouts with automatic calorie calculation
- **Food Logging**: Track daily nutrition intake
- **Weekly Check-ins**: Monitor progress with weight, measurements, and optional photos
- **AI Coaching**: Get personalized workout analysis and recommendations using OpenAI
- **PWA Support**: Install as a native app on mobile and desktop
- **Data Export/Import**: Backup and restore all your data

## Tech Stack

- **Frontend**: Vue 3 + TypeScript
- **State Management**: Pinia
- **Database**: IndexedDB (via Dexie)
- **UI**: Tailwind CSS + Headless UI
- **Forms**: vee-validate + zod
- **PWA**: vite-plugin-pwa
- **Date Handling**: date-fns
- **AI Integration**: OpenAI GPT-3.5

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-trainer-pwa
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### PWA Installation

1. Open the app in a supported browser (Chrome, Edge, Safari)
2. Look for the install prompt or use the browser's menu to "Install App"
3. The app will be installed and work offline

## Configuration

### AI Integration

To use AI features, you'll need an OpenAI API key:

1. Get an API key from [OpenAI](https://platform.openai.com/api-keys)
2. Go to Settings in the app
3. Enter your API key and test the connection

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_APP_TITLE=AI Trainer
VITE_APP_DESCRIPTION=Offline-first fitness tracking with AI coaching
```

## Usage

### First Time Setup

1. Complete the onboarding process to set up your profile
2. Configure your fitness goals and preferences
3. Set up AI integration (optional)

### Daily Usage

1. **Add Workouts**: Track your exercise sessions with automatic calorie calculation
2. **Log Food**: Record your daily nutrition intake
3. **Weekly Check-ins**: Monitor your progress with measurements and photos
4. **AI Analysis**: Get personalized recommendations for your next workout

### Data Management

- **Export**: Download all your data as a JSON file
- **Import**: Restore your data from a previously exported file
- **Reset**: Clear all data (use with caution)

## Project Structure

```
src/
├── app/                 # Main app files
├── components/          # Reusable Vue components
├── features/           # Feature-specific pages
│   ├── onboarding/     # Onboarding flow
│   ├── workout/        # Workout management
│   ├── food/           # Food logging
│   └── week/           # Weekly views
├── stores/             # Pinia stores
├── services/           # Business logic and external services
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── assets/             # Static assets
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

### Code Style

The project uses:
- ESLint for code linting
- Prettier for code formatting
- TypeScript for type safety

### Database Schema

The app uses IndexedDB with the following tables:
- `profiles` - User profile and preferences
- `workouts` - Workout sessions
- `foodLogs` - Food intake records
- `checkins` - Weekly progress check-ins
- `aiPlans` - AI-generated workout plans

## Testing

### Manual Test Cases

1. **Onboarding Flow**
   - Complete all onboarding steps
   - Verify profile is saved and editable

2. **Workout Management**
   - Create a workout (e.g., 30min run, weight 73kg)
   - Verify calorie calculation > 0
   - Edit and delete workouts

3. **AI Integration**
   - Set up API key
   - Evaluate a workout
   - Verify JSON response and PlanCard creation

4. **Food Logging**
   - Add food entries
   - Verify daily balance calculation

5. **Weekly Check-ins**
   - Add check-in with photo
   - Verify photo persists after reload

6. **Data Export/Import**
   - Export data to JSON
   - Import into empty database
   - Verify data integrity

7. **PWA Features**
   - Install as PWA
   - Test offline functionality
   - Verify cached routes work

## Limitations

- No cloud backup/sync (data is local only)
- No integrations with Health/Strava
- No streaming AI responses
- No complex periodization/calendar features

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

## Roadmap

- [ ] Cloud backup/sync
- [ ] Health app integrations
- [ ] Advanced analytics
- [ ] Social features
- [ ] Custom workout templates
- [ ] Nutrition database integration
