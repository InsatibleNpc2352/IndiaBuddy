import torch
import torch.nn as nn
import torch.nn.functional as F
import re
from collections import Counter
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer

try:
    nltk.data.find('sentiment/vader_lexicon.zip')
except LookupError:
    nltk.download('vader_lexicon', quiet=True)

class SentimentBiLSTM(nn.Module):
    def __init__(self, vocab_size=50000, embed_dim=300, hidden_dim=256, num_layers=3):
        super(SentimentBiLSTM, self).__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim)
        self.lstm = nn.LSTM(embed_dim, hidden_dim, num_layers=num_layers, bidirectional=True, batch_first=True)
        
        # Attention
        self.attention_linear = nn.Linear(hidden_dim * 2, 1)
        
        # Sentiment Head
        self.sentiment_head = nn.Sequential(
            nn.Linear(hidden_dim * 2, 64),
            nn.ReLU(),
            nn.Linear(64, 1),
            nn.Tanh() # Output -1 to 1
        )
        
    def forward(self, x):
        embedded = self.embedding(x)
        lstm_out, _ = self.lstm(embedded)
        
        # Attention over sequence
        attn_weights = F.softmax(self.attention_linear(lstm_out), dim=1)
        context = torch.sum(attn_weights * lstm_out, dim=1)
        
        sentiment_score = self.sentiment_head(context)
        return sentiment_score, attn_weights
        
    def __repr__(self):
        return f"SentimentBiLSTM(vocab=50000, embed=300, hidden=256, layers=3)"

class NewsTokenizer:
    def __init__(self, vocab_size=50000, max_len=512):
        self.vocab_size = vocab_size
        self.max_len = max_len
        self.word2idx = {"<PAD>": 0, "<UNK>": 1}
        self.idx2word = {0: "<PAD>", 1: "<UNK>"}
        
    def build_vocab(self, corpus):
        words = []
        for text in corpus:
            text = text.lower()
            words.extend(re.findall(r'\b\w+\b', text))
        counts = Counter(words)
        common_words = counts.most_common(self.vocab_size - 2)
        
        for idx, (word, _) in enumerate(common_words, start=2):
            self.word2idx[word] = idx
            self.idx2word[idx] = word
            
    def encode(self, text):
        words = re.findall(r'\b\w+\b', text.lower())
        encoded = [self.word2idx.get(w, 1) for w in words][:self.max_len]
        if len(encoded) < self.max_len:
            encoded.extend([0] * (self.max_len - len(encoded)))
        return encoded
        
    def decode(self, ids):
        return " ".join([self.idx2word.get(i, "<UNK>") for i in ids if i != 0])

class SentimentPipeline:
    def __init__(self, model=None, tokenizer=None):
        self.model = model
        self.tokenizer = tokenizer
        self.vader = SentimentIntensityAnalyzer()
        
    def analyze(self, text: str) -> dict:
        sentences = re.split(r'(?<=[.!?]) +', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        if not sentences:
            sentences = [text]
            
        if self.model is None or self.tokenizer is None:
            # VADER fallback
            scores = [self.vader.polarity_scores(s)['compound'] for s in sentences]
            avg_score = sum(scores) / len(scores) if scores else 0.0
            
            label = "bullish" if avg_score > 0.1 else ("bearish" if avg_score < -0.1 else "neutral")
            
            # Simple extractive summary based on most extreme sentiments
            scored_sentences = list(zip(sentences, scores))
            scored_sentences.sort(key=lambda x: abs(x[1]), reverse=True)
            top_3 = [s for s, _ in scored_sentences[:3]]
            
            return {
                "score": avg_score,
                "label": label,
                "summary": " ".join(top_3),
                "key_sentences": top_3
            }
            
        else:
            # Use trained model
            self.model.eval()
            encoded = torch.tensor([self.tokenizer.encode(text)])
            with torch.no_grad():
                score, attn = self.model(encoded)
                score = score.item()
                attn = attn.squeeze().tolist()
                if not isinstance(attn, list):
                    attn = [attn]
                
            label = "bullish" if score > 0.1 else ("bearish" if score < -0.1 else "neutral")
            
            # Map attention back to sentences (approximation)
            words = re.findall(r'\b\w+\b', text.lower())
            attn = attn[:len(words)]
            
            sentence_attns = []
            word_idx = 0
            for s in sentences:
                s_len = len(re.findall(r'\b\w+\b', s.lower()))
                if s_len > 0 and word_idx < len(attn):
                    s_attn = sum(attn[word_idx:word_idx+s_len]) / s_len
                    sentence_attns.append((s, s_attn))
                    word_idx += s_len
                else:
                    sentence_attns.append((s, 0.0))
            
            sentence_attns.sort(key=lambda x: x[1], reverse=True)
            top_3 = [s for s, _ in sentence_attns[:3]]
            
            return {
                "score": score,
                "label": label,
                "summary": " ".join(top_3),
                "key_sentences": top_3
            }
            
    def analyze_batch(self, texts: list[str]) -> list[dict]:
        return [self.analyze(t) for t in texts]
