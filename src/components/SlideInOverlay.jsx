import { AnimatePresence, motion } from "framer-motion";

const DEFAULT_TRANSITION = { type: "spring", stiffness: 380, damping: 36 };

// Slide-in panel overlay. Renders INSIDE its parent master tab — so when
// the master tab slides off to swap to another tab, this overlay slides
// off with it as part of the same transform. The component itself only
// handles its own enter / exit animation (in from the right, out to the
// right) and assumes its parent is positioned (the absolute children
// fill it).
//
// `snapClose` forces the exit to run with zero duration. Use it when the
// overlay is being dismissed as a side-effect of a tab swap that was
// itself triggered from the tab bar — otherwise the overlay's exit would
// sweep across the screen while its parent tab is busy translating in
// from the opposite direction.
export function SlideInOverlay({
  open,
  snapClose = false,
  className,
  transition = DEFAULT_TRANSITION,
  children,
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: snapClose ? 0 : "100%" }}
          transition={snapClose ? { duration: 0 } : transition}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
