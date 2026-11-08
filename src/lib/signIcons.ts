import type { ComponentType } from 'react'
import {
  Accessibility, Activity, Ambulance, Anvil, ArrowBigDown, ArrowBigLeft, ArrowBigRight, ArrowBigUp, Atom, Baby, Ban,
  BatteryCharging, Bell, BellRing, Biohazard, Bomb, Boxes, BriefcaseMedical, Brush, Bug, Cable, CameraOff, Car, CigaretteOff,
  CircleAlert, Cog, Construction, Container, Cross, Cylinder, Dog, DoorClosed, DoorOpen, Droplet, Droplets, Ear, Eye, Fan, Fence,
  FireExtinguisher, Fish, Flag, Flame, FlaskConical, Footprints, Forklift, Fuel, Gauge, Gem, Glasses, Hand, HandMetal, HardHat,
  HeartPulse, Layers, Lightbulb, Link, Lock, Magnet, Megaphone, Mountain, OctagonX, Package, PersonStanding, Phone, Plane, Plus,
  Power, PowerOff, Radiation, RadioTower, Recycle, ScanEye, ScanLine, Scissors, Shield, ShieldCheck, Shirt, Shovel, ShowerHead,
  Siren, Skull, Smartphone, Snowflake, SprayCan, Stethoscope, Sun, Swords, Tent, Thermometer, ThermometerSun, Tractor, Train,
  Trash2, TriangleAlert, Truck, Unplug, User, UserCheck, Users, UtensilsCrossed, Volume2, Waves, Weight, Wind, Wine, Wrench, Zap,
} from 'lucide-react'

export type SignIcon = ComponentType<{ x?: number; y?: number; size?: number; color?: string; strokeWidth?: number }>

/** Iconos genéricos usados como pictogramas ilustrativos (no reproducen ISO 7010). */
export const SIGN_ICONS: Record<string, SignIcon> = {
  Accessibility, Activity, Ambulance, Anvil, ArrowBigDown, ArrowBigLeft, ArrowBigRight, ArrowBigUp, Atom, Baby, Ban,
  BatteryCharging, Bell, BellRing, Biohazard, Bomb, Boxes, BriefcaseMedical, Brush, Bug, Cable, CameraOff, Car, CigaretteOff,
  CircleAlert, Cog, Construction, Container, Cross, Cylinder, Dog, DoorClosed, DoorOpen, Droplet, Droplets, Ear, Eye, Fan, Fence,
  FireExtinguisher, Fish, Flag, Flame, FlaskConical, Footprints, Forklift, Fuel, Gauge, Gem, Glasses, Hand, HandMetal, HardHat,
  HeartPulse, Layers, Lightbulb, Link, Lock, Magnet, Megaphone, Mountain, OctagonX, Package, PersonStanding, Phone, Plane, Plus,
  Power, PowerOff, Radiation, RadioTower, Recycle, ScanEye, ScanLine, Scissors, Shield, ShieldCheck, Shirt, Shovel, ShowerHead,
  Siren, Skull, Smartphone, Snowflake, SprayCan, Stethoscope, Sun, Swords, Tent, Thermometer, ThermometerSun, Tractor, Train,
  Trash2, TriangleAlert, Truck, Unplug, User, UserCheck, Users, UtensilsCrossed, Volume2, Waves, Weight, Wind, Wine, Wrench, Zap,
}
