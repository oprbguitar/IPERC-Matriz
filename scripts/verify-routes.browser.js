// Ejecutar mediante playwright-cli run-code --filename.
// eslint-disable-next-line no-unused-expressions
async (page) => {
  const base = new URL(page.url()).origin
  const routes = ['inicio', 'evolucion', 'ruta', 'obligaciones', 'diagnostico', 'plantillas', 'formatos', 'herramientas', 'verificar', 'fiscalizacion', 'casos', 'normativa', 'iso', 'soma', 'visor', 'senales', 'glosario', 'simulador', 'rutas', 'premium', 'explorador']
  const errors = []
  const onError = error => errors.push(error.message)
  page.on('pageerror', onError)
  for (const route of routes) {
    await page.goto(`${base}/?route-check=${route}#/${route}`)
    await page.waitForFunction(() => {
      const main = document.querySelector('main')
      return main && main.innerText.length > 40 && !document.querySelector('.view-loading')
    })
    if (await page.getByRole('heading', { level: 1 }).count() !== 1) throw new Error(`La ruta ${route} debe mostrar un título principal visible`)
  }
  if (errors.length) throw new Error(errors.join('\n'))
  await page.goto(`${base}/#/inicio`)
  await page.getByRole('button', { name: 'Abrir explorador' }).waitFor()
  for (const width of [360, 768, 1280, 1600]) {
    await page.setViewportSize({ width, height: 900 })
    if (!await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)) throw new Error(`Portada desbordada a ${width}px`)
  }
  await page.getByRole('button', { name: 'Abrir explorador' }).click()
  await page.getByRole('heading', { name: 'Explorador de Riesgos y Controles', exact: true }).waitFor()
  console.log(JSON.stringify({ routes: routes.length, javascriptErrors: errors.length, homeBreakpoints: [360, 768, 1280, 1600], previewNavigation: 'OK' }))
}
