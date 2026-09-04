from pydantic import BaseModel
from typing import List, Optional, Dict

class TransportOption(BaseModel):
    mode: str
    operator: str
    price: float
    duration_minutes: int
    travel_class: str
    layovers: int
    has_ac: bool
    berth_available: bool
    operator_rating: float
    distance_km: float
    fees: float
    luggage_kg: float

class ScoredOption(BaseModel):
    option: TransportOption
    scores: Dict[str, float]
    better_alternative: Optional[TransportOption] = None

class FiveTierScorer:
    def _normalize(self, value, min_val, max_val, invert=False):
        if max_val == min_val:
            return 100.0 if not invert else 0.0
        normalized = (value - min_val) / (max_val - min_val) * 100
        return 100 - normalized if invert else normalized

    def score_fastest(self, options: List[TransportOption]) -> Dict[int, float]:
        if not options: return {}
        min_dur = min(o.duration_minutes for o in options)
        max_dur = max(o.duration_minutes for o in options)
        return {i: self._normalize(o.duration_minutes, min_dur, max_dur, invert=True) for i, o in enumerate(options)}

    def score_comfort(self, options: List[TransportOption]) -> Dict[int, float]:
        scores = {}
        for i, o in enumerate(options):
            score = 50 # Base score
            if o.has_ac: score += 20
            if o.berth_available: score += 20
            if o.layovers == 0: score += 10
            elif o.layovers == 1: score += 5
            scores[i] = min(100.0, score)
        return scores

    def score_cost(self, options: List[TransportOption]) -> Dict[int, float]:
        if not options: return {}
        total_costs = [o.price + o.fees for o in options]
        min_cost = min(total_costs)
        max_cost = max(total_costs)
        return {i: self._normalize(cost, min_cost, max_cost, invert=True) for i, cost in enumerate(total_costs)}

    def score_economic(self, options: List[TransportOption]) -> Dict[int, float]:
        # Cost effectiveness per km
        if not options: return {}
        per_km = [(o.price + o.fees) / (o.distance_km if o.distance_km > 0 else 1) for o in options]
        min_km = min(per_km)
        max_km = max(per_km)
        return {i: self._normalize(val, min_km, max_km, invert=True) for i, val in enumerate(per_km)}

    def score_overall(self, options: List[TransportOption]) -> Dict[int, float]:
        fast = self.score_fastest(options)
        comfort = self.score_comfort(options)
        cost = self.score_cost(options)
        return {i: (fast[i] * 0.3) + (comfort[i] * 0.3) + (cost[i] * 0.4) for i in range(len(options))}

    def score_all(self, options: List[TransportOption]) -> List[ScoredOption]:
        if not options: return []
        
        fast = self.score_fastest(options)
        comfort = self.score_comfort(options)
        cost = self.score_cost(options)
        eco = self.score_economic(options)
        overall = self.score_overall(options)
        
        scored_options = []
        for i, opt in enumerate(options):
            scores = {
                "fastest": fast[i],
                "comfort": comfort[i],
                "cost": cost[i],
                "economic": eco[i],
                "overall": overall[i]
            }
            scored_options.append(ScoredOption(option=opt, scores=scores))
            
        return scored_options

    def find_better_alternative(self, options: List[TransportOption], active_tier: str) -> Optional[TransportOption]:
        # Example logic: if a mode has >=10 point advantage at same/lower price
        if not options: return None
        
        scored = self.score_all(options)
        scored.sort(key=lambda x: x.scores.get(active_tier, 0), reverse=True)
        
        best = scored[0]
        for s in scored[1:]:
            # If s is significantly cheaper but score is close
            total_cost_best = best.option.price + best.option.fees
            total_cost_s = s.option.price + s.option.fees
            
            if total_cost_s <= total_cost_best and (best.scores[active_tier] - s.scores[active_tier]) < 10:
                 return s.option # S is a better alternative financially for similar score
                 
        return None
