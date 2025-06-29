# StudentNest - AI-Powered Student Productivity Suite

StudentNest is a comprehensive web application designed to help students enhance their productivity using artificial intelligence. It provides six powerful tools that leverage Google's Gemini AI to assist with documentation, profile creation, note-taking, and content analysis.

## 🌟 What is StudentNest?

StudentNest is like having a smart AI assistant for all your academic and professional tasks. Whether you need to create project documentation, analyze websites, generate LinkedIn profiles, or organize notes, StudentNest makes it easy and efficient. Think of it as your personal productivity companion that understands what students need.

## 🎯 Who Should Use This?

- **Students** working on projects and assignments
- **Professionals** creating documentation and profiles
- **Researchers** analyzing websites and organizing information
- **Anyone** looking to streamline their content creation process

## 🚀 Key Features

### 1. **Project Document Maker**
   - Automatically generates comprehensive project documentation
   - Creates multiple sections like Abstract, Introduction, Methodology, etc.
   - Exports to PDF and Word formats
   - Uses AI to write professional, detailed content

### 2. **Website GPT**
   - Chat with any website using AI
   - Ask questions about website content
   - Get instant, intelligent responses
   - Perfect for research and content analysis

### 3. **LinkedIn Profile Tools**
   - **Profile Analyzer**: Get insights about your LinkedIn profile
   - **Summary Generator**: Create compelling LinkedIn summaries
   - Enhance your professional online presence

### 4. **GitHub Profile Maker**
   - Generate impressive GitHub README profiles
   - Showcase your skills and projects professionally
   - Stand out to potential employers

### 5. **AI Notes Writer**
   - Organize and structure your study notes
   - AI-powered content enhancement
   - Create well-formatted, comprehensive notes

### 6. **Integrated Dashboard**
   - Single platform for all tools
   - User-friendly interface
   - Secure authentication and data storage

## 🔧 Technical Modules & Dependencies

### **Core Framework & Build Tools**
- **React 18.3.1**: Modern JavaScript library for building user interfaces
- **TypeScript 5.5.3**: Adds static typing to JavaScript for better code quality
- **Vite 6.2.0**: Fast build tool and development server
- **Tailwind CSS 3.4.1**: Utility-first CSS framework for rapid UI development

### **Routing & Navigation**
- **React Router DOM 6.22.3**: Declarative routing for React applications
- Enables seamless navigation between different tools and pages

### **AI & Machine Learning**
- **Google Generative AI 0.22.0**: Integration with Google's Gemini AI models
- **Axios 1.8.1**: HTTP client for making API requests to external services

### **Authentication & Database**
- **Firebase 11.3.1**: Complete backend solution
  - **Firebase Auth**: Secure user authentication with Google Sign-in
  - **Firestore**: NoSQL database for storing user data and API keys
- **@firebase/auth 1.9.0**: Authentication module

### **Document Generation & Processing**
- **@react-pdf/renderer 4.2.2**: Generate PDF documents from React components
- **pdfjs-dist 4.10.38**: PDF parsing and rendering
- **file-saver 2.0.5**: Save generated files to user's device
- **marked 15.0.7**: Markdown parser and compiler

### **UI Components & Animations**
- **@headlessui/react 2.2.0**: Unstyled, accessible UI components
- **@radix-ui/react-***: Collection of low-level UI primitives
  - **@radix-ui/react-label 2.1.2**: Form labels
  - **@radix-ui/react-slot 1.1.2**: Component composition
  - **@radix-ui/react-toast 1.2.6**: Toast notifications
- **framer-motion 12.4.7**: Animation library for smooth transitions
- **lucide-react 0.330.0**: Beautiful icon library

### **Content Processing**
- **react-markdown 10.0.0**: Render Markdown content in React
- **remark-gfm 4.0.1**: GitHub Flavored Markdown plugin

### **Styling & Utilities**
- **styled-components 6.1.15**: CSS-in-JS styling solution
- **class-variance-authority 0.7.1**: Utility for creating variant-based components
- **clsx 2.1.1**: Utility for constructing className strings
- **tailwind-merge 2.6.0**: Merge Tailwind CSS classes efficiently
- **tailwindcss-animate 1.0.7**: Animation utilities for Tailwind

### **Development Tools**
- **ESLint 9.9.1**: Code linting and quality checking
- **PostCSS 8.4.35**: CSS transformation tool
- **Autoprefixer 10.4.18**: Automatically add vendor prefixes to CSS

## 🔄 Algorithm Flowchart & Application Flow

The application follows a structured flow from authentication to content generation:

