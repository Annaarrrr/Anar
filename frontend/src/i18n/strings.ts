import { Language } from '../types';

// ── Translations ─────────────────────────────────────────────────────────────
export interface StringSet {
  // Navigation
  nav_home:     string;
  nav_chat:     string;
  nav_vision:   string;
  nav_progress: string;

  // Settings
  settings_title:        string;
  settings_appearance:   string;
  settings_language:     string;
  settings_theme:        string;
  settings_lang_ar:      string;
  settings_lang_en:      string;
  settings_theme_light:  string;
  settings_theme_dark:   string;
  settings_account:      string;
  settings_logout:       string;
  settings_logout_msg:   string;

  // Home
  home_today:            string;
  home_greeting:         string;
  home_welcome_msg:      string;
  home_goal_active:      string;
  home_tasks_done:       string;
  home_view_tasks:       string;
  home_my_goals:         string;
  home_goal_details:     string;
  home_new_goal:         string;
  home_stat_streak:      string;
  home_stat_tasks:       string;
  home_stat_time:        string;
  home_active_pill:      string;
  home_cta_msg:          string;
  home_cta_btn:          string;
  home_mascot_msg:       string;

  // Chat
  chat_title:            string;
  chat_online:           string;
  chat_placeholder:      string;
  chat_goal_proposed:    string;
  chat_pin_desc:         string;
  chat_edit_goal:        string;
  chat_accept_goal:      string;
  chat_edit_placeholder: string;
  chat_cancel:           string;
  chat_save:             string;
  chip_study:            string;
  chip_skill:            string;
  chip_time:             string;

  // Vision Board
  vision_title:         string;
  vision_today_task:    string;
  vision_journey_btn:   string;
  vision_tap_journey:   string;
  vision_task_count:    string;
  vision_new_goal:      string;
  vision_progress:      string;
  vision_total_tasks:   string;
  vision_empty_title:   string;
  vision_empty_text:    string;
  vision_empty_btn:     string;
  vision_mascot_single: string;
  vision_mascot_multi:  string;
  vision_task_done:     string;

  // Journey Map
  journey_title:    string;
  journey_finish:   string;
  journey_start:    string;
  journey_now:      string;
  journey_done:     string;
  journey_locked:   string;
  journey_pre_done: string;
  journey_lock_msg: string;
  journey_more:     string;
  journey_view_all: string;

  // Common
  tasks:  string;
  error:  string;
  cancel: string;
  save:   string;
}

