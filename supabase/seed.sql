insert into public.legal_norms (code, title, short_name, module, source_status, notes)
values
  ('law-29783', 'Ley No. 29783, Ley de Seguridad y Salud en el Trabajo', 'Ley 29783', 'general', 'requires_validation', 'Marco general obligatorio. Cargar fuente oficial antes de citar articulos.'),
  ('ds-005-2012-tr', 'Decreto Supremo No. 005-2012-TR, Reglamento de la Ley de Seguridad y Salud en el Trabajo', 'DS 005-2012-TR', 'general', 'requires_validation', 'Reglamento general obligatorio. Requiere validacion articulo por articulo.'),
  ('rm-050-2013-tr', 'Resolucion Ministerial No. 050-2013-TR', 'RM 050-2013-TR', 'general', 'requires_validation', 'Referencia para registros/formularios SST. Requiere fuente oficial para obligaciones.'),
  ('sunafil-iperc-manual', 'Manual tecnico de SUNAFIL para IPERC', 'Manual IPERC SUNAFIL', 'general', 'requires_validation', 'Manual tecnico requerido como fuente, pendiente de carga oficial.'),
  ('public-sector-module', 'Modulo sector publico SST', 'Sector publico', 'public', 'requires_validation', 'Modulo extensible para sector publico.'),
  ('construction-module', 'Modulo sector construccion SST', 'Construccion', 'construction', 'requires_validation', 'Modulo extensible para construccion.'),
  ('mining-module', 'Modulo sector mineria SST', 'Mineria', 'mining', 'requires_validation', 'Modulo extensible para mineria.'),
  ('hydrocarbons-module', 'Modulo sector hidrocarburos SST', 'Hidrocarburos', 'hydrocarbons', 'requires_validation', 'Modulo extensible para hidrocarburos.'),
  ('health-module', 'Modulo sector salud SST', 'Salud', 'health', 'requires_validation', 'Modulo extensible para salud.'),
  ('manufacturing-module', 'Modulo manufactura SST', 'Manufactura', 'manufacturing', 'requires_validation', 'Modulo extensible para manufactura.'),
  ('office-module', 'Modulo oficinas y trabajo administrativo SST', 'Oficinas', 'offices', 'requires_validation', 'Modulo extensible para oficinas.')
on conflict (code) do nothing;
