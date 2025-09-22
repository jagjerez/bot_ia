import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Crypto Trading Bot
          </h1>
          <p className="text-gray-600 mb-6">
            Automated cryptocurrency trading with real-time monitoring and control.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            href="/dashboard"
            className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Open Dashboard
          </Link>
          
          <div className="text-sm text-gray-500">
            <p>Features:</p>
            <ul className="mt-2 space-y-1">
              <li>• Real-time price monitoring</li>
              <li>• Automated trading strategies</li>
              <li>• Trade history tracking</li>
              <li>• Live dashboard controls</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}