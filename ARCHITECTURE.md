# StudentNest Architecture Documentation

## System Overview

StudentNest is an AI-powered student productivity suite that integrates multiple tools and services to provide a comprehensive learning and productivity platform. This document outlines the technical architecture, system components, and data flows within the application.

## Technical Stack

### Frontend Architecture
- **Core Framework**: React 18.3.1 with TypeScript 5.5.3
- **Build System**: Vite 6.2.0
- **Styling**: Tailwind CSS 3.4.1 with PostCSS
- **State Management**: React Context API
- **Routing**: React Router DOM 6.22.3

### Backend Services
- **Authentication**: Firebase Auth 11.3.1
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **AI Integration**: Google Generative AI (Gemini) 0.22.0

### Document Processing
- **PDF Generation**: @react-pdf/renderer 4.2.2
- **PDF Processing**: pdfjs-dist 4.10.38
- **Markdown Processing**: marked 15.0.7, react-markdown 10.0.0

## System Architecture Diagram

```
+--------------------------------------------------------------------------------------------------+
|                                        FRONTEND LAYER                                              |
|  +------------------+     +----------------------+      +----------------------+                    |
|  |  User Interface  | --> |   React Components   | <--> |  Context Providers   |                    |
|  +------------------+     +----------------------+      +----------------------+                    |
+--------------------------------------------------------------------------------------------------+
                                          ↓
+--------------------------------------------------------------------------------------------------+
|                                    AUTHENTICATION LAYER                                            |
|      +-------------------------+                  +-------------------------+                       |
|      |     Firebase Auth      | <------------->  |      Google OAuth       |                       |
|      +-------------------------+                  +-------------------------+                       |
+--------------------------------------------------------------------------------------------------+
                                          ↓
+--------------------------------------------------------------------------------------------------+
|                                    STATE MANAGEMENT                                                |
|  +------------------+     +----------------------+      +----------------------+                    |
|  |   Auth Context   | <-> |    API Key Context   | <--> |    Local Storage     |                    |
|  +------------------+     +----------------------+      +----------------------+                    |
+--------------------------------------------------------------------------------------------------+
                                          ↓
+--------------------------------------------------------------------------------------------------+
|                                       DATA LAYER                                                   |
|            +-------------------------+          +-------------------------+                         |
|            |       Firestore        | <------> |   Firebase Storage      |                         |
|            +-------------------------+          +-------------------------+                         |
+--------------------------------------------------------------------------------------------------+
                                          ↓
+--------------------------------------------------------------------------------------------------+
|                                      AI SERVICES                                                   |
|     +-------------------------+                   +-------------------------+                       |
|     |      Gemini AI         | <------------->   |     Jina.ai Service     |                       |
|     +-------------------------+                   +-------------------------+                       |
+--------------------------------------------------------------------------------------------------+
                                          ↓
+--------------------------------------------------------------------------------------------------+
|                                    EXPORT SERVICES                                                 |
|  +------------------+     +----------------------+      +----------------------+                    |
|  |  PDF Generator   | <-> |    Word Generator    | <--> |  Markdown Processor  |                    |
|  +------------------+     +----------------------+      +----------------------+                    |
+--------------------------------------------------------------------------------------------------+

```

## Component Architecture

