const { withAndroidManifest, withDangerousMod, AndroidConfig } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Plugin de Expo para permitir tráfico HTTP (cleartext) en redes locales
 * Necesario para conectarse a servidores locales como http://192.168.x.x:xxxx
 */
const withAndroidCleartextTraffic = (config) => {
  // 1. Agregar el archivo network_security_config.xml
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const platformProjectRoot = config.modRequest.platformProjectRoot;
      const resPath = path.join(platformProjectRoot, 'app', 'src', 'main', 'res');
      const xmlPath = path.join(resPath, 'xml');

      // Crear directorio xml si no existe
      if (!fs.existsSync(xmlPath)) {
        fs.mkdirSync(xmlPath, { recursive: true });
      }

      // Crear archivo network_security_config.xml
      const networkSecurityConfig = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <!-- Permitir cleartext (HTTP) para TODAS las conexiones -->
    <!-- Necesario para desarrollo local con IPs privadas -->
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
</network-security-config>`;

      fs.writeFileSync(
        path.join(xmlPath, 'network_security_config.xml'),
        networkSecurityConfig
      );

      return config;
    },
  ]);

  // 2. Modificar AndroidManifest.xml para usar la configuración
  config = withAndroidManifest(config, (config) => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults);

    mainApplication.$['android:networkSecurityConfig'] = '@xml/network_security_config';
    mainApplication.$['android:usesCleartextTraffic'] = 'true';

    return config;
  });

  return config;
};

module.exports = withAndroidCleartextTraffic;
