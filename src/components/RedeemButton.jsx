import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Avatar } from "./Avatar";
import { copy } from "../copy";

const INITIAL_DISPLAY_MS = 3500;
const REPLAY_DISPLAY_MS = 3500;
const LONG_PRESS_MS = 350;

export function RedeemButton({ gifter, giftMessage, onRedeem }) {
  const hasTooltip = !!gifter && !!giftMessage;
  const [showTooltip, setShowTooltip] = useState(false);
  const longPressRef = useRef(null);
  const hideRef = useRef(null);

  function clearHide() {
    if (hideRef.current) {
      clearTimeout(hideRef.current);
      hideRef.current = null;
    }
  }

  function scheduleHide(ms) {
    clearHide();
    hideRef.current = setTimeout(() => setShowTooltip(false), ms);
  }

  // Initial brief display on mount when there's a message
  useEffect(() => {
    if (hasTooltip) {
      setShowTooltip(true);
      scheduleHide(INITIAL_DISPLAY_MS);
    }
    return () => {
      clearHide();
      if (longPressRef.current) clearTimeout(longPressRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasTooltip]);

  function handlePointerDown() {
    if (!hasTooltip) return;
    if (longPressRef.current) clearTimeout(longPressRef.current);
    longPressRef.current = setTimeout(() => {
      setShowTooltip(true);
      scheduleHide(REPLAY_DISPLAY_MS);
      longPressRef.current = null;
    }, LONG_PRESS_MS);
  }

  function handlePointerCancel() {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
  }

  return (
    <div className="flex-1 relative">
      <AnimatePresence>
        {showTooltip && giftMessage && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
            className="absolute bottom-full right-0 -mb-1 z-10 pointer-events-none"
          >
            <div className="relative bg-ink text-white px-3 py-1.5 rounded-md text-[12px] font-semibold whitespace-nowrap shadow-[0_4px_12px_-4px_rgba(0,0,0,0.4)]">
              “{giftMessage}”
              <span className="absolute right-5 top-full -translate-y-1/2 w-2 h-2 bg-ink rotate-45" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        type="button"
        onClick={onRedeem}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerCancel}
        onPointerLeave={handlePointerCancel}
        onPointerCancel={handlePointerCancel}
        disabled={!onRedeem}
        className="w-full h-13 rounded-lg bg-brand text-ink font-semibold text-[16px] flex items-center justify-center relative select-none transition hover:bg-brand-strong active:scale-[0.98] disabled:cursor-default disabled:hover:bg-brand"
      >
        <span>{copy.bookingCard.redeem}</span>
        {gifter && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2">
            <Avatar
              initials={gifter.initials}
              color={gifter.avatarColor}
              size={28}
              ring
            />
          </span>
        )}
      </button>
    </div>
  );
}
