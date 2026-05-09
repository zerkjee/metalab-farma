export interface Review {
  id: number;
  productId: number;
  productName: string;
  productImage?: string;
  productColor: string;
  customerName: string;
  customerCity: string;
  customerState: string;
  customerInitials: string;
  avatarColor: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verified: boolean;
  helpfulCount: number;
  totalVotes: number;
  photos?: string[];
  featured?: boolean;
}

export interface RatingSummary {
  productId: number;
  averageRating: number;
  totalReviews: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface PurchaseNotif {
  productId: number;
  productName: string;
  productImage?: string;
  productColor: string;
  customerCity: string;
  customerState: string;
  timeAgo: string;
}
