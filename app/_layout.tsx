import { useEffect } from 'react';
import { Alert, Linking } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import Constants from 'expo-constants';

// Configuración Real de GitHub
const GITHUB_USER = "KimyCompany-Starup"; 
const GITHUB_REPO = "Tic-Tac-Toe";        
const UPDATE_URL = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/releases/latest`;

export default function RootLayout() {
useEffect(() => {
    // Esperamos 2 segundos para asegurar que la app esté lista
    const timer = setTimeout(() => {
    checkUpdates();
    }, 2000);
    
    return () => clearTimeout(timer);
}, []);

const checkUpdates = async () => {
    try {
    console.log("--- Verificando Actualizaciones ---");
    
      // Añadimos 'no-cache' para obtener siempre el dato más fresco de GitHub
    const response = await fetch(UPDATE_URL, { 
        headers: { 'Cache-Control': 'no-cache' } 
    });
    const data = await response.json();

    if (!data || !data.tag_name) {
        console.log("No se encontró información de versiones en GitHub.");
        return;
    }

      // Limpiamos la 'v' (v1.0.1 -> 1.0.1)
    const latestVersion = data.tag_name.replace('v', '').trim(); 
    
      // Intentamos obtener la versión de varias fuentes de Expo por seguridad
    const currentVersion = (
        Constants.expoConfig?.version || 
        Constants.nativeAppVersion || 
        "0.0.0"
    ).trim();

    console.log(`Estado: Local [${currentVersion}] | GitHub [${latestVersion}]`);

      // Solo mostramos la alerta si las versiones son distintas
    if (latestVersion !== currentVersion) {
        Alert.alert(
        "🚀 Actualización Disponible",
        `Hay una nueva versión (${latestVersion}) lista para descargar.\n\nTu versión actual es la ${currentVersion}.`,
        [
            { 
            text: "Más tarde", 
            style: "cancel" 
            },
            { 
            text: "Descargar", 
            onPress: () => {
                // Buscamos el archivo .apk en los assets
                const apkAsset = data.assets.find((asset: any) => asset.name.endsWith('.apk'));
                if (apkAsset) {
                Linking.openURL(apkAsset.browser_download_url);
                } else {
                  // Si no hay APK adjunto, mandamos a la página del release
                Linking.openURL(data.html_url);
                }
            } 
            }
        ]
        );
    } else {
        console.log("La aplicación está al día.");
    }
    } catch (error) {
    console.error("Error detallado al verificar actualización:", error);
    }
};

return (
    <Stack>
    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    <Stack.Screen name="+not-found" />
    </Stack>
);
}