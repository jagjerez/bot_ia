# 🤖 AI/ML Trading Strategy

Este documento describe la implementación de estrategias de trading basadas en Inteligencia Artificial y Machine Learning.

## 🧠 **Arquitectura de ML**

### **1. LSTM Neural Network**
- **Propósito**: Predicción de precios basada en patrones históricos
- **Arquitectura**: 
  - 2 capas LSTM (50 unidades cada una)
  - Dropout (20%) para prevenir overfitting
  - Dense layers para predicción final
- **Input**: Secuencias de precios de 60 períodos
- **Output**: Predicción de precio futuro

### **2. Random Forest Classifier**
- **Propósito**: Clasificación de señales de compra/venta
- **Configuración**:
  - 100 estimadores
  - Profundidad máxima: 10
  - Mínimo de muestras para dividir: 5
- **Features**: 13 indicadores técnicos normalizados

### **3. Feature Engineering**
- **RSI**: Relative Strength Index (14 períodos)
- **MACD**: Moving Average Convergence Divergence
- **Bollinger Bands**: Posición del precio en las bandas
- **ATR**: Average True Range
- **Stochastic**: Oscilador estocástico
- **Williams %R**: Indicador de momentum
- **CCI**: Commodity Channel Index
- **OBV**: On-Balance Volume
- **Price Change**: Cambio porcentual de precio
- **Volume Change**: Cambio porcentual de volumen
- **Volatility**: Volatilidad de 20 períodos

## 🎯 **Estrategia de Trading**

### **Señales de Trading**
1. **Compra**: Random Forest predice "buy" con confianza > 60%
2. **Venta**: Random Forest predice "sell" con confianza > 60%
3. **Hold**: Confianza < 60% o predicción "hold"

### **Risk Management**
- **Stop Loss**: 2% por debajo del precio de entrada (compras)
- **Take Profit**: Precio objetivo predicho por LSTM
- **Position Sizing**: 10% del capital por operación
- **Commission**: 0.1% por operación

## 📊 **Backtesting**

### **Métricas de Evaluación**
- **Total Return**: Retorno total del período
- **Win Rate**: Porcentaje de operaciones ganadoras
- **Max Drawdown**: Máxima pérdida consecutiva
- **Sharpe Ratio**: Retorno ajustado por riesgo
- **Profit Factor**: Ratio de ganancias vs pérdidas

### **Configuración de Backtest**
- **Capital Inicial**: $10,000
- **Período de Entrenamiento**: 500 datos
- **Período de Prueba**: Datos restantes
- **Confianza Mínima**: 60%

## 🚀 **Cómo Usar**

### **1. Entrenar el Modelo**
```bash
# Desde el dashboard
1. Hacer clic en "Train Model"
2. Esperar a que se complete el entrenamiento
3. Verificar que el estado muestre "Model Trained: ✓"
```

### **2. Ejecutar Backtest**
```bash
# Desde el dashboard
1. Hacer clic en "Run Backtest"
2. Revisar los resultados en el popup
3. Analizar métricas de rendimiento
```

### **3. Activar Estrategia ML**
```bash
# Desde el dashboard
1. Hacer clic en "Enable ML"
2. Iniciar el bot
3. Monitorear las predicciones en tiempo real
```

## 🔧 **Configuración Avanzada**

### **Ajustar Confianza Mínima**
```typescript
// En el código
tradingBot.setMinConfidence(0.7) // 70% de confianza mínima
```

### **Cambiar Estrategia**
```typescript
// Usar estrategia simple en lugar de ML
tradingBot.setMLStrategy(false)
```

### **Personalizar Indicadores**
```typescript
// En src/lib/indicators.ts
const indicators = {
  rsi: this.rsi(14),        // Cambiar período RSI
  macd: this.macd(12, 26, 9), // Cambiar períodos MACD
  bollinger: this.bollinger(20, 2) // Cambiar período y desviación
}
```

## 📈 **Interpretación de Resultados**

### **Confianza Alta (>80%)**
- Señal muy fuerte
- Alta probabilidad de éxito
- Recomendado para operaciones grandes

### **Confianza Media (60-80%)**
- Señal moderada
- Riesgo moderado
- Bueno para operaciones regulares

### **Confianza Baja (<60%)**
- Señal débil
- No se ejecuta operación
- Esperar mejor oportunidad

## ⚠️ **Limitaciones y Consideraciones**

### **Limitaciones**
1. **Datos Históricos**: Necesita al menos 500 puntos de datos
2. **Tiempo de Entrenamiento**: Puede tomar varios minutos
3. **Memoria**: Requiere más RAM para modelos ML
4. **Overfitting**: Posible sobreajuste a datos históricos

### **Mejores Prácticas**
1. **Entrenar Regularmente**: Re-entrenar con datos frescos
2. **Validar Resultados**: Usar backtesting antes de trading real
3. **Monitorear Performance**: Ajustar parámetros según resultados
4. **Diversificar**: No depender solo de una estrategia

## 🔮 **Futuras Mejoras**

### **Próximas Características**
- **Sentiment Analysis**: Análisis de noticias y redes sociales
- **Reinforcement Learning**: Aprendizaje por refuerzo
- **Ensemble Methods**: Combinación de múltiples modelos
- **Real-time Learning**: Aprendizaje en tiempo real
- **Multi-Asset**: Soporte para múltiples criptomonedas

### **Optimizaciones**
- **Hyperparameter Tuning**: Optimización automática de parámetros
- **Feature Selection**: Selección automática de features
- **Model Ensembling**: Combinación de múltiples modelos
- **Online Learning**: Aprendizaje continuo

## 📚 **Referencias Técnicas**

- **LSTM**: Long Short-Term Memory networks
- **Random Forest**: Ensemble learning method
- **Technical Analysis**: Análisis técnico tradicional
- **Feature Engineering**: Ingeniería de características
- **Backtesting**: Pruebas con datos históricos

---

**¡El bot ahora es mucho más inteligente! 🧠✨**
