# Project Structure & Best Practices

## Directory Structure

```
src/
├── components/     # Reusable UI components
├── screens/        # Screen components
├── navigation/     # Navigation configuration
├── hooks/          # Custom hooks
├── utils/          # Helper functions
├── services/       # API calls and external services
├── store/          # State management (Redux/Zustand)
├── types/          # TypeScript type definitions
└── constants/      # App constants
```

## Component Structure
- Use functional components with hooks.
- Keep components small and focused (under 200 lines).
- Extract custom logic into hooks (`src/hooks/`).
- Use TypeScript interfaces for props.

## File Naming
- **PascalCase** for components: `HeaderComponent.tsx`
- **camelCase** for utilities: `apiHelpers.ts`
- **kebab-case** for screens: `home-screen.tsx`

## Import Order
1. React/React Native imports
2. Third-party libraries
3. Local components/utilities
4. Type imports last

## Performance Rules
- Use `React.memo()` for expensive components.
- Use `useMemo()` and `useCallback()` for heavy computations.
- Use `FlatList` instead of `ScrollView` for large lists.
- Optimize images (format, size).

## State Management
- Keep state as close to where it's used as possible.
- Use context sparingly.
- Use Zustand or Redux Toolkit for complex state.

## Expo-Specific Rules
- Keep `app.json`/`app.config.js` clean and documented.
- Use environment variables for sensitive data.
- Configure proper app icons and splash screens.
- Prefer Expo SDK packages.
- Use `expo install` for dependencies.
- Test on both iOS and Android simulators.
- Use Expo Go for quick device testing.

## Code Quality Rules
- Wrap async operations in `try/catch`.
- Use error boundaries for component-level error handling.
- Implement proper loading and error states.
- Use `StyleSheet.create()` for styles.
- Consider a design system or UI library.
- Keep styles close to components or in separate style files.
- Use responsive design principles. 