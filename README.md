# Ricettario

Ricettario statico in HTML, CSS, JavaScript e JSON. Il sito e il suo editor sono nella stessa cartella e non richiedono una build né un backend.

- Sito: apri `index.html` in un browser tramite un server locale o GitHub Pages.
- Editor: apri `editor/index.html` per creare una ricetta.
- Dati: ogni ricetta è un file in `data/recipes/`; `recipes-index.json` elenca i file da mostrare.
- Immagini: `images/recipes/`.

## Creare una ricetta con l’editor

1. Avvia il server locale dalla cartella del progetto:

   ```sh
   python3 -m http.server 8000
   ```

2. Apri `http://localhost:8000/editor/` e compila il modulo.
3. Scrivi il titolo italiano. L’editor propone uno slug; controlla che sia univoco e cambialo se necessario. Il titolo inglese, le traduzioni, i tag, le note e la conservazione possono essere completati anche in seguito.
4. Inserisci porzioni, sbatta e scalabilità. Sbatta e scalabilità vanno da 1 a 5; la convenienza viene calcolata dal sito come `scalabilità / sbatta`.
5. Aggiungi gli ingredienti uno alla volta oppure raggruppali, poi scrivi il procedimento italiano. Le quantità e la lingua inglese sono facoltative.
6. Premi **Genera e scarica JSON**. Il browser scarica `<slug>.json`: sposta questo file in `data/recipes/`.
7. Dopo il download, l’editor mostra una voce pronta da copiare per `recipes-index.json`. Premi **Copia voce indice**, apri il file nella cartella principale e incolla l’oggetto dentro l’array `recipes`, subito prima della parentesi quadra `]` che chiude l’array. Se la voce precedente non termina con una virgola, aggiungila dopo la sua `}`; non aggiungere una virgola dopo la nuova ultima voce. Salva il file.
8. Ricarica `http://localhost:8000/` per controllare la ricetta. Quando è pronta, carica su GitHub il JSON e l’indice aggiornato; se hai aggiunto una foto, carica anche il file immagine.

L’editor non mostra un’anteprima del JSON e non modifica direttamente i file del progetto: produce il file da scaricare e prepara la voce dell’indice da copiare e incollare. L’ordine degli elementi nell’array `recipes` determina l’ordine iniziale delle ricette.

## Ingredienti

Per ogni ingrediente inserisci un nome italiano. Se l’ingrediente deve essere considerato dalla dispensa, assegna anche un **ID dispensa**: è una chiave tecnica stabile che il sito usa per riconoscere e confrontare lo stesso ingrediente nella funzione “Che cosa mi cucino?”. Per esempio, usa `tomato` sia per “Pomodoro” sia per “Pomodori”: la forma singolare e quella plurale rappresentano lo stesso elemento della dispensa. L’ID non deve contenere spazi; l’editor lo propone dal nome italiano, ma puoi modificarlo. Se cambi il nome, un ID modificato manualmente resta invariato.

Completa anche, quando possibile:

- **Nome inglese** e **unità** in italiano e inglese per visualizzare la ricetta nelle due lingue.
- **Quantità**, per esempio `200`, `1/2` o `q.b.`. Può restare vuota.
- **Facoltativo** per gli ingredienti che non devono impedire al sito di considerare preparabile la ricetta quando mancano.
- **Voce** per elementi come acqua o ghiaccio: restano visibili nella ricetta ma non vengono elencati nella dispensa e non contano come mancanti. Le voci non richiedono classificazione o ID dispensa.
- **Classificazione** alimentare (`pig`, `beef`, `chicken`, `fish`, `vegetarian`) e **categoria dispensa**. La prima determina la categoria della ricetta; la seconda organizza l’elenco della dispensa.

Riutilizza gli stessi ID nelle ricette diverse. Non tradurre l’ID e non crearne uno diverso solo perché cambia la quantità o la lingua del nome. La funzione dispensa confronta gli ID, non i nomi visibili.

### Gruppi di ingredienti

Un gruppo è un’intestazione che organizza l’elenco, non un ingrediente da comprare. È utile quando una ricetta ha parti distinte, per esempio “Per il sugo” e “Per servire”, o quando vuoi separare una base da una salsa. Aggiungi gli ingredienti effettivi all’interno del gruppo: quelli mantengono ID, quantità, unità e le altre proprietà come gli ingredienti normali. Il gruppo non ha un ID dispensa; i suoi ingredienti sì e vengono considerati dalla funzione dispensa.

## Slug, ID e percorsi

Lo **slug** è il nome tecnico breve e leggibile della ricetta, scritto con lettere minuscole, numeri e trattini, ad esempio `pasta-ai-fagioli`. Nell’editor viene usato sia come `id` univoco sia come slug URL. Determina inoltre il nome del file `data/recipes/pasta-ai-fagioli.json` e viene usato per aprire la pagina condivisibile `ricetta.html?slug=pasta-ai-fagioli`. Non cambiare slug dopo la pubblicazione senza aggiornare anche ID, nome del file e indice.

`recipes-index.json` contiene un riferimento per ogni ricetta, per esempio:

```json
{
  "id": "pasta-ai-fagioli",
  "slug": "pasta-ai-fagioli",
  "file": "data/recipes/pasta-ai-fagioli.json"
}
```

Quell’elemento va inserito nell’array `recipes` del file `recipes-index.json` principale. Se il file della ricetta non è nell’indice, il sito non lo carica.

## Fotografie

Metti la foto ritagliata in `images/recipes/` e inserisci nel campo **Percorso foto** il percorso relativo dalla cartella principale, per esempio `images/recipes/pasta-ai-fagioli.jpg`. Il nome e l’estensione devono corrispondere al file reale. L’editor registra il percorso ma non sposta né copia l’immagine: aggiungi il file alla cartella e includilo nel caricamento su GitHub. Senza foto, lascia il campo vuoto.

## Lingua e privacy

La lingua iniziale segue quella del browser (italiano o inglese). La scelta manuale e i preferiti restano nel `localStorage` del browser. Il tema del sito segue le preferenze di sistema. Il sito non invia dati dei visitatori a un backend.
