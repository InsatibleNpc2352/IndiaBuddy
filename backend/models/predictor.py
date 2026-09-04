import math
import torch
import numpy as np
from datetime import date
from dataclasses import dataclass
from .transformer import PriceTransformer, Normalizer, FEATURE_NAMES
from .rnn_sentiment import SentimentPipeline

@dataclass
class PredictionResult:
    confidence_low: float
    predicted: float
    confidence_high: float
    
@dataclass
class SentimentResult:
    score: float
    label: str
    summary: str
    key_sentences: list

@dataclass
class DailyReport:
    report_date: date
    sentiment_score: float
    recommendation: str
    top_events: list
    markdown_content: str

class PricePredictor:
    def __init__(self, model: PriceTransformer, normalizer: Normalizer):
        self.model = model
        self.model.eval()
        self.normalizer = normalizer
        
    def predict(self, route_id: int, mode: str, target_date: date, historical_prices: list) -> PredictionResult:
        """
        historical_prices is a list of dictionaries, each containing all FEATURE_NAMES
        """
        if len(historical_prices) < 60:
            raise ValueError("Need at least 60 historical records for prediction")
            
        recent_data = historical_prices[-60:]
        raw_data = np.array([[r.get(f, 0) for f in FEATURE_NAMES] for r in recent_data])
        scaled_data = self.normalizer.transform(route_id, raw_data)
        
        src = torch.tensor(scaled_data, dtype=torch.float).unsqueeze(0) # [1, 60, num_features]
        
        days_out = (target_date - date.today()).days
        if days_out < 0:
            days_out = 0
            
        # Predict with uncertainty
        with torch.no_grad():
            mean_pred, std_pred = self.model.predict_with_uncertainty(src, num_samples=30)
            
        mean_pred = mean_pred.squeeze().numpy()
        std_pred = std_pred.squeeze().numpy()
        
        # Get the prediction for the specific days_out
        if days_out < len(mean_pred):
            pred_scaled = mean_pred[days_out]
            std_scaled = std_pred[days_out]
        else:
            pred_scaled = mean_pred[-1]
            std_scaled = std_pred[-1]
            
        # Inverse transform (assuming price is feature 0)
        pred_price = self.normalizer.inverse_transform(route_id, np.array([pred_scaled]), feature_idx=0)[0]
        # Standard deviation scales linearly with inverse transform
        price_range = self.normalizer.maxs.get(route_id, [1.0])[0] - self.normalizer.mins.get(route_id, [0.0])[0]
        std_price = std_scaled * price_range
        
        # Determine prediction zone and multiplier
        if days_out <= 90:
            multiplier = 1.0 # live zone, narrow CI
        elif days_out <= 365:
            multiplier = math.sqrt(days_out / 90.0) # forecast zone, medium CI
        else:
            multiplier = math.sqrt(days_out / 30.0) # speculative zone, very wide CI
            
        margin = max(std_price * multiplier * 1.96, pred_price * 0.05) # at least 5% margin
        
        return PredictionResult(
            confidence_low=max(0.0, float(pred_price - margin)),
            predicted=float(pred_price),
            confidence_high=float(pred_price + margin)
        )

class SentimentPredictor:
    def __init__(self, pipeline: SentimentPipeline):
        self.pipeline = pipeline
        
    def analyze_article(self, article_text: str, title: str = "") -> SentimentResult:
        full_text = f"{title}. {article_text}" if title else article_text
        res = self.pipeline.analyze(full_text)
        return SentimentResult(
            score=res['score'],
            label=res['label'],
            summary=res['summary'],
            key_sentences=res['key_sentences']
        )
        
    def generate_daily_report(self, flight_articles: list, train_articles: list, bus_articles: list, report_date: date) -> DailyReport:
        all_articles = flight_articles + train_articles + bus_articles
        scores = []
        top_events = []
        
        for art in all_articles:
            res = self.analyze_article(art.get('text', ''), art.get('title', ''))
            scores.append(res.score)
            if abs(res.score) > 0.5:
                top_events.append(art.get('title', 'Unknown Event'))
                
        avg_score = sum(scores) / len(scores) if scores else 0.0
        
        if avg_score > 0.2:
            rec = "Prices likely to rise due to positive travel sentiment. Book early."
        elif avg_score < -0.2:
            rec = "Prices may drop. Wait for better deals."
        else:
            rec = "Market is stable. Standard booking rules apply."
            
        md = f"# Daily Travel Sentiment Report ({report_date})\n\n"
        md += f"**Overall Sentiment Score**: {avg_score:.2f}\n"
        md += f"**Recommendation**: {rec}\n\n"
        md += "## Top Events\n"
        for evt in top_events[:5]:
            md += f"- {evt}\n"
            
        return DailyReport(
            report_date=report_date,
            sentiment_score=avg_score,
            recommendation=rec,
            top_events=top_events[:5],
            markdown_content=md
        )
