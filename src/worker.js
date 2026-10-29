// Corre los modelos en un Web Worker para no congelar la interfaz.
import { pipeline } from '@huggingface/transformers'

const MODELOS = {
  embeddings: ['feature-extraction', 'Xenova/paraphrase-multilingual-MiniLM-L12-v2'],
  sentimiento: ['sentiment-analysis', 'Xenova/bert-base-multilingual-uncased-sentiment'],
}
const cargados = {}

function obtener(nombre) {
  cargados[nombre] ??= pipeline(...MODELOS[nombre], {
    dtype: 'q8',
    progress_callback: (p) => {
      if (p.status === 'progress') self.postMessage({ tipo: 'progreso', modelo: nombre, archivo: p.file, porcentaje: p.progress })
    },
  })
  return cargados[nombre]
}

self.onmessage = async ({ data }) => {
  try {
    if (data.tipo === 'embeddings') {
      const modelo = await obtener('embeddings')
      const salida = await modelo(data.oraciones, { pooling: 'mean', normalize: true })
      self.postMessage({ tipo: 'embeddings', id: data.id, vectores: salida.tolist() })
    } else if (data.tipo === 'sentimiento') {
      const modelo = await obtener('sentimiento')
      const [resultado] = await modelo(data.texto.slice(0, 2000))
      self.postMessage({ tipo: 'sentimiento', id: data.id, ...resultado })
    }
  } catch (e) {
    self.postMessage({ tipo: 'error', id: data.id, mensaje: String(e?.message ?? e) })
  }
}
