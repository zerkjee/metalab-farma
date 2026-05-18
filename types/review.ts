export interface Review {
  id: string | number;
  productId: string | number;
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
  productId: string | number;
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
  productId: string | number;
  productName: string;
  productImage?: string;
  productColor: string;
  customerCity: string;
  customerState: string;
  timeAgo: string;
}
