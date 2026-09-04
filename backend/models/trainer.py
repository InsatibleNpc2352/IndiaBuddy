import torch
import torch.nn as nn
from torch.utils.data import DataLoader
import asyncio
import os
import json
import numpy as np

from .transformer import PriceTransformer, PriceDataset
from .rnn_sentiment import SentimentBiLSTM, NewsTokenizer

class TransformerTrainer:
    def __init__(self, model, db_session, device='cpu'):
        self.model = model.to(device)
        self.db_session = db_session
        self.device = device
        self.criterion = nn.MSELoss()

    async def load_training_data(self) -> PriceDataset:
        # Mock DB fetch for now
        records = [
            {"price": 100+i, "day_of_week": i%7, "days_to_travel": 30, "holiday_flag": 0,
             "season_index": 1, "fuel_sentiment": 0.5, "demand_index": 0.8, "capacity_signal": 1.0}
            for i in range(500)
        ]
        return PriceDataset(records, route_id=1)

    def train(self, dataset: PriceDataset, epochs=50, lr=1e-4, batch_size=32):
        self.model.train()
        optimizer = torch.optim.Adam(self.model.parameters(), lr=lr)
        dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=True)
        
        for epoch in range(epochs):
            total_loss = 0
            for batch_x, batch_y, _ in dataloader:
                batch_x, batch_y = batch_x.to(self.device), batch_y.to(self.device)
                optimizer.zero_grad()
                output = self.model(batch_x)
                loss = self.criterion(output, batch_y)
                loss.backward()
                optimizer.step()
                total_loss += loss.item()
            if (epoch + 1) % 10 == 0:
                print(f"Epoch {epoch+1}/{epochs}, Loss: {total_loss/max(1, len(dataloader)):.4f}")

    def evaluate(self, dataset: PriceDataset) -> dict:
        self.model.eval()
        dataloader = DataLoader(dataset, batch_size=32, shuffle=False)
        all_preds = []
        all_targets = []
        with torch.no_grad():
            for batch_x, batch_y, _ in dataloader:
                batch_x = batch_x.to(self.device)
                preds = self.model(batch_x).cpu()
                all_preds.append(preds)
                all_targets.append(batch_y)
        
        if not all_preds:
            return {"mae": 0, "rmse": 0, "mape": 0}
            
        all_preds = torch.cat(all_preds).numpy()
        all_targets = torch.cat(all_targets).numpy()
        
        mae = float(np.mean(np.abs(all_preds - all_targets)))
        rmse = float(np.sqrt(np.mean((all_preds - all_targets)**2)))
        mape = float(np.mean(np.abs((all_targets - all_preds) / (all_targets + 1e-8))))
        return {"mae": mae, "rmse": rmse, "mape": mape}

    def save_checkpoint(self, path: str):
        torch.save(self.model.state_dict(), path)

    def load_checkpoint(self, path: str):
        self.model.load_state_dict(torch.load(path, map_location=self.device))


class RNNTrainer:
    def __init__(self, model, db_session, device='cpu'):
        self.model = model.to(device)
        self.db_session = db_session
        self.device = device
        self.criterion = nn.MSELoss()

    async def load_training_data(self):
        # Mock dataset
        class NewsDataset(torch.utils.data.Dataset):
            def __len__(self): return 100
            def __getitem__(self, idx):
                return torch.randint(0, 50000, (512,)), torch.tensor([0.5])
        return NewsDataset()

    def train(self, dataset, epochs=20, lr=1e-3, batch_size=16):
        self.model.train()
        optimizer = torch.optim.Adam(self.model.parameters(), lr=lr)
        dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=True)
        
        for epoch in range(epochs):
            total_loss = 0
            for batch_x, batch_y in dataloader:
                batch_x, batch_y = batch_x.to(self.device), batch_y.to(self.device)
                optimizer.zero_grad()
                output, _ = self.model(batch_x)
                loss = self.criterion(output.squeeze(), batch_y.squeeze())
                loss.backward()
                optimizer.step()
                total_loss += loss.item()
            if (epoch + 1) % 5 == 0:
                print(f"RNN Epoch {epoch+1}/{epochs}, Loss: {total_loss/max(1, len(dataloader)):.4f}")

    def save_checkpoint(self, path: str):
        torch.save(self.model.state_dict(), path)

    def load_checkpoint(self, path: str):
        self.model.load_state_dict(torch.load(path, map_location=self.device))


class ModelManager:
    def __init__(self, base_dir="checkpoints"):
        self.base_dir = base_dir
        os.makedirs(base_dir, exist_ok=True)
        
    def save_model(self, model, name, version, metrics):
        path = os.path.join(self.base_dir, f"{name}_v{version}.pt")
        meta_path = os.path.join(self.base_dir, f"{name}_v{version}_meta.json")
        torch.save(model.state_dict(), path)
        with open(meta_path, 'w') as f:
            json.dump(metrics, f)
            
    def load_best_model(self, name, model_class, **kwargs):
        versions = self.list_versions(name)
        if not versions:
            return model_class(**kwargs)
        
        # Simplistic: just load highest version
        best_version = max(versions)
        path = os.path.join(self.base_dir, f"{name}_v{best_version}.pt")
        model = model_class(**kwargs)
        model.load_state_dict(torch.load(path, map_location='cpu'))
        return model

    def list_versions(self, name):
        versions = []
        for f in os.listdir(self.base_dir):
            if f.startswith(name) and f.endswith(".pt"):
                v = f.split("_v")[1].split(".pt")[0]
                versions.append(v)
        return versions

if __name__ == '__main__':
    print("Running trainer example...")
    model = PriceTransformer()
    trainer = TransformerTrainer(model, db_session=None)
    dataset = asyncio.run(trainer.load_training_data())
    if len(dataset) > 0:
        trainer.train(dataset, epochs=2)
        metrics = trainer.evaluate(dataset)
        print("Metrics:", metrics)
    else:
        print("Not enough data to run mock training.")
