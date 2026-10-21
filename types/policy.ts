// after check API via Bruno

export interface Policy {
  id: string;
  policyNumber: string;
  customerId: string;
  customerName: string;
  policyType: string;
  insurer: string;
  status: string;
  premiumAmount: number;
  premiumFrequency: string;
  coverageAmount: number;
  deductibleAmount: number;
  currency: string;
  effectiveDate: string;
  expirationDate: string;
  agentName: string | null;
  notes: string | null;
  claimReference: string | null;
  createdAt: string;
  updatedAt: string;
  actions: string[];
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PolicyListResponse {
  data: Policy[];
  pagination: Pagination;
  filters: Record<string, unknown>;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    requestId: string;
  };
}
