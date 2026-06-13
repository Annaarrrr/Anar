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
  bg:              '#FFFDF4', // warm vintage sketchbook paper
  bgSecondary:     '#FAF3E5', // lightly toasted card paper
  surface:         '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  border:          '#2D211A', // thick dark espresso ink border
  borderLight:     '#E6DFD5', // softer paper folding lines
  textPrimary:     '#2D211A',
  textSecondary:   '#65534A', // warm cocoa ink
  textMuted:       '#9E8C82', // light clay ink
  accent:          '#FF9F43', // Anar Glowing Amber
  accentAlt:       '#8779F5', // Glowing Intellect Purple
  tabBar:          '#FFFFFF',
  tabBarBorder:    '#FAF3E5',
  statusBar:       'dark',
  corkBg:          '#C68B59',
  corkHeader:      '#8B4513',
  corkTaskBar:     '#7F4F24',
  heroCard:        '#FFF6EB', // soft glowing light amber card
  inputBg:         '#FAF3E5',
};

export const darkColors: Colors = {
  bg:              '#100E17', // deep twilight chalkboard
  bgSecondary:     '#181524', // dark chalkboard card background
  surface:         '#211E30', // elevated chalkboard surface
  surfaceElevated: '#2A263D',
  border:          '#2D2942', // chalkboard grid lines
  borderLight:     '#211E30',
  textPrimary:     '#FFF5EA', // bright cream chalk text
  textSecondary:   '#A39BBF', // soft pastel violet chalk text
  textMuted:       '#625D7E', // muted chalk lines
  accent:          '#FFB830', // radiant amber glow
  accentAlt:       '#A093FF', // neon violet glow
  tabBar:          '#100E17',
  tabBarBorder:    '#181524',
  statusBar:       'light',
  corkBg:          '#5A3010',
  corkHeader:      '#2E1505',
  corkTaskBar:     '#3A1D08',
  heroCard:        '#1B1728',
  inputBg:         '#181524',
};
