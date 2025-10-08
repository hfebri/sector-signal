"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { BrandProfile } from '@/lib/db/schema';

interface BrandContextType {
  currentBrand: BrandProfile | null;
  brands: BrandProfile[];
  setCurrentBrand: (brand: BrandProfile | null) => void;
  setBrands: (brands: BrandProfile[]) => void;
  isLoading: boolean;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [currentBrand, setCurrentBrand] = useState<BrandProfile | null>(null);
  const [brands, setBrands] = useState<BrandProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load brands on mount
  useEffect(() => {
    async function loadBrands() {
      try {
        const response = await fetch('/api/brands');
        const data = await response.json();

        if (data.success && data.brands) {
          setBrands(data.brands);

          // Try to restore previously selected brand
          const savedBrandId = localStorage.getItem('currentBrandId');
          if (savedBrandId) {
            const savedBrand = data.brands.find((b: BrandProfile) => b.id === savedBrandId);
            if (savedBrand) {
              setCurrentBrand(savedBrand);
            } else if (data.brands.length > 0) {
              setCurrentBrand(data.brands[0]);
            }
          } else if (data.brands.length > 0) {
            setCurrentBrand(data.brands[0]);
          }
        }
      } catch (error) {
        console.error('Error loading brands:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadBrands();
  }, []);

  // Save current brand to localStorage when it changes
  useEffect(() => {
    if (currentBrand) {
      localStorage.setItem('currentBrandId', currentBrand.id);
    } else {
      localStorage.removeItem('currentBrandId');
    }
  }, [currentBrand]);

  const value = {
    currentBrand,
    brands,
    setCurrentBrand,
    setBrands,
    isLoading,
  };

  return (
    <BrandContext.Provider value={value}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const context = useContext(BrandContext);
  if (context === undefined) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  return context;
}