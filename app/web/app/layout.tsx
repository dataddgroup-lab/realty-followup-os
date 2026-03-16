import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Realty Follow-Up OS',
  description: 'AI-powered CRM for real estate agents',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">RF</span>
                </div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Realty Follow-Up
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  Development
                </div>
              </div>
            </div>
          </header>

          {/* Main */}
          <main className="flex-1">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </div>
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-sm text-gray-600">
              Realty Follow-Up OS • MVP Version
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
