export interface PosClient {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  qrToken: string;
  currentPoints: number;
  totalVisits: number;
  createdAt: string;
  _count?: {
    posTransactions: number;
    loyaltyLedger: number;
  };
}

export interface CatalogItem {
  id: string;
  name: string;
  category: 'Servicio' | 'Producto';
  price: number;
  pointsAwarded: number;
  active: boolean;
  createdAt?: string;
}

export interface RewardItem {
  id: string;
  title: string;
  description: string;
  requiredPoints: number;
  discountType: 'percentage' | 'fixed' | 'free_service';
  discountValue: number;
  active: boolean;
}

export interface CartLine {
  item: CatalogItem;
  quantity: number;
}

export interface PosTransactionItem {
  id: string;
  name: string;
  category: string;
  unitPrice: number;
  quantity: number;
  pointsAwarded: number;
  lineTotal: number;
  linePoints: number;
}

export interface PosTransactionRecord {
  id: string;
  idempotencyKey: string;
  clientId: string;
  items: PosTransactionItem[];
  subtotal: number;
  discountApplied: number;
  totalPaid: number;
  pointsEarned: number;
  pointsRedeemed: number;
  rewardId?: string | null;
  reward?: {
    id: string;
    title: string;
    discountType?: string;
    discountValue?: number;
  } | null;
  notes?: string | null;
  createdAt: string;
}

export interface LoyaltyLedgerEntry {
  id: string;
  clientId?: string;
  transactionId?: string | null;
  type: 'EARN' | 'REDEEM' | 'ADJUSTMENT';
  pointsDelta: number;
  visitsDelta: number;
  description: string;
  createdAt: string;
}

export interface PublicLoyaltyCardData {
  id: string;
  name: string;
  qrToken: string;
  currentPoints: number;
  totalVisits: number;
  createdAt: string;
  unlockedRewards: RewardItem[];
  nextReward: RewardItem | null;
  rewardsCatalog: RewardItem[];
  recentHistory: LoyaltyLedgerEntry[];
}
