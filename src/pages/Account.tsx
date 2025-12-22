import { useState, useEffect } from 'react';
import { User, CreditCard, Users, KeyRound, Plus, Trash2 } from 'lucide-react';
import useAuthStore from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import LogoUploader from '@/components/LogoUploader';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  createdAt?: string;
}

const Account = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'billing' | 'team' | 'api'>('overview');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const authUser = useAuthStore((s) => s.user);
  const { tier, scansUsed, scansLimit, canAccess } = useSubscription();
  const [teamEmails, setTeamEmails] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('teamMembers');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const [inviteEmail, setInviteEmail] = useState('');
  const maxSeats = 5;
  const saveTeam = (next: string[]) => {
    setTeamEmails(next);
    localStorage.setItem('teamMembers', JSON.stringify(next));
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUserProfile(null);
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from('users')
        .select('name, created_at, avatar')
        .eq('id', user.id)
        .single();
      setUserProfile({
        id: user.id,
        email: user.email || '',
        name: data?.name,
        avatar: data?.avatar,
        createdAt: data?.created_at,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'api', label: 'API', icon: KeyRound },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchUserData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Account Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your subscription and account preferences</p>
        </div>

        {/* User Profile Card */}
        {userProfile && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{userProfile.name || 'User'}</h2>
                <p className="text-gray-600 dark:text-gray-400">{userProfile.email}</p>
                {userProfile.createdAt && (
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Member since {new Date(userProfile.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`
                      flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                      ${activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Subscription Overview</h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Current Plan</span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                        {authUser?.plan || tier}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                      <span className={`text-sm font-medium ${
                        authUser ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {authUser ? 'Active' : 'Guest'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Usage</span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {scansUsed} / {scansLimit}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <a
                      href="/pricing"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {authUser?.plan === 'free' ? 'Upgrade Plan' : 'Change Plan'}
                    </a>
                  </div>
                  <div className="pt-6">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-2">Branding</h4>
                    <LogoUploader onUploaded={() => { /* re-render via localStorage */ }} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Billing Management
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Billing features will be available soon.
                </p>
                <a
                  href="/pricing"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  View Pricing
                </a>
              </div>
            )}
            {activeTab === 'team' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Team Management</h3>
                {canAccess('multi_seat') ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <input
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="Invite teammate email"
                        className="flex-1 px-3 py-2 border rounded-md bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                      />
                      <button
                        onClick={() => {
                          const email = inviteEmail.trim();
                          if (!email) return;
                          if (teamEmails.length >= maxSeats) return;
                          if (teamEmails.includes(email)) return;
                          saveTeam([...teamEmails, email]);
                          setInviteEmail('');
                        }}
                        className="inline-flex items-center px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                      >
                        <Plus className="w-4 h-4 mr-1" /> Invite
                      </button>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Seats used: {teamEmails.length} / {maxSeats}</p>
                    <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                      {teamEmails.map((email) => (
                        <li key={email} className="flex items-center justify-between py-2">
                          <span className="text-sm">{email}</span>
                          <button
                            onClick={() => saveTeam(teamEmails.filter((e) => e !== email))}
                            className="inline-flex items-center px-2 py-1 text-xs rounded-md bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                          >
                            <Trash2 className="w-4 h-4 mr-1" /> Remove
                          </button>
                        </li>
                      ))}
                      {teamEmails.length === 0 && (
                        <li className="py-4 text-sm text-slate-500 dark:text-slate-400">No teammates yet.</li>
                      )}
                    </ul>
                  </div>
                ) : (
                  <div className="p-6 text-center bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-200 dark:border-slate-800">
                    <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm">Multi-seat is available on Business plan.</p>
                    <a href="/pricing" className="inline-block mt-3 px-4 py-2 bg-blue-600 text-white rounded-md">Upgrade</a>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'api' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">API Access</h3>
                {canAccess('api_access') ? (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Use your session token to authenticate requests. Example:
                    </p>
                    <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md text-xs overflow-auto">
{`POST ${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3005'}/api/analyze/summary
Headers:
  Content-Type: application/json
  Authorization: Bearer <YOUR_SUPABASE_ACCESS_TOKEN>
Body:
  { "url": "https://example.com/article", "userId": "<YOUR_USER_ID>" }`}
                    </pre>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      You can copy your current access token from the browser console: <code>useAuthStore.getState().session?.access_token</code>.
                    </p>
                  </div>
                ) : (
                  <div className="p-6 text-center bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-200 dark:border-slate-800">
                    <KeyRound className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm">API access is available on Business plan.</p>
                    <a href="/pricing" className="inline-block mt-3 px-4 py-2 bg-blue-600 text-white rounded-md">Upgrade</a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
