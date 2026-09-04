import logging
from typing import Dict, List

logger = logging.getLogger(__name__)

class SentimentAnalyzer:
    def __init__(self):
        self.use_vader = True
        try:
            from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
            self.analyzer = SentimentIntensityAnalyzer()
        except ImportError:
            logger.warning("VADER not installed, returning dummy sentiment")
            self.analyzer = None

    def analyze(self, text: str) -> Dict:
        if not self.analyzer:
            return {"score": 0.0, "label": "neutral", "summary": "N/A"}
            
        scores = self.analyzer.polarity_scores(text)
        compound = scores['compound']
        if compound >= 0.05:
            label = "positive"
        elif compound <= -0.05:
            label = "negative"
        else:
            label = "neutral"
            
        return {
            "score": compound,
            "label": label,
            "summary": text[:100] + "..." if len(text) > 100 else text
        }

    def analyze_batch(self, articles: List[Dict]) -> List[Dict]:
        results = []
        for article in articles:
            text = article.get("title", "") + ". " + article.get("summary", "")
            sentiment = self.analyze(text)
            results.append({
                "article": article,
                "sentiment": sentiment
            })
        return results
