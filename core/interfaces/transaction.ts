export interface ITransaction {
    tId?: string;
    transactionId?: string;
    createdAt?: string;
    date: string;
    description?: string;
    type?: string;
    amount: number;
    country?: string;
    status: string;
}