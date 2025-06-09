"use client"

import { useEffect, useState } from 'react';
import { supabase } from '../../src/supabaseClient';

interface TransactionDetailsProps {
  name: string
  category: string
  price: string
  description: string
  inspectionPeriod: string
}

function TransactionDetails({ name }: { name: string }) {
  const [transaction, setTransaction] = useState<TransactionDetailsProps | null>(null);

  useEffect(() => {
    const fetchTransaction = async () => {
      const { data, error } = await supabase.from('transactions').select('*').eq('name', name);
      if (error) console.error('Error fetching data:', error);
      else setTransaction(data[0]);
    };
    fetchTransaction();
  }, [name]);

  return transaction ? (
    <article className="p-5 sm:p-6 w-full rounded-xl bg-gray-50 border border-gray-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <div>
          <h3 className="text-lg sm:text-xl font-bold tracking-tighter text-black">{transaction.name}</h3>
          <p className="text-sm sm:text-base text-gray-600">{transaction.category}</p>
        </div>
        <p className="text-lg sm:text-xl font-bold text-black mt-2 sm:mt-0">${Number.parseFloat(transaction.price).toFixed(2)}</p>
      </div>
      <p className="mb-5 text-sm sm:text-base text-gray-700">{transaction.description}</p>
      {transaction.inspectionPeriod && (
        <div className="flex gap-1.5 text-sm sm:text-base text-gray-700">
          <p>Inspection Period:</p>
          <p className="font-medium">{transaction.inspectionPeriod} Days</p>
        </div>
      )}
    </article>
  ) : null;
}

export default TransactionDetails
