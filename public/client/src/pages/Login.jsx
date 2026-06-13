import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, MapPin, User, ShieldAlert, CheckCircle2, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration Fields
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isRegistering, setIsRegistering] = useState(false); // false = Login mode, true = Sign Up mode
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Background Slider Carousel State
  const [currentBg, setCurrentBg] = useState(0);
  const bgImages = [
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80'
  ];

  // Auto-advance background slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % bgImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [bgImages.length]);

  // Redirect path after login
  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      setSuccessMsg('Successfully logged in! Redirecting...');
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1000);
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!name || !email || !address || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (address.trim().length < 5) {
      setError('Please enter a valid delivery address');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, address, password);
      setSuccessMsg('Account created successfully! Redirecting...');
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to create account. Email may already be registered.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8f9fa] dark:bg-[#121212] flex flex-col lg:grid lg:grid-cols-12 overflow-x-hidden font-sans transition-colors duration-300">
      
      {/* Left Column (lg:col-span-5) - Brand Banner & Info */}
      <div className="lg:col-span-5 flex flex-col justify-between p-8 sm:p-12 lg:p-16 bg-[#f8f9fa] dark:bg-[#121212] text-slate-805 dark:text-slate-200">
        
        {/* Top Brand Tagline */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 select-none justify-start">
            <span className="text-xl font-extrabold tracking-widest text-slate-900 dark:text-white uppercase">
              SENTARA
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#0071e3] animate-pulse"></span>
          </div>

          <div className="space-y-4 text-left">
            <span className="text-[10px] font-black tracking-[0.22em] text-slate-400 dark:text-slate-500 uppercase block">
              SENTARA PREMIUM STORE
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              TECH & DESIGN <br />
              BY <span className="bg-gradient-to-r from-[#0071e3] to-blue-600 bg-clip-text text-transparent">CREATIVES</span> <br />
              AROUND THE WORLD.
            </h1>
          </div>
        </div>

        {/* Middle Toggle / Help Prompt */}
        <div className="my-8 lg:my-0 text-left">
          <p className="text-xs text-slate-500 dark:text-slate-455 font-semibold mb-1">
            {isRegistering ? "Already have an account?" : "Don't have an account?"}
          </p>
          <button 
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
              setSuccessMsg('');
              setShowPassword(false);
              setShowConfirmPassword(false);
            }}
            className="group text-xs font-black text-slate-955 dark:text-white flex items-center gap-1.5 hover:underline border-b border-slate-900 dark:border-white pb-0.5 transition-all w-fit uppercase tracking-widest"
          >
            {isRegistering ? "Sign in to account" : "Create account ->"}
            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Bottom Lifestyle Card */}
        <div className="relative group overflow-hidden rounded-[2rem] shadow-md aspect-[1.7/1] w-full bg-slate-205 dark:bg-slate-800">
          <img 
            src="https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=800&q=80" 
            alt="About Us"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-6 sm:p-8 text-left">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-350 mb-1">
              About us
            </span>
            <h3 className="text-white text-base sm:text-lg font-bold leading-snug mb-1">
              Shop curated tech & minimal accessories
            </h3>
            <p className="text-slate-300 text-xs font-semibold leading-relaxed max-w-sm">
              Discover handpicked designer electronics and lifestyle products built for beauty, functionality, and performance.
            </p>
          </div>
        </div>

      </div>

      {/* Right Column (lg:col-span-7) - Full Screen Interactive Carousel & Login Box */}
      <div className="lg:col-span-7 relative min-h-[550px] lg:min-h-screen flex items-center justify-center overflow-hidden bg-slate-200">
        
        {/* Background Image Carousel */}
        {bgImages.map((img, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-[1000ms] ease-in-out ${
              idx === currentBg ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            } transition-transform duration-[12000ms]`}
          >
            <img 
              src={img} 
              alt={`Lifestyle Background ${idx + 1}`}
              className="w-full h-full object-cover"
            />
            {/* Contrast Overlay */}
            <div className="absolute inset-0 bg-black/10 dark:bg-black/45 backdrop-blur-[1px]" />
          </div>
        ))}

        {/* Center Floating Rounded Card */}
        <div className="relative z-10 w-full max-w-md mx-4 p-8 sm:p-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-slate-800 transition-all duration-300 transform">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {isRegistering ? 'Create your account' : 'Login to your account'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 font-bold">
              {isRegistering ? 'Sign up to get access to orders & wishlist' : 'Enter your email & password to sign in'}
            </p>
          </div>

          {/* Global Error Banner */}
          {error && (
            <div className="rounded-2xl bg-red-50 dark:bg-red-950/20 p-4 border border-red-100 dark:border-red-900/40 flex items-start gap-3 text-left mb-6 animate-fadeIn">
              <ShieldAlert className="h-5 w-5 text-red-655 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs font-bold text-red-800 dark:text-red-300 leading-snug">
                {error}
              </div>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div className="rounded-2xl bg-green-50 dark:bg-green-955/20 p-4 border border-green-100 dark:border-green-900/40 flex items-start gap-3 text-left mb-6 animate-fadeIn">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs font-bold text-green-800 dark:text-green-300 leading-snug">
                {successMsg}
              </div>
            </div>
          )}

          {!isRegistering ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-6">
              
              {/* Email Input */}
              <div className="text-left">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">
                  Email Address
                </label>
                <div className="relative border-b-2 border-slate-200 dark:border-slate-800 focus-within:border-slate-900 dark:focus-within:border-white transition-colors duration-200">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pr-8 py-3 bg-transparent text-slate-900 dark:text-white focus:outline-none text-sm font-bold"
                  />
                  <Mail size={15} className="absolute right-2 bottom-3.5 text-slate-400" />
                </div>
              </div>

              {/* Password Input */}
              <div className="text-left">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">
                  Password
                </label>
                <div className="relative border-b-2 border-slate-200 dark:border-slate-800 focus-within:border-slate-900 dark:focus-within:border-white transition-colors duration-200">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pr-8 py-3 bg-transparent text-slate-900 dark:text-white focus:outline-none text-sm font-bold ${showPassword ? 'tracking-normal' : 'tracking-widest'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 bottom-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition focus:outline-none"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center text-left py-1">
                <input
                  id="remember-me"
                  type="checkbox"
                  defaultChecked
                  className="h-4.5 w-4.5 text-slate-900 border-slate-300 dark:border-slate-700 rounded focus:ring-slate-900 dark:focus:ring-white transition cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2.5 text-xs text-slate-600 dark:text-slate-450 font-bold cursor-pointer select-none">
                  Remember me
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-slate-950 hover:bg-slate-900 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-bold text-xs uppercase tracking-widest rounded-2xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Signing In...' : 'Sign In'}
                <ArrowRight size={13} />
              </button>

              {/* Toggle in Card Form */}
              <div className="text-center mt-4 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(true);
                    setError('');
                    setSuccessMsg('');
                    setShowPassword(false);
                    setShowConfirmPassword(false);
                  }}
                  className="text-[#0071e3] hover:underline"
                >
                  Don't have an account? Create one
                </button>
              </div>

            </form>
          ) : (
            /* Sign Up Form */
            <form onSubmit={handleRegister} className="space-y-4">
              
              {/* Name Input */}
              <div className="text-left animate-fadeIn">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                  Full Name
                </label>
                <div className="relative border-b-2 border-slate-200 dark:border-slate-800 focus-within:border-slate-900 dark:focus-within:border-white transition-colors duration-200">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pr-8 py-2 bg-transparent text-slate-900 dark:text-white focus:outline-none text-sm font-bold"
                  />
                  <User size={15} className="absolute right-2 bottom-2.5 text-slate-400" />
                </div>
              </div>

              {/* Email Input */}
              <div className="text-left animate-fadeIn">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                  Email Address
                </label>
                <div className="relative border-b-2 border-slate-200 dark:border-slate-800 focus-within:border-slate-900 dark:focus-within:border-white transition-colors duration-200">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full pr-8 py-2 bg-transparent text-slate-900 dark:text-white focus:outline-none text-sm font-bold"
                  />
                  <Mail size={15} className="absolute right-2 bottom-2.5 text-slate-400" />
                </div>
              </div>

              {/* Address Input */}
              <div className="text-left animate-fadeIn">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                  Delivery Address
                </label>
                <div className="relative border-b-2 border-slate-200 dark:border-slate-800 focus-within:border-slate-900 dark:focus-within:border-white transition-colors duration-200">
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Street, City, State"
                    className="w-full pr-8 py-2 bg-transparent text-slate-900 dark:text-white focus:outline-none text-sm font-bold"
                  />
                  <MapPin size={15} className="absolute right-2 bottom-2.5 text-slate-400" />
                </div>
              </div>

              {/* Password Input */}
              <div className="text-left animate-fadeIn">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                  Password
                </label>
                <div className="relative border-b-2 border-slate-200 dark:border-slate-800 focus-within:border-slate-900 dark:focus-within:border-white transition-colors duration-200">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pr-8 py-2 bg-transparent text-slate-900 dark:text-white focus:outline-none text-sm font-bold ${showPassword ? 'tracking-normal' : 'tracking-widest'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 bottom-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition focus:outline-none"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="text-left animate-fadeIn">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                  Confirm Password
                </label>
                <div className="relative border-b-2 border-slate-200 dark:border-slate-800 focus-within:border-slate-900 dark:focus-within:border-white transition-colors duration-200">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pr-8 py-2 bg-transparent text-slate-900 dark:text-white focus:outline-none text-sm font-bold ${showConfirmPassword ? 'tracking-normal' : 'tracking-widest'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 bottom-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition focus:outline-none"
                    title={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 bg-slate-950 hover:bg-slate-900 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-bold text-xs uppercase tracking-widest rounded-2xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
                <ArrowRight size={13} />
              </button>

              {/* Toggle in Card Form */}
              <div className="text-center mt-3 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(false);
                    setError('');
                    setSuccessMsg('');
                    setShowPassword(false);
                    setShowConfirmPassword(false);
                  }}
                  className="text-[#0071e3] hover:underline"
                >
                  Already have an account? Sign in
                </button>
              </div>

            </form>
          )}

          {/* Bottom Legal */}
          <p className="mt-8 text-center text-[10px] text-slate-400 dark:text-slate-500 font-bold leading-relaxed select-none">
            By continuing, you agree to SENTARA's <br />
            <a href="#" className="underline hover:text-slate-950 dark:hover:text-white transition">Terms of Use</a> and <a href="#" className="underline hover:text-slate-950 dark:hover:text-white transition">Privacy Policy</a>.
          </p>

        </div>

      </div>

    </div>
  );
}
