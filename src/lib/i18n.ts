export interface LanguageVoiceConfig {
  code: string;
  name: string;
  nativeName: string;
  ttsLangCode: string;
  ttsVoiceName: string;
  speakingRate: number;
}

export const SUPPORTED_LANGUAGES: Record<string, LanguageVoiceConfig> = {
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    ttsLangCode: 'hi-IN',
    ttsVoiceName: 'hi-IN-Neural2-A',
    speakingRate: 1.05
  },
  en: {
    code: 'en',
    name: 'English (India)',
    nativeName: 'English',
    ttsLangCode: 'en-IN',
    ttsVoiceName: 'en-IN-Neural2-A',
    speakingRate: 1.05
  },
  bn: {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    ttsLangCode: 'bn-IN',
    ttsVoiceName: 'bn-IN-Chirp3-HD-Achernar',
    speakingRate: 1.0
  },
  mr: {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    ttsLangCode: 'mr-IN',
    ttsVoiceName: 'mr-IN-Chirp3-HD-Achernar',
    speakingRate: 1.0
  },
  gu: {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    ttsLangCode: 'gu-IN',
    ttsVoiceName: 'gu-IN-Chirp3-HD-Achernar',
    speakingRate: 1.0
  },
  ta: {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    ttsLangCode: 'ta-IN',
    ttsVoiceName: 'ta-IN-Chirp3-HD-Achernar',
    speakingRate: 1.0
  },
  te: {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    ttsLangCode: 'te-IN',
    ttsVoiceName: 'te-IN-Chirp3-HD-Achernar',
    speakingRate: 1.0
  },
  pa: {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    ttsLangCode: 'pa-IN',
    ttsVoiceName: 'pa-IN-Chirp3-HD-Achernar',
    speakingRate: 1.0
  }
};

/**
 * Complete UI Translations Dictionary covering all 8 Indian Languages.
 * When a language is selected, 100% of all UI strings change to that language.
 */
