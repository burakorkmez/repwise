import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn, initials } from "@/lib/utils"

export function UserAvatar({
  name,
  src,
  className,
}: {
  name: string
  src?: string
  className?: string
}) {
  return (
    <Avatar className={cn("overflow-hidden", className)}>
      {/* Photos are 4:5 portraits; zoom toward the face so small avatars read well */}
      {src && <AvatarImage src={src} alt={name} className="origin-[50%_30%] scale-[1.6] object-top" />}
      <AvatarFallback className="bg-accent font-semibold text-accent-foreground">
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  )
}
