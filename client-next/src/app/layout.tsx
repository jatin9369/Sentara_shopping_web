import './globals.css';
import React from 'react';
import { Inter } from 'next/font/google';
import Header from '../components/Header';

export const dynamic = 'force-dynamic';

const inter = Inter({ subsets: ['latin'] });

async function getThemeConfig() {
  try {
    const res = await fetch('/api/theme', { cache: 'no-store' });
    const data = await res.json();
    if (data.success) {
      return data.theme;
    }
  } catch (err) {
    console.error('Failed to load theme configuration dynamically:', err);
  }
  return null;
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = await getThemeConfig();

  const themeVariables = theme ? `
    :root {
      --color-primary: ${theme.primaryColor};
      --color-secondary: ${theme.secondaryColor};
      --color-accent: ${theme.accentColor};
      --color-background: ${theme.backgroundColor};
      --color-surface: ${theme.surfaceColor};
      --color-border: ${theme.borderColor};
      --color-text: ${theme.textColor};
      --border-radius: ${theme.borderRadius};
      --font-family: ${theme.fontFamily || 'Inter'}, sans-serif;
    }
  ` : '';

  return (
    <html lang="en">
      <head>
        {themeVariables && (
          <style dangerouslySetInnerHTML={{ __html: themeVariables }} />
        )}
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-background text-text transition-colors duration-300">
          <Header />
          {children}
        </div>
      </body>
    </html>
  );
}
