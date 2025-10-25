# Guía de Despliegue para DocuPrism

## Problema: La PWA no funciona offline en Vercel

### Causa
Por defecto, Nuxt usa SSR (Server-Side Rendering), lo que requiere un servidor para funcionar. Para que una PWA funcione completamente offline, necesita ser una aplicación estática (SSG - Static Site Generation).

### Solución Implementada

Se han realizado los siguientes cambios para habilitar el funcionamiento offline:

#### 1. Configuración de Nuxt (`nuxt.config.ts`)
- **`ssr: false`**: Desactiva el Server-Side Rendering
- **`nitro.preset: 'static'`**: Configura Nitro para generar archivos estáticos
- **`nitro.prerender`**: Pre-renderiza todas las rutas

#### 2. Configuración de Vercel (`vercel.json`)
- **`buildCommand: "pnpm run generate"`**: Usa generación estática en lugar de build
- **`outputDirectory: ".output/public"`**: Directorio de salida para archivos estáticos
- **Headers para Service Worker**: Configuración correcta de cache para `sw.js`

## Cómo Desplegar

### Opción 1: Despliegue Automático (Recomendado)
1. Haz commit de los cambios:
   ```bash
   git add .
   git commit -m "feat: enable static generation for offline PWA support"
   git push
   ```

2. Vercel detectará automáticamente los cambios y usará la configuración de `vercel.json`

### Opción 2: Despliegue Manual
1. Genera los archivos estáticos:
   ```bash
   pnpm run generate
   ```

2. Verifica que se hayan generado en `.output/public/`:
   ```bash
   ls -la .output/public/
   ```

3. Despliega usando Vercel CLI:
   ```bash
   vercel --prod
   ```

## Verificación del Funcionamiento Offline

1. **Primera visita**: Abre la aplicación en Chrome con internet
2. **Instalación del Service Worker**: Verifica en DevTools > Application > Service Workers que el SW está activo
3. **Cache**: En DevTools > Application > Cache Storage, verifica que los recursos están cacheados
4. **Prueba offline**: 
   - Desactiva la red en DevTools (Network > Offline)
   - O desactiva el WiFi/datos móviles
   - Recarga la página - debería funcionar sin internet

## Notas Importantes

### ¿El usuario necesita tener la página abierta?
**NO**. Una vez que:
1. El usuario visita la página por primera vez con internet
2. El Service Worker se instala correctamente
3. Los recursos se cachean

La aplicación funcionará offline incluso si:
- El usuario cierra el navegador
- Reinicia el dispositivo
- No ha visitado la página en días

### Limitaciones
- **Primera visita**: Requiere internet para instalar el Service Worker
- **Chrome Built-in AI**: Requiere Chrome Canary/Dev con flags habilitados
- **Actualizaciones**: Si hay una nueva versión, necesitará internet para actualizar

### Troubleshooting

#### El Service Worker no se instala
- Verifica que estás usando HTTPS (Vercel lo proporciona automáticamente)
- Revisa la consola del navegador para errores
- Verifica en DevTools > Application > Service Workers

#### La aplicación no funciona offline
- Asegúrate de haber visitado la página al menos una vez con internet
- Verifica que el Service Worker está en estado "activated"
- Revisa que los recursos están en Cache Storage
- Limpia el cache y vuelve a cargar con internet

#### Errores de build
- Asegúrate de tener Node.js 18+ y pnpm instalado
- Ejecuta `pnpm install` para instalar dependencias
- Verifica que no hay errores de TypeScript

## Recursos Adicionales

- [Nuxt Static Site Generation](https://nuxt.com/docs/getting-started/deployment#static-hosting)
- [Vite PWA Documentation](https://vite-pwa-org.netlify.app/)
- [Vercel Deployment](https://vercel.com/docs/frameworks/nuxt)
