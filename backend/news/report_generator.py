from datetime import date
from typing import List, Dict

class DailyReport:
    def __init__(self, content: str):
        self.content = content

class ReportGenerator:
    def generate(self,
        flight_articles: List[Dict], train_articles: List[Dict], bus_articles: List[Dict],
        flight_sentiment: List[Dict], train_sentiment: List[Dict], bus_sentiment: List[Dict],
        report_date: date
    ) -> DailyReport:
        
        md_report = f"# 📊 IndiaBuddy Travel Report - {report_date.strftime('%B %d, %Y')}\n\n"
        
        md_report += "## ✈️ Flights\n"
        if flight_sentiment:
            top_flight = sorted(flight_sentiment, key=lambda x: abs(x['sentiment']['score']), reverse=True)[:3]
            for item in top_flight:
                label = "🟢" if item['sentiment']['score'] > 0 else "🔴" if item['sentiment']['score'] < 0 else "⚪"
                md_report += f"- {label} {item['article']['title']}\n"
        else:
            md_report += "No major news.\n"
            
        md_report += "\n## 🚂 Trains\n"
        if train_sentiment:
            top_train = sorted(train_sentiment, key=lambda x: abs(x['sentiment']['score']), reverse=True)[:3]
            for item in top_train:
                label = "🟢" if item['sentiment']['score'] > 0 else "🔴" if item['sentiment']['score'] < 0 else "⚪"
                md_report += f"- {label} {item['article']['title']}\n"
        else:
            md_report += "No major news.\n"

        md_report += "\n## 🚌 Buses\n"
        if bus_sentiment:
            top_bus = sorted(bus_sentiment, key=lambda x: abs(x['sentiment']['score']), reverse=True)[:3]
            for item in top_bus:
                label = "🟢" if item['sentiment']['score'] > 0 else "🔴" if item['sentiment']['score'] < 0 else "⚪"
                md_report += f"- {label} {item['article']['title']}\n"
        else:
            md_report += "No major news.\n"
            
        md_report += "\n## 💡 Recommendation\n"
        md_report += "Book flights early due to recent fluctuations. Train availability is steady.\n"
        
        return DailyReport(md_report)
