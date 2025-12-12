import joblib
import numpy as np

class VerdaPredictor:
    def __init__(self, model_dir="models"):
        self.waste = joblib.load(f"{model_dir}/waste.pkl")
        self.biofuel = joblib.load(f"{model_dir}/biofuel.pkl")
        self.feed = joblib.load(f"{model_dir}/feed.pkl")
        self.compost = joblib.load(f"{model_dir}/compost.pkl")
        self.alloc = joblib.load(f"{model_dir}/alloc.pkl")

    def predict(self, data):
        waste_features = np.array([
            data["ffb"],
            data["cpo"],
            data["moisture"],
            data["cv"],
            data["eff"]
        ]).reshape(1, -1)

        biomass = float(self.waste.predict(waste_features)[0])

        biofuel_price = float(self.biofuel.predict(np.array([
            data["oil_price"],
            data["demand_bio"],
            data["cv"],
            data["carbon_tax"]
        ]).reshape(1, -1))[0])

        feed_price = float(self.feed.predict(np.array([
            data["demand_feed"],
            data["protein_score"],
            data["supply_factor"]
        ]).reshape(1, -1))[0])

        compost_price = float(self.compost.predict(np.array([
            data["compost_base"],
            data["nutrient_score"],
            data["moisture"],
            data["carbon_tax"]
        ]).reshape(1, -1))[0])

        alloc = int(self.alloc.predict(np.array([
            biomass,
            biofuel_price,
            feed_price,
            compost_price,
            data["carbon_tax"],
            data["demand_bio"],
            data["demand_feed"]
        ]).reshape(1, -1))[0])

        return {
            "biomass": biomass,
            "prices": {
                "biofuel": biofuel_price,
                "feed": feed_price,
                "compost": compost_price
            },
            "optimal_allocation": alloc
        }


if __name__ == "__main__":
    predictor = VerdaPredictor()

    sample = {
        "ffb": 120,
        "cpo": 25,
        "moisture": 40,
        "cv": 17,
        "eff": 0.85,

        "oil_price": 95,
        "demand_bio": 0.7,
        "carbon_tax": 12,

        "demand_feed": 0.55,
        "protein_score": 0.9,
        "supply_factor": 1.1,

        "compost_base": 30,
        "nutrient_score": 1.0
    }

    result = predictor.predict(sample)
    print(result)
