import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

export default function GoogleLoginButton({ onSuccess, onError }) {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <div className="mt-6">
        <GoogleLogin
          onSuccess={onSuccess}
          onError={() => onError('Google login failed. Please try again.')}
          useOneTap
          text="continue_with"
          shape="rectangular"
          size="large"
          width="100%"
          auto_select={false}
        />
      </div>
    </GoogleOAuthProvider>
  );
}