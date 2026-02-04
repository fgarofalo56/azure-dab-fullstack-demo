import { MsalProvider, useMsal, useIsAuthenticated } from '@azure/msal-react';
import { PublicClientApplication, InteractionStatus } from '@azure/msal-browser';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { msalConfig, loginRequest } from './config/authConfig';

// Initialize MSAL
const msalInstance = new PublicClientApplication(msalConfig);

// Initialize React Query
const queryClient = new QueryClient();

// Types
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
}

interface ApiResponse<T> {
  value: T[];
}

// Auth wrapper component
function AuthenticatedApp() {
  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const handleLogin = () => {
    instance.loginRedirect(loginRequest).catch(console.error);
  };

  const handleLogout = () => {
    instance.logoutRedirect().catch(console.error);
  };

  if (inProgress === InteractionStatus.Login) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Signing in...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Azure DAB Demo
          </h1>
          <p className="text-gray-600 text-center mb-6">
            Sign in with your organization account to access the Data API Builder demo.
          </p>
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Sign in with Microsoft
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Azure DAB Demo</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{accounts[0]?.username}</span>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-800"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <ProductList />
      </main>
    </div>
  );
}

// Product list component
function ProductList() {
  const { instance, accounts } = useMsal();

  const { data, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async (): Promise<Product[]> => {
      // Get access token
      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      });

      // Fetch products from DAB REST API
      const apiUrl = import.meta.env.VITE_API_BASE_URL || '/api';
      const res = await fetch(`${apiUrl}/Product`, {
        headers: {
          Authorization: `Bearer ${response.accessToken}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch products');
      }

      const data: ApiResponse<Product> = await res.json();
      return data.value;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Error loading products: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
            <p className="text-gray-600 mt-2">{product.description}</p>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-2xl font-bold text-blue-600">
                ${product.price.toFixed(2)}
              </span>
              <span
                className={`px-2 py-1 rounded text-sm ${
                  product.inStock
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Category: {product.category}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main App component
function App() {
  return (
    <MsalProvider instance={msalInstance}>
      <QueryClientProvider client={queryClient}>
        <AuthenticatedApp />
      </QueryClientProvider>
    </MsalProvider>
  );
}

export default App;
