// src/types/product.ts

export interface Product {
    id: string
    title: string
    description?: string
    price: number
    category?: string
    image?: {
      id: string
      url: string
      alt?: string
    }
    stock?: number
    createdAt: string
    updatedAt: string
  }
  
  export interface ProductsResponse {
    docs: Product[]
    totalDocs: number
    limit: number
    totalPages: number
    page: number
    pagingCounter: number
    hasPrevPage: boolean
    hasNextPage: boolean
    prevPage: number | null
    nextPage: number | null
  }