export const UI_TRANSLATIONS: Record<string, Record<string, string>> = {
  hi: {
    nav_prep: 'तैयारी व ऑडियो',
    nav_history: 'शिफ्ट रिकॉर्ड',
    nav_scan: 'मंडी स्कैनर',
    shift_breakfast: 'नाश्ता',
    shift_lunch: 'लंच',
    shift_dinner: 'डिनर',
    prep_targets_title: 'आज की तैयारी लक्ष्य',
    prep_items_today: 'तैयारी सामग्री · आज',
    audio_bulletin_title: 'रसोई ऑडियो बुलेटिन',
    voice_dispatch: 'ऑडियो निर्देश',
    tap_details: 'पूरा विवरण देखें',
    generating_audio: 'ऑडियो बुलेटिन तैयार हो रहा है...',
    shift_records_title: 'पुराने शिफ्ट रिकॉर्ड',
    filter_all: 'सभी शिफ्ट',
    loading_history: 'इतिहास लोड हो रहा है...',
    no_history: 'कोई पुराना रिकॉर्ड नहीं मिला',
    mandi_scanner_title: 'मंडी बिल स्कैनर',
    mandi_subtitle: 'मंडी की हस्तलिखित पर्ची फोटो खींचें या अपलोड करें',
    btn_camera: 'कैमरा खोलें',
    btn_upload: 'गैलरी से चुनें',
    scanning_bill: 'रसीद स्कैन हो रही है...',
    vendor_label: 'विक्रेता / व्यापारी:',
    col_item: 'सामग्री नाम',
    col_qty: 'मात्रा',
    col_unit: 'इकाई',
    col_rate: 'दर (₹)',
    col_total: 'कुल (₹)',
    btn_add_item: '+ नया सामान जोड़ें',
    grand_total: 'कुल योग (₹):',
    btn_record_purchase: 'सामग्री इन्वेंटरी में दर्ज करें',
    recording_purchase: 'इन्वेंटरी में दर्ज हो रहा है...',
    saved_success: 'सामान रसोई इन्वेंटरी में दर्ज हुआ!',
    station_details: 'रसोई स्टेशन विवरण',
    network: 'रसोई नेटवर्क:',
    location: 'स्थान:',
    cook: 'मुख्य रसोइया:',
    active_shift: 'सक्रिय शिफ्ट:',
    switch_station: 'स्टेशन बदलें',
    enter_code: 'स्टेशन जॉइन कोड डालें',
    btn_switch: 'स्टेशन कोड लागू करें',
    copy_code: 'कोड कॉपी करें',
    copied: 'कॉपी हो गया',
    select_outlet: 'यह आउटलेट चुनें',
    current_active: '✓ सक्रिय आउटलेट',
    all_outlets: 'उपलब्ध रसोई आउटलेट्स',
    status_completed: 'संपन्न',
    status_active: 'सक्रिय',
    retake_photo: 'दोबारा फोटो लें',
    align_slip: 'पर्ची को फ्रेम के अंदर रखें',
    verified_items: 'सत्यापित सामग्री',
    item_new: 'नई सामग्री',
    back: 'वापस',
    close: 'बंद करें',
    unit_kg: 'किलो',
    unit_litres: 'लीटर',
    unit_portions: 'प्लेट / भाग',
        nav_home: 'होम',
    nav_station: 'रसोई स्टेशन',
    past_shifts: 'पुराने शिफ्ट निर्देश',
    view_all: 'सभी देखें',
    invalid_code: 'अमान्य स्टेशन कोड',
    error_load_targets: 'टारगेट लोड नहीं हो सके। दोबारा प्रयास करें।',
    error_network: 'नेटवर्क समस्या। पुनः प्रयास करें।',
    vendor_mandi: 'मंडी सब्जी विक्रेता',
    delete_item: 'सामग्री हटाएं',
    captured_bill: 'स्कैन की गई पर्ची',
    kitchen_jaipur_central: 'जयपुर सेंट्रल क्लाउड किचन',
    assigned_staff: 'तैनात रसोई स्टाफ',
    kitchen_os: 'रसोई OS',
    item_chicken_biryani: 'चिकन बिरयानी',
    item_butter_chicken: 'बटर चिकन ग्रेवी',
    item_dal_makhani: 'दाल मखनी बेस',
    item_paneer_butter: 'पनीर बटर मसाला',
    item_rice: 'बासमती चावल',
    item_naan_dough: 'नान मैदा गूंथा',
    item_chai: 'मसाला चाय बेस',
    item_poha: 'पोहा सामग्री',
    item_idli: 'इडली घोल / बैटर',
    item_sambar: 'सांभर सामग्री',
    item_roti_dough: 'तंदूरी रोटी आटा',
    item_aloo_paratha: 'आलू पराठा मसाला',
    item_filter_coffee: 'फ़िल्टर कॉफ़ी / दूध',
    item_jeera_rice: 'जीरा राइस / पुलाव',
    item_mutton_rogan: 'मटन रोगन जोश',
    item_paneer_tikka: 'पनीर टिक्का मसाला'
  },
  en: {
    nav_prep: 'Prep & Audio',
    nav_history: 'Shift Records',
    nav_scan: 'Mandi Scanner',
    shift_breakfast: 'Breakfast',
    shift_lunch: 'Lunch',
    shift_dinner: 'Dinner',
    prep_targets_title: "Today's Prep Targets",
    prep_items_today: 'Prep Items · Today',
    audio_bulletin_title: 'Kitchen Audio Bulletin',
    voice_dispatch: 'Voice Dispatch',
    tap_details: 'Tap to view full shift details',
    generating_audio: 'Generating audio dispatch...',
    shift_records_title: 'Past Shift Records',
    filter_all: 'All Shifts',
    loading_history: 'Loading shift history...',
    no_history: 'No past records found',
    mandi_scanner_title: 'Mandi Bill Scanner',
    mandi_subtitle: 'Snap photo or upload handwritten mandi slips',
    btn_camera: 'Open Camera',
    btn_upload: 'Upload Photo',
    scanning_bill: 'Scanning receipt items...',
    vendor_label: 'Vendor / Trader:',
    col_item: 'Item Name',
    col_qty: 'Quantity',
    col_unit: 'Unit',
    col_rate: 'Rate (₹)',
    col_total: 'Total (₹)',
    btn_add_item: '+ Add New Item',
    grand_total: 'Grand Total (₹):',
    btn_record_purchase: 'Save to Kitchen Inventory',
    recording_purchase: 'Recording purchase...',
    saved_success: 'Items saved to kitchen inventory!',
    station_details: 'Outlet Details',
    network: 'Kitchen Network:',
    location: 'Location:',
    cook: 'Station Cook:',
    active_shift: 'Active Shift:',
    switch_station: 'Switch Station',
    enter_code: 'Enter Station Join Code',
    btn_switch: 'Apply Station Code',
    copy_code: 'Copy Code',
    copied: 'Copied',
    select_outlet: 'Select Outlet',
    current_active: '✓ Active Station',
    all_outlets: 'Available Kitchen Outlets',
    status_completed: 'Completed',
    status_active: 'Active',
    retake_photo: 'Retake Photo',
    align_slip: 'Align slip inside frame',
    verified_items: 'Verified Purchase Items',
    item_new: 'New Item',
    back: 'Back',
    close: 'Close',
    unit_kg: 'kg',
    unit_litres: 'litres',
    unit_portions: 'portions',
    item_chicken_biryani: 'Chicken Biryani',
    item_butter_chicken: 'Butter Chicken Gravy',
    item_dal_makhani: 'Dal Makhani Base',
    item_paneer_butter: 'Paneer Butter Masala',
    item_rice: 'Steamed Basmati Rice',
    item_naan_dough: 'Naan Dough Batch',
    item_chai: 'Masala Chai Base',
    item_poha: 'Poha Batch',
    item_idli: 'Idli Batter',
    item_sambar: 'Sambar Pot',
    item_roti_dough: 'Tandoori Roti Dough',
    item_aloo_paratha: 'Aloo Paratha Dough',
    item_filter_coffee: 'Filter Coffee / Tea Milk',
    item_jeera_rice: 'Jeera Rice / Pulao',
    item_mutton_rogan: 'Mutton Rogan Josh Gravy',
    item_paneer_tikka: 'Paneer Tikka Base'
  },
  bn: {
    nav_prep: 'প্রস্তুতি',
    nav_history: 'রেকর্ড',
    nav_scan: 'মণ্ডি স্ক্যান',
    shift_breakfast: 'সকাল',
    shift_lunch: 'দুপুর',
    shift_dinner: 'রাত',
    prep_targets_title: 'আজকের প্রস্তুতির লক্ষ্য',
    prep_items_today: 'প্রস্তুতি সামগ্রী · আজ',
    audio_bulletin_title: 'রান্নাঘরের অডিও বুলেটিন',
    voice_dispatch: 'অডিও নির্দেশিকা',
    tap_details: 'সম্পূর্ণ বিবরণ দেখুন',
    generating_audio: 'অডিও তৈরি হচ্ছে...',
    shift_records_title: 'পূর্ববর্তী শিফট রেকর্ড',
    filter_all: 'সকল শিফট',
    loading_history: 'ইতিহাস লোড হচ্ছে...',
    no_history: 'কোনো রেকর্ড পাওয়া যায়নি',
    mandi_scanner_title: 'মণ্ডি বিল স্ক্যানার',
    mandi_subtitle: 'হাতে লেখা মণ্ডি রসিদের ছবি তুলুন বা আপলোড করুন',
    btn_camera: 'ক্যামেরা খুলুন',
    btn_upload: 'ছবি আপলোড করুন',
    scanning_bill: 'রসিদ স্ক্যান করা হচ্ছে...',
    vendor_label: 'বিক্রেতা / ব্যবসায়ী:',
    col_item: 'সামগ্রীর নাম',
    col_qty: 'পরিমাণ',
    col_unit: 'একক',
    col_rate: 'দর (₹)',
    status_completed: 'সম্পন্ন',
    status_active: 'সক্রিয়',
    col_total: 'মোট (₹)',
    btn_add_item: '+ নতুন পণ্য যোগ করুন',
    grand_total: 'সর্বমোট (₹):',
    btn_record_purchase: 'ইনভেন্টরিতে সংরক্ষণ করুন',
    recording_purchase: 'সংরক্ষণ করা হচ্ছে...',
    saved_success: 'রান্নাঘরের ইনভেন্টরিতে সংরক্ষিত হয়েছে!',
    station_details: 'স্টেশনের বিবরণ',
    network: 'রান্নাঘর নেটওয়ার্ক:',
    location: 'অবস্থান:',
    cook: 'প্রধান বাবুর্চি:',
    active_shift: 'সক্রিয় শিফট:',
    switch_station: 'স্টেশন পরিবর্তন করুন',
    enter_code: 'স্টেশন কোড লিখুন',
    btn_switch: 'কোড প্রয়োগ করুন',
    back: 'ফিরে যান',
    close: 'বন্ধ করুন',
    unit_kg: 'কেজি',
    unit_litres: 'লিটার',
    unit_portions: 'প্লেট / ভাগ',
    item_chicken_biryani: 'চিকেন বিরিয়ানি',
    item_butter_chicken: 'বাটার চিকেন গ্রেভি',
    item_dal_makhani: 'ডাল মাখানি বেস',
    item_paneer_butter: 'পনির বাটার মসলা',
    item_rice: 'বাসমতী চাল',
    item_naan_dough: 'নান ময়দা মিশ্রণ',
    item_chai: 'মসলা চা বেস',
    item_poha: 'পোহা সামগ্রী',
    item_idli: 'ইডলি বাটার',
    item_sambar: 'সাম্বার উপাদান',
    item_roti_dough: 'রুটির আটা',
    item_aloo_paratha: 'আলু পরোটা সামগ্রী',
    item_filter_coffee: 'ফিল্টার কফি / দুধ',
    item_jeera_rice: 'জিরা রাইস / পোলাও',
    item_mutton_rogan: 'মাটন রোগন জোশ',
    item_paneer_tikka: 'পনির টিক্কা বেস'
  },
  mr: {
    nav_prep: 'तयारी',
    nav_history: 'नोंदी',
    nav_scan: 'मंडी स्कॅन',
    shift_breakfast: 'नाश्ता',
    shift_lunch: 'दुपार',
    shift_dinner: 'रात्र',
    prep_targets_title: 'आजचे तयारीचे लक्ष्य',
    prep_items_today: 'तयारी साहित्य · आज',
    audio_bulletin_title: 'स्वयंपाकघर ऑडिओ बुलेटिन',
    voice_dispatch: 'व्हॉइस सूचना',
    tap_details: 'संपूर्ण तपशील पहा',
    generating_audio: 'ऑडिओ बुलेटिन तयार होत आहे...',
    shift_records_title: 'मागील शिफ्ट नोंदी',
    filter_all: 'सर्व शिफ्ट',
    loading_history: 'इतिहास लोड होत आहे...',
    no_history: 'कोणतीही नोंद आढळली नाही',
    mandi_scanner_title: 'मंडी बिल स्कॅनर',
    mandi_subtitle: 'मंडीच्या हाताने लिहिलेल्या पावतीचा फोटो घ्या किंवा अपलोड करा',
    btn_camera: 'कॅमेरा उघडा',
    btn_upload: 'फोटो निवडा',
    scanning_bill: 'पावती स्कॅन होत आहे...',
    vendor_label: 'विक्रेता / व्यापारी:',
    col_item: 'साहित्याचे नाव',
    col_qty: 'प्रमाण',
    col_unit: 'एकक',
    col_rate: 'दर (₹)',
    status_completed: 'पूर्ण',
    status_active: 'सक्रिय',
    col_total: 'एकूण (₹)',
    btn_add_item: '+ नवीन वस्तू जोडा',
    grand_total: 'एकूण रक्कम (₹):',
    btn_record_purchase: 'साठा इन्व्हेंटरीमध्ये जतन करा',
    recording_purchase: 'जतन करत आहे...',
    saved_success: 'साहित्य इन्व्हेंटरीमध्ये नोंदवले गेले!',
    station_details: 'स्टेशन तपशील',
    network: 'किचन नेटवर्क:',
    location: 'स्थान:',
    cook: 'मुख्य आचारी:',
    active_shift: 'सक्रिय शिफ्ट:',
    switch_station: 'स्टेशन बदला',
    enter_code: 'स्टेशन कोड प्रविष्ट करा',
    btn_switch: 'कोड लागू करा',
    back: 'मागे',
    close: 'बंद करा',
    unit_kg: 'किलो',
    unit_litres: 'लिटर',
    unit_portions: 'भाग / प्लेट',
    item_chicken_biryani: 'चिकन बिर्याणी',
    item_butter_chicken: 'बटर चिकन ग्रेव्ही',
    item_dal_makhani: 'दाल मखनी बेस',
    item_paneer_butter: 'पनीर बटर मसाला',
    item_rice: 'बासमती तांदूळ',
    item_naan_dough: 'नान पीठ',
    item_chai: 'मसाला चहा बेस',
    item_poha: 'पोहे साहित्य',
    item_idli: 'इडली पीठ',
    item_sambar: 'सांबार साहित्य',
    item_roti_dough: 'रोटीचे पीठ',
    item_aloo_paratha: 'आलू पराठा मसाला',
    item_filter_coffee: 'फिल्टर कॉफी / दूध',
    item_jeera_rice: 'जिरा राईस / पुलाव',
    item_mutton_rogan: 'मटण रोगन जोश',
    item_paneer_tikka: 'पनीर टिक्का बेस'
  },
  gu: {
    nav_prep: 'તૈયારી',
    nav_history: 'રેકોર્ડ',
    nav_scan: 'મંડી સ્કેન',
    shift_breakfast: 'નાસ્તો',
    shift_lunch: 'બપોર',
    shift_dinner: 'સાંજ',
    prep_targets_title: 'આજના તૈયારી લક્ષ્યાંકો',
    prep_items_today: 'તૈયારી સામગ્રી · આજ',
    audio_bulletin_title: 'રસોડા ઓડિયો બુલેટિન',
    voice_dispatch: 'ઓડિયો સૂચના',
    tap_details: 'સંપૂર્ણ વિગતો જુઓ',
    generating_audio: 'ઓડિયો તૈયાર થઈ રહ્યો છે...',
    shift_records_title: 'પાછલા શિફ્ટ રેકોર્ડ્સ',
    filter_all: 'બધી શિફ્ટ',
    loading_history: 'ઇતિહાસ લોડ થઈ રહ્યો છે...',
    no_history: 'કોઈ જૂનો રેકોર્ડ મળ્યો નથી',
    mandi_scanner_title: 'મંડી બિલ સ્કેનર',
    mandi_subtitle: 'મંડીની પહોંચનો ફોટો પાડો અથવા અપલોડ કરો',
    btn_camera: 'કેમેરા ખોલો',
    btn_upload: 'ફોટો પસંદ કરો',
    scanning_bill: 'પહોંચ સ્કેન થઈ રહી છે...',
    vendor_label: 'વેપારી / વિક્રેતા:',
    col_item: 'સામગ્રીનું નામ',
    col_qty: 'જથ્થો',
    col_unit: 'એકમ',
    col_rate: 'ભાવ (₹)',
    status_completed: 'પૂર્ણ',
    status_active: 'સક્રિય',
    col_total: 'કુલ (₹)',
    btn_add_item: '+ નવી સામગ્રી ઉમેરો',
    grand_total: 'કુલ સરવાળો (₹):',
    btn_record_purchase: 'ઈન્વેન્ટરીમાં સાચવો',
    recording_purchase: 'સાચવી રહ્યું છે...',
    saved_success: 'રસોડાના સ્ટોકમાં નોંધાઈ ગયું!',
    station_details: 'સ્ટેશન વિગતો',
    network: 'રસોડા નેટવર્ક:',
    location: 'સ્થળ:',
    cook: 'મુખ્ય રસોઈયો:',
    active_shift: 'ચાલુ શિફ્ટ:',
    switch_station: 'સ્ટેશન બદલો',
    enter_code: 'સ્ટેશન કોડ દાખલ કરો',
    btn_switch: 'કોડ લાગુ કરો',
    back: 'પાછા',
    close: 'બંધ કરો',
    unit_kg: 'કિલો',
    unit_litres: 'લિટર',
    unit_portions: 'પ્લેટ / ભાગ',
    item_chicken_biryani: 'ચિકન બિરયાની',
    item_butter_chicken: 'બટર ચિકન ગ્રેવી',
    item_dal_makhani: 'દાલ મખની બેઝ',
    item_paneer_butter: 'પનીર બટર મસાલા',
    item_rice: 'બાસમતી ચોખા',
    item_naan_dough: 'નાનનો લોટ',
    item_chai: 'મસાલા ચા બેઝ',
    item_poha: 'પૌંઆ સામગ્રી',
    item_idli: 'ઈડલીનું ખીરું',
    item_sambar: 'સાંભાર સામગ્રી',
    item_roti_dough: 'રોટલીનો લોટ',
    item_aloo_paratha: 'આલૂ પરાઠા મસાલો',
    item_filter_coffee: 'ફિલ્ટર કોફી / દૂધ',
    item_jeera_rice: 'જીરા રાઇસ / પુલાવ',
    item_mutton_rogan: 'મટન રોગન જોશ',
    item_paneer_tikka: 'પનીર ટિક્કા બેઝ'
  },
  ta: {
    nav_prep: 'தயாரிப்பு',
    nav_history: 'பதிவுகள்',
    nav_scan: 'ஸ்கேனர்',
    shift_breakfast: 'காலை',
    shift_lunch: 'மதியம்',
    shift_dinner: 'இரவு',
    prep_targets_title: 'இன்றைய தயாரிப்பு இலக்குகள்',
    prep_items_today: 'தயாரிப்பு பொருட்கள் · இன்று',
    audio_bulletin_title: 'சமையலறை ஆடியோ அறிவிப்பு',
    voice_dispatch: 'குரல் வழிகாட்டல்',
    tap_details: 'முழு விவரங்களைக் காண்க',
    generating_audio: 'ஆடியோ உருவாக்கப்படுகிறது...',
    shift_records_title: 'முந்தைய ஷிப்ட் பதிவுகள்',
    filter_all: 'அனைத்து ஷிப்ட்கள்',
    loading_history: 'பதிவுகள் ஏற்றப்படுகின்றன...',
    no_history: 'பழைய பதிவுகள் எதுவும் இல்லை',
    mandi_scanner_title: 'சந்தை பில் ஸ்கேனர்',
    mandi_subtitle: 'கையால் எழுதப்பட்ட பில் புகைப்படம் எடுக்கவும் அல்லது பதிவேற்றவும்',
    btn_camera: 'கேமராவைத் திற',
    btn_upload: 'புகைப்படம் பதிவேற்று',
    scanning_bill: 'ரசீது ஸ்கேன் செய்யப்படுகிறது...',
    vendor_label: 'விற்பனையாளர்:',
    col_item: 'பொருள் பெயர்',
    col_qty: 'அளவு',
    col_unit: 'அலகு',
    col_rate: 'விலை (₹)',
    status_completed: 'முடிந்தது',
    status_active: 'செயலில்',
    col_total: 'மொத்தம் (₹)',
    btn_add_item: '+ புதிய பொருள் சேர்',
    grand_total: 'மொத்த தொகை (₹):',
    btn_record_purchase: 'சரக்கு இருப்பில் பதிவு செய்',
    recording_purchase: 'பதிவு செய்யப்படுகிறது...',
    saved_success: 'சமையலறை சரக்கில் சேர்க்கப்பட்டது!',
    station_details: 'நிலைய விவரங்கள்',
    network: 'சமையலறை நெட்வொர்க்:',
    location: 'இடம்:',
    cook: 'தலைமை சமையல்காரர்:',
    active_shift: 'செயலில் உள்ள ஷிப்ட்:',
    switch_station: 'நிலையம் மாற்று',
    enter_code: 'நிலைய குறியீட்டை உள்ளிடவும்',
    btn_switch: 'குறியீட்டைப் பயன்படுத்து',
    back: 'பின்செல்',
    close: 'மூடு',
    unit_kg: 'கிலோ',
    unit_litres: 'லிட்டர்',
    unit_portions: 'பங்கு / தட்டு',
    item_chicken_biryani: 'சிக்கன் பிரியாணி',
    item_butter_chicken: 'பட்டர் சிக்கன் கிரேவி',
    item_dal_makhani: 'தால் மக்கானி பேஸ்',
    item_paneer_butter: 'பன்னீர் பட்டர் மசாலா',
    item_rice: 'பாசுமதி அரிசி',
    item_naan_dough: 'நான் மாவு',
    item_chai: 'மசாலா டீ பேஸ்',
    item_poha: 'அவல் உப்புமா',
    item_idli: 'இட்லி மாவு',
    item_sambar: 'சாம்பார் பொருட்கள்',
    item_roti_dough: 'ரொட்டி மாவு',
    item_aloo_paratha: 'ஆலூ பரோட்டா மாவு',
    item_filter_coffee: 'பில்டர் காபி / பால்',
    item_jeera_rice: 'சீரக சாதம் / புலாவ்',
    item_mutton_rogan: 'மட்டன் ரோகன் ஜோஷ்',
    item_paneer_tikka: 'பன்னீர் டிக்கா பேஸ்'
  },
  te: {
    nav_prep: 'తయారీ',
    nav_history: 'రికార్డులు',
    nav_scan: 'స్కాన్',
    shift_breakfast: 'టిఫిన్',
    shift_lunch: 'లంచ్',
    shift_dinner: 'డిన్నర్',
    prep_targets_title: 'నేటి తయారీ లక్ష్యాలు',
    prep_items_today: 'తయారీ వస్తువులు · నేడు',
    audio_bulletin_title: 'వంటగది ఆడియో బులెటిన్',
    voice_dispatch: 'వాయిస్ సూచనలు',
    tap_details: 'పూర్తి వివరాలు చూడండి',
    generating_audio: 'ఆడియో రూపొందించబడుతోంది...',
    shift_records_title: 'గత షిఫ్ట్ రికార్డులు',
    filter_all: 'అన్ని షిఫ్టులు',
    loading_history: 'చరిత్ర లోడ్ అవుతోంది...',
    no_history: 'పాత రికార్డులు కనుగొనబడలేదు',
    mandi_scanner_title: 'మండీ బిల్లు స్కానర్',
    mandi_subtitle: 'చేతితో రాసిన బిల్లు ఫోటో తీయండి లేదా అప్‌లోడ్ చేయండి',
    btn_camera: 'కెమెరా తెరవండి',
    btn_upload: 'ఫోటో అప్‌లోడ్ చేయండి',
    scanning_bill: 'రసీదు స్కాన్ చేయబడుతోంది...',
    vendor_label: 'వ్యాపారి / విక్రేత:',
    col_item: 'వస్తువు పేరు',
    col_qty: 'పరిమాణం',
    col_unit: 'యూనిట్',
    col_rate: 'ధర (₹)',
    status_completed: 'పూర్తయింది',
    status_active: 'చురుకుగా',
    col_total: 'మొత్తం (₹)',
    btn_add_item: '+ కొత్త వస్తువు జోడించండి',
    grand_total: 'మొత్తం మొత్తం (₹):',
    btn_record_purchase: 'ఇన్వెంటరీలో సేవ్ చేయండి',
    recording_purchase: 'సేవ్ చేయబడుతోంది...',
    saved_success: 'వంటగది ఇన్వెంటరీలో నమోదు చేయబడింది!',
    station_details: 'స్టేషన్ వివరాలు',
    network: 'కిచెన్ నెట్‌వర్క్:',
    location: 'ప్రాంతం:',
    cook: 'ప్రధాన వంటగాడు:',
    active_shift: 'ప్రస్తుత షిఫ్ట్:',
    switch_station: 'స్టేషన్ మార్చండి',
    enter_code: 'స్టేషన్ కోడ్ నమోదు చేయండి',
    btn_switch: 'కోడ్ వర్తింపజేయండి',
    back: 'వెనుకకు',
    close: 'మూసివేయి',
    unit_kg: 'కిలో',
    unit_litres: 'లీటర్లు',
    unit_portions: 'ప్లేట్ / భాగాలు',
    item_chicken_biryani: 'చికెన్ బిర్యానీ',
    item_butter_chicken: 'బటర్ చికెన్ గ్రేవీ',
    item_dal_makhani: 'దాల్ మఖనీ బేస్',
    item_paneer_butter: 'పనీర్ బటర్ మసాలా',
    item_rice: 'బాస్మతి బియ్యం',
    item_naan_dough: 'నాన్ పిండి',
    item_chai: 'మసాలా టీ బేస్',
    item_poha: 'పోహా మిశ్రమం',
    item_idli: 'ఇడ్లీ పిండి',
    item_sambar: 'సాంబార్ పదార్థాలు',
    item_roti_dough: 'రొట్టె పిండి',
    item_aloo_paratha: 'ఆలూ పరాఠా మసాలా',
    item_filter_coffee: 'ఫిల్టర్ కాఫీ / పాలు',
    item_jeera_rice: 'జీరా రైస్ / పులావ్',
    item_mutton_rogan: 'మటన్ రోగన్ జోష్',
    item_paneer_tikka: 'పనీర్ టిక్కా బేస్'
  },
  pa: {
    nav_prep: 'ਤਿਆਰੀ',
    nav_history: 'ਰਿਕਾਰਡ',
    nav_scan: 'ਮੰਡੀ ਸਕੈਨ',
    shift_breakfast: 'ਨਾਸ਼ਤਾ',
    shift_lunch: 'ਦੁਪਹਿਰ',
    shift_dinner: 'ਰਾਤ',
    prep_targets_title: 'ਅੱਜ ਦੇ ਤਿਆਰੀ ਟੀਚੇ',
    prep_items_today: 'ਤਿਆਰੀ ਸਮੱਗਰੀ · ਅੱਜ',
    audio_bulletin_title: 'ਰਸੋਈ ਆਡੀਓ ਬੁਲੇਟਿਨ',
    voice_dispatch: 'ਆਵਾਜ਼ ਨਿਰਦੇਸ਼',
    tap_details: 'ਪੂਰਾ ਵੇਰਵਾ ਦੇਖੋ',
    generating_audio: 'ਆਡੀਓ ਬੁਲੇਟਿਨ ਤਿਆਰ ਹੋ ਰਿਹਾ ਹੈ...',
    shift_records_title: 'ਪਿਛਲੇ ਸ਼ਿਫਟ ਰਿਕਾਰਡ',
    filter_all: 'ਸਾਰੀਆਂ ਸ਼ਿਫਟਾਂ',
    loading_history: 'ਰਿਕਾਰਡ ਲੋਡ ਹੋ ਰਹੇ ਹਨ...',
    no_history: 'ਕੋਈ ਪੁਰਾਣਾ ਰਿਕਾਰਡ ਨਹੀਂ ਮਿਲਿਆ',
    mandi_scanner_title: 'ਮੰਡੀ ਬਿੱਲ ਸਕੈਨਰ',
    mandi_subtitle: 'ਮੰਡੀ ਦੀ ਪਰਚੀ ਦੀ ਫੋਟੋ ਖਿੱਚੋ ਜਾਂ ਅੱਪਲੋਡ ਕਰੋ',
    btn_camera: 'ਕੈਮਰਾ ਖੋਲ੍ਹੋ',
    btn_upload: 'ਫੋਟੋ ਚੁਣੋ',
    scanning_bill: 'ਰਸੀਦ ਸਕੈਨ ਹੋ ਰਹੀ ਹੈ...',
    vendor_label: 'ਦੁਕਾਨਦਾਰ / ਵਿਕਰੇਤਾ:',
    col_item: 'ਸਮੱਗਰੀ ਦਾ ਨਾਂ',
    col_qty: 'ਮਾਤਰਾ',
    col_unit: 'ਇਕਾਈ',
    col_rate: 'ਦਰ (₹)',
    status_completed: 'ਪੂਰਾ',
    status_active: 'ਸਰਗਰਮ',
    col_total: 'ਕੁੱਲ (₹)',
    btn_add_item: '+ ਨਵੀਂ ਚੀਜ਼ ਜੋੜੋ',
    grand_total: 'ਕੁੱਲ ਜੋੜ (₹):',
    btn_record_purchase: 'ਸਟਾਕ ਵਿੱਚ ਦਰਜ ਕਰੋ',
    recording_purchase: 'ਦਰਜ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...',
    saved_success: 'ਸਮੱਗਰੀ ਰਸੋਈ ਸਟਾਕ ਵਿੱਚ ਦਰਜ ਹੋ ਗਈ!',
    station_details: 'ਸਟੇਸ਼ਨ ਵੇਰਵਾ',
    network: 'ਰਸੋਈ ਨੈੱਟਵਰਕ:',
    location: 'ਸਥਾਨ:',
    cook: 'ਮੁੱਖ ਰਸੋਈਆ:',
    active_shift: 'ਸਰਗਰਮ ਸ਼ਿਫਟ:',
    switch_station: 'ਸਟੇਸ਼ਨ ਬਦਲੋ',
    enter_code: 'ਸਟੇਸ਼ਨ ਕੋਡ ਦਰਜ ਕਰੋ',
    btn_switch: 'ਕੋਡ ਲਾਗੂ ਕਰੋ',
    back: 'ਵਾਪਸ',
    close: 'ਬੰਦ ਕਰੋ',
    unit_kg: 'ਕਿਲੋ',
    unit_litres: 'ਲਿਟਰ',
    unit_portions: 'ਪਲੇਟ / ਹਿੱਸਾ',
    item_chicken_biryani: 'ਚਿਕਨ ਬਿਰਯਾਨੀ',
    item_butter_chicken: 'ਬਟਰ ਚਿਕਨ ਗ੍ਰੇਵੀ',
    item_dal_makhani: 'ਦਾਲ ਮੱਖਣੀ ਬੇਸ',
    item_paneer_butter: 'ਪਨੀਰ ਬਟਰ ਮਸਾਲਾ',
    item_rice: 'ਬਾਸਮਤੀ ਚੌਲ',
    item_naan_dough: 'ਨਾਨ ਦਾ ਆਟਾ',
    item_chai: 'ਮਸਾਲਾ ਚਾਹ ਬੇਸ',
    item_poha: 'ਪੋਹਾ ਸਮੱਗਰੀ',
    item_idli: 'ਇਡਲੀ ਦਾ ਘੋਲ',
    item_sambar: 'ਸਾਂਭਰ ਸਮੱਗਰੀ',
    item_roti_dough: 'ਰੋਟੀ ਦਾ ਆਟਾ',
    item_aloo_paratha: 'ਆਲੂ ਪਰੌਂਠਾ ਮਸਾਲਾ',
    item_filter_coffee: 'ਫਿਲਟਰ ਕੌਫ਼ੀ / ਦੁੱਧ',
    item_jeera_rice: 'ਜੀਰਾ ਰਾਈਸ / ਪੁਲਾਓ',
    item_mutton_rogan: 'ਮਟਨ ਰੋਗਨ ਜੋਸ਼',
    item_paneer_tikka: 'ਪਨੀਰ ਟਿੱਕਾ ਬੇਸ'
  }
};

