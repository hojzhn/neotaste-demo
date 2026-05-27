import { AnimatePresence, motion } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { Logo } from "./Logo";
import { copy } from "../copy";

// Initial-load greeter — pops up the first time the page mounts to set
// expectations (it's a two-phone demo, both phones are live, on mobile
// you flip between them with the FAB). Tap anywhere outside the card,
// the X, or the CTA to dismiss. Highest z (just below the Loader) so
// it lands on top of everything once the app has finished loading.
export function IntroModal({ visible, onClose }) {
  const c = copy.intro;
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="intro-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          onClick={onClose}
          className="fixed inset-0 z-180 bg-ink/50 flex items-center justify-center p-6"
        >
          <motion.div
            key="intro-card"
            role="dialog"
            aria-labelledby="intro-title"
            initial={{ opacity: 0, scale: 0.92, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 18 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white rounded-lg shadow-[0_24px_60px_-20px_rgba(0,0,0,0.45)] overflow-hidden"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close intro"
              className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-strong active:scale-95 transition"
            >
              <X className="w-4 h-4" strokeWidth={2.25} />
            </button>

            <div className="bg-brand px-6 pt-6 pb-5 flex items-end gap-3">
              <Logo size={24} color="var(--color-ink)" title="NeoTaste" />
              <p className="text-ink font-semibold text-[13px] tracking-wide uppercase pb-1">
                {c.eyebrow}
              </p>
            </div>

            <div className="px-6 pt-5 pb-6 space-y-3">
              <h2
                id="intro-title"
                className="text-[24px] font-bold text-ink leading-tight"
              >
                {c.title}
              </h2>
              <p className="text-[14px] text-ink leading-snug">{c.body}</p>
              <p className="text-[13px] text-ink-muted leading-snug pt-1">
                {c.mobileNote}
              </p>

              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full h-12 rounded-lg bg-ink text-white font-semibold text-[15px] inline-flex items-center justify-center gap-2 hover:bg-ink/90 active:scale-[0.98] transition"
              >
                {c.cta}
                <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