```
+-------------------------------------------------------------------------+
|                           LAYOUT COMPONENTS                              |
|                                                                         |
|    +-------------+     +--------------+     +----------------+          |
|    |  Layout.tsx | --> | Sidebar.tsx  | --> | ProfileMenu.tsx |          |
|    +-------------+     +--------------+     +----------------+          |
|           ↓                                                            |
+-------------------------------------------------------------------------+
           ↓
+-------------------------------------------------------------------------+
|                        AUTHENTICATION COMPONENTS                         |
|                                                                         |
|    +------------------+     +---------------+    +----------------+     |
|    | ProtectedRoute.tsx| --> | LoginModal.tsx| -> | ApiKeyModal.tsx |     |
|    +------------------+     +---------------+    +----------------+     |
|           ↓                                                            |
+-------------------------------------------------------------------------+
           ↓
+-------------------------------------------------------------------------+
|                           TOOL COMPONENTS                                |
|                                                                         |
|    +------------------+     +----------------+    +----------------+    |
|    | DashboardCard.tsx | --> | PDFDocument.tsx| -> | MarkdownModal.tsx|    |
|    +------------------+     +----------------+    +----------------+    |
|           ↓                                                            |
+-------------------------------------------------------------------------+
           ↓
+-------------------------------------------------------------------------+
|                            UI COMPONENTS                                 |
|                                                                         |
|    +-----------+    +-----------+    +------------+    +-----------+   |
|    | Button.tsx| -> | Input.tsx | -> | TextArea.tsx| -> | toast.tsx |   |
|    +-----------+    +-----------+    +------------+    +-----------+   |
|                                                                         |
+-------------------------------------------------------------------------+

```

## User Flow Diagrams

### Authentication Flow
```
+--------+          +-----------+          +---------------+          +-----------+          +-----------+
| User   |          | Frontend  |          | Firebase Auth |          | Firestore |          | Gemini AI |
+--------+          +-----------+          +---------------+          +-----------+          +-----------+
    |                    |                        |                        |                      |
    | Access App         |                        |                        |                      |
    |------------------->|                        |                        |                      |
    |                    | Check Auth             |                        |                      |
    |                    |----------------------->|                        |                      |
    |                    |                        |                        |                      |
    |                    |                        |                        |                      |
Not Authenticated Flow:  |                        |                        |                      |
    |                    |<-----------------------|                        |                      |
    |                    | No Token               |                        |                      |
    |   Show Login Modal |                        |                        |                      |
    |<-------------------|                        |                        |                      |
    |                    |                        |                        |                      |
    | Click Google Login |                        |                        |                      |
    |------------------->|                        |                        |                      |
    |                    | Init Google Auth       |                        |                      |
    |                    |----------------------->|                        |                      |
    |                    |                        |                        |                      |
    |   Login Popup      |                        |                        |                      |
    |<--------------------------------------------|                        |                      |
    |                    |                        |                        |                      |
    | Provide Credentials|                        |                        |                      |
    |------------------------------------------>|                        |                      |
    |                    |                        |                        |                      |
    |                    |    Auth Token          |                        |                      |
    |                    |<-----------------------|                        |                      |
    |                    | Store Profile          |                        |                      |
    |                    |------------------------------------------>|                      |
    |                    |                        |                        |                      |
Already Authenticated:   |                        |                        |                      |
    |                    | Valid Token            |                        |                      |
    |                    |<-----------------------|                        |                      |
    |                    | Fetch User Data        |                        |                      |
    |                    |------------------------------------------>|                      |
    |                    |                        |                        |                      |
    |    Show Dashboard  |                        |                        |                      |
    |<-------------------|                        |                        |                      |
    |                    |                        |                        |                      |
    | Access AI Feature  |                        |                        |                      |
    |------------------->|                        |                        |                      |
    |                    | Check API Key          |                        |                      |
    |                    |-------------------------------------------------------->|
    |                    |                        |                        |                      |
No API Key Flow:        |                        |                        |                      |
    |                    |                        |                        |     Key Required     |
    |                    |<--------------------------------------------------------|
    |   Show API Modal   |                        |                        |                      |
    |<-------------------|                        |                        |                      |
    |                    |                        |                        |                      |
    | Provide API Key    |                        |                        |                      |
    |------------------->|                        |                        |                      |
    |                    | Store Encrypted Key    |                        |                      |
    |                    |------------------------------------------>|                      |
    |                    |                        |                        |                      |
```

