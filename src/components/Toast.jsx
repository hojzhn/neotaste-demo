import { useEffect } from "react";
import { Gift, Utensils, Heart, ThumbsUp, X } from "lucide-react";
import { copy } from "../copy";

const TYPE_CONFIG = {
  gift: {
    Icon: Gift,
    iconBg: "bg-error",
    received: copy.toast.giftReceived,
    sent: copy.toast.giftSent,
  },
  dine: {
    Icon: Utensils,
    iconBg: "bg-verified",
    received: copy.toast.dineReceived,
    sent: copy.toast.dineSent,
  },
  thank: {
    Icon: Heart,
    iconBg: "bg-loyalty",
    received: copy.toast.thankReceived,
    sent: copy.toast.thankSent,
  },
  recommend: {
    Icon: ThumbsUp,
    iconBg: "bg-brand-dark",
    received: copy.toast.recommendReceived,
    sent: copy.toast.recommendSent,
  },
};

export function Toast({
  kind = "received",
  type,
  who,
  message,
  onClose,
  autoDismissMs = 5000,
}) {
  useEffect(() => {
    if (!autoDismissMs) return;
    const t = setTimeout(onClose, autoDismissMs);
    return () => clearTimeout(t);
  }, [autoDismissMs, onClose]);

  if (!type || !who) return null;

  const config = TYPE_CONFIG[type];
  if (!config) return null;

  const isReceived = kind === "received";
  const title = isReceived ? config.received(who) : config.sent(who);
  const { Icon, iconBg } = config;

  return (
    <div className="absolute top-12 inset-x-3 z-40 animate-[slidedown_220ms_ease-out]">
      <div className="bg-ink text-white rounded-md shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] p-3 flex items-start gap-3">
        <div
          className={`w-9 h-9 rounded-full ${iconBg} flex items-center justify-center shrink-0`}
        >
          <Icon className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-[14px] font-semibold leading-snug">{title}</p>
          {message && (
            <p className="text-[13px] text-white/80 mt-0.5 leading-snug">
              “{message}”
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={copy.toast.dismiss}
          className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 shrink-0"
        >
          <X className="w-4 h-4 text-white" strokeWidth={2.5} />
        </button>
      </div>
      <style>{`
        @keyframes slidedown {
          from { transform: translateY(-120%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
