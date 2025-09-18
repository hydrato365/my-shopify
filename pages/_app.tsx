// pages/_app.tsx

import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { CartProvider } from '../context/CartContext';
import Layout from '../components/Layout';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from 'next-themes';
import { appWithTranslation } from 'next-i18next';
import { useScrollRestoration } from '../hooks/useScrollRestoration'; // <-- ပြန်ထည့်ပါ

function MyApp({ Component, pageProps }: AppProps) {
  
  useScrollRestoration(); // <-- Scroll restoration hook ကိုပြန်ခေါ်ပါ

  return (
    <ThemeProvider attribute="class">
      <CartProvider>
        <Layout>
          <Toaster toastOptions={{ duration: 2000 }} />
          <Component {...pageProps} />
        </Layout>
      </CartProvider>
    </ThemeProvider>
  );
}

export default appWithTranslation(MyApp);