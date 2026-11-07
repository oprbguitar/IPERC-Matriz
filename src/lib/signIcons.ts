import type { ComponentType } from 'react'
import {
  Activity, ArrowBigRight, Atom, BatteryCharging, BellRing, Biohazard, Bomb, BriefcaseMedical, Cable, CameraOff, CigaretteOff, Construction,
  Container, Cylinder, DoorOpen, Droplet, Droplets, Ear, Eye, Fan, FireExtinguisher, Fish, Flag, Flame, FlaskConical, Footprints, Forklift,
  Fuel, Glasses, Hand, HandMetal, HardHat, HeartPulse, Lock, Magnet, Megaphone, Package, Phone, PersonStanding, Plus, Power, PowerOff,
  Radiation, ScanLine, Shirt, ShowerHead, Siren, Skull, Smartphone, Snowflake, SprayCan, Stethoscope, Sun, Thermometer, ThermometerSun,
  TriangleAlert, Truck, Users, UtensilsCrossed, Volume2, Waves, Wind, Wrench, Zap,
} from 'lucide-react'

export type SignIcon = ComponentType<{ x?: number; y?: number; size?: number; color?: string; strokeWidth?: number }>

/** Iconos genéricos usados como pictogramas ilustrativos (no reproducen ISO 7010). */
export const SIGN_ICONS: Record<string, SignIcon> = {
  Activity, ArrowBigRight, Atom, BatteryCharging, BellRing, Biohazard, Bomb, BriefcaseMedical, Cable, CameraOff, CigaretteOff, Construction,
  Container, Cylinder, DoorOpen, Droplet, Droplets, Ear, Eye, Fan, FireExtinguisher, Fish, Flag, Flame, FlaskConical, Footprints, Forklift,
  Fuel, Glasses, Hand, HandMetal, HardHat, HeartPulse, Lock, Magnet, Megaphone, Package, Phone, PersonStanding, Plus, Power, PowerOff,
  Radiation, ScanLine, Shirt, ShowerHead, Siren, Skull, Smartphone, Snowflake, SprayCan, Stethoscope, Sun, Thermometer, ThermometerSun,
  TriangleAlert, Truck, Users, UtensilsCrossed, Volume2, Waves, Wind, Wrench, Zap,
}
