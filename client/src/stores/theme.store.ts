import { create } from 'zustand';

interface ThemeState {
    isDark: boolean;
    toggleTheme: () => void;
}

// ── Apply theme to DOM and localStorage ──────────────────────────────────────
function applyTheme(isDark: boolean) {
    if (isDark) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

const savedIsDark = localStorage.getItem('theme') === 'dark';

applyTheme(savedIsDark);

export const useThemeStore = create<ThemeState>(() => ({
    isDark: savedIsDark,

    toggleTheme: () => {
        // Read current state directly — no set needed for reading
        const newIsDark = !useThemeStore.getState().isDark;

        // Apply to DOM + save to localStorage
        applyTheme(newIsDark);

        // Update Zustand state → triggers re-renders
        useThemeStore.setState({ isDark: newIsDark });
    },
}));
