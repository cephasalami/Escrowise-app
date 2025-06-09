"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronRight, Check, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const users = [
  {
    id: "U-1234",
    name: "Emma Wilson",
    email: "emma@example.com",
    role: "buyer",
    verified: true,
    joined: "Apr 2, 2023",
  },
  {
    id: "U-1235",
    name: "James Smith",
    email: "james@example.com",
    role: "seller",
    verified: true,
    joined: "Apr 1, 2023",
  },
  {
    id: "U-1236",
    name: "Olivia Johnson",
    email: "olivia@example.com",
    role: "buyer",
    verified: false,
    joined: "Mar 30, 2023",
  },
  {
    id: "U-1237",
    name: "William Brown",
    email: "william@example.com",
    role: "seller",
    verified: true,
    joined: "Mar 28, 2023",
  },
  {
    id: "U-1238",
    name: "Sophia Davis",
    email: "sophia@example.com",
    role: "buyer",
    verified: false,
    joined: "Mar 25, 2023",
  },
]

export default function RecentUsers() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-bold">Recent Users</CardTitle>
        <Link href="/admin/users" className="text-sm text-orange-600 hover:text-orange-700 font-medium">
          View all
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="hidden sm:grid grid-cols-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div className="col-span-2">User</div>
            <div>Role</div>
            <div>Status</div>
          </div>

          {users.map((user) => (
            <Link
              href={`/admin/users/${user.id}`}
              key={user.id}
              className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-3 px-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="col-span-2 hidden sm:flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600 mr-3">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
              </div>
              <div className="sm:hidden">
                <div className="font-medium">{user.name}</div>
                <div className="text-xs text-gray-500">{user.email}</div>
              </div>
              <div className="capitalize text-gray-600">{user.role}</div>
              <div className="flex items-center justify-between">
                <Badge
                  className={
                    user.verified
                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                      : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                  }
                  variant="outline"
                >
                  {user.verified ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
                  {user.verified ? "Verified" : "Unverified"}
                </Badge>
                <ChevronRight className="h-4 w-4 text-gray-400 sm:ml-2" />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