export const strings: Record<Language, StringSet> = {
  ar: {
    nav_home:     'الرئيسية',
    nav_chat:     'المحادثة',
    nav_vision:   'لوحة الرؤية',
    nav_progress: 'تقدمي',

    settings_title:        'الإعدادات',
    settings_appearance:   'المظهر',
    settings_language:     'اللغة',
    settings_theme:        'الثيم',
    settings_lang_ar:      'العربية',
    settings_lang_en:      'English',
    settings_theme_light:  'فاتح',
    settings_theme_dark:   'داكن',
    settings_account:      'الحساب',
    settings_logout:       'تسجيل الخروج',
    settings_logout_msg:   'هل تريد تسجيل الخروج من حسابك؟',

    home_today:            'اليوم',
    home_greeting:         'أهلاً بك 👋',
    home_welcome_msg:      'مرحباً بك في أنار! أنا مرشدك الذكي ومساعدك في التخطيط لنجاحك. دعنا نحدد أول أهدافك معاً! 💡',
    home_goal_active:      '⚡ الهدف الحالي',
    home_tasks_done:       'من {t} مهام مكتملة',
    home_view_tasks:       'عرض المهام',
    home_my_goals:         'أهدافي النشطة',
    home_goal_details:     'تفاصيل الهدف',
    home_new_goal:         'هدف جديد؟',
    home_stat_streak:      'النشاط',
    home_stat_tasks:       'المهام',
    home_stat_time:        'الوقت',
    home_active_pill:      'نشط',
    home_cta_msg:          'ابدأ التحدث مع المرشد الذكي',
    home_cta_btn:          'تحدث مع المرشد',
    home_mascot_msg:       'رائع! لديك أهداف نشطة لتنجزها اليوم. دعنا نضيئها معاً! ⚡',

    chat_title:            'المرشد الذكي',
    chat_online:           'متصل الآن',
    chat_placeholder:      'اكتب رسالتك...',
    chat_goal_proposed:    'هدف مقترح',
    chat_pin_desc:         'سيتم تثبيته كبطاقة في لوحة الرؤية وإنشاء خريطة رحلة مخصصة لك 📌',
    chat_edit_goal:        'تعديل الهدف',
    chat_accept_goal:      'نعم، اعتمد الهدف',
    chat_edit_placeholder: 'عدل نص الهدف المكتوب أعلاه ثم احفظه',
    chat_cancel:           'إلغاء',
    chat_save:             'حفظ',
    chip_study:            'دراستي',
    chip_skill:            'تطوير مهارة',
    chip_time:             'تنظيم الوقت',

    vision_title:         'لوحتي البصرية',
    vision_today_task:    'مهمة اليوم',
    vision_journey_btn:   'الرحلة',
    vision_tap_journey:   'اضغط للرحلة ←',
    vision_task_count:    'مهام',
    vision_new_goal:      'هدف جديد',
    vision_progress:      'التقدم الإجمالي',
    vision_total_tasks:   'مهام',
    vision_empty_title:   'لوحتك فارغة!',
    vision_empty_text:    'تحدث مع المرشد الذكي لتثبيت أول هدف لك هنا',
    vision_empty_btn:     'ابدأ المحادثة',
    vision_mascot_single: 'رائع! هدفك الأول مثبت. اضغط عليه لعرض خريطة الرحلة 🗺️',
    vision_mascot_multi:  'لديك {n} أهداف! الاستمرارية هي سر النجاح ✨',
    vision_task_done:     '✓ أكملت جميع مهامك!',

    journey_title:    'خريطة رحلة',
    journey_finish:   'نهاية المسار',
    journey_start:    'البداية',
    journey_now:      'الآن ⚡',
    journey_done:     'مكتمل ✓',
    journey_locked:   'مقفل 🔒',
    journey_pre_done: '✓ هذه المرحلة مكتملة تلقائياً كجزء من الأساسيات',
    journey_lock_msg: 'أكمل مهام المرحلة الحالية أولاً لإلغاء القفل',
    journey_more:     '+ {n} مهام أخرى',
    journey_view_all: 'عرض خريطة المهام الكاملة',

    tasks:  'مهام',
    error:  'خطأ',
    cancel: 'إلغاء',
    save:   'حفظ',
  },

  en: {
    nav_home:     'Home',
    nav_chat:     'Chat',
    nav_vision:   'Vision Board',
    nav_progress: 'Progress',

    settings_title:        'Settings',
    settings_appearance:   'Appearance',
    settings_language:     'Language',
    settings_theme:        'Theme',
    settings_lang_ar:      'العربية',
    settings_lang_en:      'English',
    settings_theme_light:  'Light',
    settings_theme_dark:   'Dark',
    settings_account:      'Account',
    settings_logout:       'Log Out',
    settings_logout_msg:   'Are you sure you want to log out?',

    home_today:            'Today',
    home_greeting:         'Welcome back 👋',
    home_welcome_msg:      "Welcome to Anar! I'm your AI guide, here to help you plan your success. Let's set your first goal together! 💡",
    home_goal_active:      '⚡ Current Goal',
    home_tasks_done:       'of {t} tasks completed',
    home_view_tasks:       'View Tasks',
    home_my_goals:         'My Active Goals',
    home_goal_details:     'Goal Details',
    home_new_goal:         'New Goal?',
    home_stat_streak:      'Streak',
    home_stat_tasks:       'Tasks',
    home_stat_time:        'Time',
    home_active_pill:      'Active',
    home_cta_msg:          'Start chatting with your AI Guide',
    home_cta_btn:          'Chat with AI Guide',
    home_mascot_msg:       "Great! You have active goals to complete today. Let's light them up! ⚡",

    chat_title:            'AI Guide',
    chat_online:           'Online now',
    chat_placeholder:      'Type your message...',
    chat_goal_proposed:    'Proposed Goal',
    chat_pin_desc:         'This will be pinned as a card on your Vision Board with a custom journey map 📌',
    chat_edit_goal:        'Edit Goal',
    chat_accept_goal:      'Yes, Accept Goal',
    chat_edit_placeholder: 'Edit the goal text above, then save',
    chat_cancel:           'Cancel',
    chat_save:             'Save',
    chip_study:            'Study',
    chip_skill:            'Learn a Skill',
    chip_time:             'Time Management',

    vision_title:         'My Vision Board',
    vision_today_task:    "Today's Task",
    vision_journey_btn:   'Journey',
    vision_tap_journey:   'Tap for Journey →',
    vision_task_count:    'tasks',
    vision_new_goal:      'New Goal',
    vision_progress:      'Overall Progress',
    vision_total_tasks:   'tasks',
    vision_empty_title:   'Your board is empty!',
    vision_empty_text:    'Chat with the AI guide to pin your first goal here',
    vision_empty_btn:     'Start Chatting',
    vision_mascot_single: 'Great! Your first goal is pinned. Tap it to see your Journey Map 🗺️',
    vision_mascot_multi:  'You have {n} goals! Consistency is the secret to success ✨',
    vision_task_done:     '✓ All tasks done!',

    journey_title:    'Journey Map',
    journey_finish:   'End of Path',
    journey_start:    'Start',
    journey_now:      'Now ⚡',
    journey_done:     'Completed ✓',
    journey_locked:   'Locked 🔒',
    journey_pre_done: '✓ This stage is automatically completed as part of the basics',
    journey_lock_msg: 'Complete the current stage tasks first to unlock',
    journey_more:     '+ {n} more tasks',
    journey_view_all: 'View Full Task Map',

    tasks:  'tasks',
    error:  'Error',
    cancel: 'Cancel',
    save:   'Save',
  },
};