### Tool Usage Flow
```
+--------+          +-----------+          +-----------+          +---------------+
| User   |          | Frontend  |          | Gemini AI |          | Export Service|
+--------+          +-----------+          +-----------+          +---------------+
    |                    |                      |                        |
    | Select Tool        |                      |                        |
    |------------------->|                      |                        |
    |                    | Validate API Key     |                        |
    |                    |-------------------->|                        |
    |                    |                      |                        |
    |                    |      Key Valid       |                        |
    |                    |<--------------------|                        |
    |                    |                      |                        |
    | Input Data         |                      |                        |
    |------------------->|                      |                        |
    |                    | Process with AI      |                        |
    |                    |-------------------->|                        |
    |                    |                      |                        |
    |                    | Generated Content    |                        |
    |                    |<--------------------|                        |
    |                    |                      |                        |
Export Options:          |                      |                        |
    |                    |                      |                        |
PDF Export:              |                      |                        |
    | Request PDF        |                      |                        |
    |------------------->|                      |                        |
    |                    | Generate PDF         |                        |
    |                    |---------------------------------------->|
    |     Download PDF   |                      |                        |
    |<-----------------------------------------------------------------------------------|
    |                    |                      |                        |
Word Export:             |                      |                        |
    | Request Word       |                      |                        |
    |------------------->|                      |                        |
    |                    | Generate DOCX        |                        |
    |                    |---------------------------------------->|
    |    Download DOCX   |                      |                        |
    |<-----------------------------------------------------------------------------------|
    |                    |                      |                        |
Markdown Copy:           |                      |                        |
    | Copy to Clipboard  |                      |                        |
    |------------------->|                      |                        |
    |    Copied Content  |                      |                        |
    |<-------------------|                      |                        |
    |                    |                      |                        |
```

## Data Flow Architecture

### API Key Management
1. **Storage Flow**
   - API keys are encrypted client-side
   - Stored in Firestore with user ID association
   - Retrieved and decrypted only when needed
   - Never exposed in client-side storage

2. **Usage Flow**
   - Keys are validated before each AI operation
   - Temporary session storage for active usage
   - Automatic cleanup on session end

### Document Generation
1. **Input Processing**
   - User input sanitization
   - Template selection
   - Section organization

2. **AI Processing**
   - Parallel content generation for sections
   - Content validation
   - Format verification

3. **Export Processing**
   - PDF generation with custom styling
   - Word document formatting
   - Markdown compilation

## Security Architecture

### Authentication Security
- JWT token-based authentication
- Secure session management
- Role-based access control
- OAuth2.0 implementation

### Data Security
- End-to-end encryption for sensitive data
- Secure key storage
- HTTPS-only communication
- XSS protection
- CSRF protection

### API Security
- Rate limiting
- Request validation
- Error handling
- Audit logging

## Error Handling Architecture

### Frontend Error Handling
- Global error boundary
- Component-level error handling
- User-friendly error messages
- Automatic retry mechanism

### API Error Handling
- Status code standardization
- Error response formatting
- Retry policies
- Fallback mechanisms

## Performance Optimization

### Frontend Optimization
- Code splitting
- Lazy loading
- Image optimization
- Caching strategies

### API Optimization
- Request batching
- Response compression
- Connection pooling
- Cache management

## Monitoring and Logging

### Application Monitoring
- Performance metrics
- Error tracking
- User analytics
- Resource utilization

### Security Monitoring
- Auth attempts logging
- API usage monitoring
- Suspicious activity detection
- Automated alerts

## Deployment Architecture

### Production Environment
- Vercel deployment
- CDN integration
- Environment configuration
- Build optimization

### Development Environment
- Local development setup
- Testing environment
- Staging environment
- CI/CD pipeline

## Future Architecture Considerations

### Scalability
- Microservices architecture
- Load balancing
- Database sharding
- Caching layers

### Integration
- Additional AI models
- Third-party services
- API gateway
- Message queues

### Features
- Real-time collaboration
- Mobile application
- Offline support
- Advanced analytics

---

This architecture documentation is maintained and updated regularly to reflect the current state of the StudentNest application. For any questions or clarifications, please refer to the development team. 