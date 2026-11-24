import test from 'node:test'
import assert from 'node:assert/strict'
import { destinatieValida, idValid, pentruClient } from '../validare.js'

test('POST acceptă doar zile numerice întregi în intervalul 1-30', () => {
  const baza = { oras: 'Sevilla', tara: 'Spania', zile: 3 }
  for (const zile of [1, 3, 30]) assert.equal(destinatieValida({ ...baza, zile }), true)
  for (const zile of ['3', 0, 31, 1.5, null, true, NaN]) assert.equal(destinatieValida({ ...baza, zile }), false)
})

test('POST respinge date lipsă și text nevalid', () => {
  for (const date of [undefined, null, [], {}, { oras: '  ', tara: 'Spania', zile: 3 },
    { oras: 'Sevilla', tara: 23, zile: 3 }, { oras: 'A'.repeat(101), tara: 'Spania', zile: 3 }]) {
    assert.equal(destinatieValida(date), false)
  }
})

test('identificatorul este întreg pozitiv din domeniul INT al tabelei', () => {
  for (const id of ['1', '999', '2147483647']) assert.equal(idValid(id), true)
  for (const id of ['0', '-1', '1.5', '1 OR 1=1', '2147483648', 'abc', 1]) assert.equal(idValid(id), false)
})

test('conversiile SQL păstrează contractul interfeței fără mutații', () => {
  const original = { id: 1, oras: 'Brașov', tara: 'România', zile: 2, vizitat: 0 }
  assert.deepEqual(pentruClient(original), { ...original, id: '1', vizitat: false })
  assert.equal(pentruClient({ ...original, vizitat: 1 }).vizitat, true)
  assert.equal(original.id, 1)
})
