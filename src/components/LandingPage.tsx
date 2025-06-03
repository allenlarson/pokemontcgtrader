import { SignInForm } from '../SignInForm';
import { SEO } from './SEO';

export function LandingPage() {
  return (
    <>
      <SEO
        title="Pokemon TCG Trader - Trade Pokemon Cards Online"
        description="Connect with fellow Pokemon TCG trainers, share your collection, and find the cards you need to complete your deck. Create your public trading profile and start trading today!"
      />
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Left side - Hero content */}
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 text-white p-4 md:p-8">
          <div className="max-w-lg text-center px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 md:mb-6">
              PokéTrader App
            </h1>
            <p className="text-lg md:text-xl mb-6 md:mb-8 opacity-90">
              Connect with fellow trainers, share your collection, and find the
              cards you need to complete your deck.
            </p>
            <div className="grid grid-cols-1 gap-3 md:gap-4 text-left">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-sm md:text-base">
                  Create your public trading profile
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-sm md:text-base">
                  Manage your tradeable cards and want list
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-sm md:text-base">
                  Get notified when matches are found
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-sm md:text-base">
                  Search and filter by sets, rarity, and type
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Sign in form */}
        <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-800 p-4 md:p-8">
          <div className="w-full max-w-md px-4">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome Back
              </h2>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
                Sign in to access your trading profile
              </p>
            </div>
            <SignInForm />
          </div>
        </div>
      </div>
    </>
  );
}
