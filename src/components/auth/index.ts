/**
 * Auth Components Barrel Export
 *
 * Centralized export for all authentication components
 *
 * @module components/auth
 */

export { SessionProvider } from "./SessionProvider";
export type { SessionProviderProps } from "./SessionProvider";

export {
  SignInButton,
  GoogleSignInButton,
  GitHubSignInButton,
  EmailSignInButton,
} from "./SignInButton";
export type { SignInButtonProps } from "./SignInButton";

export { SignOutButton } from "./SignOutButton";
export type { SignOutButtonProps } from "./SignOutButton";

export { UserNav } from "./UserNav";
export type { UserNavProps } from "./UserNav";

export { AuthLoadingState, AuthLoadingStates } from "./AuthLoadingState";
export type { AuthLoadingStateProps, AuthLoadingVariant } from "./AuthLoadingState";
