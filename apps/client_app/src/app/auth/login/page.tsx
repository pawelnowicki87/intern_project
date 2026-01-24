'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import GoogleLoginButton from '../../../components/ui/GoogleLoginButton';

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password);
      router.push('/feed');
    } catch (err) {
      console.error('Login failed', err);
      setError('root', {
        message: 'Invalid email or password. Please try again.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm md:max-w-md lg:max-w-lg">
        <div className="bg-white border border-gray-300 rounded-none md:rounded-sm p-8 md:p-10 mb-3">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-serif italic mb-2">Instagram</h1>
          </div>

          {errors.root && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-sm">
              <p className="text-sm text-red-600 text-center">
                {errors.root.message}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <div>
              <input
                type="text"
                placeholder="Phone number, username, or email"
                {...register('email')}
                className={`w-full px-2 py-2 text-xs border rounded-sm bg-gray-50 focus:bg-white focus:outline-none ${
                  errors.email ? 'border-red-500' : 'border-gray-300 focus:border-gray-400'
                }`}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                {...register('password')}
                className={`w-full px-2 py-2 text-xs border rounded-sm bg-gray-50 focus:bg-white focus:outline-none ${
                  errors.password ? 'border-red-500' : 'border-gray-300 focus:border-gray-400'
                }`}
              />
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="w-full bg-blue-500 text-white py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed mt-4"
            >
              {isSubmitting ? 'Logging in...' : 'Log in'}
            </button>
          </div>

          <div className="flex items-center my-5">
            <div className="flex-1 border-t border-gray-300"></div>
            <div className="px-4 text-xs font-semibold text-gray-500">OR</div>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>


          <GoogleLoginButton
            onSuccess={async (credential) => {
              try {
                await loginWithGoogle(credential);
                router.push('/');
              } catch (err) {
                console.error('Google login failed', err);
                setError('root', {
                  message: 'Google login failed. Please try again.',
                });
              }
            }}
          />


          <div className="text-center">
            <Link href="/auth/forgot-password" className="text-xs text-blue-900 hover:text-blue-950">
              Forgot password?
            </Link>
          </div>
        </div>

        <div className="bg-white border border-gray-300 rounded-none md:rounded-sm p-6 text-center">
          <p className="text-sm">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-blue-500 font-semibold hover:text-blue-600">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
