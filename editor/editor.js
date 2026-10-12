const pantryCategories = [
  '🥕 Verdura e frutta',
  '🥩 Carne e salumi',
  '🐟 Pesce',
  '🥛 Latticini e uova',
  '🍝 Pasta, riso e cereali',
  '🥫 Legumi e conserve',
  '🧂 Spezie, condimenti e ingredienti vari'
];
const classifications = ['pig', 'beef', 'chicken', 'fish', 'vegetarian'];
const form = document.querySelector('#recipe-form');
const tags = document.querySelector('#tags');
const ingredients = document.querySelector('#ingredients');
const message = document.querySelector('#form-message');
const slugInput = form.elements.slug;
let slugWasEdited = false;

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function slugify(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function addTag() {
  const row = document.createElement('div');
  row.className = 'tag-row';
  row.innerHTML = '<input data-language="it" aria-label="Tag in italiano" placeholder="Italiano"><input data-language="en" aria-label="Tag in inglese" placeholder="English"><button class="icon-button" type="button" data-action="remove-tag" aria-label="Rimuovi tag">×</button>';
  tags.append(row);
  row.querySelector('input').focus();
}

function ingredientFields() {
  const classOptions = classifications.map(value => `<option value="${value}"${value === 'vegetarian' ? ' selected' : ''}>${value}</option>`).join('');
  const categoryOptions = pantryCategories.map(value => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join('');
  return `<div class="ingredient-grid">
    <label class="wide">Ingrediente · IT<input data-field="nameIt" required placeholder="Pomodoro"></label>
    <label class="wide">Ingredient · EN<input data-field="nameEn" placeholder="Tomato"></label>
    <label class="wide">ID dispensa<input data-field="ingredientId" required placeholder="pomodoro"></label>
    <label>Quantità<input data-field="quantity" placeholder="2"></label>
    <label>Unità / indicazione · IT<input data-field="unitIt" placeholder="g oppure q.b."></label>
    <label>Unit / note · EN<input data-field="unitEn" placeholder="g or to taste"></label>
    <label>Classificazione<select data-field="classification">${classOptions}</select></label>
    <label class="full">Categoria dispensa<select data-field="category">${categoryOptions}</select></label>
    <label class="check-field full"><input data-field="optional" type="checkbox"> Facoltativo</label>
  </div>`;
}

function entryFields() {
  return `<div class="ingredient-grid">
    <label class="wide">Voce · IT<input data-field="nameIt" required placeholder="Acqua"></label>
    <label class="wide">Entry · EN<input data-field="nameEn" placeholder="Water"></label>
    <label>Quantità<input data-field="quantity" placeholder="300"></label>
    <label>Unità · IT<input data-field="unitIt" placeholder="ml"></label>
    <label>Unit · EN<input data-field="unitEn" placeholder="ml"></label>
  </div>`;
}

function addIngredient(parent = ingredients, nested = false) {
  const row = document.createElement('article');
  row.className = `ingredient-row${nested ? ' nested-item' : ''}`;
  row.dataset.type = 'item';
  row.innerHTML = `<div class="ingredient-top"><span class="ingredient-kind">Ingrediente</span><button class="icon-button" type="button" data-action="remove-ingredient" aria-label="Rimuovi ingrediente">×</button></div>${ingredientFields()}`;
  parent.append(row);
  row.querySelector('[data-field="nameIt"]').focus();
}

function addEntry(parent = ingredients, nested = false) {
  const row = document.createElement('article');
  row.className = `ingredient-row${nested ? ' nested-item' : ''}`;
  row.dataset.type = 'entry';
  row.innerHTML = `<div class="ingredient-top"><span class="ingredient-kind">Voce · non ingrediente</span><button class="icon-button" type="button" data-action="remove-entry" aria-label="Rimuovi voce">×</button></div>${entryFields()}`;
  parent.append(row);
  row.querySelector('[data-field="nameIt"]').focus();
}

function addGroup() {
  const row = document.createElement('article');
  row.className = 'ingredient-row group-row';
  row.dataset.type = 'group';
  row.innerHTML = `<div class="ingredient-top"><span class="ingredient-kind">Gruppo ingredienti</span><button class="icon-button" type="button" data-action="remove-group" aria-label="Rimuovi gruppo">×</button></div>
    <div class="fields two-columns"><label class="field"><span>Nome gruppo · IT <i>*</i></span><input data-field="groupNameIt" required placeholder="Per il sugo"></label><label class="field"><span>Group name · EN</span><input data-field="groupNameEn" placeholder="For the sauce"></label></div>
    <div class="group-items"></div><div class="group-actions"><button class="button button-light button-small group-add" type="button" data-action="add-nested">＋ Ingrediente</button><button class="button button-light button-small group-add" type="button" data-action="add-nested-entry">＋ Voce</button></div>`;
  ingredients.append(row);
  row.querySelector('[data-field="groupNameIt"]').focus();
}

function readIngredient(row) {
  const value = field => row.querySelector(`[data-field="${field}"]`).value.trim();
  const ingredient = {
    type: 'item',
    name: { it: value('nameIt'), en: value('nameEn') },
    quantity: value('quantity'),
    unit: { it: value('unitIt'), en: value('unitEn') },
    optional: row.querySelector('[data-field="optional"]')?.checked || false,
    classification: value('classification'),
    category: value('category')
  };
  ingredient.ingredientId = value('ingredientId') || slugify(value('nameIt'));
  return ingredient;
}

function readEntry(row) {
  const value = field => row.querySelector(`[data-field="${field}"]`).value.trim();
  return {
    type: 'entry',
    name: { it: value('nameIt'), en: value('nameEn') },
    quantity: value('quantity'),
    unit: { it: value('unitIt'), en: value('unitEn') }
  };
}

function readNode(row) {
    if (row.dataset.type === 'item') return readIngredient(row);
    if (row.dataset.type === 'entry') return readEntry(row);
    return {
      type: 'group',
      name: {
        it: row.querySelector('[data-field="groupNameIt"]').value.trim(),
        en: row.querySelector('[data-field="groupNameEn"]').value.trim()
      },
      items: [...row.querySelector('.group-items').children].map(readNode)
    };
}

function readIngredients() {
  return [...ingredients.children].map(readNode);
}

function readRecipe() {
  const value = name => form.elements[name].value.trim();
  return {
    schemaVersion: 1,
    id: value('slug'),
    slug: value('slug'),
    title: { it: value('titleIt'), en: value('titleEn') },
    image: value('image'),
    tags: [...tags.children].map(row => ({
      it: row.querySelector('[data-language="it"]').value.trim(),
      en: row.querySelector('[data-language="en"]').value.trim()
    })).filter(tag => tag.it || tag.en),
    servings: Number(value('servings')),
    effort: Number(value('effort')),
    scale: Number(value('scale')),
    ingredients: readIngredients(),
    method: { it: value('methodIt'), en: value('methodEn') },
    notes: { it: value('notesIt'), en: value('notesEn') },
    storage: { it: value('storageIt'), en: value('storageEn') }
  };
}

function indexEntry(recipe) {
  return {
    id: recipe.id || 'slug-della-ricetta',
    slug: recipe.slug || 'slug-della-ricetta',
    file: `data/recipes/${recipe.slug || 'slug-della-ricetta'}.json`
  };
}

function validateRecipe() {
  if (!form.reportValidity()) return null;
  const recipe = readRecipe();
  if (!recipe.ingredients.length) {
    message.textContent = 'Aggiungi almeno un ingrediente o un gruppo.';
    return null;
  }
  const isIncomplete = ingredient => ingredient.type === 'entry'
    ? !ingredient.name.it
    : ingredient.type === 'item'
      ? !ingredient.name.it || !ingredient.ingredientId
      : !ingredient.name.it || !ingredient.items.length || ingredient.items.some(isIncomplete);
  if (recipe.ingredients.some(isIncomplete)) {
    message.textContent = 'Completa il nome italiano di ogni voce e l’ID dispensa degli ingredienti; ogni gruppo deve contenere almeno un elemento.';
    return null;
  }
  message.textContent = '';
  return recipe;
}

document.addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const action = button.dataset.action;
  if (action === 'add-tag') addTag();
  if (action === 'remove-tag') button.closest('.tag-row').remove();
  if (action === 'add-ingredient') addIngredient();
  if (action === 'add-entry') addEntry();
  if (action === 'add-group') addGroup();
  if (action === 'add-nested') addIngredient(button.closest('.group-row').querySelector('.group-items'), true);
  if (action === 'add-nested-entry') addEntry(button.closest('.group-row').querySelector('.group-items'), true);
  if (action === 'remove-ingredient' || action === 'remove-group' || action === 'remove-entry') button.closest('.ingredient-row').remove();
  document.querySelector('#generated-result').hidden = true;
});

