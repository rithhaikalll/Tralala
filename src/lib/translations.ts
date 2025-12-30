export type Language = 'en' | 'ms';

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    nav_home: "Home",
    nav_discuss: "Discuss",
    nav_book: "Book",
    nav_activity: "Activity",
    nav_profile: "Profile",

    // Home
    welcome_back: "Welcome back",
    upcoming_booking: "UPCOMING BOOKING",
    no_upcoming: "No upcoming bookings yet",
    view_all: "View All",
    recommended: "Recommended for you",
    popular_tag: "Popular this week",
    good_availability: "Good availability today",
    track_activity: "Track Your Sports Activities",
    track_desc: "Record activities and earn validated hours",
    record_btn: "Record",
    news_title: "Campus sports news",
    
    // Stats
    stat_total_hours: "Total Hours",
    stat_validated: "Validated",
    stat_pending: "Pending",
    stat_rejected: "Rejected",
    
    // Booking
    book_facility: "Book Facility",
    my_bookings: "My Bookings",
    cancel_booking: "Cancel Booking",
    confirm_booking: "Confirm Booking",
    check_in_code: "Check-In Code",
    
    // Profile & Settings
    settings: "Settings",
    interface_settings: "Interface Settings",
    theme_mode: "Display Mode",
    theme_light: "Light",
    theme_dark: "Dark",
    theme_color: "Accent Color",
    language: "Language",
    help_support: "Help & Support",
    sign_out: "Sign Out",
    log_out_confirm: "Are you sure you want to log out?",
    cancel: "Cancel",
    save: "Save",
    default: "Default",
    custom: "Custom",
    activity_history: "Activity History",

    // Interface Settings
    rearrange_dashboard: "Rearrange Dashboard",
    reorder_navigation: "Reorder Navigation",
    save_arrangements: "Save Arrangements",
    reset_default: "Reset to Default",
    dashboard_widgets: "Dashboard Widgets",
    navigation_items: "Navigation Items",
    drag_instruction: "Drag and drop items to reorder",
    
    // Widget Names
    widget_upcoming: "Upcoming Booking",
    widget_recommended: "Recommended Facility",
    widget_tracking: "Activity Tracking",
    widget_news: "Campus News",

    activity_details: "Activity Details",
    activity_name: "Activity Name",
    activity_type: "Activity Type",
    date: "Date",
    duration: "Duration",
    remark: "Remark",
    status: "Status",
    loading: "Loading activity details...",
    not_found: "Activity not found.",
    eventDate: "Event Date",
    open: "Open",
    closed: "Closed",
    full: "Full",
    unregister: "Left Event",
    register: "Register Event",
    no_participants: "No Participants",
  },
  ms: {
    // Navigation
    nav_home: "Utama",
    nav_discuss: "Bincang",
    nav_book: "Tempah",
    nav_activity: "Aktiviti",
    nav_profile: "Profil",

    // Home
    welcome_back: "Selamat kembali",
    upcoming_booking: "TEMPAHAN AKAN DATANG",
    no_upcoming: "Tiada tempahan akan datang",
    view_all: "Lihat Semua",
    recommended: "Disyorkan untuk anda",
    popular_tag: "Popular minggu ini",
    good_availability: "Kekosongan banyak hari ini",
    track_activity: "Jejak Aktiviti Sukan Anda",
    track_desc: "Rekod aktiviti dan dapatkan jam yang disahkan",
    record_btn: "Rekod",
    news_title: "Berita sukan kampus",

    // Stats
    stat_total_hours: "Jumlah Jam",
    stat_validated: "Disahkan",
    stat_pending: "Menunggu",
    stat_rejected: "Ditolak",

    // Booking
    book_facility: "Tempah Fasiliti",
    my_bookings: "Tempahan Saya",
    cancel_booking: "Batal Tempahan",
    confirm_booking: "Sahkan Tempahan",
    check_in_code: "Kod Daftar Masuk",

    // Profile & Settings
    settings: "Tetapan",
    interface_settings: "Tetapan Antaramuka",
    theme_mode: "Mod Paparan",
    theme_light: "Cerah",
    theme_dark: "Gelap",
    theme_color: "Warna Tema",
    language: "Bahasa",
    help_support: "Bantuan & Sokongan",
    sign_out: "Log Keluar",
    log_out_confirm: "Adakah anda pasti mahu log keluar?",
    cancel: "Batal",
    save: "Simpan",
    default: "Lalai",
    custom: "Tersuai",
    activity_history: "Sejarah Aktiviti",

    // Interface Settings
    rearrange_dashboard: "Susun Semula Papan Pemuka",
    reorder_navigation: "Susun Semula Navigasi",
    save_arrangements: "Simpan Susunan",
    reset_default: "Tetapkan Semula",
    dashboard_widgets: "Widget Papan Pemuka",
    navigation_items: "Item Navigasi",
    drag_instruction: "Seret dan lepas item untuk menyusun semula",

    // Widget Names
    widget_upcoming: "Tempahan Akan Datang",
    widget_recommended: "Fasiliti Disyorkan",
    widget_tracking: "Jejak Aktiviti",
    widget_news: "Berita Kampus",

    activity_details: "Butiran Aktiviti",
    activity_name: "Nama Aktiviti",
    activity_type: "Jenis Aktiviti",
    date: "Tarikh",
    duration: "Tempoh",
    remark: "Catatan",
    status: "Status",
    loading: "Memuatkan butiran aktiviti...",
    not_found: "Aktiviti tidak dijumpai.",
    eventDate: "Tarikh Acara",
    open: "Terbuka",
    closed: "Ditutup",
    full: "Penuh",
    unregister: "Daftar Keluar",
    register: "Daftar Masuk",
    no_participants: "Tiada Peserta",
  }
};