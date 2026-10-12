import { readFileSync } from 'node:fs'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import { deleteDoc, doc, getDoc, getDocs, collection, setDoc, updateDoc } from 'firebase/firestore'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'

let env: RulesTestEnvironment

const validCard = {
  title: 'O que é closure?',
  description: 'Função que lembra o escopo onde foi criada.',
  intervalDays: 3,
  nextReview: '2026-10-15',
  createdAt: '2026-10-12T12:00:00.000Z',
  lastReviewedAt: null,
  reviewCount: 0,
}

const alice = () => env.authenticatedContext('alice').firestore()
const bob = () => env.authenticatedContext('bob').firestore()
const anon = () => env.unauthenticatedContext().firestore()

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-flashcards',
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  })
})

afterAll(() => env.cleanup())

beforeEach(async () => {
  await env.clearFirestore()
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), 'users/alice/cards/existing'), validCard)
  })
})

describe('isolamento entre usuários', () => {
  it('dono lê, lista, edita e exclui os próprios cards', async () => {
    await assertSucceeds(getDoc(doc(alice(), 'users/alice/cards/existing')))
    await assertSucceeds(getDocs(collection(alice(), 'users/alice/cards')))
    await assertSucceeds(updateDoc(doc(alice(), 'users/alice/cards/existing'), { reviewCount: 1 }))
    await assertSucceeds(deleteDoc(doc(alice(), 'users/alice/cards/existing')))
  })

  it('outro usuário não lê, lista, cria, edita nem exclui', async () => {
    await assertFails(getDoc(doc(bob(), 'users/alice/cards/existing')))
    await assertFails(getDocs(collection(bob(), 'users/alice/cards')))
    await assertFails(setDoc(doc(bob(), 'users/alice/cards/novo'), validCard))
    await assertFails(updateDoc(doc(bob(), 'users/alice/cards/existing'), { title: 'hack' }))
    await assertFails(deleteDoc(doc(bob(), 'users/alice/cards/existing')))
  })

  it('visitante sem login não acessa nada', async () => {
    await assertFails(getDoc(doc(anon(), 'users/alice/cards/existing')))
    await assertFails(setDoc(doc(anon(), 'users/alice/cards/novo'), validCard))
  })

  it('bloqueia qualquer outra coleção', async () => {
    await assertFails(setDoc(doc(alice(), 'outros/doc'), { a: 1 }))
    await assertFails(getDoc(doc(alice(), 'users/alice')))
    await assertFails(setDoc(doc(alice(), 'users/alice'), { a: 1 }))
  })
})

describe('validação do card', () => {
  const create = (data: object) => setDoc(doc(alice(), 'users/alice/cards/novo'), data)

  it('aceita um card válido', async () => {
    await assertSucceeds(create(validCard))
    await assertSucceeds(create({ ...validCard, lastReviewedAt: '2026-10-12T12:00:00.000Z' }))
  })

  it.each([
    ['título vazio', { title: '' }],
    ['título longo demais', { title: 'x'.repeat(201) }],
    ['descrição longa demais', { description: 'x'.repeat(10_001) }],
    ['intervalo zero', { intervalDays: 0 }],
    ['intervalo acima de 365', { intervalDays: 366 }],
    ['intervalo fracionado', { intervalDays: 1.5 }],
    ['intervalo como texto', { intervalDays: '3' }],
    ['data em formato errado', { nextReview: '15/10/2026' }],
    ['contador negativo', { reviewCount: -1 }],
    ['lastReviewedAt numérico', { lastReviewedAt: 123 }],
    ['campo extra', { isAdmin: true }],
  ])('recusa %s', async (_label, patch) => {
    await assertFails(create({ ...validCard, ...patch }))
  })

  it('recusa card com campos faltando', async () => {
    const { reviewCount: _omit, ...incomplete } = validCard
    await assertFails(create(incomplete))
  })

  it('valida também as edições', async () => {
    const ref = doc(alice(), 'users/alice/cards/existing')
    await assertFails(updateDoc(ref, { intervalDays: 1000 }))
    await assertFails(updateDoc(ref, { extra: 'x' }))
    await assertSucceeds(updateDoc(ref, { intervalDays: 7, nextReview: '2026-10-19' }))
  })
})
