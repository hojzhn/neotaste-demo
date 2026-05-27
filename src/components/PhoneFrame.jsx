import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, ChevronLeft } from "lucide-react";
import { Avatar } from "./Avatar";
import { StatusBar } from "./StatusBar";

// Bell Y positions in pixels from the top of the phone. "low" sits just
// under the big "Bookings" headline; "high" tucks up under the status
// bar once the user has scrolled or moved to a tab with no in-page
// headline (Profile, etc).
const BELL_TOP_HIGH = 48;
const BELL_TOP_LOW = 88;
const CHROME_TRANSITION = { type: "spring", stiffness: 380, damping: 32 };

// Stack-based phone chrome. Both the back chevron (top-left) and the bell
// (top-right) live exactly once per PhoneFrame; any screen inside the phone
// can push its own handler onto the stack via `usePushPhoneChrome`. The
// topmost entry wins, so e.g. a RestaurantDetailPage with an open
// BookingConfirmation can override the back action without coordinating
// with its parent. Pushes are reversed on unmount, so closing a screen
// transparently restores whatever was active under it.
const PhoneChromeContext = createContext(null);

export function usePushPhoneChrome(kind, value) {
  const ctx = useContext(PhoneChromeContext);
  useEffect(() => {
    if (!ctx || value == null) return;
    return ctx.push(kind, value);
  }, [ctx, kind, value]);
}

export function PhoneFrame({
  user,
  role,
  label,
  sublabel,
  statusBarDark = false,
  // When `naked`, drop the desktop bezel + caption and render the
  // screen contents into a fixed full-viewport surface — used by the
  // mobile App layout so the demo fills the device with no chrome.
  naked = false,
  children,
}) {
  const hasUser = !!user;
  const displayName = hasUser ? (user.fullName ?? user.name) : label;
  const displayRole = hasUser ? role : sublabel;

  const [stacks, setStacks] = useState({ back: [], bell: [] });
  const push = useCallback((kind, value) => {
    const token = Symbol("phone-chrome");
    setStacks((prev) => ({
      ...prev,
      [kind]: [...prev[kind], { token, value }],
    }));
    return () => {
      setStacks((prev) => ({
        ...prev,
        [kind]: prev[kind].filter((entry) => entry.token !== token),
      }));
    };
  }, []);
  const ctxValue = useMemo(() => ({ push }), [push]);
  const activeBack = stacks.back[stacks.back.length - 1]?.value ?? null;
  const activeBell = stacks.bell[stacks.bell.length - 1]?.value ?? null;

  // The chrome (children + global back/bell/StatusBar) renders into a
  // single positioning root. Bezel + naked differ only in what wraps it.
  const screen = (
    <div
      className={
        naked
          ? "fixed inset-0 overflow-hidden bg-white"
          : "w-full h-full rounded-[46px] overflow-hidden bg-white relative"
      }
    >
      <PhoneChromeContext.Provider value={ctxValue}>
        {children}
      </PhoneChromeContext.Provider>

      {/* Global back chevron — fixed top-left position so the user
          always reaches for the same spot. Fades + scales in on
          appear, out on disappear. */}
      <AnimatePresence>
        {activeBack && (
          <motion.button
            key="phone-back"
            type="button"
            onClick={activeBack}
            aria-label="Back"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={CHROME_TRANSITION}
            style={{ top: BELL_TOP_HIGH }}
            className="absolute left-3 z-49 w-10 h-10 rounded-lg bg-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.15)] border border-black/5 flex items-center justify-center hover:bg-surface active:scale-95"
          >
            <ChevronLeft className="w-5 h-5 text-ink" strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Global bell — chevron-mirror position with Y animating between
          two anchors per active screen. Hidden whenever a deep slide-in
          page is on top. */}
      <AnimatePresence>
        {activeBell && (
          <motion.button
            key="phone-bell"
            type="button"
            onClick={activeBell.onClick}
            aria-label="Notifications"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{
              opacity: 1,
              scale: 1,
              top:
                activeBell.position === "low" ? BELL_TOP_LOW : BELL_TOP_HIGH,
            }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={CHROME_TRANSITION}
            className="absolute right-3 z-49 w-10 h-10 rounded-full bg-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.15)] border border-black/5 flex items-center justify-center hover:bg-surface active:scale-95"
          >
            <Bell className="w-5 h-5 text-ink" strokeWidth={2.25} />
            {activeBell.hasNotifications && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-error ring-2 ring-white" />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Single global StatusBar per phone — floats above every
          in-app overlay (including the redeem flow at z-50 and the
          raised TabBar at z-45). Tone is driven by whatever screen
          is currently dominant, lifted through App. */}
      <div className="absolute top-0 inset-x-0 z-50 pointer-events-none">
        <StatusBar dark={statusBarDark} />
      </div>
    </div>
  );

  if (naked) {
    return screen;
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {(hasUser || displayName || displayRole) && (
        <div className="flex items-center gap-2.5 mt-1 mb-8">
          {hasUser && (
            <Avatar
              initials={user.initials}
              color={user.avatarColor}
              image={user.avatarImage}
              size={36}
            />
          )}
          <div className="text-left">
            {displayName && (
              <p className="text-[15px] font-semibold text-ink leading-tight">
                {displayName}
              </p>
            )}
            {displayRole && (
              <p className="text-[12px] text-ink-muted leading-tight">
                {displayRole}
              </p>
            )}
          </div>
        </div>
      )}
      <div className="relative w-97.5 h-211 bg-black rounded-[54px] p-2.5">
        {screen}
      </div>
    </div>
  );
}