/**
 * Get localized string for any UI key in target language.
 */
export function getTranslation(key: string, lang: string = 'hi'): string {
  const code = (lang || 'hi').toLowerCase().trim();
  const dict = UI_TRANSLATIONS[code] || UI_TRANSLATIONS.hi;
  return dict[key] || UI_TRANSLATIONS.en?.[key] || key;
}

/**
 * Translates item name into target language if dictionary matches,
 * otherwise returns original item name.
 */
export function getLocalizedItemName(itemName: string, lang: string = 'hi'): string {
  const lower = itemName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const keyMap: Record<string, string> = {
    chickenbiryani: 'item_chicken_biryani',
    chickendumbiryani: 'item_chicken_biryani',
    butterchickengravy: 'item_butter_chicken',
    dalmakhanibase: 'item_dal_makhani',
    paneerbuttermasala: 'item_paneer_butter',
    steamedbasmatirice: 'item_rice',
    naandoughbatch: 'item_naan_dough',
    masalachaibase: 'item_chai',
    pohabatch: 'item_poha',
    pohaupmaprep: 'item_poha',
    idlibatter: 'item_idli',
    sambarpot: 'item_sambar',
    tandoorirotidough: 'item_roti_dough',
    alooparathadough: 'item_aloo_paratha',
    filtercoffeeteamilk: 'item_filter_coffee',
    jeerarice: 'item_jeera_rice',
    jeeraricepulao: 'item_jeera_rice',
    pulao: 'item_jeera_rice',
    muttonroganjosh: 'item_mutton_rogan',
    muttonroganjoshgravy: 'item_mutton_rogan',
    paneertikka: 'item_paneer_tikka',
    paneertikkabase: 'item_paneer_tikka'
  };

  const key = keyMap[lower];
  if (key) {
    return getTranslation(key, lang);
  }
  return itemName;
}

