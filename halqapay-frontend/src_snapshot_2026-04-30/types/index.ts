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
  inviteCode?: string;
  nextPayoutDate?: string | null;
  nextDeadline?: string | null;
}

export interface CirclesListResponse {
  circles: CircleResponse[];
}

export interface CircleJoinOrValidateResponse {
  approved: boolean;
  /** In the USER's home currency */
  monthlyBurden?: string | number;
  /** In the USER's home currency */
  newTotalBurden?: string | number;
  /** In the USER's home currency */
  remainingCapacity?: string | number;
  reason?: string;
  suggestedMinDuration?: number;
  suggestedDuration?: number;
  /** Currency that monthlyBurden / newTotalBurden / remainingCapacity are expressed in */
  userCurrency?: CurrencyCode;
  /** The circle's own monthly contribution (in the circle's currency) */
  circleMonthlyInCircleCurrency?: string | number;
  circleCurrency?: CurrencyCode;
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
  isPrivate: boolean;
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
  /** Monthly payment converted to user's home currency — use for DTI calculation */
  monthlyPaymentInUserCurrency?: string | number;
  userCurrency?: CurrencyCode;
  currency?: CurrencyCode;
  durationMonths?: number;
  currentMonth?: number;
  monthsRemaining?: number;
  slotNumber?: number;
  payoutStatus?: string;
  status?: string;
  inviteCode?: string;
  isPrivate?: boolean;
  nextPayoutDate?: string | null;
  nextDeadline?: string | null;
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
  /** In user's home currency — for burden calculations */
  monthlyAmountInUserCurrency?: string;
  userCurrency?: CurrencyCode;
  monthsRemaining: number;
  payoutStatus: string;
  circleStatus?: string;
  inviteCode?: string;
  isPrivate?: boolean;
  nextPayoutDate?: string | null;
  nextDeadline?: string | null;
}

export type NotificationType = "WALLET_TOPUP" | "WALLET_WITHDRAW" | "CIRCLE_PAYOUT" | "PAYMENT_DEADLINE" | "CIRCLE_ACTIVE" | "CIRCLE_JOINED" | "GENERIC";

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  type: NotificationType;
  createdAt: string;
}

export interface CircleMemberDetailItem {
  slotNumber: number;
  fullName: string;
  payoutMonth: number;
  payoutDate: string;
  payoutReceived: boolean;
}

export interface CircleDetailResponse {
  circleId: string;
  name: string;
  currency: CurrencyCode;
  totalValue: string | number;
  monthlyContribution: string | number;
  durationMonths: number;
  currentMonth: number;
  circleStatus: string;
  mySlotNumber: number;
  /** True when this month's payout goes to me — pay button is disabled */
  isMyPayoutMonth: boolean;
  nextPaymentDeadline: string;
  amountRemainingToPay: string | number;
  members: CircleMemberDetailItem[];
}
