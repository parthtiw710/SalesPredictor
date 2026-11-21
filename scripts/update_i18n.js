const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'lib', 'i18n.ts');
let code = fs.readFileSync(filePath, 'utf-8');

const extraTranslations = {
  hi: {
    nav_home: 'होम',
    nav_scan: 'मंडी स्कैन',
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
    kitchen_os: 'रसोई OS'
  },
  en: {
    nav_home: 'Home',
    nav_scan: 'Mandi Scan',
    nav_station: 'Station',
    past_shifts: 'Past Predictions',
    view_all: 'View All',
    invalid_code: 'Invalid station join code',
    error_load_targets: 'Could not load targets. Tap to retry.',
    error_network: 'Network error. Tap to retry.',
    vendor_mandi: 'Mandi Vegetable Vendor',
    delete_item: 'Delete Item',
    captured_bill: 'Captured Bill',
    kitchen_jaipur_central: 'Jaipur Central Cloud Kitchen',
    assigned_staff: 'Assigned Kitchen Staff',
    kitchen_os: 'Kitchen OS'
  },
  bn: {
    nav_home: 'হোম',
    nav_scan: 'মণ্ডি স্ক্যান',
    nav_station: 'স্টেশন',
    past_shifts: 'পূর্ববর্তী শিফট রেকর্ড',
    view_all: 'সকল দেখুন',
    invalid_code: 'অবৈধ স্টেশন কোড',
    error_load_targets: 'টার্গেট লোড করা যায়নি। পুনরায় চেষ্টা করুন।',
    error_network: 'নেটওয়ার্ক ত্রুটি। পুনরায় চেষ্টা করুন।',
    vendor_mandi: 'মণ্ডি শাকসবজি বিক্রেতা',
    delete_item: 'সামগ্রী মুছুন',
    captured_bill: 'স্ক্যান করা রসিদ',
    kitchen_jaipur_central: 'জয়পুর সেন্ট্রাল ক্লাউড কিচেন',
    assigned_staff: 'নিয়োজিত রান্নাঘর কর্মী',
    kitchen_os: 'রান্নাঘর OS'
  },
  mr: {
    nav_home: 'होम',
    nav_scan: 'मंडी स्कॅन',
    nav_station: 'स्टेशन',
    past_shifts: 'मागील शिफ्ट नोंदी',
    view_all: 'सर्व पहा',
    invalid_code: 'अवैध स्टेशन कोड',
    error_load_targets: 'टारगेट लोड करता आले नाही. पुन्हा प्रयत्न करा.',
    error_network: 'नेटवर्क त्रुटी. पुन्हा प्रयत्न करा.',
    vendor_mandi: 'मंडी भाजी विक्रेता',
    delete_item: 'आयटम हटवा',
    captured_bill: 'स्कॅन केलेले बिल',
    kitchen_jaipur_central: 'जयपूर सेंट्रल क्लाउड किचन',
    assigned_staff: 'नेमलेले स्वयंपाक कर्मचारी',
    kitchen_os: 'किचन OS'
  },
  gu: {
    nav_home: 'હોમ',
    nav_scan: 'મંડી સ્કેન',
    nav_station: 'સ્ટેશન',
    past_shifts: 'પાછલી શિફ્ટ વિગતો',
    view_all: 'બધા જુઓ',
    invalid_code: 'અમાન્ય સ્ટેશન કોડ',
    error_load_targets: 'ટાર્ગેટ લોડ થઈ શક્યા નથી. ફરી પ્રયાસ કરો.',
    error_network: 'નેટવર્ક ભૂલ. ફરી પ્રયાસ કરો.',
    vendor_mandi: 'મંડી શાકભાજી વેચનાર',
    delete_item: 'સામગ્રી કાઢી નાખો',
    captured_bill: 'સ્કેન કરેલી રસીદ',
    kitchen_jaipur_central: 'જયપુર સેન્ટ્રલ ક્લાઉડ કિચન',
    assigned_staff: 'નિયુક્ત રસોઈ સ્ટાફ',
    kitchen_os: 'કિચન OS'
  },
  ta: {
    nav_home: 'முகப்பு',
    nav_scan: 'மண்டி ஸ்கேன்',
    nav_station: 'நிலையம்',
    past_shifts: 'முந்தைய ஷிப்ட் பதிவுகள்',
    view_all: 'அனைத்தையும் காண்க',
    invalid_code: 'தவறான நிலைய குறியீடு',
    error_load_targets: 'இலக்குகளை ஏற்ற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
    error_network: 'பிணையப் பிழை. மீண்டும் முயற்சிக்கவும்.',
    vendor_mandi: 'மண்டி காய்கறி விற்பனையாளர்',
    delete_item: 'உருப்படியை நீக்கு',
    captured_bill: 'ஸ்கேன் செய்யப்பட்ட ரசீது',
    kitchen_jaipur_central: 'ஜெய்ப்பூர் சென்ட்ரல் கிளவுட் கிச்சன்',
    assigned_staff: 'நியமிக்கப்பட்ட பணியாளர்கள்',
    kitchen_os: 'கிச்சன் OS'
  },
  te: {
    nav_home: 'హోమ్',
    nav_scan: 'మండీ స్కాన్',
    nav_station: 'స్టేషన్',
    past_shifts: 'గత షిఫ్ట్ రికార్డులు',
    view_all: 'అన్నీ చూడండి',
    invalid_code: 'చెల్లని స్టేషన్ కోడ్',
    error_load_targets: 'టార్గెట్‌లను లోడ్ చేయడం సాధ్యపడలేదు. మళ్లీ ప్రయత్నించండి.',
    error_network: 'నెట్‌వర్క్ లోపం. మళ్లీ ప్రయత్నించండి.',
    vendor_mandi: 'మండీ కూరగాయల వ్యాపారి',
    delete_item: 'వస్తువును తొలగించండి',
    captured_bill: 'స్కాన్ చేసిన రశీదు',
    kitchen_jaipur_central: 'జైపూర్ సెంట్రల్ క్లౌడ్ కిచెన్',
    assigned_staff: 'నియమించబడిన సిబ్బంది',
    kitchen_os: 'కిచెన్ OS'
  },
  pa: {
    nav_home: 'ਹੋਮ',
    nav_scan: 'ਮੰਡੀ ਸਕੈਨ',
    nav_station: 'ਸਟੇਸ਼ਨ',
    past_shifts: 'ਪਿਛਲੀਆਂ ਸ਼ਿਫਟਾਂ',
    view_all: 'ਸਾਰੇ ਦੇਖੋ',
    invalid_code: 'ਗਲਤ ਸਟੇਸ਼ਨ ਕੋਡ',
    error_load_targets: 'ਟੀਚੇ ਲੋਡ ਨਹੀਂ ਹੋ ਸਕੇ। ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    error_network: 'ਨੈੱਟਵਰਕ ਸਮੱਸਿਆ। ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    vendor_mandi: 'ਮੰਡੀ ਸਬਜ਼ੀ ਵਿਕਰੇਤਾ',
    delete_item: 'ਆਈਟਮ ਹਟਾਓ',
    captured_bill: 'ਸਕੈਨ ਕੀਤੀ ਪਰਚੀ',
    kitchen_jaipur_central: 'ਜੈਪੁਰ ਸੈਂਟਰਲ ਕਲਾਊਡ ਕਿਚਨ',
    assigned_staff: 'ਤੈਨਾਤ ਰਸੋਈ ਸਟਾਫ਼',
    kitchen_os: 'ਰਸੋਈ OS'
  }
};

for (const [lang, keys] of Object.entries(extraTranslations)) {
  const searchPattern = new RegExp(`(${lang}:\\s*\\{[\\s\\S]*?)(item_chicken_biryani:)`);
  const match = code.match(searchPattern);
  if (match) {
    let keyLines = '';
    for (const [k, v] of Object.entries(keys)) {
      if (!match[1].includes(`${k}:`)) {
        keyLines += `    ${k}: '${v}',\n`;
      }
    }
    if (keyLines) {
      code = code.replace(searchPattern, `$1${keyLines}    $2`);
    }
  }
}

// Also update getLocalizedOutletName, getLocalizedCity, getLocalizedChef
const newOutletNameFunction = `export function getLocalizedOutletName(name: string, lang: string = 'hi'): string {
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
}`;

const outletFuncRegex = /export function getLocalizedOutletName[\s\S]*?return names\[name\]\?\.\[code\][\s\S]*?}/;
if (outletFuncRegex.test(code)) {
  code = code.replace(outletFuncRegex, newOutletNameFunction);
}

fs.writeFileSync(filePath, code, 'utf-8');
console.log('Successfully updated i18n.ts with extra translations and fuzzy outlet matching!');