/**
 * Translates common units (kg, litres, portions)
 */
export function getLocalizedUnit(unit: string, lang: string = 'hi'): string {
  const u = (unit || '').toLowerCase().trim();
  if (u === 'kg' || u === 'kgs') return getTranslation('unit_kg', lang);
  if (u === 'litres' || u === 'litre' || u === 'l') return getTranslation('unit_litres', lang);
  if (u === 'portions' || u === 'portion' || u === 'plates') return getTranslation('unit_portions', lang);
  return unit;
}

/**
 * Translates outlet names into target language.
 */
export function getLocalizedOutletName(name: string, lang: string = 'hi'): string {
  const code = (lang || 'hi').toLowerCase().trim();
  if (code === 'en') return name || 'Civil Lines Express';

  const clean = (name || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  if (clean.includes('civil') || clean.includes('aa')) {
    const map: Record<string, string> = {
      hi: 'सिविल लाइन्स एक्सप्रेस',
      bn: 'সিভিল লাইনস এক্সপ্রেস',
      mr: 'सिव्हिल लाइन्स एक्सप्रेस',
      gu: 'સિવિલ લાઇન્સ એક્સપ્રેસ',
      ta: 'சிவில் லைன்ஸ் எக்ஸ்பிரஸ்',
      te: 'సివిల్ లైన్స్ ఎక్స్‌ప్రెస్',
      pa: 'ਸਿਵਲ ਲਾਈਨਜ਼ ਐਕਸਪ੍ਰੈੱਸ'
    };
    return map[code] || map.hi;
  }
  if (clean.includes('malviya') || clean.includes('ab')) {
    const map: Record<string, string> = {
      hi: 'मालवीय नगर हब',
      bn: 'মালব্য নগর হাব',
      mr: 'मालवीय नगर हब',
      gu: 'માલવિયા નગર હબ',
      ta: 'மால்வியா நகர் மையம்',
      te: 'మాలవీయ నగర్ హబ్',
      pa: 'ਮਾਲਵੀਆ ਨਗਰ ਹੱਬ'
    };
    return map[code] || map.hi;
  }
  if (clean.includes('connaught') || clean.includes('ba')) {
    const map: Record<string, string> = {
      hi: 'कनॉट प्लेस सेंट्रल',
      bn: 'কনট প্লেস সেন্ট্রাল',
      mr: 'कनॉट प्लेस सेंट्रल',
      gu: 'કનૉટ પ્લેસ સેન્ટ્રલ',
      ta: 'கன்னாட் பிளேஸ் சென்ட்ரல்',
      te: 'కన్నాట్ ప్లేస్ సెంట్రల్',
      pa: 'ਕਨਾਟ ਪਲੇਸ ਸੈਂਟਰਲ'
    };
    return map[code] || map.hi;
  }
  if (clean.includes('indiranagar') || clean.includes('ca')) {
    const map: Record<string, string> = {
      hi: 'इंदिरानगर क्लाउड हब',
      bn: 'ইন্দিরানগর ক্লাউড হাব',
      mr: 'इंदिरानगर क्लाउड हब',
      gu: 'ઇન્દિરાનગર ક્લાઉડ હબ',
      ta: 'இந்திராநகர் கிளவுட் மையம்',
      te: 'ఇందిరానగర్ క్లౌడ్ హబ్',
      pa: 'ਇੰਦਰਾ ਨਗਰ ਕਲਾਊਡ ਹੱਬ'
    };
    return map[code] || map.hi;
  }
  if (clean.includes('bandra') || clean.includes('da')) {
    const map: Record<string, string> = {
      hi: 'बांद्रा वेस्ट किचन',
      bn: 'বান্দ্রা পশ্চিম রান্নাঘর',
      mr: 'वांद्रे पश्चिम किचन',
      gu: 'બાંદ્રા વેસ્ટ કિચન',
      ta: 'பாந்த்ரா மேற்கு சமையலறை',
      te: 'బాంద్రా వెస్ట్ కిచెన్',
      pa: 'ਬਾਂਦਰਾ ਵੈਸਟ ਰਸੋਈ'
    };
    return map[code] || map.hi;
  }

  return 'सिविल लाइन्स एक्सप्रेस';
}

/**
 * Translates city names into target language.
 */
export function getLocalizedCity(city: string, lang: string = 'hi'): string {
  const code = (lang || 'hi').toLowerCase().trim();
  if (code === 'en') return city;

  const cities: Record<string, Record<string, string>> = {
    Jaipur: { hi: 'जयपुर', bn: 'জয়পুর', mr: 'जयपूर', gu: 'જયપુર', ta: 'ஜெய்ப்பூர்', te: 'జైపూర్', pa: 'ਜੈਪੁਰ' },
    Delhi: { hi: 'दिल्ली', bn: 'দিল্লি', mr: 'दिल्ली', gu: 'દિલ્હી', ta: 'தில்லி', te: 'ఢిల్లీ', pa: 'ਦਿੱਲੀ' },
    Bengaluru: { hi: 'बेंगलुरु', bn: 'বেঙ্গালুরু', mr: 'बंगळुरू', gu: 'બેંગલુરુ', ta: 'பெங்களூரு', te: 'బెంగళూరు', pa: 'ਬੈਂਗਲੁਰੂ' },
    Mumbai: { hi: 'मुंबई', bn: 'মুম্বাই', mr: 'मुंबई', gu: 'મુંબઈ', ta: 'மும்பை', te: 'ముంబై', pa: 'ਮੁੰਬਈ' }
  };

  return cities[city]?.[code] || cities[city]?.hi || city;
}

/**
 * Translates chef names into target language.
 */
export function getLocalizedChef(chef: string, lang: string = 'hi'): string {
  const code = (lang || 'hi').toLowerCase().trim();
  if (code === 'en') return chef;

  const chefs: Record<string, Record<string, string>> = {
    'Chef Rajesh Sharma': { hi: 'शेफ राजेश शर्मा', bn: 'শেফ রাজেশ শর্মা', mr: 'शेफ राजेश शर्मा', gu: 'શેફ રાજેશ શર્મા', ta: 'செஃப் ராஜேஷ் சர்மா', te: 'చెఫ్ రాజేష్ శర్మ', pa: 'ਸ਼ੈੱਫ ਰਾਜੇਸ਼ ਸ਼ਰਮਾ' },
    'Chef Anita Meena': { hi: 'शेफ अनिता मीणा', bn: 'শেফ অনিতা মীনা', mr: 'शेफ अनिता मीना', gu: 'શેફ અનિતા મીણા', ta: 'செஃப் அனிதா மீனா', te: 'చెఫ్ అనితా మీనా', pa: 'ਸ਼ੈੱਫ ਅਨੀਤਾ ਮੀਣਾ' },
    'Chef Vikram Singh': { hi: 'शेफ विक्रम सिंह', bn: 'শেফ বিক্রম সিং', mr: 'शेफ विक्रम सिंग', gu: 'શેਫ વિક્રਮ સિંહ', ta: 'செஃப் விக்ரம் சிங்', te: 'చెఫ్ విక్రమ్ సింగ్', pa: 'ਸ਼ੈੱਫ ਵਿਕਰਮ ਸਿੰਘ' },
    'Chef Priya Nair': { hi: 'शेफ प्रिया नायर', bn: 'শেফ প্রিয়া নায়ার', mr: 'शेफ प्रिया नायर', gu: 'શેફ પ્રિયા નાયર', ta: 'செஃப் பிரியா நாயர்', te: 'చెఫ్ ప్రియా నాయర్', pa: 'ਸ਼ੈੱਫ ਪ੍ਰਿਆ ਨਾਇਰ' },
    'Chef Farhan Khan': { hi: 'शेफ फरहान खान', bn: 'শেফ ফারহান খান', mr: 'शेफ फरहान खान', gu: 'શેਫ ફરહાન ખાન', ta: 'செஃப் ஃபர்ஹான் கான்', te: 'చెఫ్ ఫర్హాన్ ఖాన్', pa: 'ਸ਼ੈੱਫ ਫਰਹਾਨ ਖਾਨ' }
  };

  return chefs[chef]?.[code] || chefs[chef]?.hi || chef;
}

/**
 * Translates single text string using Google Cloud Translation API REST endpoint
 * via native GCP IAM Bearer token (no API key needed).
 */
export async function translateBulletinText(
  sourceText: string,
  targetLang: string,
  token?: string
): Promise<string> {
  const normalizedLang = targetLang.toLowerCase().trim();
  if (!normalizedLang || normalizedLang === 'hi' || !sourceText) {
    return sourceText;
  }

  const langConfig = SUPPORTED_LANGUAGES[normalizedLang];
  if (!langConfig) {
    return sourceText;
  }

  const { PROJECT_ID, getGcpAccessToken } = await import('./gcp');
  const authToken = token || (await getGcpAccessToken());
  if (!authToken) {
    return sourceText;
  }

  try {
    const url = 'https://translation.googleapis.com/language/translate/v2';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'X-Goog-User-Project': PROJECT_ID,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: [sourceText],
        target: normalizedLang,
        format: 'text'
      })
    });

    if (!res.ok) {
      return sourceText;
    }

    const data = await res.json();
    return data?.data?.translations?.[0]?.translatedText || sourceText;
  } catch {
    return sourceText;
  }
}

