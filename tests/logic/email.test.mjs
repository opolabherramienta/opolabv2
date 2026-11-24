import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function load(file) {
  const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(js, { exports });
  return exports;
}

const { buildWaitlistWelcome } = load('lib/email/welcome.ts');

test('la bienvenida dice lo mismo en HTML y en texto', () => {
  const { subject, html, text } = buildWaitlistWelcome('https://opolab.net/');

  assert.match(subject, /OpoLab/);
  for (const phrase of [
    'Ya estás en la lista de OpoLab',
    'El planificador será gratis',
    'Coach de pago',
    'responde a este mensaje',
    'Responsable: Daniel González López',
  ]) {
    assert.ok(html.includes(phrase), `falta en el HTML: ${phrase}`);
    assert.ok(text.includes(phrase), `falta en el texto: ${phrase}`);
  }
});

test('la bienvenida enlaza al sitio sin barra final y no promete precio', () => {
  const { html, text } = buildWaitlistWelcome('https://opolab.net/');

  assert.ok(html.includes('href="https://opolab.net"'));
  assert.ok(text.includes('\n\nhttps://opolab.net\n\n'));
  assert.doesNotMatch(`${html}${text}`, /\d+\s?(€|euros)/);
});
