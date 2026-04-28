import React, { useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Auth({ selectedRole }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Clear errors when switching modes or role changes
  useEffect(() => {
    setError('');
  }, [isLogin, selectedRole]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!isLogin) {
        if (!selectedRole) {
          setError("Please select if you are a Volunteer or an NGO Organization first.");
          setLoading(false);
          return;
        }
        if (selectedRole === 'NGO' && !orgName.trim()) {
          setError("Please enter your Organization Name.");
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError("Passwords do not match. Please check and try again.");
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError("Password should be at least 6 characters long.");
          setLoading(false);
          return;
        }
      }

      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        await handleUserRouting(userCredential.user);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await handleUserRouting(userCredential.user, orgName.trim());
      }
    } catch (error) {
      console.error('Auth error:', error);
      let message = "An error occurred. Please try again.";
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        message = "Invalid email or password. Please try again.";
      } else if (error.code === 'auth/email-already-in-use') {
        message = "This email is already registered. Try logging in instead.";
      } else if (error.code === 'auth/invalid-email') {
        message = "Please enter a valid email address.";
      } else {
        message = error.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    
    if (!isLogin && selectedRole === 'NGO' && !orgName.trim()) {
      setError("Please enter your Organization Name before continuing with Google.");
      return;
    }

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    try {
      const userCredential = await signInWithPopup(auth, provider);
      await handleUserRouting(userCredential.user, !isLogin && selectedRole === 'NGO' ? orgName.trim() : '');
    } catch (error) {
      console.error('Google Auth error:', error);
      setError(error.message);
    }
  };

  const handleUserRouting = async (user, newOrgName = '') => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      if (!selectedRole) {
        setError("Role selection missing. Please select a role before continuing.");
        return;
      }
      
      if (selectedRole === 'NGO' && newOrgName) {
        await updateProfile(user, { displayName: newOrgName });
      }
      
      const userDataToSave = {
        uid: user.uid,
        email: user.email,
        role: selectedRole,
        displayName: newOrgName || user.displayName || '',
        createdAt: serverTimestamp(),
        onboardingComplete: false
      };
      
      if (selectedRole === 'NGO' && newOrgName) {
        userDataToSave.name = newOrgName;
      }

      await setDoc(userRef, userDataToSave);
      navigate(selectedRole === 'NGO' ? '/admin/dashboard' : '/hub/onboarding');
    } else {
      const userData = userSnap.data();
      if (userData.role === 'Volunteer' && !userData.onboardingComplete) {
        navigate('/hub/onboarding');
      } else {
        navigate(userData.role === 'NGO' ? '/admin/dashboard' : '/hub');
      }
    }
  };

  return (
    <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-none transition-all duration-300 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{isLogin ? 'Login' : 'Create Account'}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {isLogin ? 'Welcome back to Lighthouse' : 'Join our community of impact'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-600 dark:text-red-400 font-medium leading-relaxed">{error}</p>
        </div>
      )}

      <form onSubmit={handleAuth} className="space-y-4">
        {!isLogin && selectedRole === 'NGO' && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Organization Name</label>
            <input 
              type="text" 
              value={orgName} 
              onChange={(e) => setOrgName(e.target.value)} 
              placeholder="e.g. Lighthouse Foundation" 
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
              required={!isLogin && selectedRole === 'NGO'}
            />
          </div>
        )}

        <div>
          <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="name@example.com" 
            className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
            required
          />
        </div>
        
        <div>
          <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="••••••••" 
            className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
            required
          />
        </div>

        {!isLogin && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Confirm Password</label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              placeholder="••••••••" 
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
              required={!isLogin}
            />
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] mt-2"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Processing...</span>
            </div>
          ) : (
            isLogin ? 'Log In' : 'Create Account'
          )}
        </button>
      </form>
      
      <div className="mt-8 flex items-center">
        <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
        <span className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">or continue with</span>
        <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
      </div>

      <button 
        onClick={handleGoogleAuth} 
        disabled={loading}
        className="w-full mt-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold py-3.5 px-4 rounded-xl transition-all hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-3 shadow-sm active:scale-[0.98] disabled:opacity-50"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Google
      </button>

      <div className="mt-8 text-center">
        <button 
          onClick={() => {
            setIsLogin(!isLogin);
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setOrgName('');
          }} 
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-bold transition-colors"
        >
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
        </button>
      </div>
    </div>
  );
}
