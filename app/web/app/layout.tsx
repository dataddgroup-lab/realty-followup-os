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
      <body>
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
          {/* Header */}
          <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-base">RF</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900 leading-tight">
                    Realty Follow-Up
                  </h1>
                  <p className="text-xs text-gray-500">AI-Powered CRM</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <nav className="hidden sm:flex items-center gap-8">
                  <a
                    href="#"
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 transition"
                  >
                    Contacts
                  </a>
                  <a
                    href="#"
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 transition"
                  >
                    Docs
                  </a>
                </nav>

                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">U</span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="fade-in">{children}</div>
            </div>
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Product</h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>
                      <a href="#" className="hover:text-gray-900">
                        Features
                      </a>
                    </li>
                    <li>
                      <a href="#" className="hover:text-gray-900">
                        Pricing
                      </a>
                    </li>
                    <li>
                      <a href="#" className="hover:text-gray-900">
                        Docs
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Company</h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>
                      <a href="#" className="hover:text-gray-900">
                        About
                      </a>
                    </li>
                    <li>
                      <a href="#" className="hover:text-gray-900">
                        Blog
                      </a>
                    </li>
                    <li>
                      <a href="#" className="hover:text-gray-900">
                        Contact
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Legal</h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>
                      <a href="#" className="hover:text-gray-900">
                        Privacy
                      </a>
                    </li>
                    <li>
                      <a href="#" className="hover:text-gray-900">
                        Terms
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-6 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  © 2026 Realty Follow-Up OS. All rights reserved.
                </p>
                <div className="flex items-center gap-4">
                  <a
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition"
                  >
                    Twitter
                  </a>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition"
                  >
                    GitHub
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
