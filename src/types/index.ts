// ─── Auth ──────────────────────────────────────────────────────
export type UserRole = 'SUPER_ADMIN' | 'AGENCY_ADMIN' | 'DISPATCHER' | 'FLEET_ADMIN' | 'DRIVER'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  agencyId?: string
  fleetId?: string
}

// ─── Pagination ────────────────────────────────────────────────
export interface PaginationMeta {
  total: number
  page: number
  perPage: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

// ─── Agency ────────────────────────────────────────────────────
export type AgencyStatus = 'ACTIVE' | 'SUSPENDED' | 'INACTIVE'
export type SubscriptionPlan = 'BASIC' | 'PRO' | 'ENTERPRISE'

export interface Agency {
  id: string
  name: string
  ownerName: string
  contactEmail: string
  contactPhone: string
  address?: string
  status: AgencyStatus
  plan: SubscriptionPlan
  commissionPercent: number
  paymentTermsDays: number
  logoUrl?: string
  createdAt: string
  updatedAt: string
}

// ─── Fleet ─────────────────────────────────────────────────────
export type FleetStatus = 'INVITED' | 'PENDING' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED' | 'INACTIVE'

export interface Fleet {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  status: FleetStatus
  createdAt: string
  updatedAt: string
}

// ─── Dispatcher ────────────────────────────────────────────────
export type DispatcherStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED_TRANSFER' | 'SUSPENDED_RESTORATION' | 'INACTIVE'

export interface Dispatcher {
  id: string
  agencyId: string
  name: string
  email: string
  phone?: string
  status: DispatcherStatus
  totalLoadsCreated: number
  totalLoadsCompleted: number
  completionRate: number
  onTimeDeliveryRate: number
  overallRating: number
  createdAt: string
  updatedAt: string
}

// ─── Driver ────────────────────────────────────────────────────
export type DriverStatus = 'PENDING' | 'ACTIVE' | 'ON_LOAD' | 'SUSPENDED_TRANSFER' | 'SUSPENDED_RESTORATION' | 'INACTIVE'

export interface Driver {
  id: string
  fleetId: string
  name: string
  email: string
  phone?: string
  licenseNumber?: string
  status: DriverStatus
  createdAt: string
  updatedAt: string
}

// ─── Vehicle ───────────────────────────────────────────────────
export type VehicleStatus = 'AVAILABLE' | 'ON_LOAD' | 'UNDER_MAINTENANCE' | 'INACTIVE'
export type VehicleType = 'SEMI' | 'FLATBED' | 'REEFER' | 'BOX_TRUCK' | 'TANKER' | 'OTHER'

export interface Vehicle {
  id: string
  fleetId: string
  make: string
  model: string
  year: number
  plateNumber: string
  vinNumber?: string
  vehicleType: VehicleType
  capacityTons?: number
  status: VehicleStatus
  insuranceExpiry?: string
  inspectionExpiry?: string
  createdAt: string
  updatedAt: string
}

// ─── Load ──────────────────────────────────────────────────────
export type LoadStatus =
  | 'DRAFT'
  | 'ASSIGNED'
  | 'IN_TRANSIT'
  | 'PENDING_DELIVERY_CONFIRMATION'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'

export interface Load {
  id: string
  serialNumber: string
  loadNumber?: string | null
  agencyId: string
  dispatcherId: string
  fleetId?: string
  driverId?: string
  vehicleId?: string
  pickupLocation: string
  dropoffLocation: string
  pickupDate: string
  deliveryDate: string
  loadRate: number
  commissionPercent: number
  commissionAmount: number
  fleetEarnings: number
  dispatcherEarnings: number
  status: LoadStatus
  notes?: string
  podFileUrl?: string
  tripStartedAt?: string
  deliverySubmittedAt?: string
  deliveryAcceptedAt?: string
  completedAt?: string
  cancellationReason?: string
  cancelledAt?: string
  createdAt: string
  updatedAt: string
  dispatcher?: { id: string; name: string; email: string }
  fleet?: { id: string; name: string }
  driver?: { id: string; name: string; phone?: string }
  vehicle?: { id: string; make: string; model: string; plateNumber: string; vehicleType: VehicleType }
  statusHistory?: LoadStatusHistory[]
}

export interface LoadStatusHistory {
  id: string
  loadId: string
  status: LoadStatus
  changedAt: string
  changedById: string
  changedByRole: UserRole
  note?: string
}

// ─── Invoice ───────────────────────────────────────────────────
export type InvoiceStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'DISPUTED'
export type PaymentMethod = 'BANK_TRANSFER' | 'CHEQUE' | 'CASH' | 'OTHER'

export interface Invoice {
  id: string
  invoiceNumber: string
  loadId: string
  agencyId: string
  fleetId: string
  loadRate: number
  commissionPercent: number
  commissionAmount: number
  fleetEarnings: number
  dispatcherEarnings: number
  status: InvoiceStatus
  generatedAt: string
  dueDate: string
  amountPaid?: number
  paymentMethod?: PaymentMethod
  paymentReference?: string
  paymentDate?: string
  paidAt?: string
  isDisputed: boolean
  disputeReason?: string
  pdfUrl?: string
  load?: { id: string; serialNumber: string; loadNumber?: string | null; pickupLocation: string; dropoffLocation: string }
  fleet?: { id: string; name: string }
  receipt?: Receipt
  createdAt: string
  updatedAt: string
}

// ─── Receipt ───────────────────────────────────────────────────
export interface Receipt {
  id: string
  receiptNumber: string
  invoiceId: string
  loadId: string
  agencyId: string
  fleetId: string
  loadRate: number
  commissionAmount: number
  fleetEarnings: number
  amountPaid: number
  paymentMethod: PaymentMethod
  paymentReference?: string
  paymentDate: string
  pdfUrl?: string
  generatedAt: string
}

// ─── Notification ──────────────────────────────────────────────
export interface Notification {
  id: string
  userId: string
  userRole: UserRole
  type: string
  title: string
  message: string
  data?: Record<string, unknown>
  isRead: boolean
  readAt?: string
  createdAt: string
}
