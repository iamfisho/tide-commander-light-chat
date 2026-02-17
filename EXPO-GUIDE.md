# 🚀 Guía de Inicio Rápido - Tide Mobile con Expo

¡Bienvenido a Tide Mobile! Esta versión usa Expo para una experiencia de desarrollo mucho más simple.

## ✅ Ventajas de Expo

- ❌ **NO necesitas Android Studio**
- ❌ **NO necesitas configurar Gradle**
- ❌ **NO necesitas emuladores**
- ✅ **Prueba directo en tu teléfono con Expo Go**
- ✅ **Desarrollo más rápido con recarga en caliente**
- ✅ **Funciona en Android e iOS**

## 📱 Paso 1: Instala Expo Go en tu teléfono

**Android:**
https://play.google.com/store/apps/details?id=host.exp.exponent

**iOS:**
https://apps.apple.com/app/expo-go/id982107779

## 🖥️ Paso 2: Inicia el servidor de desarrollo

```bash
cd e:/Projects/tide-mobile-expo
npm start
```

Verás un código QR en la terminal.

## 📲 Paso 3: Escanea el código QR

**En Android:**
- Abre la app Expo Go
- Toca "Scan QR code"
- Escanea el código QR de la terminal

**En iOS:**
- Abre la cámara nativa del iPhone
- Apunta al código QR
- Toca la notificación de Expo Go

## ⚙️ Paso 4: Configura la conexión al servidor

Una vez que la app se abra en tu teléfono:

1. Toca el ícono de Settings ⚙️
2. Ingresa la URL de tu servidor Tide Commander:
   - Formato: `http://TU_IP:5174`
   - Ejemplo: `http://192.168.1.100:5174`
3. Si usas autenticación, ingresa tu `AUTH_TOKEN`
4. Toca "Test Connection" para verificar
5. Toca "Save Settings"
6. ¡Vuelve atrás y verás tus agentes!

## 🔍 Encuentra tu IP local

**Windows:**
```bash
ipconfig
# Busca "IPv4 Address" (ej: 192.168.1.100)
```

**macOS/Linux:**
```bash
ifconfig
# Busca "inet" (ej: 192.168.1.100)
```

## 🎯 Asegúrate de que Tide Commander esté corriendo

```bash
cd path/to/tide-commander
echo "LISTEN_ALL_INTERFACES=1" >> .env
tide-commander start
```

## 🛠️ Comandos útiles

```bash
# Iniciar servidor de desarrollo
npm start

# Reiniciar con cache limpio
npm start --clear

# Ejecutar en Android (solo si tienes emulador instalado)
npm run android

# Ejecutar en iOS (solo macOS)
npm run ios
```

## 🔥 Recarga en Caliente

La app se recargará automáticamente cuando guardes cambios en el código.

## 📱 Funcionalidades de la App

- **Lista de Agentes**: Ve todos tus agentes con estado en tiempo real
- **Chat**: Conversa con cada agente tipo Telegram/WhatsApp
- **Comandos**: Envía comandos directamente desde tu móvil
- **Notificaciones**: Recibe alertas cuando un agente termina una tarea
- **WebSocket**: Actualizaciones en tiempo real del backend

## ❓ Troubleshooting

### No puedo conectarme al servidor

1. ✅ Teléfono y computadora en la misma red WiFi?
2. ✅ Tide Commander corriendo con `LISTEN_ALL_INTERFACES=1`?
3. ✅ Firewall permite conexiones en el puerto 5174?
4. ✅ Probaste la URL en el navegador del teléfono?

### La app no se abre en Expo Go

1. Asegúrate de escanear el código QR correcto
2. Verifica que Expo Go esté actualizado
3. Reinicia el servidor con `npm start --clear`

### Error de red en Expo

Si ves errores de red:
1. Presiona `a` en la terminal para abrir en Android (si tienes emulador)
2. O usa `npx expo start --tunnel` para usar un tunnel

## 🎉 ¡Listo!

Ahora puedes controlar tus agentes de Claude desde cualquier lugar de tu casa.

**¿Preguntas?** Revisa el [README.md](README.md) o abre un issue en GitHub.
