import { useState } from 'react';
import { BookOpen, GraduationCap, Sparkles, Target, Award, Check, ChevronRight, ChevronLeft, AlertCircle, Lock } from 'lucide-react';
import { supabase, type MagicLinkUser } from '../lib/supabase';

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
    options: ['Agriculture', 'Art', 'Business', 'Communication', 'Education', 'Law', 'Engineering', 'Finance', 'Government', 'Media', 'Science', 'Technology'],
    maxSelections: 3,
  },
  {
    id: 2,
    title: 'What challenges do you face?',
    options: ['Resources', 'Workload', 'Time', 'Career Path', 'Subject', 'Support'],
    maxSelections: 3,
  },
  {
    id: 3,
    title: 'How do you prefer to learn?',
    options: ['Online resources', 'Mentorship', 'Group Study', 'After School Classes', 'Online Courses'],
    maxSelections: 3,
  },
  {
    id: 4,
    title: 'What is your race?',
    options: ['Black', 'Coloured', 'White', 'Indian', 'Asian', 'Multiracial', 'Prefer not to say'],
    maxSelections: 1,
  },
  {
    id: 5,
    title: 'What is your gender?',
    options: ['Male', 'Female'],
    maxSelections: 1,
  },
  {
    id: 6,
    title: 'What are your hobbies? (select up to 3)',
    options: ['Reading', 'Sports', 'Gaming', 'Music', 'Traveling', 'Arts', 'Cooking', 'Technology', 'Content Creation', 'Debate', 'Wildlife', 'Social Causes', 'Events', 'Other'],
    maxSelections: 3,
  },
  {
    id: 7,
    title: 'What is your age group?',
    options: ['Under 18', '18-24', '25-34', '35-44', '45-54', '55-64', '65+', 'Prefer not to say'],
    maxSelections: 1,
  },
  {
    id: 8,
    title: 'What is your highest level of education?',
    options: ['No formal education', 'Primary school', 'High school', 'Vocational training', "Bachelor's degree", "Master's degree", 'Doctorate', 'Prefer not to say'],
    maxSelections: 1,
  },
  {
    id: 9,
    title: 'What is your employment status?',
    options: ['Employed full-time', 'Employed part-time', 'Self-employed', 'Unemployed', 'Student', 'Retired', 'Homemaker', 'Prefer not to say'],
    maxSelections: 1,
  },
  {
    id: 10,
    title: 'What is your relationship status?',
    options: ['Single', 'In a relationship', 'Married', 'Divorced', 'Widowed', 'Prefer not to say'],
    maxSelections: 1,
  },
];

