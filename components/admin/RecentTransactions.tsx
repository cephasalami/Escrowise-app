"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const transactions = [
  {
    id: "TX-1234",
    title: "Domain Purchase",
    amount: "$2,500.00",
    status: "completed",
    date: "Apr 3, 2023",
  },
  {
    id: "TX-1235",
    title: "Website Development",
    amount: "$5,000.00",
    status: "in progress",
    date: "Apr 2, 2023",
  },
  {
    id: "TX-1236",
    title: "Logo Design",
    amount: "$500.00",
    status: "pending",
    date: "Apr 1, 2023",
  },
  {
    id: "TX-1237",
    title: "Social Media Marketing",
    amount: "$1,200.00",
    status: "disputed",
    date: "Mar 30, 2023",
  },
  {
    id: "TX-1238",
    title: "SaaS Subscription",
    amount: "$4,999.00",
    status: "completed",
    date: "Mar 29, 2023",
  },
]

const StatusBadge = ({ status }: { status: string }) => {
  const statusStyles = {
    completed: "bg-green-100 text-green-800 hover:bg-green-200",
    "in progress": "bg-blue-100 text-blue-800 hover:bg-blue-200",
    pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    disputed: "bg-red-100 text-red-800 hover:bg-red-200",
  }

  const statusType = status as keyof typeof statusStyles

  return (
    <Badge className={`font-medium ${statusStyles[statusType] || "bg-gray-100 text-gray-800"}`} variant="outline">
      {status}
    </Badge>
  )
}

export default function RecentTransactions() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-bold">Recent Transactions</CardTitle>
        <Link href="/admin/transactions" className="text-sm text-orange-600 hover:text-orange-700 font-medium">
          View all
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="hidden sm:grid grid-cols-5 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div>ID</div>
            <div className="col-span-2">Transaction</div>
            <div>Amount</div>
            <div>Status</div>
          </div>

          {transactions.map((transaction) => (
            <Link
              href={`/admin/transactions/${transaction.id}`}
              key={transaction.id}
              className="grid grid-cols-2 sm:grid-cols-5 gap-2 py-3 px-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-sm text-gray-500">{transaction.id}</div>
              <div className="col-span-2 hidden sm:block">
                <div className="font-medium">{transaction.title}</div>
                <div className="text-xs text-gray-500">{transaction.date}</div>
              </div>
              <div className="sm:hidden">
                <div className="font-medium">{transaction.title}</div>
                <div className="text-xs text-gray-500">{transaction.date}</div>
              </div>
              <div className="font-medium">{transaction.amount}</div>
              <div className="flex items-center justify-between">
                <StatusBadge status={transaction.status} />
                <ChevronRight className="h-4 w-4 text-gray-400 sm:ml-2" />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

