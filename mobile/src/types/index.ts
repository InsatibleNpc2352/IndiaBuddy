export type Mode = 'Flight' | 'Train' | 'Bus' | 'All';

export interface TransportOption {
  id: string;
  mode: Mode;
  operator: string;
  price: number;
  durationMinutes: number;
  departureTime: string;
  arrivalTime: string;
  class: string;
  tierScore: number;
  offersCount: number;
  bookingUrl: string;
}

export interface RoutePrediction {
  date: string;
  predictedPrice: number;
  lowerBound: number;
  upperBound: number;
  zone: 'green' | 'yellow' | 'red';
}

export interface PromoCode {
  id: string;
  code: string;
  description: string;
  discountAmount: number;
  mode: Mode;
}

export interface NewsSignal {
  id: string;
  headline: string;
  impact: 'positive' | 'negative' | 'neutral';
  date: string;
}

export interface UserProfile {
  id: string;
  email: string;
  memberSince: string;
  pushEnabled: boolean;
  biometricEnabled: boolean;
}

export interface PriceAlert {
  id: string;
  route: string;
  targetPrice: number;
  active: boolean;
}

export interface SavedRoute {
  id: string;
  origin: string;
  destination: string;
}
