import { useEffect, useState } from 'react';
import { BookOpen, GraduationCap, Sparkles, Target, Award, Check, ChevronRight, ChevronLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { MagicLinkUser } from '../lib/supabase';

type SurveyQuestion = {
  id: number;
  title: string;
  options: string[];
  maxSelections: number;
};

const SURVEY_QUESTIONS: SurveyQuestion[] = [
  {
    id: 1,
    title: 'Which Industries interest you the most?',
    options: [
      'Agriculture',
      'Art',
      'Business',
      'Communication',
      'Education',
      'Law',
      'Engineering',
      'Finance',
      'Government',
      'Media',
      'Science',
      'Technology',
    ],
    maxSelections: 3,
  },
  {
    id: 2,
    title: 'What challenges do you face?',
    options: [
      'Resources',
      'Workload',
      'Time',
      'Career Path',
      'Subject',
      'Support',
    ],
    maxSelections: 3,
  },
  {
    id: 3,
    title: 'How do you prefer to learn?',
    options: [
      'Online resources',
      'Mentorship',
      'Group Study',
      'After School Classes',
      'Online Courses',
    ],
    maxSelections: 3,
  },
  {
    id: 4,
    title: 'What is your race?',
    options: [
      'Black',
      'Coloured',
      'White',
      'Indian',
      'Asian',
      'Multiracial',
      'Prefer not to say',
    ],
    maxSelections: 1,
  },
  {
    id: 5,
    title: 'What is your gender?',
    options: [
      'Male',
      'Female',
      'Non-binary',
      'Other',
      'Prefer not to say',
    ],
    maxSelections: 1,
  },
  {
    id: 6,
    title: 'What are your hobbies? (select up to 3)',
    options: [
      'Reading',
      'Sports',
      'Gaming',
      'Music',
      'Traveling',
      'Arts',
      'Cooking',
      'Technology',
      'Content Creation',
      'Debate',
      'Wildlife',
      'Social Causes',
      'Events',
      'Other',
    ],
    maxSelections: 3,
  },
  {
    id: 7,
    title: 'What is your age group?',
    options: [
      'Under 18',
      '18-24',
      '25-34',
      '35-44',
      '45-54',
      '55-64',
      '65+',
      'Prefer not to say',
    ],
    maxSelections: 1,
  },
  {
    id: 8,
    title: 'What is your highest level of education?',
    options: [
      'No formal education',
      'Primary school',
      'High school',
      'Vocational training',
      'Bachelor\'s degree',
      'Master\'s degree',
      'Doctorate',
      'Prefer not to say',
    ],
    maxSelections: 1,
  },
  {
    id: 9,
    title: 'What is your employment status?',
    options: [
      'Employed full-time',
      'Employed part-time',
      'Self-employed',
      'Unemployed',
      'Student',
      'Retired',
      'Homemaker',
      'Prefer not to say',
    ],
    maxSelections: 1,
  },
  {
    id: 10,
    title: 'What is your relationship status?',
    options: [
      'Single',
      'In a relationship',
      'Married',
      'Divorced',
      'Widowed',
      'Prefer not to say',
    ],
    maxSelections: 1,
  },
  {
    id: 11,
    title: 'Where do you live? (city/town)',
    options: [
      'Prefer not to say',
      // This will be a text input; but we'll treat as single select with "Other" option that triggers input.
      // For simplicity, we'll keep as option but later can be extended.
    ],
    maxSelections: 1,
  },
];

export default function WelcomePage() {
  const [user, setUser] = useState<MagicLinkUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [surveyStep, setSurveyStep] = useState<number>(0); // 0 = welcome, 1-3 = questions, 4 = completed
  const [selections, setSelections] = useState<Record<number, string[]>>({
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
    7: [],
    8: [],
    9: [],
    10: [],
    11: [],
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    // Temporary bypass: if no token, set a mock user for development
    if (!token) {
      const mockUser: MagicLinkUser = {
        id: 'mock-user-id-123',
        email: 'demo@example.com',
        is_active: true,
        magic_token: 'mock-token',
        activated_at: new Date().toISOString(),
        first_access_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setUser(mockUser);
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
    setSurveyStep(1);
  };

  const handleOptionToggle = (questionId: number, option: string) => {
    const current = selections[questionId] || [];
    const isSelected = current.includes(option);
    let updated: string[];
    if (isSelected) {
      updated = current.filter((item) => item !== option);
    } else {
      if (current.length >= SURVEY_QUESTIONS.find((q) => q.id === questionId)!.maxSelections) {
        // Limit reached, maybe show a toast or ignore
        return;
      }
      updated = [...current, option];
    }
    setSelections({ ...selections, [questionId]: updated });
  };

  const handleNext = () => {
    if (surveyStep < SURVEY_QUESTIONS.length) {
      setSurveyStep(surveyStep + 1);
    } else {
      // Submit survey
      console.log('Submitting survey:', selections);
      // Here you would send selections to Supabase
      setSurveyStep(SURVEY_QUESTIONS.length + 1); // completion
    }
  };

  const handlePrev = () => {
    if (surveyStep > 1) {
      setSurveyStep(surveyStep - 1);
    } else {
      setSurveyStep(0); // back to welcome
    }
  };

  const handleSkip = () => {
    // Skip survey and go to completion
    setSurveyStep(SURVEY_QUESTIONS.length + 1);
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

  // Survey screen
  if (surveyStep >= 1 && surveyStep <= SURVEY_QUESTIONS.length) {
    const question = SURVEY_QUESTIONS[surveyStep - 1];
    const selected = selections[question.id] || [];
    const maxReached = selected.length >= question.maxSelections;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        <FloatingElements />
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="max-w-4xl w-full">
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12">
              <div className="flex items-center justify-between mb-8">
                <button
                  onClick={handlePrev}
                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Back
                </button>
                <div className="text-lg font-semibold text-gray-700">
                  Question {surveyStep} of {SURVEY_QUESTIONS.length}
                </div>
                <button
                  onClick={handleSkip}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Skip
                </button>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800">
                {question.title}
              </h2>
              <p className="text-center text-gray-600 mb-10">
                Choose up to {question.maxSelections} options
                {maxReached && <span className="ml-2 text-green-600 font-semibold">(Max reached)</span>}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-12">
                {question.options.map((option) => {
                  const isSelected = selected.includes(option);
                  return (
                    <button
                      key={option}
                      onClick={() => handleOptionToggle(question.id, option)}
                      className={`p-6 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50'
                      }`}
                    >
                      <span className="text-lg font-medium text-gray-800">{option}</span>
                      {isSelected && <Check className="w-5 h-5 text-indigo-600" />}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between items-center">
                <div className="text-gray-500">
                  {selected.length} of {question.maxSelections} selected
                </div>
                <button
                  onClick={handleNext}
                  disabled={selected.length === 0}
                  className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <span className="relative">
                    {surveyStep === SURVEY_QUESTIONS.length ? 'Submit Survey' : 'Next Question'}
                  </span>
                  <ChevronRight className="w-5 h-5 relative group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Completion screen
  if (surveyStep === SURVEY_QUESTIONS.length + 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden">
        <FloatingElements />
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="max-w-2xl w-full">
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-12 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <Check className="w-12 h-12 text-green-600" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
                Thank You, {user.email?.split('@')[0] || 'Learner'}!
              </h1>
              <p className="text-xl text-gray-600 mb-10">
                Your preferences have been saved. We'll tailor your learning journey based on your choices.
              </p>
              <button
                onClick={() => window.location.reload()} // or navigate to dashboard
                className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-12 py-5 rounded-full text-xl font-semibold shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <span className="relative">Go to Dashboard</span>
                <Target className="w-6 h-6 relative group-hover:rotate-90 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Welcome screen (surveyStep === 0)
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
              Hello {user.email?.split('@')[0] || user.id.slice(0, 8)}
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
              <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                To customize your experience, we'll ask you a few quick questions about your interests and learning preferences.
              </p>
              <button
                onClick={handleStart}
                className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-12 py-5 rounded-full text-xl font-semibold shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative">Start Survey</span>
                <Target className="w-6 h-6 relative group-hover:rotate-90 transition-transform duration-300" />
              </button>
              <button
                onClick={handleSkip}
                className="mt-4 text-gray-600 hover:text-gray-800 underline transition-colors"
              >
                Skip survey and go straight to learning
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
