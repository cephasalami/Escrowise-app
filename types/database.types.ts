export type Database = {
  public: {
    Tables: {
      transactions: {
        Row: {
          id: string
          seller_id: string
          item_title: string
          category: string
          description: string
          photos: string[]
          price: string
          currency: string
          price_justification: string
          delivery_method: string
          shipping_details: string
          inspection_period: number
          payment_deadline: string
          return_policy: string
          warranty: string
          special_terms: string
          buyer_email: string
          buyer_name: string
          buyer_phone: string
          require_verification: boolean
          min_buyer_rating: number
          allow_direct_comm: boolean
          comm_guidelines: string
          fee_payer: string
          insurance: string
          dispute_resolution: string
          protection_services: string
          status: string
          draft: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          seller_id: string
          item_title: string
          category: string
          description: string
          photos?: string[]
          price: string
          currency: string
          price_justification: string
          delivery_method: string
          shipping_details: string
          inspection_period: number
          payment_deadline: string
          return_policy: string
          warranty: string
          special_terms: string
          buyer_email: string
          buyer_name: string
          buyer_phone: string
          require_verification: boolean
          min_buyer_rating: number
          allow_direct_comm: boolean
          comm_guidelines: string
          fee_payer: string
          insurance: string
          dispute_resolution: string
          protection_services: string
          status?: string
          draft?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
