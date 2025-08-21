import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Gefter - Kitchen Design',
  description: 'Design your perfect kitchen with Gefter',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Clear session storage when page is closed or refreshed
              window.addEventListener('beforeunload', function() {
                sessionStorage.clear();
              });
              
              // Also clear on page visibility change (when tab becomes hidden)
              document.addEventListener('visibilitychange', function() {
                if (document.visibilityState === 'hidden') {
                  sessionStorage.clear();
                }
              });
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gray-50">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
} 