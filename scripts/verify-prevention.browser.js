// El CLI evalúa esta función; no es un programa Node independiente.
// eslint-disable-next-line no-unused-expressions
async (page) => {
  const assert = (ok, message) => { if (!ok) throw new Error(message) }
  const base = new URL(page.url()).origin
  await page.setViewportSize({ width: 1280, height: 900 })
  const report = []
  const checkpoint = (message) => { report.push(message); console.log(message) }
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto(`${base}/?prevention-check=${Date.now()}#/explorador?f=ruido`)
  await page.getByRole('heading', { name: 'Ruido y protección auditiva', exact: true }).waitFor()
  const title = page.locator('#pr-detail-title')
  await page.getByRole('searchbox').fill('dermatitis')
  await page.getByRole('heading', { name: 'Piel, dermatitis y contacto con sustancias', exact: true }).waitFor()
  assert(await page.locator('.pr-result').count() === 1, 'La búsqueda debe filtrar fichas')
  await page.getByRole('searchbox').fill('sincoincidenciazzzz')
  await page.getByRole('heading', { name: 'No encontramos esa combinación.' }).waitFor()
  await page.getByRole('button', { name: 'Restablecer búsqueda' }).click()
  for (const option of await page.getByRole('combobox', { name: 'Sector', exact: true }).locator('option').evaluateAll(nodes => nodes.map(n => n.value).filter(Boolean))) {
    await page.getByRole('combobox', { name: 'Sector', exact: true }).selectOption(option)
    assert(await page.locator('.pr-result').count() > 0, `Sector vacío: ${option}`)
  }
  await page.getByRole('combobox', { name: 'Sector', exact: true }).selectOption('domestic')
  assert(await page.locator('.pr-detail').innerText().then(t => t.includes('Hogar: prevención general')), 'Hogar debe distinguir alcance')
  await page.getByRole('combobox', { name: 'Sector', exact: true }).selectOption('')
  await page.getByRole('combobox', { name: 'Mi perfil' }).selectOption('employer')
  assert((await page.locator('.pr-profile-hint').innerText()).includes('recursos'), 'El perfil debe orientar acción')
  await page.getByRole('button', { name: 'Pausar animaciones', exact: true }).click()
  await page.locator('.pr-result').filter({ hasText: 'Radiación UV solar' }).click()
  assert(await page.locator('.pr-detail').evaluate(el => getComputedStyle(el).opacity) === '1', 'Pausar no debe ocultar texto')
  await page.getByRole('button', { name: '04 Control', exact: true }).click()
  assert(await page.locator('.pr-phase').evaluate(el => getComputedStyle(el).opacity) === '1', 'Etapas pausadas deben permanecer legibles')
  checkpoint('Búsqueda, sin resultados, 16 sectores, perfil, hogar y pausa: OK')

  async function globalNoise() {
    await page.locator('.search-trigger').click()
    await page.getByRole('dialog').locator('input').fill('Ruido y protección auditiva')
    await page.getByRole('dialog').getByRole('button').filter({ hasText: 'Ruido y protección auditiva' }).first().click()
    await page.getByRole('heading', { name: 'Ruido y protección auditiva', exact: true }).waitFor()
  }
  await globalNoise()
  await page.locator('.pr-result').filter({ hasText: 'Radiación UV solar' }).click()
  await globalNoise()
  await page.getByText('Normas, fuentes y límites de aplicación', { exact: true }).click()
  await page.locator('.pr-norms').getByRole('button', { name: 'R.M. N.° 375-2008-TR' }).click()
  await page.waitForURL(/#\/normativa/)
  await page.goBack()
  await page.getByRole('heading', { name: 'Ruido y protección auditiva', exact: true }).waitFor()
  checkpoint('Búsqueda global repetida y regreso desde normativa: OK')

  await page.getByRole('button', { name: 'Visor de ambientes', exact: true }).click()
  for (const button of await page.locator('.pr-scene-nav button').all()) {
    await button.click()
    await page.locator('.pr-scene svg').waitFor()
    assert(await page.locator('.pr-hotspot').count() === 4, 'Cada escena debe mostrar cuatro puntos')
    for (const point of await page.locator('.pr-point-list button').all()) {
      await point.click()
      assert(await point.getAttribute('aria-pressed') === 'true', 'El punto debe abrir su ficha')
      assert((await title.innerText()).length > 5, 'La ficha debe tener contenido')
    }
    await page.getByRole('button', { name: 'Comparar con controles', exact: true }).click()
    assert(await page.locator('.pr-scene--controlled').count() === 1, 'Escena con controles')
    await page.getByRole('button', { name: 'Ver sin controles', exact: true }).click()
  }
  checkpoint('Ocho ambientes, 32 puntos y comparación con/sin controles: OK')
  for (const width of [360, 768, 1280, 1600]) {
    await page.setViewportSize({ width, height: 900 })
    for (const name of ['Fichas por riesgo', 'Visor de ambientes', 'EPP e instrumentos', 'Práctica IPERC', 'Ruido e índice UV']) {
      await page.getByRole('button', { name, exact: true }).click()
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `Desbordamiento: ${name} ${width}`)
      const clipped = await page.locator('.pr-explorer button, .pr-explorer input, .pr-explorer select, .pr-explorer textarea').evaluateAll(nodes => nodes.filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.left < -1 || r.right > innerWidth + 1) }).map(el => el.textContent?.slice(0, 50)))
      assert(clipped.length === 0, `Controles fuera de pantalla: ${name} ${width}: ${clipped}`)
    }
    checkpoint(`Cinco superficies sin desbordamiento a ${width}px: OK`)
  }
  await page.getByRole('button', { name: 'EPP e instrumentos', exact: true }).click()
  assert(await page.locator('.pr-result').count() === 10, 'Diez familias EPP')
  await page.getByRole('combobox', { name: 'Tipo de equipo' }).selectOption('instrumento')
  assert(await page.locator('.pr-result').count() === 8, 'Ocho instrumentos')
  await page.getByRole('searchbox', { name: 'Buscar EPP o instrumento' }).fill('luxometro')
  assert(await page.locator('.pr-result').count() === 1, 'Filtro de instrumento sin tilde')
  await page.getByRole('button', { name: 'Ruido e índice UV', exact: true }).click()
  await page.getByRole('slider', { name: 'Nivel constante ilustrativo' }).fill('91')
  assert((await page.locator('.pr-reading').first().innerText()).includes('2 h'), '91dB debe representar2h')
  await page.getByRole('slider', { name: 'Índice UV ilustrativo' }).fill('11')
  assert((await page.locator('.pr-reading').nth(1).innerText()).includes('Extremo'), 'UV11 extremo')
  await page.getByRole('button', { name: 'Práctica IPERC', exact: true }).click()
  await page.getByRole('button', { name: 'Almacén', exact: true }).click()
  await page.getByRole('textbox', { name: 'Actividad', exact: true }).fill('Actividad de prueba local')
  await page.getByRole('button', { name: 'Guardar en este navegador', exact: true }).click()
  assert((await page.locator('.pr-practice').innerText()).includes('Borrador guardado'), 'Guardar práctica')
  const practiceDownload = page.waitForEvent('download')
  await page.locator('.pr-practice').getByRole('button', { name: 'Markdown', exact: true }).click()
  const practiceFile = await practiceDownload
  await practiceFile.saveAs('output/practica-preventiva.md')
  await page.reload()
  await page.getByRole('button', { name: 'Práctica IPERC', exact: true }).click()
  assert(await page.getByRole('textbox', { name: 'Actividad', exact: true }).inputValue() === 'Actividad de prueba local', 'Persistir práctica')
  checkpoint('Ruido, UV y práctica guardada, recargada y descargada: OK')

  await page.getByRole('button', { name: 'Fichas por riesgo', exact: true }).click()
  const wordDownload = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Word editable', exact: true }).click()
  await (await wordDownload).saveAs('output/ficha-preventiva.doc')
  const qrDownload = page.waitForEvent('download')
  await page.getByRole('button', { name: 'QR de la ficha', exact: true }).click()
  await (await qrDownload).saveAs('output/ficha-preventiva-qr.svg')
  const pdfPopup = page.waitForEvent('popup')
  await page.getByRole('button', { name: 'Ficha y checklist PDF', exact: true }).click()
  const popup = await pdfPopup
  await popup.waitForLoadState()
  assert((await popup.locator('body').innerText()).includes('Responsable:'), 'PDF incluye checklist')
  await popup.pdf({ path: 'output/ficha-preventiva.pdf', format: 'A4' })
  await popup.close()
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.getByRole('button', { name: 'Visor de ambientes', exact: true }).click()
  assert(await page.locator('.pr-point-list button[aria-pressed=true]').count() === 1, 'Al abrir el visor su ficha debe corresponder a un punto del ambiente')
  assert(await page.locator('.pr-scene-flow').evaluate(el => getComputedStyle(el).animationName) === 'none', 'Respetar movimiento reducido')
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  checkpoint('Descargas Word, QR, PDF y reduced-motion: OK')
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.screenshot({ path: 'output/visor-desktop.png', fullPage: true })
  await page.setViewportSize({ width: 360, height: 900 })
  await page.screenshot({ path: 'output/visor-mobile.png', fullPage: true })
  console.log(JSON.stringify(report))
}
