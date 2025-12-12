# VERDA AI Training System Documentation

## Overview

The VERDA AI system uses machine learning to optimize palm oil mill waste allocation for maximum economic and environmental benefit. This document describes the training data generation, model architecture, and validation approach.

## Data Sources and Industry Assumptions

### Palm Oil Industry Context

The training data is generated based on **real palm oil industry patterns and standards**:

#### 1. Input Features (Mill Operations)

| Feature | Range | Description | Industry Source |
|---------|-------|-------------|-----------------|
| **FFB** | 80-150 tons/day | Fresh Fruit Bunches processed | Typical small-to-medium mill capacity |
| **CPO** | 18-24% of FFB | Crude Palm Oil extraction rate | Malaysian Palm Oil Board (MPOB) standards |
| **Moisture** | 35-45% | Moisture content in biomass waste | Typical for EFB, fiber, and shell |
| **CV (Calorific Value)** | 16-19 MJ/kg | Energy content of biomass | Palm biomass energy studies |
| **Mill Efficiency** | 0.75-0.95 | Processing efficiency | Industry operational range |

#### 2. Biomass Waste Components

Palm oil mills generate approximately **23% waste** from FFB processing:

| Component | % of FFB | Typical Use |
|-----------|----------|-------------|
| **EFB** (Empty Fruit Bunches) | ~22% | Mulch, compost, biofuel |
| **Fiber** (Mesocarp fiber) | ~14% | Boiler fuel, biofuel |
| **Shell** (Kernel shells) | ~6% | Boiler fuel, activated carbon |
| **POME** (Palm Oil Mill Effluent) | 0.6-0.8 m³/ton FFB | Biogas, fertilizer |

**Total biomass waste = FFB × 0.23** (with minor variations based on mill efficiency)

#### 3. Market Price Modeling

Prices are modeled based on realistic market relationships:

##### Biofuel Price ($85-120/ton)
- **Base factors**: Oil price index, calorific value, carbon tax incentives
- **Formula**: `Base + Oil_Price×0.5 + CV×8 + Carbon_Tax×0.3 + Demand×25`
- **Correlations**: +0.8 with oil prices, +0.6 with carbon tax policy

##### Animal Feed Price ($45-75/ton)
- **Base factors**: Protein content, market demand, supply availability
- **Formula**: `Base + Protein×15 + Demand×20 - Supply_Factor×10`
- **Correlations**: +0.7 with protein score, -0.5 with oversupply

##### Compost Price ($25-50/ton)
- **Base factors**: Nutrient quality, moisture content, market base price
- **Formula**: `Base×Nutrient - Moisture×0.5 + Carbon_Tax×0.1`
- **Considerations**: Lower moisture = better quality, carbon credits add value

##### Carbon Credits
- **Range**: $8-15/ton CO₂ equivalent
- **Impact**: Influences biofuel and compost economics
- **Source**: Voluntary carbon market prices (2024-2025)

#### 4. Allocation Strategies

The system classifies optimal allocation into 3 strategies:

| Strategy | Allocation | Focus | When Optimal |
|----------|------------|-------|--------------|
| **0** | 60% Biofuel, 25% Feed, 15% Compost | High Revenue | High oil prices, high biofuel demand |
| **1** | 40% Biofuel, 40% Feed, 20% Compost | Balanced | Moderate market conditions |
| **2** | 30% Biofuel, 30% Feed, 40% Compost | Sustainability | High carbon tax, compost demand |

**Decision Logic**: Revenue-based optimization considering:
- Market prices for each product
- Carbon tax incentives for sustainable options
- Demand indicators for each market

## Model Architecture

### 1. Waste Predictor (Regression)
- **Purpose**: Predict total biomass waste from mill operations
- **Features**: FFB, CPO, moisture, CV, efficiency
- **Target**: Biomass (tons)
- **Algorithm**: Random Forest Regressor (100 trees, depth=15)

### 2. Biofuel Price Predictor (Regression)
- **Purpose**: Predict biofuel market price
- **Features**: Oil price, biofuel demand, CV, carbon tax
- **Target**: Biofuel price ($/ton)
- **Algorithm**: Random Forest Regressor (100 trees, depth=15)

### 3. Feed Price Predictor (Regression)
- **Purpose**: Predict animal feed market price
- **Features**: Feed demand, protein score, supply factor
- **Target**: Feed price ($/ton)
- **Algorithm**: Random Forest Regressor (100 trees, depth=15)

