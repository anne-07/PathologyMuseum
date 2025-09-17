import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

export default function GoogleLoginButton({ onSuccess, onError }) {
  console.log('Google client ID:', process.env.REACT_APP_GOOGLE_CLIENT_ID);
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <div className="mt-6">
<<<<<<< Updated upstream
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
=======
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            onSuccess(credentialResponse);
          }}
          onError={(error) => {
            console.error('Google login error:', error);
            onError('Google login failed. Please try again.');
          }}
          useOneTap
          text="continue_with"
          shape="rectangular"
          size="large"
          width="100%"
        />
>>>>>>> Stashed changes
      </div>
    </GoogleOAuthProvider>
  );
}