import math
import torch
import torch.nn as nn
from torch.utils.data import Dataset
import numpy as np

FEATURE_NAMES = [
    'price', 'day_of_week', 'days_to_travel', 'holiday_flag',
    'season_index', 'fuel_sentiment', 'demand_index', 'capacity_signal'
]
SEQ_LEN = 60
FORECAST_HORIZON = 365

class PositionalEncoding(nn.Module):
    def __init__(self, d_model, max_len=5000):
        super(PositionalEncoding, self).__init__()
        pe = torch.zeros(max_len, d_model)
        position = torch.arange(0, max_len, dtype=torch.float).unsqueeze(1)
        div_term = torch.exp(torch.arange(0, d_model, 2).float() * (-math.log(10000.0) / d_model))
        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)
        pe = pe.unsqueeze(0)
        self.register_buffer('pe', pe)

    def forward(self, x):
        x = x + self.pe[:, :x.size(1)]
        return x

class PriceTransformer(nn.Module):
    def __init__(self, input_dim=len(FEATURE_NAMES), d_model=128, nhead=8, num_layers=4, dim_feedforward=512, dropout=0.1, out_seq_len=FORECAST_HORIZON):
        super(PriceTransformer, self).__init__()
        self.input_linear = nn.Linear(input_dim, d_model)
        self.pos_encoder = PositionalEncoding(d_model)
        encoder_layers = nn.TransformerEncoderLayer(d_model, nhead, dim_feedforward, dropout, batch_first=True)
        self.transformer_encoder = nn.TransformerEncoder(encoder_layers, num_layers)
        self.output_linear = nn.Linear(d_model, out_seq_len)
        self.dropout = nn.Dropout(dropout)
        
    def forward(self, src):
        # src shape: [batch_size, seq_len, input_dim]
        src = self.input_linear(src)
        src = self.pos_encoder(src)
        output = self.transformer_encoder(src)
        
        # Take the output of the last sequence element
        output = output[:, -1, :]
        
        # Predict prices
        pred_prices = self.output_linear(self.dropout(output))
        return pred_prices
        
    def predict_with_uncertainty(self, src, num_samples=100):
        # Enable dropout for Monte Carlo
        self.train()
        predictions = []
        with torch.no_grad():
            for _ in range(num_samples):
                predictions.append(self.forward(src).unsqueeze(0))
        predictions = torch.cat(predictions, dim=0) # [num_samples, batch_size, out_seq_len]
        
        mean_pred = predictions.mean(dim=0)
        std_pred = predictions.std(dim=0)
        
        # Return to eval mode
        self.eval()
        return mean_pred, std_pred
        
    def __repr__(self):
        return f"PriceTransformer(d_model=128, nhead=8, num_layers=4, out={FORECAST_HORIZON})"

class Normalizer:
    def __init__(self):
        self.mins = {}
        self.maxs = {}

    def fit_scaler(self, route_id, data):
        data = np.array(data)
        self.mins[route_id] = np.min(data, axis=0)
        self.maxs[route_id] = np.max(data, axis=0)
        # Avoid division by zero
        self.maxs[route_id] = np.where(self.maxs[route_id] == self.mins[route_id], self.maxs[route_id] + 1, self.maxs[route_id])

    def transform(self, route_id, data):
        data = np.array(data)
        if route_id not in self.mins:
            self.fit_scaler(route_id, data)
        return (data - self.mins[route_id]) / (self.maxs[route_id] - self.mins[route_id])

    def inverse_transform(self, route_id, data, feature_idx=0):
        data = np.array(data)
        min_val = self.mins[route_id][feature_idx]
        max_val = self.maxs[route_id][feature_idx]
        return data * (max_val - min_val) + min_val

class PriceDataset(Dataset):
    def __init__(self, records, route_id, normalizer=None, seq_len=SEQ_LEN, horizon=FORECAST_HORIZON):
        self.records = records
        self.route_id = route_id
        self.seq_len = seq_len
        self.horizon = horizon
        self.normalizer = normalizer if normalizer else Normalizer()
        
        # Format records into array of shape [num_records, num_features]
        raw_data = np.array([[r.get(f, 0) for f in FEATURE_NAMES] for r in records])
        
        if len(raw_data) > 0:
            self.normalizer.fit_scaler(route_id, raw_data)
            self.data = self.normalizer.transform(route_id, raw_data)
        else:
            self.data = np.array([])
        
        self.features_seq = []
        self.target_prices = []
        self.metadata = []
        
        for i in range(len(self.data) - self.seq_len - self.horizon + 1):
            self.features_seq.append(self.data[i:i+self.seq_len])
            # Assuming price is at index 0
            self.target_prices.append(self.data[i+self.seq_len:i+self.seq_len+self.horizon, 0])
            self.metadata.append({"route_id": route_id, "start_index": i})

    def __len__(self):
        return len(self.features_seq)

    def __getitem__(self, idx):
        return (
            torch.tensor(self.features_seq[idx], dtype=torch.float),
            torch.tensor(self.target_prices[idx], dtype=torch.float),
            self.metadata[idx]
        )
