export default function Home() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to Realty Follow-Up OS
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          AI-powered CRM for real estate agents. Manage contacts, track activities, and get AI summaries.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-2">📋 Contacts</h3>
            <p className="text-sm text-gray-600">Create and manage contact information</p>
          </div>
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-2">📅 Timeline</h3>
            <p className="text-sm text-gray-600">View all activities and interactions</p>
          </div>
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-2">✨ AI Summary</h3>
            <p className="text-sm text-gray-600">Get AI-powered contact summaries</p>
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Getting Started</h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Sign In</h3>
              <p className="text-sm text-gray-600">Set up your account with Supabase authentication</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              2
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Create Contacts</h3>
              <p className="text-sm text-gray-600">Add the people you want to follow up with</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              3
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Log Activities</h3>
              <p className="text-sm text-gray-600">Record calls, emails, meetings, and showings</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              4
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Get AI Summaries</h3>
              <p className="text-sm text-gray-600">Click summarize to get AI-powered contact insights</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
        <h3 className="font-semibold text-yellow-900 mb-2">🚀 MVP Status</h3>
        <p className="text-sm text-yellow-800">
          This is an early version. Authentication and full feature set coming soon.
        </p>
      </div>
    </div>
  )
}
