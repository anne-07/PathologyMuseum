# Pathology Learning Management System

A modern web application for pathology education featuring 3D specimens, digital slides, and comprehensive learning resources.

## Features

- Interactive 3D specimen viewer
- Digital slide viewer with annotations
- User authentication and progress tracking
- Responsive design with dark mode support

## Tech Stack

- Frontend: React.js with Tailwind CSS
- Backend: Node.js with Express
- Database: MongoDB
- Storage: Cloud Storage for specimens and slides

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Project Structure

```
src/
  ├── components/     # Reusable UI components
  ├── pages/         # Page components
  ├── context/       # React context providers
  ├── hooks/         # Custom React hooks
  ├── services/      # API service functions
  ├── utils/         # Utility functions
  └── assets/        # Static assets
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
REACT_APP_API_URL=your_api_url
REACT_APP_STORAGE_URL=your_storage_url
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
