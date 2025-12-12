import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.metrics import mean_absolute_error
import joblib
import os

class VerdaTrainer:
    def __init__(self, model_dir="models"):
        self.model_dir = model_dir
        os.makedirs(model_dir, exist_ok=True)


    def train(self):
        df = self.generate_dataset()

        # Waste model
        X_waste = df[["ffb", "cpo", "moisture", "cv", "eff"]]
        y_waste = df["biomass"]

        waste_model = RandomForestRegressor()
        waste_model.fit(X_waste, y_waste)
        joblib.dump(waste_model, f"{self.model_dir}/waste.pkl")

        # Biofuel price model
        X_biofuel = df[["oil_price", "demand_bio", "cv", "carbon_tax"]]
        y_biofuel = df["biofuel_price"]

        biofuel_model = RandomForestRegressor()
        biofuel_model.fit(X_biofuel, y_biofuel)
        joblib.dump(biofuel_model, f"{self.model_dir}/biofuel.pkl")

        # Feed price model
        X_feed = df[["demand_feed", "protein_score", "supply_factor"]]
        y_feed = df["feed_price"]

        feed_model = RandomForestRegressor()
        feed_model.fit(X_feed, y_feed)
        joblib.dump(feed_model, f"{self.model_dir}/feed.pkl")

        # Compost price model
        X_compost = df[["compost_base", "nutrient_score", "moisture", "carbon_tax"]]
        y_compost = df["compost_price"]

        compost_model = RandomForestRegressor()
        compost_model.fit(X_compost, y_compost)
        joblib.dump(compost_model, f"{self.model_dir}/compost.pkl")

        # Allocation model
        X_alloc = df[[
            "biomass",
            "biofuel_price",
            "feed_price",
            "compost_price",
            "carbon_tax",
            "demand_bio",
            "demand_feed"
        ]]
        y_alloc = df["allocation"]

        alloc_model = RandomForestClassifier()
        alloc_model.fit(X_alloc, y_alloc)
        joblib.dump(alloc_model, f"{self.model_dir}/alloc.pkl")

        return "Training complete, all models saved."


if __name__ == "__main__":
    trainer = VerdaTrainer(model_dir="models")
    print("Generating synthetic data and training models...")
    result = trainer.train()
    print(result)

