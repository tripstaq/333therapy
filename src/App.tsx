import React, { useState } from 'react';
import { Brain, Heart, Sparkles, Star, Sun, Moon, Cloud, MessageSquare, ArrowRight, AlertCircle, UserCircle2 } from 'lucide-react';
import { supabase } from './lib/supabase';

type Symptom = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
};

const symptoms: Symptom[] = [
  {
    id: 'anxiety',
    name: 'Anxiety',
    description: 'Feeling worried, nervous, or uneasy',
    icon: <Cloud className="w-6 h-6" />,
  },
  {
    id: 'depression',
    name: 'Depression',
    description: 'Persistent feelings of sadness or loss of interest',
    icon: <Moon className="w-6 h-6" />,
  },
  {
    id: 'ptsd',
    name: 'PTSD',
    description: 'Difficulty recovering from traumatic experiences',
    icon: <Star className="w-6 h-6" />,
  },
  {
    id: 'stress',
    name: 'Stress',
    description: 'Feeling overwhelmed or under pressure',
    icon: <Sun className="w-6 h-6" />,
  },
];

function App() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [step, setStep] = useState<'welcome' | 'symptoms' | 'create-account'>('welcome');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(false);

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptomId)
        ? prev.filter(id => id !== symptomId)
        : [...prev, symptomId]
    );
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('name') as string;

    try {
      const { error: signUpError, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            symptoms: selectedSymptoms,
          },
        },
      });

      if (signUpError) throw signUpError;

      // Create user profile in the profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user?.id,
            full_name: fullName,
            symptoms: selectedSymptoms,
          },
        ]);

      if (profileError) throw profileError;

      alert('Account created successfully! You can now sign in.');
      setIsLogin(true); // Switch to login view after successful registration
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Redirect to dashboard or therapy session (you can implement this next)
      alert('Login successful!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const renderWelcome = () => (
    <div className="text-center space-y-6">
      <div className="relative inline-block">
        <Brain className="w-24 h-24 text-blue-500" />
        <Heart className="w-8 h-8 text-pink-500 absolute -top-2 -right-2 animate-bounce" />
      </div>
      <h1 className="text-4xl font-bold text-gray-800 font-display">
        Welcome to MindfulAI Therapy
      </h1>
      <p className="text-xl text-gray-600 max-w-2xl mx-auto">
        Your personal AI therapist is here to help you on your journey to better mental health. 
        Let's start by understanding how you're feeling.
      </p>
      <button
        onClick={() => setStep('symptoms')}
        className="bg-blue-500 text-white px-8 py-4 rounded-full text-lg font-semibold 
                 hover:bg-blue-600 transition-colors shadow-lg hover:shadow-xl
                 flex items-center justify-center mx-auto space-x-2"
      >
        <span>Start Your Journey</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );

  const renderSymptoms = () => (
    <div className="space-y-8">
      <div className="text-center">
        <Sparkles className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-800 mb-2">How are you feeling?</h2>
        <p className="text-gray-600">Select all that apply to you</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {symptoms.map(symptom => (
          <button
            key={symptom.id}
            onClick={() => toggleSymptom(symptom.id)}
            className={`p-6 rounded-xl border-2 transition-all text-left
                      ${selectedSymptoms.includes(symptom.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                      }`}
          >
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-lg ${
                selectedSymptoms.includes(symptom.id)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {symptom.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-lg mb-1">{symptom.name}</h3>
                <p className="text-gray-600 text-sm">{symptom.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="text-center space-y-4">
        <button
          onClick={() => setStep('create-account')}
          disabled={selectedSymptoms.length === 0}
          className={`px-8 py-4 rounded-full text-lg font-semibold transition-all
                    flex items-center justify-center mx-auto space-x-2
                    ${selectedSymptoms.length > 0
                      ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
        >
          <span>Continue</span>
          <ArrowRight className="w-5 h-5" />
        </button>
        <button
          onClick={() => setStep('welcome')}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          Go back
        </button>
      </div>
    </div>
  );

  const renderCreateAccount = () => (
    <div className="max-w-md mx-auto space-y-8">
      <div className="text-center">
        <UserCircle2 className="w-12 h-12 text-blue-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          {isLogin ? 'Welcome Back' : 'Create Your Account'}
        </h2>
        <p className="text-gray-600">
          {isLogin 
            ? 'Sign in to continue your therapy journey'
            : 'Let's get you set up with your personal AI therapist'}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={isLogin ? handleLogin : handleSignUp} className="space-y-6">
        {!isLogin && (
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your full name"
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={isLogin ? 'Enter your password' : 'Create a password (min. 6 characters)'}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white px-8 py-4 rounded-full text-lg font-semibold 
                   hover:bg-blue-600 transition-colors shadow-lg hover:shadow-xl
                   disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          {loading 
            ? (isLogin ? 'Signing In...' : 'Creating Account...') 
            : (isLogin ? 'Sign In' : 'Create Account')}
        </button>
      </form>

      <div className="text-center space-y-4">
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-blue-500 hover:text-blue-700 transition-colors"
        >
          {isLogin 
            ? 'Need an account? Sign up' 
            : 'Already have an account? Sign in'}
        </button>
        <button
          onClick={() => setStep('symptoms')}
          className="block w-full text-gray-500 hover:text-gray-700 transition-colors"
        >
          Go back
        </button>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <MessageSquare className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Important Notice</h3>
            <p className="mt-1 text-sm text-yellow-700">
              This AI therapy platform is for preliminary support only. If you're experiencing 
              a crisis or emergency, please contact emergency services or a mental health 
              professional immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Doodle Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 border-4 border-blue-400 rounded-full" />
        <div className="absolute top-40 right-40 w-24 h-24 border-4 border-pink-400 transform rotate-45" />
        <div className="absolute bottom-60 left-1/4 w-40 h-40 border-4 border-yellow-400 rounded-lg transform -rotate-12" />
        <div className="absolute top-1/3 right-1/3 w-28 h-28 border-4 border-green-400 transform rotate-12" />
      </div>

      {/* Content */}
      <div className="relative">
        <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center space-x-3">
              <Brain className="w-8 h-8 text-blue-500" />
              <h1 className="text-2xl font-semibold text-gray-800">MindfulAI Therapy</h1>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-12">
          {step === 'welcome' && renderWelcome()}
          {step === 'symptoms' && renderSymptoms()}
          {step === 'create-account' && renderCreateAccount()}
        </main>
      </div>
    </div>
  );
}

export default App;