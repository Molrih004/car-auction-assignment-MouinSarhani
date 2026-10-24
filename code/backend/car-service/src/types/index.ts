export type Condition = 'EXCELLENT' | 'GOOD' | 'FAIR';

export interface Car {
  id: string;
  sellerId: number;
  make: string;
  model: string;
  year: number;
  color: string;
  mileage: number;
  condition: Condition;
  description: string;
  price: number;
  createdAt: Date;
}
