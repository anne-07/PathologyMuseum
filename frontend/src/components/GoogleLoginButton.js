import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

export default function GoogleLoginButton({ onSuccess, onError }) {
  console.log('Google client ID:', process.env.REACT_APP_GOOGLE_CLIENT_ID);
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">Or continue with</span>
          </div>
        </div>

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
      </div>
    </GoogleOAuthProvider>
  );
}