import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.metrics import (
    mean_absolute_error, 
    r2_score, 
    accuracy_score,
    classification_report,
    confusion_matrix
)
import joblib
import os
import json
from datetime import datetime

class VerdaTrainer:
    """
    VERDA AI Training System for Palm Oil Mill Waste Optimization
    
    This trainer generates realistic synthetic data based on actual palm oil industry
    patterns and trains ML models to predict biomass waste, market prices, and optimal
    allocation strategies.
    """
    
    def __init__(self, model_dir="models"):
        self.model_dir = model_dir
        os.makedirs(model_dir, exist_ok=True)
        self.metrics = {}
    
    def generate_dataset(self, n_samples=5000):
        """
        Generate realistic synthetic training data based on palm oil industry patterns.
        
        Parameters:
        -----------
        n_samples : int
            Number of samples to generate (default: 5000)
        
        Returns:
        --------
        pd.DataFrame
            Generated dataset with all features and targets
        
        Industry-based realistic patterns:
        - FFB (Fresh Fruit Bunches): 80-150 tons/day (realistic mill capacity)
        - CPO (Crude Palm Oil): 18-24% of FFB (industry extraction rate)
        - Moisture content: 35-45% (typical for palm biomass)
        - Calorific Value (CV): 16-19 MJ/kg (for EFB, fiber, shell)
        - Mill efficiency: 0.75-0.95 (75-95% efficiency)
        """
        np.random.seed(42)  # For reproducibility
        
        # Input Features - Based on actual palm oil mill operations
        # FFB: Fresh Fruit Bunches processed per day (80-150 tons/day)
        ffb = np.random.uniform(80, 150, n_samples)
        
        # CPO: Crude Palm Oil extraction rate (18-24% of FFB is realistic)
        # Adding slight correlation with mill efficiency
        base_extraction_rate = np.random.uniform(0.18, 0.24, n_samples)
        
        # Mill efficiency: 75-95% (affects overall output)
        eff = np.random.uniform(0.75, 0.95, n_samples)
        
        # CPO production = FFB × extraction_rate × efficiency
        cpo = ffb * base_extraction_rate * eff
        
        # Moisture content: 35-45% (typical for palm biomass - EFB, fiber, shell)
        moisture = np.random.uniform(35, 45, n_samples)
        
        # Calorific Value: 16-19 MJ/kg (for palm biomass)
        # Negatively correlated with moisture (wetter = lower CV)
        cv = 19 - (moisture - 35) / 10 * 2 + np.random.normal(0, 0.3, n_samples)
        cv = np.clip(cv, 16, 19)
        
        # Derived Outputs
        # Biomass waste: ~23% of FFB becomes waste (EFB, fiber, shell, POME)
        # EFB: ~22%, Fiber: ~14%, Shell: ~6%, POME: ~0.6-0.8 m³/ton FFB
        biomass_base_rate = 0.23
        # Add slight variation based on efficiency and extraction
        biomass = ffb * biomass_base_rate * (1 + np.random.uniform(-0.05, 0.05, n_samples))
        
        # Market Price Modeling - Realistic relationships
        # Oil price index (base factor for biofuel)
        oil_price = np.random.uniform(60, 120, n_samples)
        
        # Biofuel demand index (0-1, where 1 is high demand)
        demand_bio = np.random.uniform(0.3, 0.95, n_samples)
        
        # Carbon tax: $8-$15/ton CO₂ equivalent
        carbon_tax = np.random.uniform(8, 15, n_samples)
        
        # Biofuel price: Base $85-$120/ton
        # Influenced by oil prices (+0.8 correlation), carbon tax, CV, and demand
        biofuel_price = (
            85 + 
            (oil_price - 60) * 0.5 +  # Oil price influence
            (cv - 16) * 8 +  # Higher CV = higher value
            carbon_tax * 0.3 +  # Carbon tax incentive
            demand_bio * 25 +  # Demand factor
            np.random.normal(0, 3, n_samples)
        )
        biofuel_price = np.clip(biofuel_price, 85, 120)
        
        # Animal feed price: Base $45-$75/ton
        # Protein content proxy (derived from processing quality)
        protein_score = np.random.uniform(0.6, 1.2, n_samples)
        
        # Feed demand index
        demand_feed = np.random.uniform(0.3, 0.9, n_samples)
        
        # Supply factor (market availability)
        supply_factor = np.random.uniform(0.8, 1.3, n_samples)
        
        feed_price = (
            45 + 
            protein_score * 15 +  # Protein content value
            demand_feed * 20 -  # Demand increase
            (supply_factor - 1) * 10 +  # Oversupply reduces price
            np.random.normal(0, 2, n_samples)
        )
        feed_price = np.clip(feed_price, 45, 75)
        
        # Compost price: Base $25-$50/ton
        # Base compost market price
        compost_base = np.random.uniform(25, 50, n_samples)
        
        # Nutrient score (quality factor)
        nutrient_score = np.random.uniform(0.7, 1.3, n_samples)
        
        compost_price = (
            compost_base * nutrient_score -
            (moisture - 40) * 0.5 +  # Lower moisture = better quality
            carbon_tax * 0.1 +  # Small carbon credit benefit
            np.random.normal(0, 1.5, n_samples)
        )
        compost_price = np.clip(compost_price, 25, 50)
        
        # Allocation Logic - Based on economic optimization with market conditions
        # Create realistic scenarios where different allocations are optimal
        # by considering processing costs, market access, and incentives
        allocation = np.zeros(n_samples, dtype=int)
        
        for i in range(n_samples):
            # Each allocation strategy has different economics:
            
            # Allocation 0: 60% Biofuel, 25% Feed, 15% Compost (High biofuel focus)
            # Best when: biofuel price is very high, low processing costs
            # Drawback: High infrastructure cost for biofuel processing
            biofuel_infra_cost = 8.0  # $8/ton processing cost for high biofuel conversion
            rev_0 = (
                biomass[i] * 0.60 * (biofuel_price[i] - biofuel_infra_cost) + 
                biomass[i] * 0.25 * feed_price[i] + 
                biomass[i] * 0.15 * compost_price[i]
            )
            
            # Allocation 1: 40% Biofuel, 40% Feed, 20% Compost (Balanced)
            # Best when: feed market is strong, medium costs, balanced demand
            # Benefits: Lower costs, flexibility, market access
            balanced_cost = 3.0  # Lower processing cost
            
            # Strong bonuses for balanced conditions
            feed_market_bonus = 0
            if demand_feed[i] > 0.55:  # Feed demand is good
                feed_market_bonus = biomass[i] * 12  # Strong bonus
            
            protein_bonus = 0
            if protein_score[i] > 0.85:  # High protein quality
                protein_bonus = biomass[i] * 8
            
            rev_1 = (
                biomass[i] * 0.40 * (biofuel_price[i] - balanced_cost) + 
                biomass[i] * 0.40 * feed_price[i] + 
                biomass[i] * 0.20 * compost_price[i] +
                feed_market_bonus +
                protein_bonus
            )
            
            # Allocation 2: 30% Biofuel, 30% Feed, 40% Compost (Sustainability focus)
            # Best when: carbon tax is high, compost market is good, moisture is high
            # Benefits: Carbon credits, lower processing needs, sustainability premiums
            sustainable_cost = 1.5  # Lowest processing cost
            
            # Strong bonuses for sustainability conditions
            carbon_incentive = 0
            if carbon_tax[i] > 10:  # Carbon tax policy active
                carbon_incentive = carbon_tax[i] * biomass[i] * 1.2  # Strong carbon credit
            
            nutrient_bonus = 0
            if nutrient_score[i] > 1.0:  # Good nutrient quality
                nutrient_bonus = biomass[i] * 10
            
            moisture_bonus = 0
            if moisture[i] > 41:  # High moisture favors compost
                moisture_bonus = biomass[i] * 6
            
            compost_demand_bonus = 0
            # Create compost demand proxy from market conditions
            if compost_base[i] > 37 and nutrient_score[i] > 1.0:
                compost_demand_bonus = biomass[i] * 8
            
            rev_2 = (
                biomass[i] * 0.30 * (biofuel_price[i] - sustainable_cost) + 
                biomass[i] * 0.30 * feed_price[i] + 
                biomass[i] * 0.40 * compost_price[i] + 
                carbon_incentive +
                nutrient_bonus +
                moisture_bonus +
                compost_demand_bonus
            )
            
            # Select allocation with highest net revenue
            revenues = [rev_0, rev_1, rev_2]
            allocation[i] = np.argmax(revenues)
        
        # Create DataFrame
        df = pd.DataFrame({
            # Input features
            'ffb': ffb,
            'cpo': cpo,
            'moisture': moisture,
            'cv': cv,
            'eff': eff,
            
            # Market factors
            'oil_price': oil_price,
            'demand_bio': demand_bio,
            'carbon_tax': carbon_tax,
            'demand_feed': demand_feed,
            'protein_score': protein_score,
            'supply_factor': supply_factor,
            'compost_base': compost_base,
            'nutrient_score': nutrient_score,
            
            # Target outputs
            'biomass': biomass,
            'biofuel_price': biofuel_price,
            'feed_price': feed_price,
            'compost_price': compost_price,
            'allocation': allocation
        })
        
        return df
    
    def save_training_data(self, df, filename="training_data.csv"):
        """
        Save generated training data to CSV for reproducibility.
        
        Parameters:
        -----------
        df : pd.DataFrame
            Training data to save
        filename : str
            Output filename (default: "training_data.csv")
        """
        data_dir = os.path.join(os.path.dirname(self.model_dir), "data")
        os.makedirs(data_dir, exist_ok=True)
        filepath = os.path.join(data_dir, filename)
        df.to_csv(filepath, index=False)
        print(f"Training data saved to: {filepath}")
        return filepath
    
    def calculate_mape(self, y_true, y_pred):
        """Calculate Mean Absolute Percentage Error."""
        return np.mean(np.abs((y_true - y_pred) / y_true)) * 100
    
    def train_model(self, X_train, X_test, y_train, y_test, model, model_name):
        """
        Generic training method with validation metrics.
        
        Parameters:
        -----------
        X_train, X_test : array-like
            Training and test features
        y_train, y_test : array-like
            Training and test targets
        model : sklearn model
            Model instance to train
        model_name : str
            Name of the model for metrics tracking
        
        Returns:
        --------
        tuple
            Trained model and metrics dictionary
        """
        # Train the model
        model.fit(X_train, y_train)
        
        # Make predictions
        y_pred_train = model.predict(X_train)
        y_pred_test = model.predict(X_test)
        
        # Calculate metrics
        metrics = {}
        
        if hasattr(model, 'predict_proba'):  # Classification model
            # Accuracy
            train_acc = accuracy_score(y_train, y_pred_train)
            test_acc = accuracy_score(y_test, y_pred_test)
            metrics['train_accuracy'] = f"{train_acc * 100:.2f}%"
            metrics['test_accuracy'] = f"{test_acc * 100:.2f}%"
            metrics['accuracy'] = f"{test_acc * 100:.2f}%"
            
            # Classification report
            report = classification_report(y_test, y_pred_test, output_dict=True)
            metrics['precision'] = {k: f"{v['precision']:.3f}" for k, v in report.items() if k.isdigit()}
            metrics['recall'] = {k: f"{v['recall']:.3f}" for k, v in report.items() if k.isdigit()}
            metrics['f1_score'] = {k: f"{v['f1-score']:.3f}" for k, v in report.items() if k.isdigit()}
            
            # Confusion matrix
            cm = confusion_matrix(y_test, y_pred_test)
            metrics['confusion_matrix'] = cm.tolist()
            
            print(f"\n{model_name} Metrics:")
            print(f"  Train Accuracy: {metrics['train_accuracy']}")
            print(f"  Test Accuracy: {metrics['test_accuracy']}")
            print(f"\nClassification Report:")
            print(classification_report(y_test, y_pred_test))
            print(f"Confusion Matrix:\n{cm}")
            
        else:  # Regression model
            # MAE
            train_mae = mean_absolute_error(y_train, y_pred_train)
            test_mae = mean_absolute_error(y_test, y_pred_test)
            metrics['train_mae'] = round(train_mae, 3)
            metrics['test_mae'] = round(test_mae, 3)
            metrics['mae'] = round(test_mae, 3)
            
            # MAPE
            train_mape = self.calculate_mape(y_train, y_pred_train)
            test_mape = self.calculate_mape(y_test, y_pred_test)
            metrics['train_mape'] = f"{train_mape:.2f}%"
            metrics['test_mape'] = f"{test_mape:.2f}%"
            metrics['mape'] = f"{test_mape:.2f}%"
            
            # R² Score
            train_r2 = r2_score(y_train, y_pred_train)
            test_r2 = r2_score(y_test, y_pred_test)
            metrics['train_r2'] = round(train_r2, 4)
            metrics['test_r2'] = round(test_r2, 4)
            metrics['r2_score'] = round(test_r2, 4)
            
            print(f"\n{model_name} Metrics:")
            print(f"  Train MAE: {metrics['train_mae']:.3f}")
            print(f"  Test MAE: {metrics['test_mae']:.3f}")
            print(f"  Train MAPE: {metrics['train_mape']}")
            print(f"  Test MAPE: {metrics['test_mape']}")
            print(f"  Train R²: {metrics['train_r2']:.4f}")
            print(f"  Test R²: {metrics['test_r2']:.4f}")
        
        return model, metrics

    def train(self, save_data=True):
        """
        Main training pipeline.
        
        This method:
        1. Generates or loads realistic training data
        2. Splits data into train/test sets
        3. Trains all 5 models with proper validation
        4. Prints comprehensive metrics
        5. Saves models and generates training report
        
        Parameters:
        -----------
        save_data : bool
            Whether to save generated training data to CSV (default: True)
        """
        print("="*70)
        print("VERDA AI Training System - Palm Oil Mill Waste Optimization")
        print("="*70)
        
        # Generate dataset
        print("\nGenerating realistic synthetic dataset based on palm oil industry patterns...")
        df = self.generate_dataset(n_samples=5000)
        print(f"Dataset generated: {len(df)} samples")
        print(f"Features: {list(df.columns)}")
        
        # Save training data if requested
        if save_data:
            self.save_training_data(df)
        
        print("\n" + "="*70)
        print("Training Models with 80/20 Train/Test Split")
        print("="*70)
        
        # Model 1: Waste Predictor
        print("\n[1/5] Training Waste Predictor (Biomass)...")
        X_waste = df[["ffb", "cpo", "moisture", "cv", "eff"]]
        y_waste = df["biomass"]
        
        X_waste_train, X_waste_test, y_waste_train, y_waste_test = train_test_split(
            X_waste, y_waste, test_size=0.2, random_state=42
        )
        
        waste_model = RandomForestRegressor(
            n_estimators=100,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42
        )
        
        waste_model, waste_metrics = self.train_model(
            X_waste_train, X_waste_test, y_waste_train, y_waste_test,
            waste_model, "Waste Predictor"
        )
        joblib.dump(waste_model, f"{self.model_dir}/waste.pkl")
        self.metrics['waste_predictor'] = waste_metrics
        
        # Model 2: Biofuel Price Predictor
        print("\n[2/5] Training Biofuel Price Predictor...")
        X_biofuel = df[["oil_price", "demand_bio", "cv", "carbon_tax"]]
        y_biofuel = df["biofuel_price"]
        
        X_biofuel_train, X_biofuel_test, y_biofuel_train, y_biofuel_test = train_test_split(
            X_biofuel, y_biofuel, test_size=0.2, random_state=42
        )
        
        biofuel_model = RandomForestRegressor(
            n_estimators=100,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42
        )
        
        biofuel_model, biofuel_metrics = self.train_model(
            X_biofuel_train, X_biofuel_test, y_biofuel_train, y_biofuel_test,
            biofuel_model, "Biofuel Price Predictor"
        )
        joblib.dump(biofuel_model, f"{self.model_dir}/biofuel.pkl")
        self.metrics['biofuel_price'] = biofuel_metrics
        
        # Model 3: Feed Price Predictor
        print("\n[3/5] Training Feed Price Predictor...")
        X_feed = df[["demand_feed", "protein_score", "supply_factor"]]
        y_feed = df["feed_price"]
        
        X_feed_train, X_feed_test, y_feed_train, y_feed_test = train_test_split(
            X_feed, y_feed, test_size=0.2, random_state=42
        )
        
        feed_model = RandomForestRegressor(
            n_estimators=100,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42
        )
        
        feed_model, feed_metrics = self.train_model(
            X_feed_train, X_feed_test, y_feed_train, y_feed_test,
            feed_model, "Feed Price Predictor"
        )
        joblib.dump(feed_model, f"{self.model_dir}/feed.pkl")
        self.metrics['feed_price'] = feed_metrics
        
        # Model 4: Compost Price Predictor
        print("\n[4/5] Training Compost Price Predictor...")
        X_compost = df[["compost_base", "nutrient_score", "moisture", "carbon_tax"]]
        y_compost = df["compost_price"]
        
        X_compost_train, X_compost_test, y_compost_train, y_compost_test = train_test_split(
            X_compost, y_compost, test_size=0.2, random_state=42
        )
        
        compost_model = RandomForestRegressor(
            n_estimators=100,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42
        )
        
        compost_model, compost_metrics = self.train_model(
            X_compost_train, X_compost_test, y_compost_train, y_compost_test,
            compost_model, "Compost Price Predictor"
        )
        joblib.dump(compost_model, f"{self.model_dir}/compost.pkl")
        self.metrics['compost_price'] = compost_metrics
        
        # Model 5: Allocation Classifier
        print("\n[5/5] Training Allocation Classifier...")
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
        
        # Stratified split for classification
        X_alloc_train, X_alloc_test, y_alloc_train, y_alloc_test = train_test_split(
            X_alloc, y_alloc, test_size=0.2, random_state=42, stratify=y_alloc
        )
        
        alloc_model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            min_samples_split=5,
            class_weight='balanced',
            random_state=42
        )
        
        alloc_model, alloc_metrics = self.train_model(
            X_alloc_train, X_alloc_test, y_alloc_train, y_alloc_test,
            alloc_model, "Allocation Classifier"
        )
        joblib.dump(alloc_model, f"{self.model_dir}/alloc.pkl")
        self.metrics['allocation_classifier'] = alloc_metrics
        
        # Generate training report
        print("\n" + "="*70)
        print("Generating Training Report...")
        print("="*70)
        
        report = {
            "timestamp": datetime.now().isoformat(),
            "dataset_size": len(df),
            "train_test_split": "80/20",
            "models": self.metrics
        }
        
        report_path = f"{self.model_dir}/training_report.json"
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"\nTraining report saved to: {report_path}")
        
        print("\n" + "="*70)
        print("Training Complete!")
        print("="*70)
        print(f"All models saved to: {self.model_dir}/")
        print("Models trained:")
        print("  - waste.pkl (Biomass Waste Predictor)")
        print("  - biofuel.pkl (Biofuel Price Predictor)")
        print("  - feed.pkl (Animal Feed Price Predictor)")
        print("  - compost.pkl (Compost Price Predictor)")
        print("  - alloc.pkl (Optimal Allocation Classifier)")
        
        return "Training complete, all models saved with validation metrics."


if __name__ == "__main__":
    trainer = VerdaTrainer(model_dir="models")
    print("Generating synthetic data and training models...")
    result = trainer.train()
    print(result)

