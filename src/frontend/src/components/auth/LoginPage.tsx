/**
 * LoginPage Component
 * Microsoft Entra ID authentication page for the DOT Transportation Data Portal
 */

import { getIcon, MicrosoftIcon, ChevronRightIcon } from '../icons';

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const categories = [
    { icon: 'train', name: 'Railroads', source: 'FRA Safety Data', color: 'blue' },
    { icon: 'bridge', name: 'Bridges', source: 'National Inventory', color: 'emerald' },
    { icon: 'bus', name: 'Transit', source: 'NTD Metrics', color: 'purple' },
    { icon: 'car', name: 'Automobiles', source: 'FARS Data', color: 'red' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-4xl w-full">
          {/* Logo and Title */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-28 h-28 bg-white rounded-full shadow-2xl mb-8 border-4 border-red-600">
              <span className="text-blue-900 font-black text-3xl">DOT</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              U.S. Department of Transportation
            </h1>
            <p className="text-xl text-blue-100 mb-2">Transportation Data Portal</p>
            <p className="text-blue-200 max-w-2xl mx-auto">
              Access comprehensive transportation data across Railroads, Bridges, Public Transit,
              and Highway Safety. Powered by Azure Data API Builder.
            </p>
          </div>

          {/* Category Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {categories.map((cat) => (
              <div
                key={cat.name}
                className={`bg-${cat.color}-800/40 backdrop-blur-sm rounded-xl p-6 text-center border border-${cat.color}-500/30 transition-transform hover:scale-105`}
              >
                <div className={`text-${cat.color}-300 flex justify-center mb-3`}>
                  {getIcon(cat.icon, 'w-10 h-10')}
                </div>
                <p className="text-white font-semibold">{cat.name}</p>
                <p className={`text-${cat.color}-300 text-sm`}>{cat.source}</p>
              </div>
            ))}
          </div>

          {/* Login Button */}
          <div className="text-center">
            <button
              onClick={onLogin}
              className="group inline-flex items-center gap-3 bg-red-600 text-white py-4 px-10 rounded-xl hover:bg-red-500 transition-all font-semibold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              <MicrosoftIcon className="w-6 h-6" />
              Sign in with Microsoft
              <ChevronRightIcon className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
            <p className="text-blue-200 text-sm mt-4">
              Authorized personnel only. Use your organization credentials.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-blue-200 text-sm">
        <p>Azure Data API Builder Demo | Sample data based on DOT open datasets</p>
      </footer>
    </div>
  );
}
