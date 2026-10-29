// Resumen extractivo: elige las oraciones más representativas del texto a partir de sus embeddings.
// No depende del modelo, así se testea con vectores de prueba.

export function separarOraciones(texto) {
  return texto
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?…])\s+(?=[¿¡A-ZÁÉÍÓÚÑ0-9"«(])/u)
    .map((o) => o.trim())
    .filter((o) => o.split(' ').length >= 4)
}

function coseno(a, b) {
  let dot = 0
  let na = 0
  let nb = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    na += a[i] * a[i]
    nb += b[i] * b[i]
  }
  return na && nb ? dot / Math.sqrt(na * nb) : 0
}

/**
 * Maximal Marginal Relevance: premia oraciones parecidas al texto completo (el centroide)
 * y penaliza las que repiten algo ya elegido. lambda = 1 ignora la redundancia.
 */
export function elegirOraciones(vectores, cantidad, lambda = 0.7) {
  const dim = vectores[0].length
  const centroide = new Array(dim).fill(0)
  for (const v of vectores) for (let i = 0; i < dim; i++) centroide[i] += v[i] / vectores.length

  const relevancia = vectores.map((v) => coseno(v, centroide))
  const elegidas = []
  const restantes = new Set(vectores.map((_, i) => i))

  while (elegidas.length < Math.min(cantidad, vectores.length)) {
    let mejor = -1
    let mejorPuntaje = -Infinity
    for (const i of restantes) {
      const redundancia = elegidas.length ? Math.max(...elegidas.map((j) => coseno(vectores[i], vectores[j]))) : 0
      const puntaje = lambda * relevancia[i] - (1 - lambda) * redundancia
      if (puntaje > mejorPuntaje) {
        mejorPuntaje = puntaje
        mejor = i
      }
    }
    elegidas.push(mejor)
    restantes.delete(mejor)
  }
  // Se devuelven en el orden original para que el resumen se lea de corrido.
  return elegidas.sort((a, b) => a - b)
}

export function estrellasASentimiento(etiqueta) {
  const n = Number.parseInt(etiqueta, 10)
  if (n <= 2) return 'negativo'
  if (n === 3) return 'neutral'
  return 'positivo'
}
