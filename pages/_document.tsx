// pages/_document.tsx

import { Html, Head, Main, NextScript } from "next/document";

// --- Flash (FOUC) ကို ကာကွယ်ပေးမယ့် Script ---
const ThemeScript = () => {
  const script = `
    (function() {
      try {
        // အနာဂတ်မှာ manual theme switcher ထည့်ခဲ့ရင် localStorage ကို အရင်စစ်ဆေးပါမယ်။
        const preference = window.localStorage.getItem('theme');
        if (preference) {
          document.documentElement.classList.add(preference);
          return;
        }
        // localStorage မှာ မရှိရင် OS setting ကို စစ်ဆေးပါမယ်။
        const osPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        if (osPreference === 'dark') {
          document.documentElement.classList.add('dark');
        }
      } catch (e) {
        // console.error('Failed to set theme from script', e);
      }
    })();
  `;
  // Script ကို HTML ထဲမှာ တိုက်ရိုက်ထည့်သွင်းပေးပါတယ်။
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
};


export default function Document() {
  return (
    <Html lang="en">
      <Head />
      {/* သင့်ရဲ့ မူလ className="antialiased" ကို ဒီနေရာမှာ ထိန်းသိမ်းပေးထားပါတယ် */}
      <body className="antialiased">
        {/* Script ကို <body> tag ရဲ့ အစမှာထည့်ပေးရပါမယ်။ ဒါမှ page ကို မပြခင် သူက အရင်အလုပ်လုပ်မှာပါ။ */}
        <ThemeScript />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}