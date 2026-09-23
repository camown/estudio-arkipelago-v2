import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono, JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
});

const jakartaDisplay = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'ESTUDIO ARKIPELAGO',
  description: 'Studio Operations System',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0A0A0A',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var prefs = localStorage.getItem('arkipelago_theme_prefs');
                  if (prefs) {
                    var parsed = JSON.parse(prefs);
                    if (parsed.themeMode === 'light') {
                      document.documentElement.classList.remove('dark');
                      document.documentElement.classList.add('light');
                      document.documentElement.setAttribute('data-theme', 'light');
                    } else {
                      document.documentElement.classList.remove('light');
                      document.documentElement.classList.add('dark');
                      document.documentElement.setAttribute('data-theme', 'dark');
                    }
                  } else {
                    document.documentElement.classList.add('dark');
                    document.documentElement.setAttribute('data-theme', 'dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${jetbrainsMono.variable} ${jakartaDisplay.variable} antialiased min-h-screen bg-bg-main text-text-main`}
      >
        {children}
      </body>
    </html>
  );
}