```mermaid
graph TD
    A["User Opens StudentNest"] --> B{"User Authenticated?"}
    B -->|No| C["Show Login Modal"]
    C --> D["Firebase Google Auth"]
    D --> E["Store User Data"]
    E --> F["Load Dashboard"]
    
    B -->|Yes| F
    F --> G["Dashboard with 6 Tools"]
    
    G --> H["Select Tool"]
    H --> I{"API Key Available?"}
    I -->|No| J["Show API Key Modal"]
    J --> K["Save Encrypted API Key"]
    K --> L["Tool Interface"]
    
    I -->|Yes| L
    L --> M["User Input"]
    M --> N["Process with AI"]
    
    N --> O{"Tool Type"}
    O -->|Doc Maker| P["Generate Sections<br/>with Gemini AI"]
    O -->|Website GPT| Q["Fetch Website Content<br/>via Jina.ai"]
    O -->|LinkedIn Tools| R["Process LinkedIn Data<br/>with Gemini AI"]
    O -->|GitHub Profile| S["Generate GitHub Profile<br/>with Gemini AI"]
    O -->|Notes Writer| T["AI-Powered Note<br/>Organization"]
    
    P --> U["Markdown Content"]
    Q --> V["AI Website Analysis"]
    R --> W["Profile Insights"]
    S --> X["GitHub README"]
    T --> Y["Structured Notes"]
    
    U --> Z["Export Options"]
    V --> AA["Chat Interface"]
    W --> Z
    X --> Z
    Y --> Z
    
    Z --> BB["PDF/Word Export"]
    Z --> CC["Copy to Clipboard"]
    Z --> DD["Preview Mode"]
```

## 🏗️ Detailed Architecture Explanation

### **1. Authentication Layer**
```
User → Login Modal → Firebase Auth → Google OAuth → User Profile Storage
```
- Users authenticate via Google Sign-in through Firebase
- User data is securely stored in Firestore database
- Authentication state is managed globally using React Context

### **2. API Key Management**
```
User → API Key Modal → Encrypted Storage → Firebase Firestore → Secure Retrieval
```
- Gemini API keys are encrypted and stored per user
- Keys are retrieved securely when needed for AI operations
- Context API manages key state across the application

### **3. Document Generation Flow**
```
User Input → AI Processing → Markdown Generation → PDF/Word Export
```
- User provides project details (title, description, sections)
- Gemini AI generates content for each section sequentially
- Content is formatted in Markdown and converted to PDF/Word

### **4. Website Analysis Flow**
```
Website URL → Jina.ai Content Extraction → Gemini AI Analysis → Chat Interface
```
- Jina.ai service extracts clean text content from websites
- Gemini AI processes the content and user questions
- Real-time chat interface for interactive Q&A

### **5. Profile Generation Flow**
```
User Data → AI Prompt Engineering → Content Generation → Export Options
```
- Structured prompts guide AI to generate professional profiles
- Content is optimized for LinkedIn and GitHub platforms
- Multiple export formats available

## 📁 Project Structure

```
studentnextools/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components (buttons, modals, etc.)
│   │   └── Layout/         # Application layout components
│   ├── pages/              # Main application pages/tools
│   ├── lib/                # Utility libraries and contexts
│   │   ├── AuthContext.tsx # Authentication management
│   │   ├── ApiKeyContext.tsx # API key management
│   │   └── firebase.ts     # Firebase configuration
│   ├── utils/              # Utility functions
│   └── main.tsx           # Application entry point
├── public/                 # Static assets
└── package.json           # Dependencies and scripts
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager
- Google Gemini API key
- Firebase project

### Step-by-Step Setup

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd studentnextools
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   ```

4. **Get Your Gemini API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - You'll enter this in the app when first using any AI feature

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Build for Production**
   ```bash
   npm run build
   ```

## 🎮 How to Use

### **Getting Started**
1. Open the application in your browser
2. Sign in with your Google account
3. Enter your Gemini API key when prompted
4. Start using any of the six available tools

### **Tool-Specific Usage**

#### **Document Maker**
1. Enter your project title and description
2. Specify the sections you want (e.g., "Introduction, Methodology, Results")
3. Click "Generate Documentation"
4. Download as PDF or Word, or copy the Markdown

#### **Website GPT**
1. Enter any website URL
2. Ask questions about the website content
3. Get AI-powered insights and analysis
4. Continue the conversation with follow-up questions

#### **LinkedIn Tools**
1. **Analyzer**: Paste your LinkedIn profile text for insights
2. **Summary Generator**: Provide your background details for a professional summary

#### **GitHub Profile Maker**
1. Enter your personal and professional details
2. Generate a comprehensive README profile
3. Copy the Markdown to your GitHub profile

#### **Notes Writer**
1. Input your raw notes or study material
2. AI organizes and enhances the content
3. Export as formatted documents

## 🔒 Security Features

- **Encrypted API Key Storage**: All API keys are encrypted before storage
- **Firebase Security Rules**: Database access is restricted to authenticated users
- **HTTPS Only**: All communications are encrypted in transit
- **No Server-Side API Key Storage**: Keys remain with individual users

## 🌐 Deployment

The application is configured for deployment on Vercel with the included `vercel.json` configuration. It supports:
- Static site generation
- Client-side routing
- Environment variable management
- Automatic HTTPS

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed description
3. Include error messages and steps to reproduce

## 🎯 Future Enhancements

- Additional AI model support
- Collaborative features
- Mobile application
- Advanced export options
- Integration with more platforms

---

**Made with ❤️ for students by students**

Visit us at [StudentNest.in](https://studentnest.in) for more tools and resources!
