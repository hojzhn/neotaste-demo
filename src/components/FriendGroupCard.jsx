import clsx from "clsx";
import { Avatar } from "./Avatar";

// Collapsed display of a friend group, à la Instagram's Close Friends share
// affordance. Shows up to 3 overlapping avatars and a "{firstName} +N" label
// (where N is the count of other friends in the group). Used both in the
// recommend flow and in the MessageSheet's "sending to" row when there are
// multiple recipients.
export function FriendGroupCard({
  friends,
  subtitle,
  onClick,
  className,
}) {
  if (!friends || friends.length === 0) return null;
  const visible = friends.slice(0, 3);
  const first = friends[0];
  const rest = friends.length - 1;
  const label = rest > 0 ? `${first.name} +${rest}` : first.name;

  const Element = onClick ? "button" : "div";
  return (
    <Element
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={clsx(
        "w-full flex items-center gap-3 p-3 rounded-2xl bg-surface text-left",
        onClick && "hover:bg-surface-strong transition-colors",
        className,
      )}
    >
      <div className="flex -space-x-3 shrink-0">
        {visible.map((f) => (
          <Avatar
            key={f.id}
            initials={f.initials}
            color={f.avatarColor}
            size={36}
            ring
          />
        ))}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-ink truncate">{label}</p>
        {subtitle && (
          <p className="text-[12px] text-ink-muted truncate">{subtitle}</p>
        )}
      </div>
    </Element>
  );
}
