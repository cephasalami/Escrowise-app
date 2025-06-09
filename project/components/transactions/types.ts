export interface Transaction {
  id: string
  title: string
  created: string
  amount: string
  currency: string
  role: string
  status: {
    text: string
    type: "awaiting-response" | "awaiting-payment" | "completed" | "cancelled"
  }
}

