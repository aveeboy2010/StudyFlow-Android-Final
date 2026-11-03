# StudyFlow Android APK

මෙය ඔබ දුන් `StudyFlow(4).html` එක Android WebView app එකක් ලෙස package කරන project එකයි.

## GitHub භාවිතයෙන් APK එක හදන විදිහ

1. GitHub එකේ අලුත් **Public** හෝ **Private** repository එකක් හදන්න. උදා: `StudyFlow-Android`.
2. මේ ZIP එක extract කරලා ඇතුළේ තියෙන සියලු files/folders repository එකට upload කරන්න.
3. `main` branch එකට commit කරන්න.
4. Repository එකේ **Actions** tab එකට යන්න.
5. `Build StudyFlow APK` workflow එක තෝරලා **Run workflow** ඔබන්න. පළමු push එකේද build එක auto-run වෙනවා.
6. Build එක green වුණාම run එක open කරලා පහළ **Artifacts** කොටසෙන් `StudyFlow-debug-apk` download කරන්න.
7. ZIP එක extract කරලා `app-debug.apk` phone එකට copy කර install කරන්න. Android එකෙන් ඉල්ලුවොත් browser/file manager එකට APK install permission දෙන්න.

## දත්ත සහ අවශ්‍යතා

- Android 8.0 (API 26) හෝ ඉහළ.
- App එකේ HTML/JavaScript එක local asset එකක් නිසා internet නැතිවත් ප්‍රධාන features වැඩ කළ යුතුයි.
- Tasks, history සහ settings WebView local storage එකේ save වේ. App data clear/uninstall කළොත් ඒවා නැතිවිය හැක; backup එකක් තබාගන්න.
- මේ workflow එක **debug APK** එකක් හදනවා. Play Store release එකකට පසුව signed release build එකක් සහ privacy/data safety review එකක් අවශ්‍යයි.

## දැනට ඇති සීමාවක්

මෙම HTML එකේ JSON export එක browser Blob download එකක් භාවිත කරනවා. Android WebView තුළ එය device එක අනුව වෙනස් විය හැකි නිසා phone එකේ install කළ පසු Export/Import දෙකම පරීක්ෂා කරන්න. Import file picker එක Android document picker එක භාවිත කරයි.
