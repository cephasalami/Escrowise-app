import TransactionDetails from "@/components/admin/TransactionDetails";

interface PageProps {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function TransactionPage({ params }: PageProps) {
  return (
    <div className="container mx-auto py-8 px-4">
      <TransactionDetails transactionId={params.id} />
    </div>
  );
}
