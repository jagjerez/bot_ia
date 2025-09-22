# 🎮 Modo Simulación y Trading Real

Este documento describe las funcionalidades de simulación y trading real implementadas en el bot de trading.

## 🔒 **Modo Simulación (Por Defecto)**

### **Características:**
- **✅ Seguro**: No ejecuta órdenes reales en Binance
- **✅ Completo**: Todas las funcionalidades del bot funcionan
- **✅ Logging**: Registra todas las operaciones en la base de datos
- **✅ Testing**: Perfecto para probar estrategias y configuraciones

### **Comportamiento:**
- Las señales de compra/venta se generan normalmente
- Se registran en la base de datos como trades simulados
- Se muestran en el dashboard con etiqueta `[SIMULATION]`
- No se envían órdenes reales a Binance

## ⚠️ **Modo Trading Real**

### **Activación Requerida:**
1. **Desactivar Simulación**: Cambiar a modo real
2. **Habilitar Trading Real**: Activar el botón de trading real
3. **Confirmación**: El sistema mostrará advertencias de seguridad

### **Características:**
- **⚠️ PELIGROSO**: Ejecuta órdenes reales en Binance
- **💰 Dinero Real**: Usa fondos reales de tu cuenta
- **🔒 Doble Confirmación**: Requiere dos pasos para activar
- **📊 Monitoreo**: Logs detallados de todas las operaciones

## 🎛️ **Controles del Dashboard**

### **1. Modo de Trading**
```
🔄 SIMULATION  ←→  🟠 REAL
```
- **SIMULATION**: Modo seguro (por defecto)
- **REAL**: Modo de trading real (requiere confirmación)

### **2. Trading Real**
```
🔒 DISABLED  ←→  ⚠️ ENABLED
```
- **DISABLED**: Trading real deshabilitado
- **ENABLED**: Trading real habilitado (solo si no está en simulación)

### **3. Datos Históricos**
```
📊 200 puntos históricos
[Load Historical Data]
```
- Muestra cantidad de puntos históricos cargados
- Botón para cargar datos históricos del gráfico

## 📊 **Datos Históricos**

### **Funcionalidades:**
- **📈 Gráfico Completo**: Muestra datos históricos + tiempo real
- **🔄 Actualización**: Se actualiza automáticamente cada 30 segundos
- **📊 200 Puntos**: Mantiene los últimos 200 puntos de datos
- **⚡ Rápido**: Carga instantánea de datos históricos

### **Fuente de Datos:**
- **Binance API**: Datos reales de 1 minuto
- **Símbolo**: BTC/USDT (configurable)
- **Período**: 200 velas históricas
- **Formato**: OHLCV (Open, High, Low, Close, Volume)

## 🚀 **Cómo Usar**

### **1. Modo Simulación (Recomendado)**
```bash
1. Abrir Dashboard: http://localhost:3000/dashboard
2. Verificar que esté en "SIMULATION"
3. Iniciar el bot
4. Monitorear las operaciones simuladas
5. Revisar logs en la consola
```

### **2. Modo Trading Real (Solo para Producción)**
```bash
1. Cambiar a modo "REAL"
2. Hacer clic en "Enable Real Trading"
3. Confirmar la advertencia de seguridad
4. Iniciar el bot con precaución
5. Monitorear constantemente
```

### **3. Cargar Datos Históricos**
```bash
1. Hacer clic en "Load Historical Data"
2. Esperar a que se carguen los datos
3. Ver el gráfico actualizado con datos históricos
4. Los datos se actualizan automáticamente
```

## 🔧 **APIs Disponibles**

### **Estado de Trading**
```http
GET /api/trading/status
```
**Respuesta:**
```json
{
  "success": true,
  "data": {
    "simulationMode": true,
    "realTradingEnabled": false,
    "isRealTrading": false
  }
}
```

### **Cambiar Modo Simulación**
```http
POST /api/trading/simulation
Content-Type: application/json

{
  "enabled": true
}
```

### **Habilitar Trading Real**
```http
POST /api/trading/real
Content-Type: application/json

{
  "enabled": true
}
```

### **Cargar Datos Históricos**
```http
GET /api/historical?symbol=BTC/USDT&limit=200
```

## ⚠️ **Advertencias de Seguridad**

### **Modo Simulación**
- ✅ **Seguro**: No hay riesgo de pérdida de dinero
- ✅ **Ideal para**: Testing, desarrollo, aprendizaje
- ✅ **Recomendado**: Para la mayoría de usuarios

### **Modo Trading Real**
- ⚠️ **PELIGROSO**: Puede causar pérdidas financieras
- ⚠️ **Solo para**: Usuarios experimentados
- ⚠️ **Requerido**: Monitoreo constante
- ⚠️ **Recomendado**: Empezar con cantidades pequeñas

## 🛡️ **Medidas de Seguridad**

### **1. Doble Confirmación**
- No se puede activar trading real mientras esté en simulación
- Requiere desactivar simulación primero
- Botón de trading real deshabilitado en simulación

### **2. Indicadores Visuales**
- **Azul**: Modo simulación activo
- **Rojo**: Trading real habilitado
- **Gris**: Trading real deshabilitado

### **3. Logs Detallados**
- Todas las operaciones se registran
- Etiquetas claras: `[SIMULATION]` vs `[REAL TRADE]`
- Timestamps y detalles de cada operación

## 📈 **Flujo de Trabajo Recomendado**

### **1. Desarrollo y Testing**
```bash
1. Usar modo SIMULATION
2. Probar estrategias ML
3. Ejecutar backtests
4. Ajustar parámetros
5. Verificar rendimiento
```

### **2. Producción (Solo Experto)**
```bash
1. Cambiar a modo REAL
2. Habilitar trading real
3. Empezar con cantidades pequeñas
4. Monitorear constantemente
5. Tener plan de emergencia
```

## 🔍 **Monitoreo y Logs**

### **Consola del Servidor**
```bash
# Modo Simulación
🔄 SIMULATED BUY: BTC/USDT at $50000 (Amount: 0.001)
🔄 SIMULATED SELL: BTC/USDT at $51000 (Amount: 0.001)

# Modo Real
✅ REAL BUY order executed: { orderId: "12345", ... }
✅ REAL SELL order executed: { orderId: "12346", ... }
```

### **Dashboard**
- Estado en tiempo real del modo de trading
- Contadores de operaciones
- Alertas de seguridad
- Datos históricos en el gráfico

## 🎯 **Conclusión**

El sistema de simulación y trading real proporciona:

- **🔒 Seguridad**: Modo simulación por defecto
- **⚡ Flexibilidad**: Fácil cambio entre modos
- **📊 Visibilidad**: Datos históricos y tiempo real
- **🛡️ Control**: Múltiples capas de seguridad
- **📈 Rendimiento**: Monitoreo completo

**¡Perfecto para desarrollo seguro y trading profesional! 🚀**

---

**¡El bot ahora es completamente seguro y profesional! 🎮✨**
