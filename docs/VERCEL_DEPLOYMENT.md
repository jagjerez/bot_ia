# Vercel Deployment Guide

Esta guía te ayudará a desplegar tu bot de trading de criptomonedas en Vercel.

## Configuración de Base de Datos

### 1. Crear Base de Datos PostgreSQL

Vercel no soporta SQLite, por lo que necesitas una base de datos PostgreSQL. Opciones recomendadas:

#### Opción A: Vercel Postgres (Recomendado)
1. Ve a tu proyecto en Vercel
2. Ve a la pestaña "Storage"
3. Crea una nueva base de datos PostgreSQL
4. Copia la `DATABASE_URL` que se genera

#### Opción B: Supabase (Gratuito)
1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Ve a Settings > Database
4. Copia la "Connection string"

#### Opción C: PlanetScale
1. Ve a [planetscale.com](https://planetscale.com)
2. Crea una nueva base de datos
3. Copia la connection string

### 2. Configurar Variables de Entorno

En el dashboard de Vercel:
1. Ve a tu proyecto
2. Ve a Settings > Environment Variables
3. Agrega las siguientes variables:

```
DATABASE_URL=postgresql://user:password@host:port/database
BINANCE_API_KEY=tu-api-key
BINANCE_SECRET=tu-secret
BINANCE_SANDBOX=true
NEXTAUTH_SECRET=tu-secret-key
NEXTAUTH_URL=https://tu-dominio.vercel.app
```

## Configuración del Proyecto

### 1. Archivos de Configuración

El proyecto ya está configurado con:
- `vercel.json` - Configuración de Vercel
- `next.config.ts` - Configuración de Next.js
- `prisma/schema.prisma` - Schema para PostgreSQL (producción)
- `prisma/schema.sqlite.prisma` - Schema para SQLite (desarrollo)

### 2. Scripts Disponibles

```bash
# Desarrollo local (SQLite)
pnpm db:generate:sqlite
pnpm db:push:sqlite
pnpm db:reset:sqlite

# Producción (PostgreSQL)
pnpm db:generate
pnpm db:push
pnpm db:reset
```

## Proceso de Despliegue

### 1. Preparar el Proyecto

```bash
# Instalar dependencias
pnpm install

# Generar cliente Prisma
pnpm db:generate

# Hacer push de la base de datos (solo la primera vez)
pnpm db:push
```

### 2. Desplegar en Vercel

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Vercel automáticamente:
   - Ejecutará `pnpm install`
   - Ejecutará `pnpm db:generate` (via postinstall)
   - Ejecutará `pnpm build`

### 3. Verificar el Despliegue

1. Ve a tu dominio de Vercel
2. Verifica que la aplicación carga correctamente
3. Prueba las funcionalidades del bot

## Solución de Problemas

### Error: "PrismaClient is not defined"

**Causa**: El cliente de Prisma no se generó correctamente.

**Solución**:
1. Verifica que `prisma` esté en `devDependencies`
2. Asegúrate de que `postinstall` ejecute `prisma generate`
3. Verifica que `DATABASE_URL` esté configurada

### Error: "Database connection failed"

**Causa**: La `DATABASE_URL` no es válida o la base de datos no está accesible.

**Solución**:
1. Verifica la `DATABASE_URL` en Vercel
2. Asegúrate de que la base de datos esté activa
3. Verifica que las credenciales sean correctas

### Error: "Build failed"

**Causa**: Problemas durante el proceso de build.

**Solución**:
1. Verifica los logs de build en Vercel
2. Asegúrate de que todas las dependencias estén instaladas
3. Verifica que no haya errores de TypeScript

## Configuración de Desarrollo Local

Para desarrollo local, usa SQLite:

```bash
# Crear archivo .env.local
echo 'DATABASE_URL="file:./dev.db"' > .env.local

# Configurar base de datos local
pnpm db:generate:sqlite
pnpm db:push:sqlite
pnpm db:seed
```

## Monitoreo y Logs

### Vercel Analytics
1. Habilita Vercel Analytics en tu proyecto
2. Monitorea el rendimiento y errores

### Logs de Aplicación
1. Ve a la pestaña "Functions" en Vercel
2. Revisa los logs de las funciones serverless
3. Monitorea los errores en tiempo real

## Optimizaciones

### Performance
1. Usa `output: 'standalone'` en `next.config.ts`
2. Configura `serverExternalPackages` para paquetes pesados
3. Usa `maxDuration` apropiado para funciones API

### Costos
1. Usa Vercel Postgres para base de datos (más económico)
2. Optimiza las consultas de base de datos
3. Implementa caching donde sea posible

## Seguridad

### Variables de Entorno
1. Nunca commitees archivos `.env`
2. Usa diferentes API keys para desarrollo y producción
3. Rota las keys regularmente

### Base de Datos
1. Usa conexiones SSL
2. Restringe el acceso por IP
3. Haz backups regulares

## Soporte

Si tienes problemas:
1. Revisa los logs de Vercel
2. Verifica la documentación de Prisma
3. Consulta la documentación de Vercel
4. Revisa los issues en GitHub del proyecto
