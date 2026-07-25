import { Inter, Manrope } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { AppProvider } from '@/context/AppContext';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import Navbar from '@/components/Navbar';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'Calora | Premium Calorie & Fitness Tracker',
  description: 'An OLED Black calorie, BMI, steps, and weight tracker with premium aesthetics, gamification, and offline-first capabilities.',
  manifest: '/manifest.json',
  themeColor: '#000000',
  viewport: 'width-device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  appleWebAppCapable: 'yes',
  appleWebAppStatusBarStyle: 'black-translucent',
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${manrope.variable} h-full antialiased dark`}
      style={{ colorScheme: 'dark' }}
    >
      <body className="min-h-full bg-black text-white font-sans flex flex-col selection:bg-accent-red selection:text-white">
        <AuthProvider>
          <AppProvider>
            <ServiceWorkerRegister />
            <main className="flex-grow flex flex-col w-full max-w-md md:max-w-2xl lg:max-w-4xl mx-auto px-4 pb-28 pt-4">
              {children}
            </main>
            <Navbar />
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
