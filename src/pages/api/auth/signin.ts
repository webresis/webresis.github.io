import type { APIRoute } from 'astro';
import { createRemoteJWKSet, jwtVerify } from 'jose';

const projectId = 'resistencia-materiales';

export const POST: APIRoute = async ({ request, cookies }) => {
  let step = 'Inicializando';
  try {
    step = 'Parsing request JSON';
    const bodyText = await request.text();
    
    if (!bodyText) {
      return new Response(JSON.stringify({ error: `Cuerpo de la petición vacío. Método: ${request.method}` }), { status: 400 });
    }

    const { idToken } = JSON.parse(bodyText);

    if (!idToken) {
      return new Response(JSON.stringify({ error: 'Falta el token de autenticación' }), { status: 401 });
    }

    step = 'Fetching JWKS and verifying JWT';
    // 1. Verificamos la firma criptográfica del JWT usando las llaves públicas de Google (JWKS endpoint correcto)
    const JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'));
    
    const { payload } = await jwtVerify(idToken, JWKS, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    });

    const email = payload.email as string;
    const uid = payload.sub as string;

    if (!email) {
      return new Response(JSON.stringify({ error: 'El token no contiene un correo electrónico' }), { status: 403 });
    }

    step = 'Fetching Firestore';
    // 2. Consultamos Firestore (REST API) usando el token del propio usuario
    // Buscamos si existe un documento con su correo en la colección "users"
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${encodeURIComponent(email)}`;
    
    const dbResponse = await fetch(firestoreUrl, {
      headers: {
        Authorization: `Bearer ${idToken}`
      }
    });

    step = 'Checking Firestore response';
    if (!dbResponse.ok) {
      if (dbResponse.status === 404) {
        return new Response(JSON.stringify({ error: 'Acceso Denegado. Tu correo no está registrado como editor autorizado.' }), { status: 403 });
      }
      const errText = await dbResponse.text();
      return new Response(JSON.stringify({ error: `Error DB (${dbResponse.status}): ${errText}` }), { status: 500 });
    }

    step = 'Parsing Firestore JSON';
    const userData = await dbResponse.json();
    
    // Extraemos el rol (si no existe, por defecto es editor)
    const role = userData.fields?.role?.stringValue || 'editor';

    // 3. Si todo es correcto, creamos una Cookie de Sesión segura para Astro
    // Solo guardamos datos esenciales: email, uid y rol.
    const sessionData = {
      email,
      uid,
      role
    };

    cookies.set('session_token', JSON.stringify(sessionData), {
      path: '/',
      httpOnly: true, // Protege contra XSS
      secure: true,   // Solo enviar por HTTPS
      sameSite: 'lax', // Protege contra CSRF
      maxAge: 60 * 60 * 24 * 7 // 7 días
    });

    return new Response(JSON.stringify({ success: true, role }), { status: 200 });

  } catch (error: any) {
    console.error('Error en el proceso de login:', error.message || error);
    return new Response(JSON.stringify({ error: `Error en el servidor (${step}): ${error.message || 'Error desconocido'}` }), { status: 401 });
  }
};
