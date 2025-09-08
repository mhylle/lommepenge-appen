import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Family {
  id: string;
  name: string;
  description?: string;
  parentUserId: string;
  profilePicture?: string;
  isActive: boolean;
  currency: string;
  defaultAllowance: number;
  allowanceFrequency: string;
  createdAt: string;
  updatedAt: string;
  children?: PocketMoneyUser[];
  transactions?: Transaction[];
}

export interface PocketMoneyUser {
  id: string;
  familyId: string;
  authUserId: string;
  name: string;
  email?: string;
  role: string;
  currentBalance: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  familyId: string;
  userId: string;
  amount: number;
  type: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFamilyDto {
  name: string;
  description?: string;
  currency?: string;
  defaultAllowance?: number;
  allowanceFrequency?: string;
}

export interface UpdateFamilyDto {
  name?: string;
  description?: string;
  profilePicture?: string;
  isActive?: boolean;
  currency?: string;
  defaultAllowance?: number;
  allowanceFrequency?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FamilyService {
  private currentFamilySubject = new BehaviorSubject<Family | null>(null);
  public currentFamily$ = this.currentFamilySubject.asObservable();

  constructor() {}

  /**
   * Get all families for the current user
   */
  async getFamilies(): Promise<Family[]> {
    try {
      const response = await fetch('/api/app2/families', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch families');
      }

      const families: Family[] = await response.json();
      
      // Set the first family as current if none is set
      if (families.length > 0 && !this.currentFamilySubject.value) {
        this.setCurrentFamily(families[0]);
      }

      return families;
    } catch (error) {
      console.error('Error fetching families:', error);
      throw error;
    }
  }

  /**
   * Get active families for the current user
   */
  async getActiveFamilies(): Promise<Family[]> {
    try {
      const response = await fetch('/api/app2/families/active', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch active families');
      }

      const families: Family[] = await response.json();
      
      // Set the first active family as current if none is set
      if (families.length > 0 && !this.currentFamilySubject.value) {
        this.setCurrentFamily(families[0]);
      }

      return families;
    } catch (error) {
      console.error('Error fetching active families:', error);
      throw error;
    }
  }

  /**
   * Get a specific family by ID
   */
  async getFamily(id: string): Promise<Family> {
    try {
      const response = await fetch(`/api/app2/families/${id}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch family');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching family:', error);
      throw error;
    }
  }

  /**
   * Create a new family
   */
  async createFamily(familyDto: CreateFamilyDto): Promise<Family> {
    try {
      const response = await fetch('/api/app2/families', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(familyDto)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create family');
      }

      const family: Family = await response.json();
      this.setCurrentFamily(family);
      return family;
    } catch (error) {
      console.error('Error creating family:', error);
      throw error;
    }
  }

  /**
   * Update an existing family
   */
  async updateFamily(id: string, familyDto: UpdateFamilyDto): Promise<Family> {
    try {
      const response = await fetch(`/api/app2/families/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(familyDto)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update family');
      }

      const family: Family = await response.json();
      
      // Update current family if it's the one being updated
      if (this.currentFamilySubject.value?.id === id) {
        this.setCurrentFamily(family);
      }

      return family;
    } catch (error) {
      console.error('Error updating family:', error);
      throw error;
    }
  }

  /**
   * Delete a family
   */
  async deleteFamily(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/app2/families/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete family');
      }

      // Clear current family if it was deleted
      if (this.currentFamilySubject.value?.id === id) {
        this.setCurrentFamily(null);
      }
    } catch (error) {
      console.error('Error deleting family:', error);
      throw error;
    }
  }

  /**
   * Set the current active family
   */
  setCurrentFamily(family: Family | null): void {
    this.currentFamilySubject.next(family);
  }

  /**
   * Get the current active family
   */
  getCurrentFamily(): Family | null {
    return this.currentFamilySubject.value;
  }

  /**
   * Check if user has any family
   */
  async hasFamily(): Promise<boolean> {
    try {
      const families = await this.getActiveFamilies();
      return families.length > 0;
    } catch (error) {
      console.error('Error checking family status:', error);
      return false;
    }
  }

  /**
   * Initialize family context from auth response
   */
  initializeFamilyFromAuth(familyInfo: any): void {
    if (familyInfo) {
      const family: Partial<Family> = {
        id: familyInfo.id,
        name: familyInfo.name,
        currency: familyInfo.currency,
      };
      
      // If this is a newly created family, fetch full details
      if (familyInfo.isFirstTime) {
        this.getFamily(familyInfo.id).then(fullFamily => {
          this.setCurrentFamily(fullFamily);
        }).catch(error => {
          console.warn('Failed to fetch full family details:', error);
          // Set partial family info anyway
          this.setCurrentFamily(family as Family);
        });
      } else {
        // For existing families, fetch full details
        this.getFamily(familyInfo.id).then(fullFamily => {
          this.setCurrentFamily(fullFamily);
        }).catch(error => {
          console.warn('Failed to fetch family details:', error);
        });
      }
    }
  }

  /**
   * Clear family state (used on logout)
   */
  clearFamilyState(): void {
    this.setCurrentFamily(null);
  }

  /**
   * Format currency amount for display
   */
  formatAmount(amount: number, currency: string = 'DKK'): string {
    return new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Get translated frequency text in Danish
   */
  getFrequencyText(frequency: string): string {
    switch (frequency) {
      case 'weekly':
        return 'ugentligt';
      case 'monthly':
        return 'månedligt';
      case 'biweekly':
        return 'hver anden uge';
      default:
        return frequency;
    }
  }
}