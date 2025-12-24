export type Seller = {
    id: string;
    name: string;
    phone: string;
    category: string; // e.g., "TMT Bars"
    credits: number;  // Wallet balance
    isVerified: boolean;
};

export type BuyerRequest = {
    id: string;
    buyerName: string;
    product: string;
    category: string;
    quantity: string;
    status: 'OPEN' | 'LOCKED' | 'CLOSED';
    lockedBySellerId?: string; // The winner
};
