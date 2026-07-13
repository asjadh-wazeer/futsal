export interface Business {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  primaryColor: string;
  accentColor: string;
  phone?: string;
  email?: string;
  currency: string;
  branches?: Branch[];
}

export interface Branch {
  id: string;
  businessId: string;
  name: string;
  address: string;
  city: string;
  phone?: string;
  email?: string;
  openTime: string;
  closeTime: string;
  slotDuration: number;
  isActive: boolean;
  courts?: Court[];
  _count?: { courts: number; bookings: number };
}

export interface Sport {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  color: string;
  isActive: boolean;
}

export interface Court {
  id: string;
  branchId: string;
  sports: Sport[];
  branch?: Branch;
  name: string;
  description?: string;
  image?: string;
  pricePerHour: number;
  size?: string;
  minDuration: number;
  maxDuration: number;
  isActive: boolean;
  pricingRules?: PricingRule[];
  schedules?: CourtSchedule[];
  _count?: { bookings: number };
}

export interface PricingRule {
  id: string;
  courtId: string;
  name: string;
  pricePerHour: number;
  dayType: 'ALL' | 'WEEKDAY' | 'WEEKEND';
  startHour: number;
  endHour: number;
  priority: number;
  isActive: boolean;
}

export interface CourtSchedule {
  id?: string | null;
  courtId: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  createdAt: string;
  totalSpent: number;
  visitCount: number;
  bookings?: Booking[];
  _count?: { bookings: number };
}

export interface Booking {
  id: string;
  bookingRef: string;
  branchId: string;
  branch: Branch;
  courtId: string;
  court: Court;
  customerId: string;
  customer: Customer;
  sportId?: string;
  sport?: Sport;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  courtAmount: number;
  platformFee: number;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  source: 'CUSTOMER' | 'MANUAL';
  createdByName?: string;
  cancelledByName?: string;
  cancelledAt?: string;
  notes?: string;
  payment?: Payment;
  createdAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  method: 'ONLINE' | 'CASH' | 'CARD';
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  transactionId?: string;
  paidAt?: string;
}

export interface TimeSlot {
  time: string;
  endTime: string;
  available: boolean;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'OWNER' | 'STAFF';
  branchId?: string | null;
  isActive?: boolean;
  createdAt?: string;
  business: {
    id: string;
    name: string;
    logo?: string;
    primaryColor: string;
    currency?: string;
  };
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'STAFF';
  isActive: boolean;
  branchId: string | null;
  createdAt: string;
  branch: { id: string; name: string; city: string } | null;
}
