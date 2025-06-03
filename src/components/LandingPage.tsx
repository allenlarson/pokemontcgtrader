import { SignInForm } from "../SignInForm";

export function LandingPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero content */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 text-white p-8">
        <div className="max-w-lg text-center">
          <h1 className="text-5xl font-bold mb-6">
            Pokemon TCG Trader
          </h1>
          <p className="text-xl mb-8 opacity-90">
            Connect with fellow trainers, share your collection, and find the cards you need to complete your deck.
          </p>
          <div className="grid grid-cols-1 gap-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span>Create your public trading profile</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span>Manage your tradeable cards and want list</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span>Get notified when matches are found</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span>Search and filter by sets, rarity, and type</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Sign in form */}
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600">
              Sign in to access your trading profile
            </p>
          </div>
          <SignInForm />
        </div>
      </div>
    </div>
  );
}
