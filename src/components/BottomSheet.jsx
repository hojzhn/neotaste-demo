import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { useState } from "react";

// Snap positions are translateY percentages relative to the sheet's own height.
// 'full' = sheet pinned to its full-height position (top edge near top of phone)
// 'compact' = pushed down so 35% of the sheet is hidden below the screen edge
// 'peek' = a persistent map drawer that barely rises into view
const SNAP_Y = { full: "0%", compact: "35%", peek: "82%" };
const SHEET_HEIGHT_PCT = 90; // percent of phone height the sheet occupies at full

export function BottomSheet({
  open,
  onClose,
  children,
  floatingControls = null,
  hideFloatingControlsAtFull = false,
  initialSnap = "full",
  snap,
  onSnapChange,
  showBackdrop = true,
  dismissible = true,
}) {
  const [internalSnap, setInternalSnap] = useState(initialSnap);
  const currentSnap = snap ?? internalSnap;
  const dragControls = useDragControls();

  function setSnap(nextSnap) {
    if (snap == null) setInternalSnap(nextSnap);
    onSnapChange?.(nextSnap);
  }

  function handleDragEnd(_, info) {
    const dy = info.offset.y;
    const vy = info.velocity.y;

    if (currentSnap === "full") {
      if (!dismissible && (dy > 220 || vy > 900)) setSnap("compact");
      else if (dy > 220 || vy > 900) onClose();
      else if (dy > 60 || vy > 400) setSnap("compact");
    } else if (currentSnap === "compact") {
      if (!dismissible && (dy > 80 || vy > 400)) setSnap("peek");
      else if (dy > 80 || vy > 400) onClose();
      else if (dy < -50 || vy < -400) setSnap("full");
    } else {
      if (dy < -50 || vy < -400) setSnap("compact");
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div
          className={`absolute inset-0 z-70 ${showBackdrop ? "pointer-events-auto" : "pointer-events-none"}`}
        >
          {showBackdrop && (
            <motion.button
              type="button"
              aria-label="Close"
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 md:-top-11 bg-black/40 cursor-default"
            />
          )}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: SNAP_Y[currentSnap] }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragElastic={0.15}
            dragMomentum={false}
            dragConstraints={{ top: 0 }}
            onDragEnd={handleDragEnd}
            className="absolute bottom-0 inset-x-0 bg-white rounded-t-lg flex flex-col pointer-events-auto"
            style={{ height: `${SHEET_HEIGHT_PCT}%` }}
          >
            {floatingControls && (
              <div className="absolute right-3 -top-[98px] pointer-events-auto">
                <div
                  className={
                    hideFloatingControlsAtFull && currentSnap === "full"
                      ? "opacity-0 pointer-events-none transition-opacity"
                      : "opacity-100 transition-opacity"
                  }
                >
                  {floatingControls}
                </div>
              </div>
            )}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="py-3 px-4 shrink-0 touch-none cursor-grab active:cursor-grabbing select-none"
            >
              <div className="w-10 h-1 bg-black/20 rounded-full mx-auto" />
            </div>
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
