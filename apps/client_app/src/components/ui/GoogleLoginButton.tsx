'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    google: any;
  }
}

type GoogleLoginButtonProps = {
  onSuccess: (credential: string) => void;
};

export default function GoogleLoginButton({
  onSuccess,
}: GoogleLoginButtonProps) {
  useEffect(() => {
    const interval = setInterval(() => {
      if (!window.google) return;

      clearInterval(interval);

      if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
        console.error('Missing Google Client ID');
        clearInterval(interval);
        return;
      }

      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        callback: (response: any) => {
          onSuccess(response.credential);
        },
      });

      const el = document.getElementById('google-login-btn');
      if (!el) return;

      window.google.accounts.id.renderButton(el, {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onSuccess]);

  return (
    <div
      id="google-login-btn"
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
      }}
    />
  );
}
