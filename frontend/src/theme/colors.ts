// ── Color Token System ────────────────────────────────────────────────────────

export interface Colors {
  // Backgrounds
  bg:              string;   // main screen background
  bgSecondary:     string;   // secondary bg, input areas
  surface:         string;   // card / sheet backgrounds
  surfaceElevated: string;   // elevated cards

  // Borders
  border:          string;
  borderLight:     string;

  // Text
  textPrimary:     string;
  textSecondary:   string;
  textMuted:       string;

  // Accents (same in both modes)
  accent:          string;   // purple #6C5CE7
  accentAlt:       string;   // teal #00BFA6

  // Tab bar
  tabBar:          string;
  tabBarBorder:    string;

  // Status bar style
  statusBar:       'light' | 'dark';

  // Cork board (Vision Board)
  corkBg:          string;
  corkHeader:      string;
  corkTaskBar:     string;

  // Specific
  heroCard:        string;  // Home hero card gradient start
  inputBg:         string;  // Chat input background
}

export const lightColors: Colors = {
  bg:              '#F3F4FD',
  bgSecondary:     '#F8F9FF',
  surface:         '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  border:          '#E2E8F0',
  borderLight:     '#F1F5F9',
  textPrimary:     '#1E293B',
  textSecondary:   '#64748B',
  textMuted:       '#94A3B8',
  accent:          '#6C5CE7',
  accentAlt:       '#00BFA6',
  tabBar:          '#FFFFFF',
  tabBarBorder:    '#F1F3F9',
  statusBar:       'dark',
  corkBg:          '#C68B59',
  corkHeader:      '#8B4513',
  corkTaskBar:     '#7F4F24',
  heroCard:        '#F0EEFF',
  inputBg:         '#F3F4FD',
};

export const darkColors: Colors = {
  bg:              '#0E0E1A',
  bgSecondary:     '#13131F',
  surface:         '#1A1B2E',
  surfaceElevated: '#232440',
  border:          '#2D2E4A',
  borderLight:     '#252644',
  textPrimary:     '#EEEEFF',
  textSecondary:   '#8B8CB0',
  textMuted:       '#5C5B94',
  accent:          '#8779F5',   // slightly brighter purple for dark bg
  accentAlt:       '#00D4BA',   // slightly brighter teal for dark bg
  tabBar:          '#13131F',
  tabBarBorder:    '#1E1F35',
  statusBar:       'light',
  corkBg:          '#5A3010',   // dark mahogany cork
  corkHeader:      '#2E1505',   // very dark wood
  corkTaskBar:     '#3A1D08',   // dark wood task bar
  heroCard:        '#1C1B35',
  inputBg:         '#1A1B2E',
};
