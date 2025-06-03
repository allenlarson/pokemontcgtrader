import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { SignOutButton } from '../SignOutButton';
import { CardSearch } from './CardSearch';
import { UserProfile } from './UserProfile';
import { TradeableCards } from './TradeableCards';
import { WantList } from './WantList';
import { ThemeToggle } from './ThemeToggle';

type Tab = 'search' | 'tradeable' | 'wants' | 'profile';

export function MainApp() {
  const [activeTab, setActiveTab] = useState<Tab>('search');
  const userProfile = useQuery(api.profiles.getCurrentUserProfile);

  const tabs = [
    { id: 'search' as Tab, label: 'Search Cards', icon: '🔍' },
    { id: 'tradeable' as Tab, label: 'My Cards', icon: '📦' },
    { id: 'wants' as Tab, label: 'Want List', icon: '⭐' },
    { id: 'profile' as Tab, label: 'Profile', icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                Pokemon TCG Trader
              </h1>
              {userProfile && (
                <span className="text-gray-600 dark:text-gray-300">
                  Welcome, {userProfile.username}!
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'search' && <CardSearch />}
        {activeTab === 'tradeable' && <TradeableCards />}
        {activeTab === 'wants' && <WantList />}
        {activeTab === 'profile' && <UserProfile />}
      </main>
    </div>
  );
}
