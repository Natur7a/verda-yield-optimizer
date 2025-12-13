"""
FastAPI application for VERDA AI prediction service.

This API wraps the VerdaPredictor ML models and provides REST endpoints
for waste allocation optimization predictions.
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from typing import Dict
import logging
from datetime import datetime
import os
import json
from verda_ai import VerdaPredictor

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="VERDA AI Prediction API",
    description="AI-powered palm oil waste allocation optimizer",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",  # Development frontend
        "http://127.0.0.1:8080",
        "https://*.lovable.app",  # Production (Lovable deployment)
        "https://*.lovable.dev",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global predictor instance
predictor = None

# Allocation strategy descriptions
ALLOCATION_DESCRIPTIONS = {
    0: "Revenue Maximization (60% Biofuel, 25% Feed, 15% Compost)",
    1: "Balanced Approach (40% Biofuel, 40% Feed, 20% Compost)",
    2: "Sustainability Focus (30% Biofuel, 30% Feed, 40% Compost)"
}


# Pydantic Models
class PredictionInput(BaseModel):
    """Input model for prediction requests with validation."""
    ffb: float = Field(..., ge=80, le=150, description="Fresh Fruit Bunches (tons/day)")
    cpo: float = Field(..., ge=14, le=36, description="Crude Palm Oil extraction rate (%)")
    moisture: float = Field(..., ge=35, le=45, description="Moisture content (%)")
    cv: float = Field(..., ge=16, le=19, description="Calorific Value (MJ/kg)")
    eff: float = Field(..., ge=0.75, le=0.95, description="Mill efficiency")
    oil_price: float = Field(..., ge=70, le=130, description="Oil price index")
    demand_bio: float = Field(..., ge=0.4, le=1.0, description="Biofuel demand factor")
    carbon_tax: float = Field(..., ge=8, le=15, description="Carbon tax ($/ton CO2)")
    demand_feed: float = Field(..., ge=0.4, le=1.0, description="Feed demand factor")
    protein_score: float = Field(..., ge=0.7, le=1.2, description="Protein score")
    supply_factor: float = Field(..., ge=0.8, le=1.3, description="Supply factor")
    compost_base: float = Field(..., ge=20, le=50, description="Compost base price")
    nutrient_score: float = Field(..., ge=0.7, le=1.3, description="Nutrient score")

    class Config:
        json_schema_extra = {
            "example": {
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
        }


class PricesPrediction(BaseModel):
    """Price predictions for different products."""
    biofuel: float = Field(..., description="Biofuel price ($/ton)")
    feed: float = Field(..., description="Feed price ($/ton)")
    compost: float = Field(..., description="Compost price ($/ton)")


class PredictionOutput(BaseModel):
    """Output model for prediction responses."""
    biomass: float = Field(..., description="Predicted biomass waste (tons)")
    prices: PricesPrediction
    optimal_allocation: int = Field(..., ge=0, le=2, description="Optimal allocation strategy (0, 1, or 2)")
    allocation_description: str = Field(..., description="Description of allocation strategy")


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    model_loaded: bool


class ModelInfo(BaseModel):
    """Model metadata information."""
    model_name: str
    version: str
    training_date: str
    models: Dict[str, str]


# Startup event
@app.on_event("startup")
async def startup_event():
    """Load ML models on startup."""
    global predictor
    try:
        model_dir = os.path.join(os.path.dirname(__file__), "models")
        logger.info(f"Loading models from {model_dir}")
        predictor = VerdaPredictor(model_dir=model_dir)
        logger.info("Models loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load models: {e}")
        logger.warning("API will start but predictions will fail until models are trained")


# Middleware for request logging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests and responses."""
    logger.info(f"Request: {request.method} {request.url.path}")
    response = await call_next(request)
    logger.info(f"Response status: {response.status_code}")
    return response


# API Endpoints
@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "VERDA AI Prediction API",
        "version": "1.0.0",
        "description": "AI-powered palm oil waste allocation optimizer",
        "endpoints": {
            "health": "/health",
            "predict": "/predict",
            "models_info": "/models/info",
            "docs": "/docs",
            "redoc": "/redoc"
        }
    }


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    model_loaded = predictor is not None
    return HealthResponse(
        status="healthy" if model_loaded else "degraded",
        model_loaded=model_loaded
    )


@app.post("/predict", response_model=PredictionOutput)
async def predict(input_data: PredictionInput):
    """
    Main prediction endpoint.
    
    Accepts mill operation parameters and market conditions,
    returns biomass prediction, price forecasts, and optimal allocation strategy.
    """
    if predictor is None:
        logger.error("Prediction attempted but models not loaded")
        raise HTTPException(
            status_code=503,
            detail="Models not loaded. Please ensure models are trained first by running trainer.py"
        )
    
    try:
        # Convert input to dict
        input_dict = input_data.model_dump()
        logger.info(f"Prediction request: {input_dict}")
        
        # Get prediction from ML model
        result = predictor.predict(input_dict)
        
        # Add allocation description
        allocation = result["optimal_allocation"]
        result["allocation_description"] = ALLOCATION_DESCRIPTIONS.get(
            allocation, 
            f"Unknown allocation strategy {allocation}"
        )
        
        logger.info(f"Prediction result: biomass={result['biomass']:.2f}, allocation={allocation}")
        
        return PredictionOutput(**result)
        
    except Exception as e:
        logger.error(f"Prediction error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )


@app.get("/models/info", response_model=ModelInfo)
async def get_model_info():
    """
    Get model metadata and training information.
    """
    model_dir = os.path.join(os.path.dirname(__file__), "models")
    report_path = os.path.join(model_dir, "training_report.json")
    
    # Default response
    info = {
        "model_name": "VERDA AI Optimizer",
        "version": "1.0.0",
        "training_date": "Not available",
        "models": {
            "waste_predictor": "Random Forest Regressor",
            "biofuel_price_predictor": "Random Forest Regressor",
            "feed_price_predictor": "Random Forest Regressor",
            "compost_price_predictor": "Random Forest Regressor",
            "allocation_classifier": "Random Forest Classifier"
        }
    }
    
    # Try to load training report if available
    try:
        if os.path.exists(report_path):
            with open(report_path, 'r') as f:
                report = json.load(f)
                info["training_date"] = report.get("training_date", "Not available")
                if "metrics" in report:
                    info["metrics"] = report["metrics"]
    except Exception as e:
        logger.warning(f"Could not load training report: {e}")
    
    return ModelInfo(**info)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
