/*
  RSVP → Google Apps Script webhook

  Pasos para conectar:
  1. Abrí script.google.com → Nuevo proyecto
  2. Pegá el código del Apps Script de abajo en el editor
  3. Publicá como Web App (acceso: "Cualquiera")
  4. Copiá la URL de la web app y pegala en APPS_SCRIPT_URL
*/

// TODO: pegar la URL del Apps Script web app acá
const APPS_SCRIPT_URL = ''

/*
  Apps Script sugerido (pegar en script.google.com):

  function doPost(e) {
    const sheet = SpreadsheetApp.openById('TU_SPREADSHEET_ID').getActiveSheet()
    const data = JSON.parse(e.postData.contents)
    sheet.appendRow([
      data.timestamp,
      data.nombre,
      data.viene,
      data.cuantos,
      data.restriccion || '—',
      data.horario,
      data.lleva,
    ])
    return ContentService.createTextOutput('ok')
  }
*/

export interface RsvpData {
  nombre: string
  viene: string
  cuantos: string
  restriccion: string
  horario: string
  lleva: string
}

export async function submitRsvp(data: RsvpData): Promise<void> {
  const payload = { ...data, timestamp: new Date().toISOString() }

  if (!APPS_SCRIPT_URL) {
    // TODO: conectar con Google Apps Script antes de publicar la landing
    console.log('[RSVP] URL no configurada — datos recibidos:', payload)
    return
  }

  try {
    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    // Silencioso para el usuario — el submit igual muestra el mensaje de gracias
    console.error('[RSVP] Error al enviar:', err)
  }
}
