import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

export default function GoogleLoginButton({ onSuccess, onError }) {
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  
  // If Google Client ID is not configured, don't render the button
  if (!clientId) {
    return (
      <div className="mt-6 text-sm text-gray-500">
        Google login is not configured. Please set REACT_APP_GOOGLE_CLIENT_ID environment variable.
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="mt-6">
        <GoogleLogin
          onSuccess={onSuccess}
          onError={() => onError('Google login failed. Please try again.')}
          useOneTap
          text="continue_with"
          shape="rectangular"
          size="large"
          auto_select={false}
        />
      </div>
    </GoogleOAuthProvider>
  );
}