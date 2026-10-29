# Resumidor IA

Resume textos y detecta su tono con modelos de IA que corren 100% en el navegador, con [Transformers.js](https://huggingface.co/docs/transformers.js). No hay servidor ni API key: el texto nunca sale del dispositivo.

**Demo:** https://nbbz95.github.io/resumidor-ia/

## Cómo funciona

1. **Resumen extractivo.** Separa el texto en oraciones y calcula el embedding de cada una con `paraphrase-multilingual-MiniLM-L12-v2` (multilingüe, funciona en español). Después elige las oraciones con **Maximal Marginal Relevance**: premia las más parecidas al texto completo (el centroide) y penaliza las que repiten algo ya elegido.
2. **Tono.** Clasifica el texto con `bert-base-multilingual-uncased-sentiment` (de 1 a 5 estrellas) y lo traduce a positivo, neutral o negativo.
3. Los modelos corren en un **Web Worker** cuantizados a 8 bits, así la interfaz no se congela. La primera vez se descargan (unos 300 MB entre los dos) y después quedan en la caché del navegador.

La lógica de selección está en [`src/resumen.js`](src/resumen.js), separada del modelo y cubierta con tests.

## Decisiones

- **Extractivo en vez de generativo:** los modelos generativos chicos que corren en el navegador resumen mal en español. Elegir oraciones del original no inventa nada.
- **Privacidad y costo cero:** sin backend no hay datos de usuarios ni facturas de API.

## Stack

JavaScript, Vite, Transformers.js (ONNX Runtime Web), Vitest, GitHub Actions y GitHub Pages.

## Correr localmente

```bash
npm install
npm run dev
npm test
```
