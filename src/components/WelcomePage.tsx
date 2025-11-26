import { useEffect, useState } from 'react';
import { BookOpen, GraduationCap, Sparkles, Target, Award } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { MagicLinkUser } from '../lib/supabase';

export default function WelcomePage() {
  const [user, setUser] = useState<MagicLinkUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
      setError('No magic link token provided');
      setLoading(false);
      return;
    }

    fetchUser(token);
  }, []);

  const fetchUser = async (token: string) => {
    try {
      console.log('Fetching user with token:', token);
      console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);

      const { data, error } = await supabase
        .from('magic_link_users')
        .select('*')
        .eq('magic_token', token)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (!data) {
        setError('Invalid or inactive magic link');
        setLoading(false);
        return;
      }

      if (!data.first_access_at) {
        await supabase
          .from('magic_link_users')
          .update({ first_access_at: new Date().toISOString() })
          .eq('id', data.id);
      }

      setUser(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user:', err);
      setError(err instanceof Error ? err.message : 'Failed to load welcome page');
      setLoading(false);
    }
  };

  const handleStart = () => {
    console.log('Starting learning journey for user:', user?.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-lg text-gray-600">Loading your learning portal...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">{error || 'Unable to access this page'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      <FloatingElements />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="max-w-4xl w-full">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 transform hover:scale-[1.01] transition-transform duration-300">
            <div className="flex items-center justify-center mb-8 animate-fade-in">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                <GraduationCap className="w-20 h-20 text-indigo-600 relative z-10" strokeWidth={1.5} />
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-fade-in-up">
              Hello {user.id.slice(0, 8)}
            </h1>

            <p className="text-xl text-gray-600 text-center mb-12 animate-fade-in-up animation-delay-200">
              Welcome to your personalized learning journey
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <FeatureCard
                icon={<BookOpen className="w-8 h-8" />}
                title="Interactive Lessons"
                description="Engage with dynamic content"
                delay="0"
              />
              <FeatureCard
                icon={<Sparkles className="w-8 h-8" />}
                title="Personalized Path"
                description="Tailored to your goals"
                delay="100"
              />
              <FeatureCard
                icon={<Award className="w-8 h-8" />}
                title="Track Progress"
                description="Celebrate your achievements"
                delay="200"
              />
            </div>

            <div className="text-center animate-fade-in-up animation-delay-300">
              <button
                onClick={handleStart}
                className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-12 py-5 rounded-full text-xl font-semibold shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative">Start Learning</span>
                <Target className="w-6 h-6 relative group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: string;
}) {
  return (
    <div
      className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mb-4 text-indigo-600">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

function FloatingElements() {
  return (
    <>
      <div className="absolute top-20 left-10 w-20 h-20 bg-blue-300/30 rounded-full blur-xl animate-float"></div>
      <div className="absolute top-40 right-20 w-32 h-32 bg-indigo-300/30 rounded-full blur-xl animate-float animation-delay-1000"></div>
      <div className="absolute bottom-32 left-1/4 w-24 h-24 bg-purple-300/30 rounded-full blur-xl animate-float animation-delay-2000"></div>
      <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-blue-400/30 rounded-full blur-xl animate-float animation-delay-1500"></div>

      <div className="absolute top-1/4 right-10 opacity-10 animate-drift">
        <BookOpen className="w-32 h-32 text-blue-600" />
      </div>
      <div className="absolute bottom-1/4 left-10 opacity-10 animate-drift animation-delay-2000">
        <GraduationCap className="w-40 h-40 text-indigo-600" />
      </div>
    </>
  );
}