/**
 * Deep Multi-String Google Cloud Translation:
 * Translates an array of strings in ONE single HTTP call via GCP IAM token (no API key).
 */
export async function translateBatchTexts(
  texts: string[],
  targetLang: string,
  token?: string
): Promise<string[]> {
  const normalizedLang = targetLang.toLowerCase().trim();
  if (!normalizedLang || normalizedLang === 'hi' || !texts || texts.length === 0) {
    return texts;
  }

  const { PROJECT_ID, getGcpAccessToken } = await import('./gcp');
  const authToken = token || (await getGcpAccessToken());
  if (!authToken) {
    return texts;
  }

  try {
    const url = 'https://translation.googleapis.com/language/translate/v2';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'X-Goog-User-Project': PROJECT_ID,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: texts,
        target: normalizedLang,
        format: 'text'
      })
    });

    if (!res.ok) {
      return texts;
    }

    const data = await res.json();
    const translations = data?.data?.translations;
    if (Array.isArray(translations) && translations.length === texts.length) {
      return translations.map((t: any) => t.translatedText);
    }
    return texts;
  } catch {
    return texts;
  }
}

export function getLanguageConfig(lang: string = 'hi'): LanguageVoiceConfig {
  const code = lang.toLowerCase().trim();
  return SUPPORTED_LANGUAGES[code] || SUPPORTED_LANGUAGES.hi;
}