export default function WelcomePage() {
  const [user, setUser] = useState<MagicLinkUser | null>(null);
  const [tokenInput, setTokenInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [surveyStep, setSurveyStep] = useState<number>(0);
  const [selections, setSelections] = useState<Record<number, string[]>>({
    1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [],
  });

  const validateToken = async (token: string) => {
    setIsValidating(true);
    setError(null);

    try {
      const { data, error: dbError } = await supabase
        .from('magic_link_users')
        .select('*')
        .eq('magic_token', token.trim())
        .eq('is_active', true)
        .maybeSingle();

      if (dbError) {
        throw dbError;
      }

      if (!data) {
        setError('Invalid or inactive token. Please check your token and try again.');
        setIsValidating(false);
        return;
      }

      // Update first access time if this is the first time
      if (!data.first_access_at) {
        const { error: updateError } = await supabase
          .from('magic_link_users')
          .update({ first_access_at: new Date().toISOString() })
          .eq('id', data.id);
        if (updateError) {
          console.warn('Failed to update first_access_at:', updateError);
          // Continue anyway - this is non-critical
        }
      }

      setUser(data);
      setError(null);
    } catch (err) {
      console.error('Token validation error:', err);
      setError('Failed to validate token. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleTokenSubmit = () => {
    if (tokenInput.trim()) {
      validateToken(tokenInput.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTokenSubmit();
    }
  };

  const submitSurvey = async () => {
    if (!user?.magic_token) return;
    console.log('Submitting survey with token:', user.magic_token);
    console.log('Selections:', selections);
    // TODO: Send to backend
  };

  const handleStart = () => setSurveyStep(1);

  const handleOptionToggle = (questionId: number, option: string) => {
    const current = selections[questionId] || [];
    const isSelected = current.includes(option);
    const maxSelections = SURVEY_QUESTIONS.find((q) => q.id === questionId)!.maxSelections;
    let updated: string[];

    if (maxSelections === 1) {
      updated = isSelected ? [] : [option];
    } else {
      if (isSelected) {
        updated = current.filter((item) => item !== option);
      } else {
        if (current.length >= maxSelections) return;
        updated = [...current, option];
      }
    }

    setSelections({ ...selections, [questionId]: updated });
  };

  const handleNext = () => {
    if (surveyStep < SURVEY_QUESTIONS.length) {
      setSurveyStep(surveyStep + 1);
    } else {
      submitSurvey();
      setSurveyStep(SURVEY_QUESTIONS.length + 1);
    }
  };

  const handlePrev = () => {
    if (surveyStep > 1) {
      setSurveyStep(surveyStep - 1);
    } else {
      setSurveyStep(0);
    }
  };

  const handleSkip = () => {
    setSurveyStep(SURVEY_QUESTIONS.length + 1);
  };

  // Token Entry Screen
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        <FloatingElements />
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="max-w-md w-full">
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-10">
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                  <Lock className="w-16 h-16 text-indigo-600 relative z-10" strokeWidth={1.5} />
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-center mb-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Welcome Back
              </h1>
              <p className="text-gray-600 text-center mb-8">
                Enter your access token to continue your personalized learning journey
              </p>

              <div className="space-y-6">
                <div>
                  <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
                    Access Token
                  </label>
                  <input
                    type="text"
                    id="token"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter your magic link token"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all duration-300 font-mono text-sm"
                    disabled={isValidating}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    You should have received this token via email
                  </p>
                </div>

                {error && (
                  <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleTokenSubmit}
                  disabled={!tokenInput.trim() || isValidating}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
                >
                  {isValidating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Validating...</span>
                    </>
                  ) : (
                    <>
                      <span>Access Learning Portal</span>
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 text-center">
                  Don't have a token?{' '}
                  <a href="mailto:support@example.com" className="text-indigo-600 hover:text-indigo-800 font-medium">
                    Contact Support
                  </a>
                </p>
              </div>
            </div>
          </div>
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
                Choose up to {question.maxSelections} option{question.maxSelections > 1 ? 's' : ''}
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
                onClick={() => window.location.reload()}
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

  // Welcome screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      <FloatingElements />
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="max-w-4xl w-full">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12">
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                <GraduationCap className="w-20 h-20 text-indigo-600 relative z-10" strokeWidth={1.5} />
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Hello {user.email?.split('@')[0] || 'Learner'}
            </h1>

            <p className="text-xl text-gray-600 text-center mb-12">
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

            <div className="text-center">
              <p className="text-gray-700 mb-8 max-w-2xl mx-auto">
                To customize your experience, we'll ask you a few quick questions about your interests and learning preferences.
              </p>
              <button
                onClick={handleStart}
                className="group relative flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-12 py-5 rounded-full text-xl font-semibold shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden mx-auto"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative">Start Survey</span>
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
      className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
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
      <div className="absolute top-20 left-10 w-20 h-20 bg-blue-300/30 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute top-40 right-20 w-32 h-32 bg-indigo-300/30 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-32 left-1/4 w-24 h-24 bg-purple-300/30 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-blue-400/30 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      <div className="absolute top-1/4 right-10 opacity-10">
        <BookOpen className="w-32 h-32 text-blue-600" />
      </div>
      <div className="absolute bottom-1/4 left-10 opacity-10">
        <GraduationCap className="w-40 h-40 text-indigo-600" />
      </div>
    </>
  );
}