export type CurrencyCode =
  | "EGP"
  | "SAR"
  | "AED"
  | "USD"
  | "KWD"
  | "QAR"
  | "BHD"
  | "OMR"
  | "JOD";

export type CircleStatus = "OPEN" | "ACTIVE" | "COMPLETED" | "CANCELLED";

export type TransactionType = "CONTRIBUTION" | "PAYOUT" | "REFUND";
export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED";

export type KycStatus = "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
export type UserRole = "USER" | "ADMIN";

export interface UserSummary {
  id: string;
  email: string;
  fullName: string;
  salary: string;
  walletBalance: string;
  currency: CurrencyCode;
  kycStatus?: KycStatus;
  role?: UserRole;
}

export interface AuthResponse {
  token: string;
  user: UserSummary;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  country: string;
  currency: CurrencyCode;
  salary: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface CircleResponse {
  id: string;
  name: string;
  totalValue: string;
  durationMonths: number;
  monthlyContribution: string;
  currency: CurrencyCode;
  maxMembers: number;
  currentMembers: number;
  currentMonth: number;
  status: CircleStatus;
  isAffordable?: boolean;
  isJoined?: boolean;
}

export interface CirclesListResponse {
  circles: CircleResponse[];
}

export interface CircleJoinOrValidateResponse {
  approved: boolean;
  monthlyBurden?: string;
  newTotalBurden?: string;
  remainingCapacity?: string;
  reason?: string;
  suggestedMinDuration?: number;
  suggestedDuration?: number;
}

export interface ValidateCircleBody {
  totalValue: number;
  durationMonths: number;
}

export interface CreateCirclePayload {
  name: string;
  totalValue: number;
  durationMonths: number;
  currency: CurrencyCode;
  maxMembers: number;
}

export interface UserProfileResponse {
  id: string;
  email: string;
  fullName: string;
  country: string;
  currency: CurrencyCode;
  salary: string | number;
  walletBalance: string | number;
  riskScore: number;
  kycStatus: KycStatus;
  role: UserRole;
  kycDocumentUrl?: string;
  activeCircles?: MyCircleMembershipSummary[];
}

export interface MyCircleMembershipSummary {
  circleId: string;
  name: string;
  monthlyContribution?: string | number;
  monthlyPayment?: string | number;
  currency?: CurrencyCode;
  durationMonths?: number;
  currentMonth?: number;
  monthsRemaining?: number;
  slotNumber?: number;
  payoutStatus?: string;
  status?: string;
}

export interface MyCirclesResponse {
  activeCircles: MyCircleMembershipSummary[];
  completedCircles: MyCircleMembershipSummary[];
}

export interface TransactionResponse {
  id: string;
  userId?: string;
  circleId?: string | null;
  type: TransactionType;
  amount: string | number;
  currency: CurrencyCode;
  status: TransactionStatus;
  description?: string | null;
  monthNumber?: number | null;
  createdAt: string;
}

export interface TransactionsListResponse {
  transactions: TransactionResponse[];
}

export interface ApiErrorBody {
  status?: number;
  error?: string;
  message?: string;
  timestamp?: string;
}

export interface ActiveCircleRow {
  circleId: string;
  name: string;
  monthlyAmount: string;
  currency: CurrencyCode;
  monthsRemaining: number;
  payoutStatus: string;
  circleStatus?: string;
}
