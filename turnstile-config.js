// Cloudflare Turnstile Configuration
// Para usar este captcha necesitas:
// 1. Ir a https://dash.cloudflare.com/
// 2. Crear cuenta gratuita
// 3. Ir a "Turnstile" en el panel
// 4. Crear un nuevo sitio
// 5. Copiar la "Site Key" y reemplazar 'YOUR_SITE_KEY' abajo

const TURNSTILE_CONFIG = {
  siteKey: '0x4AAAAAAABkMYinukE_rfkH', // Reemplaza con tu Site Key
  theme: 'light', // 'light' o 'dark'
  size: 'normal' // 'normal', 'compact', o 'invisible'
};

// Función para renderizar Turnstile
function renderTurnstile(containerId) {
  if (typeof turnstile !== 'undefined') {
    return turnstile.render(`#${containerId}`, {
      sitekey: TURNSTILE_CONFIG.siteKey,
      theme: TURNSTILE_CONFIG.theme,
      size: TURNSTILE_CONFIG.size,
      callback: function(token) {
        console.log('Turnstile token:', token);
        // El token se usa para verificar en el servidor
      },
      'error-callback': function() {
        console.error('Error en Turnstile');
      }
    });
  }
}

// Función para obtener el token de Turnstile
function getTurnstileToken(widgetId) {
  if (typeof turnstile !== 'undefined' && widgetId) {
    return turnstile.getResponse(widgetId);
  }
  return null;
}

// Función para resetear Turnstile
function resetTurnstile(widgetId) {
  if (typeof turnstile !== 'undefined' && widgetId) {
    turnstile.reset(widgetId);
  }
}

// Exportar para uso global
window.TurnstileConfig = {
  render: renderTurnstile,
  getToken: getTurnstileToken,
  reset: resetTurnstile
};