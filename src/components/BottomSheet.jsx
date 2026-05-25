import { AnimatePresence, motion, useDragControls } from 'framer-motion'
import { useEffect, useState } from 'react'

// Snap positions are translateY percentages relative to the sheet's own height.
// 'full' = sheet pinned to its full-height position (top edge near top of phone)
// 'compact' = pushed down so 35% of the sheet is hidden below the screen edge
const SNAP_Y = { full: '0%', compact: '35%' }
const SHEET_HEIGHT_PCT = 90 // percent of phone height the sheet occupies at full

export function BottomSheet({ open, onClose, children, initialSnap = 'full' }) {
  const [snap, setSnap] = useState(initialSnap)
  const dragControls = useDragControls()

  useEffect(() => {
    if (open) setSnap(initialSnap)
  }, [open, initialSnap])

  function handleDragEnd(_, info) {
    const dy = info.offset.y
    const vy = info.velocity.y

    if (snap === 'full') {
      if (dy > 220 || vy > 900) onClose()
      else if (dy > 60 || vy > 400) setSnap('compact')
    } else {
      if (dy > 80 || vy > 400) onClose()
      else if (dy < -50 || vy < -400) setSnap('full')
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="absolute inset-0 z-30">
          <motion.button
            type="button"
            aria-label="Close"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 cursor-default"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: SNAP_Y[snap] }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragElastic={0.15}
            dragMomentum={false}
            dragConstraints={{ top: 0 }}
            onDragEnd={handleDragEnd}
            className="absolute bottom-0 inset-x-0 bg-white rounded-t-xl flex flex-col overflow-hidden"
            style={{ height: `${SHEET_HEIGHT_PCT}%` }}
          >
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
  )
}
