export type TransportMode = 'flights' | 'trains' | 'buses' | 'all';
export type Tier = 'fastest' | 'comfort' | 'cost' | 'overall' | 'economic';

export interface TransportOption {
  id: string;
  mode: 'flight' | 'train' | 'bus';
  operator: string;
  operatorLogo?: string;
  price: number;
  durationMinutes: number;
  departureTime: string; // ISO or HH:mm
  arrivalTime: string;
  class: string;
  promoCount: number;
  bookingUrl: string;
}

export interface ScoredOption extends TransportOption {
  scores: Record<Tier, number>; // 0-100
}

export interface Prediction {
  date: string; // YYYY-MM-DD
  predictedPrice: number;
  lowerBound: number;
  upperBound: number;
  historicalPrice?: number; // if past date
}

export interface PromoCode {
  id: string;
  code: string;
  description: string;
  mode: TransportMode;
  expiryDate: string;
  isVerified: boolean;
  minAmount?: number;
  cardRequirement?: string;
}

export interface NewsSignal {
  id: string;
  date: string;
  headline: string;
  url?: string;
}

export interface DailyReport {
  date: string;
  summary: string;
  recommendation: string;
  updatedAt: string;
  sentiments: {
    flights: { score: number; sentiment: 'bullish' | 'neutral' | 'bearish' };
    trains: { score: number; sentiment: 'bullish' | 'neutral' | 'bearish' };
    buses: { score: number; sentiment: 'bullish' | 'neutral' | 'bearish' };
  }
}

export type CalendarZone = 'live' | 'forecast' | 'speculative';
