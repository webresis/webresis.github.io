import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async ({ url, cookies, redirect }, next) => {
  const isWorkspaceRoute = url.pathname.startsWith('/workspace-mc361');
  const isLoginPage = url.pathname === '/workspace-mc361/login';

  // Solo protegemos las rutas que empiezan por /workspace-mc361 (pero ignoramos la del login)
  if (isWorkspaceRoute && !isLoginPage) {
    const sessionCookie = cookies.get('session_token');

    if (!sessionCookie) {
      // Si no hay cookie segura, lo expulsamos al login
      return redirect('/workspace-mc361/login');
    }

    try {
      const session = JSON.parse(sessionCookie.value);
      
      // Verificamos de forma muy básica que la cookie no haya sido manipulada
      // En un caso de producción super estricto, podríamos re-validar el token o firmar la cookie
      if (!session.email || !session.uid) {
        throw new Error('Cookie corrupta');
      }

      // Si el usuario intenta entrar a pantallas de Admin y no es administrador
      const isAdminRoute = url.pathname.startsWith('/workspace-mc361/management');
      if (isAdminRoute && session.role !== 'admin') {
        return redirect('/workspace-mc361/content/chapters'); // Lo mandamos de vuelta al dashboard de contenido
      }

      // Continuamos con la carga normal de la página
      return next();
    } catch (error) {
      // Si la cookie es inválida, la borramos y redirigimos
      cookies.delete('session_token', { path: '/' });
      return redirect('/workspace-mc361/login');
    }
  }

  // Si no es una ruta protegida, dejamos que cargue normalmente
  return next();
});
