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
  sportId: string;
  sport: Sport;
  branch?: Branch;
  name: string;
  description?: string;
  image?: string;
  pricePerHour: number;
  minDuration: number;
  maxDuration: number;
  isActive: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
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
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
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
  role: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF';
  business: {
    id: string;
    name: string;
    logo?: string;
    primaryColor: string;
    currency: string;
  };
}
