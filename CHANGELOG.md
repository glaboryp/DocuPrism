# Changelog

All notable changes to DocuPrism will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-01-23

### Added
- **Toast Notification System**: Beautiful, accessible toast notifications for all user actions
  - Success, error, warning, and info message types
  - Auto-dismiss with configurable duration
  - Smooth animations and transitions
  - ARIA live regions for screen readers

- **Analysis History Page**: Complete history management interface
  - View all saved analyses with metadata
  - Search and filter capabilities
  - Delete individual or all analyses
  - Storage usage indicator
  - Detailed modal view for each analysis
  - Copy summaries directly from history

- **File Upload Support**: Drag-and-drop file upload functionality
  - Support for TXT, PDF, DOCX, and MD files
  - Drag-and-drop interface
  - File size validation (max 10MB)
  - Format validation with user-friendly errors
  - Visual feedback during upload
  - Automatic text extraction

- **Improved Error Handling**: Centralized error management system
  - Custom error types with error codes
  - Structured error logging
  - User-friendly error messages
  - Context-aware error handling
  - Centralized configuration for timeouts and constants

- **Enhanced Documentation**: Comprehensive README updates
  - Detailed setup instructions
  - Chrome AI enablement guide
  - Project structure documentation
  - Use cases and examples
  - Privacy and security information
  - Roadmap and contribution guidelines

### Changed
- **Architecture Improvements**: Migrated to Nuxt pages/layouts system
  - Created proper page routing structure
  - Implemented shared layout for consistency
  - Better code organization and separation of concerns

- **Type Safety**: Added TypeScript types for better type checking
  - Created `StoredAnalysis` type for storage
  - Improved type definitions across components
  - Better IDE support and autocomplete

- **Configuration**: Centralized application constants
  - Timeout configurations
  - Storage settings
  - File upload limits
  - Error messages
  - Success messages

### Fixed
- Removed hardcoded timeout values
- Improved offline detection and handling
- Better error messages for AI operations
- Fixed theme transition flash on page load

### Technical Improvements
- Added composable for toast notifications (`useToast`)
- Created error handling utilities (`errorHandler.ts`)
- Centralized constants (`config/constants.ts`)
- Improved code reusability with better component structure
- Enhanced accessibility with ARIA labels and roles

## [1.0.0] - 2025-01-15

### Added
- Initial release of DocuPrism
- On-device text summarization using Chrome Built-in AI
- Multiple summary types (TL;DR, Key Points, Teaser, Headline)
- Configurable summary length (Short, Medium, Long)
- Format options (Plain Text, Markdown)
- Multi-language support with automatic detection
- Dark mode with theme persistence
- PWA with offline support
- Local storage for analysis history
- Responsive design for all devices
- Privacy-first architecture

### Core Features
- Chrome Summarizer API integration
- Language Detection API integration
- Offline-first PWA capabilities
- Service worker for caching
- Theme toggle with system preference detection
- AI requirements modal for unsupported browsers

---

## Legend

- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security improvements
