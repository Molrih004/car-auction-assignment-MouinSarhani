import { api } from './client';
import type { Car, Condition } from './types';

export interface CarFilter {
  makes: string[];
  yearFrom?: number;
  yearTo?: number;
  conditions: Condition[];
}

// GET /cars?make=Citroën,Peugeot&yearFrom=1960&yearTo=1979&condition=EXCELLENT,GOOD
export const getCars = (filter?: CarFilter) => {
  const query = new URLSearchParams();
  if (filter?.makes.length) query.set('make', filter.makes.join(','));
  if (filter?.yearFrom) query.set('yearFrom', String(filter.yearFrom));
  if (filter?.yearTo) query.set('yearTo', String(filter.yearTo));
  if (filter?.conditions.length) query.set('condition', filter.conditions.join(','));
  const qs = query.toString();
  return api<{ data: Car[] }>('GET', `/cars${qs ? `?${qs}` : ''}`).then((res) => res.data);
};

export const getCar = (id: string) => api<{ data: Car }>('GET', `/cars/${id}`).then((res) => res.data);
