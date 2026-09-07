import { getChildAvatar } from "@/lib/accounts/child-avatars";
import type { ChildAvatarId } from "@/lib/accounts/types";
import { cn } from "@/lib/utils/cn";

export interface ChildAvatarProps {
  avatar: ChildAvatarId;
  size?: "md" | "lg" | "xl";
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<ChildAvatarProps["size"]>, string> = {
  md: "size-11 text-xl",
  lg: "size-16 text-3xl",
  xl: "size-24 text-5xl",
};

function ChildAvatar({ avatar, size = "md", className }: ChildAvatarProps) {
  const option = getChildAvatar(avatar);
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full",
        option.bg,
        SIZE_CLASSES[size],
        className,
      )}
      role="img"
      aria-label={`${option.label} avatar`}
    >
      <span aria-hidden="true">{option.emoji}</span>
    </div>
  );
}

export { ChildAvatar };
