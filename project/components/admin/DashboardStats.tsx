"use client"

import type React from "react"

import { TrendingUp, Users, ShieldAlert, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedCounter } from "@/components/animations/AnimatedCounter"

interface StatCardProps {
  title: string
  value: string | number | React.ReactNode
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

const StatCard = ({ title, value, icon, trend, className }: StatCardProps) => {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        <div className="bg-gray-100 p-2 rounded-md">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <div className="flex items-center mt-1">
            <div className={trend.isPositive ? "text-green-500" : "text-red-500"}>
              {trend.isPositive ? (
                <ArrowUpRight className="h-4 w-4 inline-block mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 inline-block mr-1" />
              )}
              <span className="text-sm font-medium">{trend.value}%</span>
            </div>
            <span className="text-xs text-gray-500 ml-1">vs. last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function DashboardStats() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Transactions"
        value={<AnimatedCounter value={1243} />}
        icon={<TrendingUp className="h-4 w-4 text-orange-600" />}
        trend={{ value: 12, isPositive: true }}
      />
      <StatCard
        title="Active Users"
        value={<AnimatedCounter value={528} />}
        icon={<Users className="h-4 w-4 text-blue-600" />}
        trend={{ value: 8, isPositive: true }}
      />
      <StatCard
        title="Open Disputes"
        value={<AnimatedCounter value={15} />}
        icon={<ShieldAlert className="h-4 w-4 text-red-600" />}
        trend={{ value: 2, isPositive: false }}
      />
      <StatCard
        title="Total Revenue"
        value={`$${(53249).toLocaleString()}`}
        icon={<DollarSign className="h-4 w-4 text-green-600" />}
        trend={{ value: 15, isPositive: true }}
      />
    </div>
  )
}

