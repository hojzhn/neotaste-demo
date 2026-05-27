import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "./Logo";

// Full-screen loader — brand-green canvas with the NeoTaste "N" mark
// gently pulsing in the centre and an animated "Loading" line below.
// AnimatePresence lets the parent fade it out cleanly once everything's
// ready; the highest z so it sits above every other overlay in the app
// (StatusBar, redeem flow, sheets, etc.).
export function Loader({ visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="app-loader"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="fixed inset-0 z-200 bg-brand flex flex-col items-center justify-center gap-6 select-none"
          role="status"
          aria-live="polite"
        >
          <motion.div
            animate={{
              scale: [1, 1.08, 1],
              opacity: [0.85, 1, 0.85],
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Logo size={88} color="var(--color-ink)" title="NeoTaste" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="text-ink font-bold text-[15px] tracking-[0.12em] uppercase"
          >
            Loading
            <motion.span
              aria-hidden="true"
              className="inline-block"
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.5, 1],
              }}
            >
              …
            </motion.span>
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
