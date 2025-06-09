"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

export default function TransactionsTable() {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRows, setSelectedRows] = useState<string[]>([])

  const transactions = [
    {
      id: "TX-2023-04-25-001",
      buyer: "John Smith",
      seller: "Alice Johnson",
      amount: "$2,500.00",
      status: "Completed",
      date: "2023-04-25",
      type: "Domain Purchase",
    },
    {
      id: "TX-2023-04-24-002",
      buyer: "Robert Brown",
      seller: "Emma Davis",
      amount: "$1,800.00",
      status: "In Progress",
      date: "2023-04-24",
      type: "Service Contract",
    },
    {
      id: "TX-2023-04-23-003",
      buyer: "Michael Wilson",
      seller: "Olivia Martinez",
      amount: "$3,200.00",
      status: "Pending",
      date: "2023-04-23",
      type: "Product Sale",
    },
    {
      id: "TX-2023-04-22-004",
      buyer: "William Taylor",
      seller: "Sophia Anderson",
      amount: "$950.00",
      status: "Completed",
      date: "2023-04-22",
      type: "Digital Asset",
    },
    {
      id: "TX-2023-04-21-005",
      buyer: "James Thomas",
      seller: "Isabella Jackson",
      amount: "$1,500.00",
      status: "Disputed",
      date: "2023-04-21",
      type: "Consulting Fee",
    },
    {
      id: "TX-2023-04-20-006",
      buyer: "David White",
      seller: "Ava Harris",
      amount: "$4,800.00",
      status: "Completed",
      date: "2023-04-20",
      type: "Software License",
    },
    {
      id: "TX-2023-04-19-007",
      buyer: "Christopher Garcia",
      seller: "Mia Lewis",
      amount: "$2,100.00",
      status: "Pending",
      date: "2023-04-19",
      type: "Marketing Campaign",
    },
    {
      id: "TX-2023-04-18-008",
      buyer: "Daniel Lee",
      seller: "Chloe Walker",
      amount: "$750.00",
      status: "In Progress",
      date: "2023-04-18",
      type: "Design Services",
    },
    {
      id: "TX-2023-04-17-009",
      buyer: "Andrew Hall",
      seller: "Abigail Green",
      amount: "$3,900.00",
      status: "Completed",
      date: "2023-04-17",
      type: "Real Estate Sale",
    },
    {
      id: "TX-2023-04-16-010",
      buyer: "Joseph Baker",
      seller: "Emily Nelson",
      amount: "$1,200.00",
      status: "Disputed",
      date: "2023-04-16",
      type: "Travel Booking",
    },
  ]

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (selectedRows.length === transactions.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(transactions.map((t) => t.id))
    }
  }

  // Handle single row checkbox
  const handleSelectRow = (id: string) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id))
    } else {
      setSelectedRows([...selectedRows, id])
    }
  }

  const StatusBadge = ({ status }: { status: string }) => {
    const statusStyles = {
      Completed: "bg-green-100 text-green-800 hover:bg-green-200",
      "In Progress": "bg-blue-100 text-blue-800 hover:bg-blue-200",
      Pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
      Disputed: "bg-red-100 text-red-800 hover:bg-red-200",
      Canceled: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    }

    const statusType = status as keyof typeof statusStyles

    return (
      <Badge className={`font-medium ${statusStyles[statusType] || "bg-gray-100 text-gray-800"}`} variant="outline">
        {status}
      </Badge>
    )
  }

  return (
    <Card>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedRows.length === transactions.length && transactions.length > 0}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="w-[150px]">Transaction ID</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id} className="group hover:bg-gray-50">
                <TableCell>
                  <Checkbox
                    checked={selectedRows.includes(transaction.id)}
                    onCheckedChange={() => handleSelectRow(transaction.id)}
                    aria-label={`Select row ${transaction.id}`}
                  />
                </TableCell>
                <TableCell className="font-medium">{transaction.id}</TableCell>
                <TableCell>{transaction.buyer}</TableCell>
                <TableCell>{transaction.seller}</TableCell>
                <TableCell>{transaction.amount}</TableCell>
                <TableCell>
                  <StatusBadge status={transaction.status} />
                </TableCell>
                <TableCell>{transaction.date}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        <span>View details</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit transaction</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600 hover:text-red-700 focus:text-red-700">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete transaction</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between space-x-2 py-4 px-4">
        <div className="text-sm text-gray-500">
          {selectedRows.length > 0 ? (
            <span>
              {selectedRows.length} of {transactions.length} row(s) selected.
            </span>
          ) : (
            <span>Showing {transactions.length} transactions</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="px-3 py-2 h-8">
            {currentPage}
          </Button>
          <Button
            variant="outline"
            size="icon"
            disabled={transactions.length <= 10}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

