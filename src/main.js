import './estilos.css'
import { elegirOraciones, estrellasASentimiento, separarOraciones } from './resumen'

const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' })
const pendientes = new Map()
let siguienteId = 0

worker.onmessage = ({ data }) => {
  if (data.tipo === 'progreso') {
    estado(`Descargando modelo de ${data.modelo} (solo la primera vez): ${Math.round(data.porcentaje)}%`)
    return
  }
  const promesa = pendientes.get(data.id)
  if (!promesa) return
  pendientes.delete(data.id)
  data.tipo === 'error' ? promesa.reject(new Error(data.mensaje)) : promesa.resolve(data)
}

function pedir(mensaje) {
  const id = siguienteId++
  return new Promise((resolve, reject) => {
    pendientes.set(id, { resolve, reject })
    worker.postMessage({ ...mensaje, id })
  })
}

const $ = (id) => document.getElementById(id)
const estado = (t) => ($('estado').textContent = t)

const EJEMPLO = `La inteligencia artificial generativa avanzó muy rápido en los últimos años y hoy está presente en herramientas de uso diario. Muchas empresas la usan para redactar textos, responder consultas de clientes y analizar documentos largos. Sin embargo, los especialistas advierten que los modelos pueden cometer errores con mucha seguridad, por lo que siempre conviene revisar lo que generan. Otro desafío es el costo energético de entrenar y ejecutar modelos grandes en centros de datos. Por eso crece el interés en modelos chicos que pueden correr directamente en el teléfono o en el navegador, sin mandar datos a un servidor. Esta alternativa mejora la privacidad, porque el texto del usuario nunca sale de su dispositivo. También baja los costos, ya que no hace falta pagar por cada consulta a una API. La contracara es que los modelos chicos son menos precisos que los más grandes. Aun así, para tareas acotadas como resumir o clasificar textos, los resultados suelen ser más que suficientes.`

$('ejemplo').addEventListener('click', () => {
  $('texto').value = EJEMPLO
})

$('formulario').addEventListener('submit', async (e) => {
  e.preventDefault()
  const texto = $('texto').value.trim()
  const oraciones = separarOraciones(texto)
  if (oraciones.length < 2) {
    estado('Pegá un texto más largo, con al menos dos oraciones.')
    return
  }
  const cantidad = Number($('cantidad').value)
  $('analizar').disabled = true
  $('resultado').hidden = true
  const inicio = performance.now()
  try {
    estado('Analizando…')
    const [{ vectores }, sentimiento] = await Promise.all([
      pedir({ tipo: 'embeddings', oraciones }),
      pedir({ tipo: 'sentimiento', texto }),
    ])
    const elegidas = elegirOraciones(vectores, cantidad)
    $('resumen').innerHTML = ''
    for (const i of elegidas) {
      const li = document.createElement('li')
      li.textContent = oraciones[i]
      $('resumen').append(li)
    }
    const tono = estrellasASentimiento(sentimiento.label)
    $('sentimiento').textContent = `${tono} (${Math.round(sentimiento.score * 100)}% de confianza)`
    $('sentimiento').className = tono
    $('metricas').textContent = `${elegidas.length} de ${oraciones.length} oraciones · ${Math.round(100 - (elegidas.map((i) => oraciones[i]).join(' ').length / texto.length) * 100)}% más corto · ${((performance.now() - inicio) / 1000).toFixed(1)} s`
    $('resultado').hidden = false
    estado('')
  } catch (err) {
    estado(`Error: ${err.message}`)
  } finally {
    $('analizar').disabled = false
  }
})
