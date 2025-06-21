import { createTheme } from '@mui/material/styles';

// 공통 컴포넌트 스타일 (컬러 종속성 제거)
const commonComponents = {
    MuiCardContent: {
        styleOverrides: {
            root: {
                paddingTop: 8,
                paddingBottom: 16,
                paddingLeft: 8,
                paddingRight: 16,
            },
        },
    },
    MuiChip: {
        styleOverrides: {
            root: {
                backgroundColor: '#333333',
                color: '#D5FF3F',
                borderRadius: 4,
                pointerEvents: 'none',
                fontSize: '0.75rem',
                height: 24,
            },
        },
    },
    MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
            root: {
                textTransform: 'none',
            },
            outlined: {
                borderRadius: 4,
                fontSize: '0.75rem',
                padding: '4px 12px',
            },
        },
    },
};

// 다크 테마
export const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: { main: '#D5FF3F', contrastText: '#000000' },
        secondary: { main: '#333333', contrastText: '#FFFFFF' },
        background: { default: '#121212', paper: '#1A1A1A' },
        text: { primary: '#FFFFFF', secondary: '#B0B0B0' },
    },
    shape: { borderRadius: 2 },
    spacing: 8,
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundColor: '#1A1A1A',
                    color: '#FFFFFF',
                    borderRadius: 2,
                    width: '100%',
                    maxWidth: 800,
                    margin: '0 auto',
                    overflow: 'hidden',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundColor: '#1A1A1A',
                    color: '#FFFFFF',
                },
            },
        },
        ...commonComponents,
    },
});

// 라이트 테마
export const lightTheme = createTheme({
    palette: {
        mode: 'light',
        primary: { main: '#497CFF', contrastText: '#FFFFFF' },
        secondary: { main: '#F3F4F6', contrastText: '#1F2937' },
        background: { default: '#F8FAFC', paper: '#FFFFFF' },
        text: { primary: '#1F2937', secondary: '#6B7280' },
        divider: '#E5E7EB',
    },
    shape: { borderRadius: 2 },
    spacing: 8,
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundColor: '#FAFAFA',
                    color: '#000000',
                    borderRadius: 2,
                    width: '100%',
                    maxWidth: 800,
                    margin: '0 auto',
                    overflow: 'hidden',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundColor: '#FAFAFA',
                    color: '#000000',
                },
            },
        },
        ...commonComponents,
    },
});

// 모드에 따라 테마 반환
export function getAppTheme(mode) {
    return mode === 'dark' ? darkTheme : lightTheme;
}