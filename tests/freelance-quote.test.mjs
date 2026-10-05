import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const source = await readFile(new URL('../app/lib/freelance-quote.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } });
const { evaluateQuote } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputText).toString('base64')}`);
const example = { hours: '30', hourlyRate: '25000', complexity: 'medium', safety: '15', externalCosts: '100000',
  targetMargin: '20', depositRate: '50', revisions: '2', validityDays: '7' };

test('la cotización conserva el ejemplo económico publicado', () => {
  const { result, errors } = evaluateQuote(example);
  assert.deepEqual(errors, {});
  assert.equal(result.baseCost, 750000);
  assert.equal(result.contingency, 135000);
  assert.equal(result.protectedMinimum, 1135000);
  assert.equal(result.quotedPrice, 1418750);
  assert.equal(result.deposit, 709375);
  assert.equal(result.balance, 709375);
});

test('anticipo y saldo cuadran con el total incluso al redondear fracciones de peso', () => {
  const { result } = evaluateQuote({ ...example, hours: '1', hourlyRate: '101', complexity: 'low',
    safety: '0', externalCosts: '0', targetMargin: '0' });
  assert.equal(result.quotedPrice, 101);
  assert.equal(result.deposit, 51);
  assert.equal(result.balance, 50);
});

test('sin anticipo y con anticipo total, el saldo sigue siendo coherente', () => {
  const noDeposit = evaluateQuote({ ...example, depositRate: '0' }).result;
  const allDeposit = evaluateQuote({ ...example, depositRate: '100' }).result;
  assert.equal(noDeposit.deposit, 0);
  assert.equal(noDeposit.balance, noDeposit.quotedPrice);
  assert.equal(allDeposit.balance, 0);
  assert.equal(allDeposit.deposit, allDeposit.quotedPrice);
});

test('rechaza vacíos, negativos y porcentajes fuera de rango antes de presentar un resumen', () => {
  for (const [field, value] of [['hours', ''], ['hours', '0'], ['hourlyRate', '-1'], ['externalCosts', '-10'],
    ['safety', '101'], ['targetMargin', '81'], ['depositRate', '150'], ['depositRate', '-5'],
    ['revisions', '-1'], ['revisions', '1.5'], ['validityDays', '0'], ['validityDays', '2.5']]) {
    const outcome = evaluateQuote({ ...example, [field]: value });
    assert.equal(outcome.result, null, `${field}=${value}`);
    assert.ok(outcome.errors[field]);
  }
});

test('rechaza desbordamiento numérico y conserva la cantidad válida de revisiones', () => {
  assert.equal(evaluateQuote({ ...example, hours: '1e300' }).result, null);
  assert.equal(evaluateQuote({ ...example, hours: '1000000000000000' }).result, null);
  assert.equal(evaluateQuote({ ...example, revisions: '0' }).result.revisions, 0);
});
