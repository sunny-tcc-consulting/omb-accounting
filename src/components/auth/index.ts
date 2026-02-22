/**
 * Authentication Components - Export all auth components and hooks
 * Part of Phase 4.3-4.4: Permission System + Session Management
 */

// Hooks
export { usePermission, usePermissionLevel } from "@/hooks/usePermission";
export {
  useSession,
  useSessionTimeRemaining,
  useSessionExpiringSoon,
  useSessionStatus,
} from "@/hooks/useSession";

// Permission Components
export {
  PermissionGuard,
  default as PermissionGuardComponent,
} from "./PermissionGuard";
export {
  PermissionElement,
  PermissionButton,
  default as PermissionElementComponent,
} from "./PermissionElement";

// Session Components
export { default as SessionTimeoutWarning } from "./SessionTimeoutWarning";
export { default as SessionActivityLog } from "./SessionActivityLog";
