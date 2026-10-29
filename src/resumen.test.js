import { describe, expect, it } from 'vitest'
import { elegirOraciones, estrellasASentimiento, separarOraciones } from './resumen'

describe('separarOraciones', () => {
  it('corta por punto y descarta fragmentos muy cortos', () => {
    const texto = 'El primer párrafo tiene una idea. Corto. ¿Y esta pregunta cuenta como oración? Sí, también cuenta acá.'
    expect(separarOraciones(texto)).toEqual([
      'El primer párrafo tiene una idea.',
      '¿Y esta pregunta cuenta como oración?',
      'Sí, también cuenta acá.',
    ])
  })

  it('no corta en números decimales', () => {
    expect(separarOraciones('La inflación fue de 2.5 por ciento en el mes.')).toHaveLength(1)
  })
})

describe('elegirOraciones', () => {
  const vectores = [
    [1, 0, 0],
    [0.9, 0.1, 0],
    [0, 1, 0],
    [0.95, 0, 0.05],
  ]

  it('devuelve la cantidad pedida en orden original', () => {
    const elegidas = elegirOraciones(vectores, 2)
    expect(elegidas).toHaveLength(2)
    expect([...elegidas].sort((a, b) => a - b)).toEqual(elegidas)
  })

  it('con lambda baja evita oraciones redundantes', () => {
    const elegidas = elegirOraciones(vectores, 2, 0.3)
    expect(elegidas).toContain(2)
  })

  it('no pide más oraciones de las que hay', () => {
    expect(elegirOraciones(vectores, 10)).toHaveLength(4)
  })
})

describe('estrellasASentimiento', () => {
  it.each([
    ['1 star', 'negativo'],
    ['3 stars', 'neutral'],
    ['5 stars', 'positivo'],
  ])('%s → %s', (etiqueta, esperado) => {
    expect(estrellasASentimiento(etiqueta)).toBe(esperado)
  })
})
