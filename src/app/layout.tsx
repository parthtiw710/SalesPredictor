import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SalesPredicter | Spoken Kitchen Intelligence & Demand Forecasting OS',
  description:
    'Autonomous Multi-Language Spoken Kitchen Bulletin & Procurement OS for Indian Cloud Kitchens & Outlets.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SalesPredicter'
  }
};

export const viewport: Viewport = {
  themeColor: '#FFDE43',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased bg-[#FFFDF7] text-[#2D2418]">
      <head>
        <link rel="preconnect" href="https://storage.googleapis.com" />
      </head>
      <body className="h-full w-full overflow-hidden flex flex-col font-sans bg-[#FFFDF7]">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.warn('SW registration warning:', err);
                  });
                });
              }
            `
          }}
        />
      </body>
    </html>
  );
}
