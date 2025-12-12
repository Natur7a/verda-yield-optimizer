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
    
    def calculate_mape(self, y_true, y_pred):
        """
        Calculate Mean Absolute Percentage Error.
        
        Handles zero values by using epsilon to avoid division by zero.
        """
        epsilon = 1e-10  # Small value to avoid division by zero
        return np.mean(np.abs((y_true - y_pred) / (y_true + epsilon))) * 100
    
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

    def train(self, data_path="data/training_data.csv"):
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
        print(f"\nLoading training data from {data_path}...")
        df = pd.read_csv(data_path)
        print(f"Dataset loaded: {len(df)} samples")
        print(f"Features: {list(df.columns)}")
        
        
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

