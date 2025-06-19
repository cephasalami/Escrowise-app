import { Metadata } from 'next';
import TransactionDetails from "@/components/admin/TransactionDetails";

export const metadata: Metadata = {
  title: 'Transaction Details',
};

interface TransactionPageProps {
  params: { id: string };
}

export default function TransactionPage({ params }: TransactionPageProps) {
  return (
    <div className="container mx-auto py-8 px-4">
      <TransactionDetails transactionId={params.id} />
    </div>
  );
}
