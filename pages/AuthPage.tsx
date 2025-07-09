import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';
import Input from '../components/Input';
import Alert from '../components/Alert';
import { UserRole } from '../types';
import { startTransition } from 'react';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, register, loading, error: authError, clearError } = useAuth();

  const queryParams = new URLSearchParams(location.search);
  const initialMode = queryParams.get('mode') === 'register' ? 'register' : 'login';
  const initialRole = queryParams.get('role') as UserRole || UserRole.TENANT;
  const returnTo = queryParams.get('returnTo') || '/';

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>(initialRole);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
	if (user) {
		startTransition(() => {
			navigate(returnTo, { replace: true });
		});
	}
  }, [user, navigate, returnTo]);

  useEffect(() => {
    setFormError(null);
    if (authError) setFormError(authError);
    return () => clearError();
  }, [authError, mode]);

  useEffect(() => {
    setMode(queryParams.get('mode') === 'register' ? 'register' : 'login');
    setRole(queryParams.get('role') as UserRole || UserRole.TENANT);
  }, [location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (!password || !name) {
          setFormError("All fields are required.");
          return;
        }
        await register(email, password, name, role);
      }
    } catch (err: any) {
      if (!authError) {
        setFormError(err.message || `An error occurred during ${mode}.`);
      }
    }
  };

  const toggleMode = () => {
    setMode(prevMode => {
      const newMode = prevMode === 'login' ? 'register' : 'login';
      navigate(`/auth?mode=${newMode}${newMode === 'register' ? `&role=${role}` : ''}${returnTo !== '/' ? `&returnTo=${returnTo}` : ''}`, { replace: true });
      return newMode;
    });
    clearError();
    setFormError(null);
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (mode === 'register') {
      navigate(`/auth?mode=register&role=${newRole}${returnTo !== '/' ? `&returnTo=${returnTo}` : ''}`, { replace: true });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          {mode === 'login' ? 'Welcome Back!' : 'Create Account'}
        </h2>
        <p className="text-center text-gray-500 mb-8">
          {mode === 'login' ? 'Login to continue.' : 'Join us to find or list properties.'}
        </p>

        {formError && <Alert type="error" message={formError} onClose={() => setFormError(null)} />}

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'register' && (
            <Input
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              required
            />
          )}
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">I am a...</label>
              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant={role === UserRole.TENANT ? 'primary' : 'outline'}
                  onClick={() => handleRoleChange(UserRole.TENANT)}
                  className="flex-1"
                >
                  Tenant
                </Button>
                <Button
                  type="button"
                  variant={role === UserRole.AGENT ? 'primary' : 'outline'}
                  onClick={() => handleRoleChange(UserRole.AGENT)}
                  className="flex-1"
                >
                  Agent/Landlord
                </Button>
              </div>
            </div>
          )}

          <Button type="submit" isLoading={loading} className="w-full !py-3 !text-base">
            {mode === 'login' ? 'Login' : 'Register'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-8">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          <button onClick={toggleMode} className="font-medium text-green-600 hover:text-green-500 ml-1">
            {mode === 'login' ? 'Register here' : 'Login here'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
