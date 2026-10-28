import {
  Activity,
  Dumbbell,
  Flame,
  Flower2,
  Footprints,
  PersonStanding,
  Target,
  Zap,
} from "lucide-react"

export const specialties = [
  { slug: "strength", label: "Strength", icon: Dumbbell },
  { slug: "hiit", label: "HIIT", icon: Zap },
  { slug: "fat-loss", label: "Fat Loss", icon: Flame },
  { slug: "yoga", label: "Yoga", icon: Flower2 },
  { slug: "mobility", label: "Mobility", icon: PersonStanding },
  { slug: "boxing", label: "Boxing", icon: Target },
  { slug: "running", label: "Running", icon: Footprints },
  { slug: "calisthenics", label: "Calisthenics", icon: Activity },
] as const

export const specialtyLabel = (slug: string) =>
  specialties.find((s) => s.slug === slug)?.label ?? slug
