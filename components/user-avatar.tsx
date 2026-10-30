import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { avatarUrl, cn, initials } from "@/lib/utils"

export function UserAvatar({
  name,
  src,
  className,
}: {
  name: string
  src?: string | null
  className?: string
}) {
  return (
    <Avatar className={cn("overflow-hidden", className)}>
      {/* ImageKit crops to the face (fo-face), so 4:5 portraits read well at avatar size */}
      {src && <AvatarImage src={avatarUrl(src)} alt={name} />}
      <AvatarFallback className="bg-accent font-semibold text-accent-foreground">
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  )
}
