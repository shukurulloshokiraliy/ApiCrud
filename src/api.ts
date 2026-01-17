// src/api.ts

import type { ProductsResponse } from './types/products'

const API_BASE_URL = 'https://payload-api-2.onrender.com/api'

export const api = {

  async getProducts(limit: number = 10): Promise<ProductsResponse> {
    const response = await fetch(`${API_BASE_URL}/products?limit=${limit}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return response.json()
  },


  async getProductById(id: string) {
    const response = await fetch(`${API_BASE_URL}/products/${id}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return response.json()
  },

  async searchProducts(query: string): Promise<ProductsResponse> {
    const response = await fetch(`${API_BASE_URL}/products?where[title][like]=${query}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return response.json()
  },

  async getProductsByCategory(category: string): Promise<ProductsResponse> {
    const response = await fetch(`${API_BASE_URL}/products?where[category][equals]=${category}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return response.json()
  },

  
  async createProduct(data: {
    title: string
    description: string
    price: number
    category: string
    stock: number
  }) {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return response.json()
  },


  async updateProduct(id: string, data: {
    title: string
    description: string
    price: number
    category: string
    stock: number
  }) {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return response.json()
  },


  async deleteProduct(id: string) {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return response.json()
  }
}