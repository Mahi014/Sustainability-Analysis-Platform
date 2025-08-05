from pydantic import BaseModel
from data_loader import get_nasa_solar_data
from catboost import CatBoostRegressor
from sklearn.model_selection import train_test_split
import numpy as np;
import pandas as pd;

class LocationInput(BaseModel):
    latitude: float
    longitude: float

def train_catboost(df):
    features = [
        'Year', 'Month', 'DayOfYear',
        'CLRSKY_SFC_SW_DWN', 'T2M',
        'Day_Sin', 'Day_Cos',
        'SWDWN_7d_avg', 'SWDWN_30d_avg', 'T2M_7d_avg'
    ]
    X = df[features]
    y = df['ALLSKY_SFC_SW_DWN']
    X_train, _, y_train, _ = train_test_split(X, y, test_size=0.2, random_state=42)
    model = CatBoostRegressor(
        iterations=1500,
        learning_rate=0.03,
        depth=8,
        loss_function='RMSE',
        random_seed=42,
        early_stopping_rounds=50,
        verbose=False
    )
    model.fit(X_train, y_train)
    return model

def predict_solar(input_data: LocationInput):
    df = get_nasa_solar_data(input_data.latitude, input_data.longitude)
    if df is None:
        return {"message": "Failed to fetch NASA data."}

    model = train_catboost(df)
    future_dates = pd.date_range(start="2025-01-01", end="2025-12-31", freq='D')
    future_df = pd.DataFrame({"Date": future_dates})
    future_df['Year'] = future_df['Date'].dt.year
    future_df['Month'] = future_df['Date'].dt.month
    future_df['DayOfYear'] = future_df['Date'].dt.dayofyear
    future_df['Day_Sin'] = np.sin(2 * np.pi * future_df['DayOfYear'] / 365)
    future_df['Day_Cos'] = np.cos(2 * np.pi * future_df['DayOfYear'] / 365)
    future_df['CLRSKY_SFC_SW_DWN'] = df['CLRSKY_SFC_SW_DWN'].mean()
    future_df['T2M'] = df['T2M'].mean()
    future_df['SWDWN_7d_avg'] = df['SWDWN_7d_avg'].mean()
    future_df['SWDWN_30d_avg'] = df['SWDWN_30d_avg'].mean()
    future_df['T2M_7d_avg'] = df['T2M_7d_avg'].mean()
    features = [
        'Year', 'Month', 'DayOfYear',
        'CLRSKY_SFC_SW_DWN', 'T2M',
        'Day_Sin', 'Day_Cos',
        'SWDWN_7d_avg', 'SWDWN_30d_avg', 'T2M_7d_avg'
    ]
    predictions = model.predict(future_df[features])
    yearly_average = max(0, predictions.mean())

    if yearly_average > 5.0:
        recommendation = "✅ Excellent potential! Installing solar is a great investment."
    elif 3.5 <= yearly_average <= 5.0:
        recommendation = "👍 Good potential. Solar installation is beneficial."
    elif 2.0 <= yearly_average < 3.5:
        recommendation = "⚠️ Moderate potential. Consider additional analysis before installation."
    else:
        recommendation = "❌ Low potential. Solar may not be a cost-effective option."

    return {
        "average_radiation": round(yearly_average, 3),
        "result": recommendation
    }