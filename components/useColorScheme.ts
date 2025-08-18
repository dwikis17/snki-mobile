// Force light theme - always return 'light' instead of system theme
export function useColorScheme(): 'light' | 'dark' {
    return 'light';
}
