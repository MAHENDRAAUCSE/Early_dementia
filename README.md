# Detect Neural Dementia

AI-Powered Health Assessment Platform - Simplified cognitive screening and health monitoring.

## Overview

Detect Neural Dementia provides comprehensive AI-powered health assessment that evaluates cognitive function using speech analysis and memory/attention tasks. Our platform makes early detection of cognitive changes accessible to everyone through affordable, user-friendly screening tools.

## Features

- **AI-Powered Assessment**: Advanced speech analysis and cognitive task evaluation
- **Memory Testing**: Word recall and retention assessments
- **Attention Tasks**: Number sequence and pattern recognition tests
- **Speech Analysis**: Voice pattern recognition and analysis
- **Real-time Results**: Immediate assessment feedback and scoring
- **Profile Management**: Complete user profile and assessment history
- **Local Data Storage**: All data stored securely in browser localStorage
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Technology Stack

- **Frontend**: React + TypeScript + Vite
- **Data Storage**: Browser localStorage (no backend required)
- **UI Components**: Tailwind CSS + shadcn/ui
- **Build Tool**: Vite for fast development and production builds

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Access the application at `http://localhost:8080`

## Project Structure

```
guardian-medics/
├── client/                 # React frontend application
│   ├── components/        # Reusable UI components (shadcn/ui)
│   ├── pages/            # Application pages/screens
│   ├── hooks/            # Custom React hooks
│   └── lib/              # Utility functions
├── public/               # Static assets
└── index.html           # Application entry point
```

## Assessment Components

### Memory Test
- Word recall tasks with increasing difficulty
- Immediate and delayed recall testing
- Scoring based on accuracy and retention

### Speech Analysis
- Voice pattern recognition using Web Audio API
- Speech clarity assessment
- Pause detection and speaking ratio analysis

### Attention Tasks
- Number sequence memorization
- Pattern recognition tests
- Response time measurement

## Data Storage

All user data is stored locally in the browser using localStorage:
- **User Profiles**: Personal information and settings
- **Assessment History**: Complete record of all assessments
- **Session Data**: Current assessment progress
- **No Backend Required**: Fully client-side application

## Browser Compatibility

- Chrome 80+ (recommended)
- Firefox 75+
- Safari 14+
- Edge 80+

*Note: Microphone access required for speech analysis features*

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and ensure code quality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact the Detect Neural Dementia team.
