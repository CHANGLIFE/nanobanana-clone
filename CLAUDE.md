# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application for "Nano Banana", an AI-powered image editor landing page. The project demonstrates natural language image editing capabilities with a modern, responsive UI built with React 19, TypeScript, and Tailwind CSS.

## Development Commands

- `pnpm dev` - Start the development server (Next.js dev server)
- `pnpm build` - Build the production application
- `pnpm start` - Start the production server
- `pnpm lint` - Run ESLint checks

## Architecture & Structure

### Core Framework
- **Next.js 15** with App Router architecture
- **TypeScript** configuration with strict mode enabled
- **Tailwind CSS v4** for styling with custom animations
- **React 19** with hooks and modern patterns

### Project Layout
```
app/                  # Next.js App Router pages
  ├── layout.tsx     # Root layout with fonts and analytics
  ├── page.tsx       # Home page composing all sections
  └── globals.css    # Global styles and Tailwind imports

components/          # Reusable React components
  ├── *.tsx          # Landing page sections (hero, features, editor, etc.)
  ├── ui/            # Complete Radix UI component library (50+ components)
  └── theme-provider.tsx # Theme context provider

lib/                 # Utility functions and configurations
hooks/               # Custom React hooks
styles/              # Additional CSS/styling files
public/              # Static assets
```

### Component Architecture
The landing page follows a modular section-based architecture:
- Each major section (Hero, Features, Editor, etc.) is a separate component
- Components are composed in `app/page.tsx` to form the complete landing page
- UI components in `components/ui/` provide a complete design system using Radix UI primitives

### Key Technologies
- **UI Framework**: Comprehensive Radix UI component library (50+ components)
- **Form Handling**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS with class-variance-authority for component variants
- **Icons**: Lucide React icon set
- **Analytics**: Vercel Analytics integration
- **Theme**: next-themes for dark/light mode support

### Configuration Notes
- TypeScript paths configured with `@/*` alias pointing to root
- ESLint and TypeScript errors ignored during builds (configured in next.config.mjs)
- Images unoptimized for deployment flexibility
- Geist and Geist Mono fonts loaded from Google Fonts

### Editor Component
The central `Editor` component showcases the AI image editing functionality:
- Image upload and preview capabilities
- Text prompt input for natural language editing
- Two-column layout for input/output demonstration
- Uses File API for client-side image handling