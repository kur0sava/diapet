/**
 * Unified Icon component — wraps Lucide Icons with a string-based API
 * for easy migration from Ionicons.
 */
import React from 'react';
import {
  House,
  Droplets,
  PawPrint,
  BookOpen,
  CircleEllipsis,
  PlusCircle,
  Pencil,
  Trash2,
  XCircle,
  RefreshCw,
  Clock,
  Syringe,
  Stethoscope,
  HeartPulse,
  UtensilsCrossed,
  Package,
  AlertCircle,
  Info,
  AlertTriangle,
  Star,
  Gift,
  FileText,
  Settings,
  Link,
  Camera,
  Images,
  BarChart3,
  Calculator,
  MessageCircle,
  Calendar,
  List,
  Search,
  Bell,
  Wheat,
  Store,
  Lightbulb,
  Heart,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  X,
  Check,
  Send,
  Beaker,
  Leaf,
  Globe,
  Moon,
  Sun,
  Shield,
  Phone,
  CreditCard,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  Eye,
  EyeOff,
  Share2,
  Download,
  Filter,
  MoreVertical,
  LogOut,
  User,
  Dumbbell,
  Pill,
  Activity,
  Clipboard,
  Scale,
  CircleHelp,
  Lock,
  MinusCircle,
  Wallet,
  ShoppingCart,
  ShoppingBag,
  ArrowUp,
  type LucideIcon,
} from 'lucide-react-native';

/**
 * Icon name mapping — maps semantic names to Lucide components.
 * Kept as a flat record for O(1) lookup.
 */
const ICON_MAP: Record<string, LucideIcon> = {
  // Navigation tabs
  'home': House,
  'home-outline': House,
  'water': Droplets,
  'water-outline': Droplets,
  'paw': PawPrint,
  'paw-outline': PawPrint,
  'book': BookOpen,
  'book-outline': BookOpen,
  'ellipsis-horizontal-circle': CircleEllipsis,
  'ellipsis-horizontal-circle-outline': CircleEllipsis,

  // Actions
  'add-circle-outline': PlusCircle,
  'add-circle': PlusCircle,
  'add': Plus,
  'create-outline': Pencil,
  'pencil': Pencil,
  'trash-outline': Trash2,
  'trash': Trash2,
  'close-circle-outline': XCircle,
  'close-circle': XCircle,
  'close': X,
  'refresh-outline': RefreshCw,
  'refresh': RefreshCw,
  'checkmark': Check,
  'checkmark-circle': Check,
  'send': Send,

  // Time & Calendar
  'time-outline': Clock,
  'time': Clock,
  'calendar-outline': Calendar,
  'calendar': Calendar,

  // Medical
  'fitness-outline': Syringe,
  'fitness': Syringe,
  'medkit-outline': Stethoscope,
  'medkit': Stethoscope,
  'medical-outline': HeartPulse,
  'medical': HeartPulse,
  'heart-outline': Heart,
  'heart': Heart,
  'pulse-outline': Activity,
  'pulse': Activity,
  'pill': Pill,

  // Food
  'restaurant-outline': UtensilsCrossed,
  'restaurant': UtensilsCrossed,
  'nutrition-outline': Wheat,
  'nutrition': Wheat,
  'fast-food-outline': UtensilsCrossed,
  'fast-food': UtensilsCrossed,
  'flask-outline': Beaker,
  'flask': Beaker,
  'leaf-outline': Leaf,
  'leaf': Leaf,
  'cafe-outline': UtensilsCrossed,

  // UI elements
  'alert-circle-outline': AlertCircle,
  'alert-circle': AlertCircle,
  'information-circle-outline': Info,
  'information-circle': Info,
  'warning-outline': AlertTriangle,
  'warning': AlertTriangle,
  'star-outline': Star,
  'star': Star,
  'gift-outline': Gift,
  'gift': Gift,
  'help-circle-outline': CircleHelp,

  // Documents & Data
  'document-text-outline': FileText,
  'document-text': FileText,
  'clipboard-outline': Clipboard,
  'clipboard': Clipboard,
  'list-outline': List,
  'list': List,
  'analytics-outline': BarChart3,
  'analytics': BarChart3,
  'stats-chart-outline': BarChart3,
  'filter-outline': Filter,
  'filter': Filter,

  // Settings & Profile
  'settings-outline': Settings,
  'settings': Settings,
  'person-outline': User,
  'person': User,
  'log-out-outline': LogOut,
  'shield-outline': Shield,
  'shield': Shield,
  'eye-outline': Eye,
  'eye-off-outline': EyeOff,

  // Communication
  'chatbubble-ellipses-outline': MessageCircle,
  'chatbubble-ellipses': MessageCircle,
  'chatbubble-outline': MessageCircle,
  'notifications-outline': Bell,
  'notifications': Bell,
  'call-outline': Phone,
  'call': Phone,

  // Media
  'camera-outline': Camera,
  'camera': Camera,
  'images-outline': Images,
  'images': Images,
  'share-outline': Share2,
  'share-social-outline': Share2,
  'download-outline': Download,

  // Commerce
  'storefront-outline': Store,
  'storefront': Store,
  'card-outline': CreditCard,
  'card': CreditCard,
  'calculator-outline': Calculator,
  'calculator': Calculator,
  'cube-outline': Package,
  'cube': Package,
  'cash-outline': CreditCard,

  // Navigation arrows
  'chevron-forward': ChevronRight,
  'chevron-forward-outline': ChevronRight,
  'chevron-back': ChevronLeft,
  'chevron-back-outline': ChevronLeft,
  'chevron-down': ChevronDown,
  'chevron-down-outline': ChevronDown,
  'chevron-up': ChevronUp,
  'chevron-up-outline': ChevronUp,
  'arrow-back': ArrowLeft,
  'arrow-back-outline': ArrowLeft,

  // Misc
  'bulb-outline': Lightbulb,
  'bulb': Lightbulb,
  'link-outline': Link,
  'link': Link,
  'globe-outline': Globe,
  'globe': Globe,
  'moon-outline': Moon,
  'moon': Moon,
  'sunny-outline': Sun,
  'sunny': Sun,
  'search-outline': Search,
  'search': Search,
  'sparkles': Sparkles,
  'sparkles-outline': Sparkles,
  'trending-up': TrendingUp,
  'trending-up-outline': TrendingUp,
  'trending-down': TrendingDown,
  'trending-down-outline': TrendingDown,
  'remove-outline': Minus,
  'remove-circle': MinusCircle,
  'remove-circle-outline': MinusCircle,
  'lock-closed': Lock,
  'lock-closed-outline': Lock,
  'wallet-outline': Wallet,
  'wallet': Wallet,
  'cart-outline': ShoppingCart,
  'cart': ShoppingCart,
  'bag-outline': ShoppingBag,
  'bag': ShoppingBag,
  'arrow-up': ArrowUp,
  'arrow-up-outline': ArrowUp,
  'stats-chart': BarChart3,
  'ellipsis-vertical': MoreVertical,
  'scale-outline': Scale,
  'barbell-outline': Dumbbell,
};

