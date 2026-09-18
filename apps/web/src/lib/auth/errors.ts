/**
 * Secure Firebase Auth Error Mapper
 * Converts raw Firebase Auth error codes into safe, user-friendly messages without leaking sensitive account existence.
 */

export function mapFirebaseAuthError(errorCode: string): string {
  switch (errorCode) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password. Please check your credentials and try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please log in instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Please choose a stronger password with at least 8 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been suspended. Please contact LegalHubMumbai support.';
    case 'auth/too-many-requests':
      return 'Too many unsuccessful attempts. Access has been temporarily restricted for your security. Please try again later.';
    case 'auth/invalid-verification-code':
      return 'The OTP you entered is invalid. Please check the code and try again.';
    case 'auth/code-expired':
      return 'The OTP has expired. Please request a new verification code.';
    case 'auth/captcha-check-failed':
      return 'Security verification (reCAPTCHA) failed. Please try again.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in cancelled. The sign-in window was closed before completion.';
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by your browser. Please allow popups for localhost:3000 and try again.';
    case 'auth/cancelled-popup-request':
      return 'Another sign-in attempt is already in progress.';
    case 'auth/operation-not-allowed':
      return 'Sign-in method is disabled in Firebase Console. Please enable "Email/Password" and "Google" under Firebase Console > Authentication > Sign-in method.';
    case 'auth/unauthorized-domain':
      return 'Unauthorized Domain: Please add "localhost" to Authorized Domains under Firebase Console > Authentication > Settings > Authorized domains.';
    case 'auth/configuration-not-found':
      return 'Authentication configuration not found in Firebase Console. Please ensure Firebase Authentication is initialized in project zipadvo2026new.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please verify your internet connection.';
    case 'auth/requires-recent-login':
      return 'For your security, please log in again to perform this sensitive action.';
    default:
      if (errorCode) {
        return `An authentication error occurred (${errorCode}). Please try again or check Firebase settings.`;
      }
      return 'An authentication error occurred. Please try again or contact support.';
  }
}
