const tools = document.querySelectorAll('.tool');
const canvas = document.getElementById('canvas');
const editor = document.getElementById('editor');
const form = document.getElementById('editForm');
const deleteBtn = document.getElementById('deleteBtn');
const toggleBtn = document.getElementById('toggleEditor');

const editText = document.getElementById('editText');
const editColor = document.getElementById('editColor');
const editSize = document.getElementById('editSize');
const editBgColor = document.getElementById('editBgColor');

let selectedElement = null;
let offsetX, offsetY;

tools.forEach(tool => {
  tool.addEventListener('dragstart', e => {
    e.dataTransfer.setData('type', tool.dataset.type);
  });

  // Touch support for mobile
  tool.addEventListener('touchstart', e => {
    const type = tool.dataset.type;
    const touch = e.touches[0];
    const el = document.createElement(type === 'text' ? 'p' : type === 'image' ? 'img' : 'button');

    if (type === 'text') el.textContent = 'Edit me!';
    else if (type === 'image') {
      el.src = 'https://via.placeholder.com/150';
      el.style.width = '150px';
    } else {
      el.textContent = 'Click me';
      el.style.backgroundColor = '#00ffe0';
    }

    el.classList.add('element');
    el.style.left = `${touch.clientX - canvas.getBoundingClientRect().left}px`;
    el.style.top = `${touch.clientY - canvas.getBoundingClientRect().top}px`;

    enableDragging(el);
    el.addEventListener('click', () => openEditor(el));
    canvas.appendChild(el);
    adjustCanvasHeight();
    document.querySelector('.placeholder')?.remove();
  });
});

canvas.addEventListener('dragover', e => e.preventDefault());

canvas.addEventListener('drop', e => {
  e.preventDefault();
  const type = e.dataTransfer.getData('type');
  let el;

  if (type === 'text') el = document.createElement('p');
  else if (type === 'image') el = document.createElement('img');
  else el = document.createElement('button');

  if (type === 'text') el.textContent = 'Edit me!';
  else if (type === 'image') {
    el.src = 'https://via.placeholder.com/150';
    el.style.width = '150px';
  } else {
    el.textContent = 'Click me';
    el.style.backgroundColor = '#00ffe0';
  }

  el.classList.add('element');
  el.style.left = `${e.offsetX}px`;
  el.style.top = `${e.offsetY}px`;

  enableDragging(el);
  el.addEventListener('click', () => openEditor(el));
  canvas.appendChild(el);

  adjustCanvasHeight();
  document.querySelector('.placeholder')?.remove();
});

function enableDragging(el) {
  el.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    selectedElement = el;

    offsetX = e.clientX - el.getBoundingClientRect().left;
    offsetY = e.clientY - el.getBoundingClientRect().top;

    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', drop);
  });
}

function drag(e) {
  if (!selectedElement) return;

  const canvasRect = canvas.getBoundingClientRect();

  let newX = e.clientX - canvasRect.left - offsetX;
  let newY = e.clientY - canvasRect.top - offsetY;

  newX = Math.max(0, Math.min(newX, canvas.offsetWidth - selectedElement.offsetWidth));
  newY = Math.max(0, newY);

  selectedElement.style.left = `${newX}px`;
  selectedElement.style.top = `${newY}px`;

  adjustCanvasHeight();
}

function drop() {
  document.removeEventListener('mousemove', drag);
  document.removeEventListener('mouseup', drop);
  selectedElement = null;
}

function openEditor(el) {
  selectedElement = el;
  editor.classList.remove('hidden');
  editor.classList.remove('collapsed');

  const isImg = el.tagName === 'IMG';
  const isBtn = el.tagName === 'BUTTON';

  editText.value = isImg ? el.src : el.textContent;
  editColor.value = rgbToHex(getComputedStyle(el).color);
  editSize.value = isImg ? parseInt(el.style.width) || 150 : parseInt(getComputedStyle(el).fontSize) || 16;

  if (isBtn) {
    editBgColor.classList.remove('hidden');
    editBgColor.value = rgbToHex(getComputedStyle(el).backgroundColor);
  } else {
    editBgColor.classList.add('hidden');
  }
}

form.addEventListener('submit', e => {
  e.preventDefault();
  if (!selectedElement) return;

  const text = editText.value.trim();
  const color = editColor.value;
  const size = editSize.value;

  if (selectedElement.tagName === 'IMG') {
    if (text.startsWith("http")) selectedElement.src = text;
    else return alert("Please enter a valid image URL.");
    selectedElement.style.width = size + 'px';
  } else {
    selectedElement.textContent = text;
    selectedElement.style.color = color;
    selectedElement.style.fontSize = size + "px";
    if (selectedElement.tagName === 'BUTTON') {
      selectedElement.style.backgroundColor = editBgColor.value;
    }
  }

  adjustCanvasHeight();
  editor.classList.add('hidden');
});

deleteBtn.addEventListener('click', () => {
  if (selectedElement) {
    selectedElement.remove();
    editor.classList.add('hidden');
    selectedElement = null;
    if (!canvas.querySelector('.element')) {
      const placeholder = document.createElement('p');
      placeholder.textContent = "Drop elements here";
      placeholder.classList.add('placeholder');
      canvas.appendChild(placeholder);
    }
    adjustCanvasHeight();
  }
});

function adjustCanvasHeight() {
  const elements = canvas.querySelectorAll('.element');
  let maxBottom = 0;
  elements.forEach(el => {
    const rect = el.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    const bottom = rect.bottom - canvasRect.top;
    maxBottom = Math.max(maxBottom, bottom);
  });
  canvas.style.minHeight = (maxBottom + 40) + 'px';
}

function rgbToHex(rgb) {
  const result = rgb.match(/\d+/g);
  return "#" + result.map(x => (+x).toString(16).padStart(2, '0')).join('');
}

document.addEventListener('click', (e) => {
  const isClickInsideEditor = editor.contains(e.target);
  const isEditingElement = selectedElement?.contains?.(e.target);
  if (!isClickInsideEditor && !isEditingElement) {
    editor.classList.add('hidden');
    selectedElement = null;
  }
});

toggleBtn.addEventListener('click', () => {
  editor.classList.toggle('collapsed');
  toggleBtn.textContent = editor.classList.contains('collapsed') ? '⬆' : '⬇';
});