export type IconName = keyof typeof ICON_MAP | (string & {});

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: object;
}

export function Icon({ name, size = 24, color = '#000', strokeWidth = 1.75, style }: IconProps) {
  const LucideComponent = ICON_MAP[name];

  if (!LucideComponent) {
    // Fallback — render nothing rather than crash
    if (__DEV__) {
      console.warn(`[Icon] Unknown icon name: "${name}"`);
    }
    return null;
  }

  return <LucideComponent size={size} color={color} strokeWidth={strokeWidth} style={style} />;
}

// Re-export individual icons for direct use
export {
  House, Droplets, PawPrint, BookOpen, CircleEllipsis,
  PlusCircle, Pencil, Trash2, XCircle, RefreshCw,
  Clock, Syringe, Stethoscope, HeartPulse, UtensilsCrossed,
  Package, AlertCircle, Info, AlertTriangle, Star,
  Gift, FileText, Settings, Link, Camera,
  Images, BarChart3, Calculator, MessageCircle, Calendar,
  List, Search, Bell, Wheat, Store,
  Lightbulb, Heart, ChevronRight, ChevronLeft, ChevronDown, ChevronUp, ArrowLeft,
  X, Check, Send, Beaker, Leaf,
  Globe, Moon, Sun, Shield, Phone,
  CreditCard, Sparkles, TrendingUp, TrendingDown, Plus,
  Minus, Filter, MoreVertical, User, Activity, Scale,
  Lock, MinusCircle, Wallet, ShoppingCart, ShoppingBag, ArrowUp,
  type LucideIcon,
};
