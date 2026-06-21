import {
  Users,
  Building2,
  User,
  FileText,
  MapPin,
  Lock,
  Rocket,
  Eye,
  ShieldCheck,
  MessageSquare,
  ListChecks,
  Map as MapIcon,
  Bell,
  UserPlus,
  Compass,
  Flag,
  Route,
  Home,
  Briefcase,
  Wallet,
  CalendarClock,
  Landmark,
  TrafficCone,
  Headset,
  Scale,
  SquareParking,
  Droplets,
  Dumbbell,
  HeartHandshake,
  MountainSnow,
  Trees,
  Smartphone,
  type LucideIcon,
} from 'lucide-react'

import type { IconName } from './site'

const MAP: Record<IconName, LucideIcon> = {
  users: Users,
  building: Building2,
  user: User,
  fileText: FileText,
  mapPin: MapPin,
  lock: Lock,
  rocket: Rocket,
  eye: Eye,
  shieldCheck: ShieldCheck,
  messageSquare: MessageSquare,
  list: ListChecks,
  map: MapIcon,
  bell: Bell,
  userPlus: UserPlus,
  compass: Compass,
  flag: Flag,
  route: Route,
  home: Home,
  briefcase: Briefcase,
  wallet: Wallet,
  calendarClock: CalendarClock,
  landmark: Landmark,
  trafficCone: TrafficCone,
  headset: Headset,
  scale: Scale,
  parking: SquareParking,
  droplets: Droplets,
  dumbbell: Dumbbell,
  heartHandshake: HeartHandshake,
  mountain: MountainSnow,
  trees: Trees,
  smartphone: Smartphone,
}

export function Icon({
  name,
  className,
  strokeWidth = 1.6,
}: {
  name: IconName
  className?: string
  strokeWidth?: number
}) {
  const Cmp = MAP[name]
  if (!Cmp) return null
  return <Cmp className={className} strokeWidth={strokeWidth} aria-hidden="true" />
}