### 4. Compost Price Predictor (Regression)
- **Purpose**: Predict compost market price
- **Features**: Compost base price, nutrient score, moisture, carbon tax
- **Target**: Compost price ($/ton)
- **Algorithm**: Random Forest Regressor (100 trees, depth=15)

### 5. Allocation Classifier (Classification)
- **Purpose**: Recommend optimal allocation strategy
- **Features**: Biomass, biofuel price, feed price, compost price, carbon tax, demands
- **Target**: Allocation class (0, 1, or 2)
- **Algorithm**: Random Forest Classifier (100 trees, depth=10, balanced weights)

## Training Methodology

### Data Generation
- **Dataset Size**: 5,000 samples
- **Method**: Synthetic data with realistic correlations
- **Reproducibility**: Fixed random seed (42)
- **Saved**: `ai/data/training_data.csv`

### Train/Test Split
- **Ratio**: 80% training, 20% testing
- **Method**: Random split with stratification for classification
- **Purpose**: Validate model generalization

### Validation Metrics

#### Regression Models (Waste, Prices)
- **MAE (Mean Absolute Error)**: Average prediction error in units
- **MAPE (Mean Absolute Percentage Error)**: Percentage-based error metric
- **R² Score**: Proportion of variance explained (0-1, higher is better)

#### Classification Model (Allocation)
- **Accuracy**: Overall correct predictions
- **Precision**: Correctness of positive predictions per class
- **Recall**: Coverage of actual positives per class
- **F1-Score**: Harmonic mean of precision and recall
- **Confusion Matrix**: Detailed prediction vs actual breakdown

## Expected Performance

Based on the realistic data generation and model configuration:

| Model | Expected Test MAE | Expected Test MAPE | Expected Test R² |
|-------|------------------|-------------------|-----------------|
| Waste Predictor | < 1.0 ton | < 5% | > 0.95 |
| Biofuel Price | < 2.0 $/ton | < 2% | > 0.90 |
| Feed Price | < 1.5 $/ton | < 3% | > 0.90 |
| Compost Price | < 1.0 $/ton | < 3% | > 0.90 |
| Allocation Classifier | - | - | **~90-95% accuracy** |

**Note**: The high accuracy is achievable because:
1. Allocation is directly based on revenue optimization (deterministic logic)
2. Features contain the necessary information to compute optimal allocation
3. Clear decision boundaries between allocation strategies
4. Balanced class distribution in training data

## Data Validation

Use `ai/validate_data.py` to verify data quality:

```bash
cd ai
python validate_data.py
```

The validation script checks:
- ✓ Value ranges match industry standards
- ✓ Correlations are realistic
- ✓ No data leakage between models
- ✓ Proper distributions
- ✓ Realistic industry relationships (CPO/FFB ratio, waste rates)

## Training the Models

```bash
cd ai
python trainer.py
```

This will:
1. Generate 5,000 realistic samples
2. Save data to `data/training_data.csv`
3. Train all 5 models with 80/20 split
4. Print comprehensive validation metrics
5. Save models to `models/` directory
6. Generate `models/training_report.json`

## Using the Trained Models

```python
from verda_ai import VerdaPredictor

predictor = VerdaPredictor(model_dir="models")

result = predictor.predict({
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
})

# Returns:
# {
#   "biomass": <predicted tons>,
#   "prices": {
#     "biofuel": <$/ton>,
#     "feed": <$/ton>,
#     "compost": <$/ton>
#   },
#   "optimal_allocation": <0, 1, or 2>
# }
```

## References

### Industry Standards
- Malaysian Palm Oil Board (MPOB) - Extraction rates and waste statistics
- International Energy Agency (IEA) - Biomass energy values
- RSPO (Roundtable on Sustainable Palm Oil) - Sustainability standards

### Academic Sources
- Yusoff, S. (2006). "Renewable energy from palm oil" - Biomass composition
- Sulaiman, F. et al. (2011). "Palm oil biomass potential" - Calorific values
- Ofori-Boateng, C. et al. (2013). "Sustainability of palm oil biomass"

### Market Data
- Carbon pricing data from voluntary carbon markets (2024-2025)
- Biofuel price trends from renewable energy reports
- Animal feed pricing from agricultural commodity markets
- Compost pricing from organic agriculture industry

## Changelog

### Version 1.0 (2025-12-12)
- Initial release with comprehensive training system
- Realistic data generation based on palm oil industry standards
- Full validation metrics and data quality checks
- Documentation of all assumptions and sources

## Contact

For questions about the training data or model assumptions, please refer to the industry sources listed above or consult with palm oil processing experts.