form.addEventListener('input', event => {
  if (event.target === slugInput) slugWasEdited = true;
  if (event.target.name === 'titleIt' && !slugWasEdited) slugInput.value = slugify(event.target.value);
  if (event.target.matches('[data-field="ingredientId"]')) event.target.dataset.edited = 'true';
  if (event.target.matches('[data-field="nameIt"]')) {
    const idInput = event.target.closest('.ingredient-row').querySelector('[data-field="ingredientId"]');
    if (idInput && !idInput.dataset.edited) idInput.value = slugify(event.target.value);
  }
  message.textContent = '';
  document.querySelector('#generated-result').hidden = true;
});

document.querySelector('#download').addEventListener('click', () => {
  const recipe = validateRecipe();
  if (!recipe) return;
  const blob = new Blob([`${JSON.stringify(recipe, null, 2)}\n`], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${recipe.slug}.json`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  document.querySelector('#generated-message').textContent = `Il file ${recipe.slug}.json è stato generato. Mettilo nella cartella data/recipes/.`;
  document.querySelector('#index-snippet').textContent = JSON.stringify(indexEntry(recipe), null, 2);
  document.querySelector('#generated-result').hidden = false;
  message.textContent = '';
  document.querySelector('#generated-result').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

document.querySelector('#copy-index').addEventListener('click', async () => {
  const status = document.querySelector('#copy-status');
  try {
    await Promise.race([
      navigator.clipboard.writeText(document.querySelector('#index-snippet').textContent),
      new Promise((_, reject) => window.setTimeout(() => reject(new Error('Clipboard non disponibile')), 1200))
    ]);
    status.textContent = 'Voce copiata.';
  } catch {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(document.querySelector('#index-snippet'));
    selection.removeAllRanges();
    selection.addRange(range);
    status.textContent = 'Voce selezionata: copia con ⌘C o Ctrl+C.';
  }
});

addIngredient();
