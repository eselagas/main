    let fontSize = 14;
    let lastFont = "Roboto";
    let lastAlignment = 'justifyLeft';
    let selectedImage = null;
    let isDrawing = false;
    let savedDrawingData;

// Progress Spinner
function showLoadingSpinner() {
    document.getElementById('loverlay').style.display = 'flex';
}

function endSpinner() {
    document.getElementById('loverlay').style.display = 'none';
}

    function execCmd(command) {
	if (command === 'indent') {
    document.execCommand('indent', false, null);
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const parentElement = range.startContainer.parentElement;
    if (parentElement.tagName !== 'LI') {
        document.execCommand('insertUnorderedList', false, null);
    }

    if (parentElement.tagName === 'LI') {
        const blockquotes = document.querySelectorAll('blockquote'); blockquotes.forEach(blockquote => { blockquote.removeAttribute('style'); });
        const parentNode = parentElement.parentNode;
        if (parentNode && parentNode.tagName !== 'UL') {
            const ul = document.createElement('ul');
            parentNode.replaceChild(ul, parentElement);
            ul.appendChild(parentElement);
        }
    }
} else {
    document.execCommand(command, false, null);
  }
}

let userId;

const getUserId = async () => {
    userId = localStorage.getItem('user_id');
    if (!userId) {
        userId = 'user_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('user_id', userId);
    }
    return userId;
};

const initializeUserId = async () => {
    await getUserId();
    console.log("User ID = ", userId);
};

initializeUserId();

// Prompts
function prompts(text, placeholder) {
  return new Promise((resolve, reject) => {
    const modal = document.getElementById('prompt');
    const title = document.getElementById('title');
    const input = document.getElementById('p_text');
    
    if (!modal || !title || !input) {
      reject(new Error('Required DOM elements not found'));
      return;
    }

    // Clear previous value
    input.value = '';
    
    modal.style.display = "block";
    title.textContent = text;
    input.placeholder = placeholder;

    input.onkeyup = (e) => {
      if (e.key === 'Enter') {
        const value = input.value;
        modal.style.display = "none";
        input.onkeyup = null;
        resolve(value);
      }
    };
    
  });
}
// link handling

document.getElementById('editor').addEventListener('click', function(event) {
  const range = document.caretRangeFromPoint(event.clientX, event.clientY);
  if (!range) return;

  const node = range.startContainer;
  const element = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
  const link = element.closest('a');

  if (link) {
    event.preventDefault();
    window.open(link.href, '_blank');
    window.focus();
    return;
  }

  if (event.ctrlKey) {
    const text = getSelectedText(range);
    if (isValidURL(text)) {
      event.preventDefault();
      const url = text.startsWith('http') ? text : 'https://' + text;
      const a = document.createElement('a');
      a.href = url;
      a.textContent = text;
      a.style.color = '#0066cc';
      a.style.textDecoration = 'underline';
      replaceSelectedText(range, a);
      window.open(url, '_blank').focus();
    }
  }
});

// Add styles for links in the editor
const style = document.createElement('style');
style.textContent = `
  #editor a:not([style*="color"]) {
    color: #0066cc;
    text-decoration: underline;
  }
`;
document.head.appendChild(style);

function getSelectedText(range) {
  const preSelectionRange = range.cloneRange();
  preSelectionRange.selectNodeContents(document.getElementById('editor'));
  preSelectionRange.setEnd(range.startContainer, range.startOffset);
  
  const start = preSelectionRange.toString().length;
  const text = document.getElementById('editor').textContent;
  let word = '';
  
  for (let i = start - 1; i >= 0; i--) {
    if (/\s/.test(text[i])) break;
    word = text[i] + word;
  }
  
  for (let i = start; i < text.length; i++) {
    if (/\s/.test(text[i])) break;
    word += text[i];
  }
  
  return word.trim();
}

function isValidURL(text) {
  const pattern = /^(https?:\/\/)?([\w.-]+\.[a-zA-Z]{2,})(\/\S*)?$/;
  return pattern.test(text);
}

function replaceSelectedText(range, newContent) {
  const span = document.createElement('span');
  span.appendChild(newContent);
  
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  
  document.execCommand('insertHTML', false, span.innerHTML);
}

// drawingCanvas automatic resize
const resizeHandler = () => {
    const canvas = document.getElementById('drawingCanvas');
    canvas.width = window.innerWidth - 20;
    canvas.height = window.innerHeight - 108;
};

window.addEventListener('resize', resizeHandler);
resizeHandler();


// Zoom
document.addEventListener('DOMContentLoaded', function() {
    let currentScale = 1;
    let initialDistance = 0;

    function initializePinchToZoom(editor) {
        function handleTouchStart(event) {
            if (event.touches.length === 2) {
                initialDistance = getDistance(event.touches[0], event.touches[1]);
            }
        }

        function handleTouchMove(event) {
            if (event.touches.length === 2) {
                event.preventDefault();
                const newDistance = getDistance(event.touches[0], event.touches[1]);
                const scaleChange = newDistance / initialDistance;
                currentScale *= scaleChange;
                editor.style.transform = `scale(${currentScale})`;
                initialDistance = newDistance;
            }
        }
        
        function updateScale(currentScale) {
    		const newScale = currentScale * 2; // Replace eval with direct calculation
    		return `scale(${newScale})`;
		}

        function handleTouchEnd(event) {
            // Ensure the scale stays within reasonable bounds
            if (currentScale < 0.2) {
                currentScale = 0.2;
            } else if (currentScale > 3) {
                currentScale = 3;
            }
            editor.style.transform = `scale(${currentScale})`;
            resizeScale.style.transform = eval(currentScale + currentScale);
        }

        function getDistance(touch1, touch2) {
            return Math.hypot(touch2.pageX - touch1.pageX, touch2.pageY - touch1.pageY);
        }

        editor.addEventListener('touchstart', handleTouchStart);
        editor.addEventListener('touchmove', handleTouchMove);
        editor.addEventListener('touchend', handleTouchEnd);
        
        // Mouse wheel zoom
        editor.addEventListener('wheel', handleWheelZoom);
    }

    function handleWheelZoom(event) {
        event.preventDefault();
        const zoomFactor = 0.1;
        const delta = Math.sign(event.deltaY);
        currentScale += delta * -zoomFactor;
        // Ensure the scale stays within reasonable bounds
        if (currentScale < 0.2) {
            currentScale = 0.2;
        } else if (currentScale > 3) {
            currentScale = 3;
        }
        const editor = event.currentTarget;
        editor.style.transform = `scale(${currentScale})`;
    }

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach((node) => {
                    if (node.classList && node.classList.contains('resizable')) {
                        initializePinchToZoom(node);
                    }
                });
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Check if any resizable elements are already present when the script runs
    document.querySelectorAll('.resizable').forEach((element) => {
        initializePinchToZoom(element);
    });
});

async function insertTable() {
    try {
        const rows = await prompts("Enter the number of rows", "(eg. 2)");
        const cols = await prompts("Enter the number of columns", "(eg. 3)");
        
        if (!rows || !cols || isNaN(rows) || isNaN(cols) || rows < 1 || cols < 1) {
            throw new Error("Invalid table dimensions");
        }

        let tableHtml = '<table role="grid">';
        for (let i = 0; i < rows; i++) {
            tableHtml += '<tr role="row">';
            for (let j = 0; j < cols; j++) {
                tableHtml += `<td role="gridcell" tabindex="0"><br></td>`;
            }
            tableHtml += '</tr>';
        }
        tableHtml += '</table>';

        const editor = document.getElementById('editor');
        editor.focus();
        document.execCommand('insertHTML', false, tableHtml);
        showToolbar('tableToolbar');
    } catch (err) {
        alert('Failed to create table: ' + err.message);
    }
}


document.addEventListener('keydown', function(event) {
  if (event.ctrlKey) {
    switch (event.key) {
      case 'b':
        event.preventDefault();
        execCmd('bold');
        break;
      case 'i':
        event.preventDefault();
        execCmd('italic');
        break;
      case 'u':
        event.preventDefault();
        execCmd('underline');
        break;
      case 'L' :
      	event.preventDefault();
      	changeAlignment('justifyLeft');
      	break;
      case 'C' :
      	event.preventDefault();
      	changeAlignment('justifyCenter');
      	break;
      case 'R' :
      	event.preventDefault();
      	changeAlignment('justifyRight');
      	break;
    }
  }
  if (event.key === 'Tab') 
	{ 
	event.preventDefault();
	execCmd('indent');
	} 

});

document.addEventListener('click', function(event) {
  if (event.target.tagName === 'TD' || event.target.tagName === 'TH') {
    selectedCell = event.target;
    showToolbar('tableToolbar');
  }
});

	// Text Editing
    function changeFont(font) {
      document.execCommand('fontName', false, font);
      lastFont = font;
    }

    function changeFontSize(change) {
      fontSize += change;
      document.execCommand('fontSize', false, fontSize);
    }

    function changeAlignment(alignment) {
      document.execCommand(alignment, false, null);
      lastAlignment = alignment;
      document.getElementById('alignSelect').value = "";
    }

document.getElementById('editor').addEventListener('click', function(event) {
  const textToolbar = document.getElementById('textToolbar');
  const imageToolbar = document.getElementById('imageToolbar');
  const drawingToolbar = document.getElementById('drawingToolbar');
  const drawingCanvas = document.getElementById('drawingCanvas');

  if (event.target.tagName === 'IMG') {
    selectedImage = event.target;
    wrapImage(selectedImage);
    textToolbar.classList.add('hide');
    if (imageToolbar) imageToolbar.classList.remove('hide'); // Check existence
    drawingToolbar.classList.add('hide');
    drawingCanvas.classList.add('hide');
  } else {
    textToolbar.classList.remove('hide');
    if (imageToolbar) imageToolbar.classList.add('hide'); // Check existence
    drawingToolbar.classList.add('hide');
    drawingCanvas.classList.add('hide');
    if (selectedImage) unwrapImage(selectedImage);
    selectedImage = null;
  }
});
let strokes = []; // Array to store all strokes
let currentStroke = []; // Array to store the current stroke

function toggleDrawingToolbar() {
    const drawingToolbar = document.getElementById('drawingToolbar');
    const drawingCanvas = document.getElementById('drawingCanvas');
    const textToolbar = document.getElementById('textToolbar');
    const imageToolbar = document.getElementById('imageToolbar');

    drawingToolbar.classList.toggle('hide');
    textToolbar.classList.toggle('hide', !drawingToolbar.classList.contains('hide'));
    if (imageToolbar) imageToolbar.classList.add('hide'); // Check existence

    if (!drawingToolbar.classList.contains('hide')) {
        drawingCanvas.style.display = 'block';
        drawingCanvas.style.zIndex = '6';
        context = drawingCanvas.getContext('2d'); // Initialize context

        // Render saved drawing if it exists
        if (savedDrawingData) {
            const savedImage = new Image();
            savedImage.src = savedDrawingData;
            savedImage.onload = () => context.drawImage(savedImage, 0, 0);
        }
    } else {
        drawingCanvas.style.display = 'none';
    }
}

function saveAndHideDrawingToolbar() {
    const drawingCanvas = document.getElementById('drawingCanvas');
    const drawingToolbar = document.getElementById('drawingToolbar');
    const textToolbar = document.getElementById('textToolbar');

    if (drawingCanvas) {
        savedDrawingData = drawingCanvas.toDataURL();
    }

    // Keep canvas behind the text
    drawingCanvas.style.zIndex = '0';
    textToolbar.classList.remove('hide');
    drawingToolbar.classList.add('hide');
}

function setInkThickness(thickness) {
    context.lineWidth = thickness;
}

function selectPenColor() {
    context.lineWidth = 5;
    context.globalCompositeOperation = 'source-over'; // Ensure we're in drawing mode
    context.strokeStyle = document.getElementById('penColor').value;
}

function selectHighlighter(color) {
    context.lineWidth = 10;
    context.strokeStyle = document.getElementById('penColor').value;
}

function selectEraser() {
    context.globalCompositeOperation = 'destination-out';
    context.lineWidth = 30; // Set eraser thickness here

    // Function to erase strokes
    drawingCanvas.addEventListener('mousedown', function(event) {
        const pos = getMousePos(event);
        strokes = strokes.filter(stroke => {
            const isErased = stroke.some(point => {
                return Math.abs(point.x - pos.x) < context.lineWidth && Math.abs(point.y - pos.y) < context.lineWidth;
            });
            return !isErased; // Remove stroke if any point is within the eraser range
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('drawingCanvas');
    context = canvas.getContext('2d');
});

document.getElementById('drawingCanvas').addEventListener('mousedown', startDrawing);
document.getElementById('drawingCanvas').addEventListener('touchstart', startDrawing);

document.getElementById('drawingCanvas').addEventListener('mousemove', draw);
document.getElementById('drawingCanvas').addEventListener('touchmove', draw);

document.getElementById('drawingCanvas').addEventListener('mouseup', stopDrawing);
document.getElementById('drawingCanvas').addEventListener('touchend', stopDrawing);

document.getElementById('drawingCanvas').addEventListener('mouseout', stopDrawing);
document.getElementById('drawingCanvas').addEventListener('touchcancel', stopDrawing);

function getMousePos(event) {
    const rect = drawingCanvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

function drawLine(context, x1, y1, x2, y2) {
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    context.closePath();
}

function startDrawing(event) {
    isDrawing = true;
    const pos = getMousePos(event);
    x = pos.x;
    y = pos.y;
    currentStroke = [{x, y}]; // Start a new stroke
}

function draw(event) {
    event.preventDefault();
    if (isDrawing === true) {
        const pos = getMousePos(event);
        drawLine(context, x, y, pos.x, pos.y);
        x = pos.x;
        y = pos.y;
        currentStroke.push({x, y}); // Add point to the current stroke
    }
}

function stopDrawing() {
    if (isDrawing === true) {
        isDrawing = false;
        strokes.push(currentStroke); // Add the current stroke to the array of strokes
        context.globalCompositeOperation = 'source-over'; // Reset composite operation after erasing
    }
}

let selectedCell = null;

document.addEventListener('click', function(event) {
  if (event.target.tagName === 'TD' || event.target.tagName === 'TH') {
    selectedCell = event.target;
    showTableToolbar();
  } else if (!event.target.closest('.toolbar')) {
    showToolbar('textToolbar');
  }
});


  function showTableToolbar() {
  const tableToolbar = document.getElementById('tableToolbar');
  const textToolbar = document.getElementById('textToolbar');
  const drawingToolbar = document.getElementById('drawingToolbar');
  const imageToolbar = document.getElementById('imageToolbar');
  const drawingCanvas = document.getElementById('drawingCanvas');

  tableToolbar.classList.remove('hide');
  textToolbar.classList.add('hide');
  if (drawingToolbar) drawingToolbar.classList.add('hide');
  if (imageToolbar) imageToolbar.classList.add('hide');
  if (drawingCanvas) drawingCanvas.style.display = 'none'; // Hide the drawing canvas if it's visible
}



function addRow() {
  if (selectedCell) {
    const row = selectedCell.parentElement.cloneNode(true);
    selectedCell.parentElement.parentElement.appendChild(row);
  }
}

function addColumn() {
  if (selectedCell) {
    const rows = selectedCell.parentElement.parentElement.rows;
    for (let i = 0; i < rows.length; i++) {
      rows[i].insertCell(selectedCell.cellIndex + 1).innerHTML = "";
    }
  }
}

function deleteRow() {
  if (selectedCell) {
    selectedCell.parentElement.remove();
  }
}

function deleteColumn() {
  if (selectedCell) {
    const rows = selectedCell.parentElement.parentElement.rows;
    for (let i = 0; i < rows.length; i++) {
      rows[i].deleteCell(selectedCell.cellIndex);
    }
  }
}

async function mergeCells() {
  if (selectedCell) {
    const span = parseInt(await prompts("Enter colspan or rowspan value:", "2"));
    if (span) {
      selectedCell.colSpan = span;
    }
  }
}

function splitCell() {
  if (selectedCell && selectedCell.colSpan > 1) {
    selectedCell.colSpan = 1;
  }
}

function setCellType(type) {
  if (selectedCell) {
    const cellType = document.createElement(type);
    cellType.innerHTML = selectedCell.innerHTML;
    selectedCell.parentElement.replaceChild(cellType, selectedCell);
    selectedCell = cellType;
  }
}

function setAlignment(alignment) {
  if (selectedCell) {
    selectedCell.style.textAlign = alignment;
  }
}

function toggleTableToolbar() {
  const tableToolbar = document.getElementById('tableToolbar');
  const textToolbar = document.getElementById('textToolbar');
  if (tableToolbar.classList.contains('hide')) {
    tableToolbar.classList.remove('hide');
    textToolbar.classList.add('hide');
  } else {
    tableToolbar.classList.add('hide');
    textToolbar.classList.remove('hide');
  }
}

function showToolbar(toolbarId) {
  const toolbars = document.querySelectorAll('.toolbar');
  toolbars.forEach(toolbar => {
    if (toolbar.id === toolbarId) {
      toolbar.classList.remove('hide');
    } else {
      toolbar.classList.add('hide');
    }
  });
}

function toggleTextToolbar() {
  showToolbar('textToolbar');

  // Insert a <br> after the table and move the cursor
  const editor = document.getElementById('editor');
  const selection = window.getSelection();
  const range = document.createRange();
  const br = document.createElement('br');
  editor.appendChild(br);
  range.setStartAfter(editor.lastChild);
  range.setEndAfter(editor.lastChild);
  selection.removeAllRanges();
  selection.addRange(range);
}

   function getMousePos(event) {
      const rect = drawingCanvas.getBoundingClientRect();
      const clientX = event.clientX || event.touches[0].clientX;
      const clientY = event.clientY || event.touches[0].clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    }
    
    function drawLine(context, x1, y1, x2, y2) {
      context.beginPath();
      context.lineWidth = context.lineWidth; // Maintain current line width
      context.moveTo(x1, y1);
      context.lineTo(x2, y2);
      context.stroke();
      context.closePath();
    }

    // Function to remove resize handles
    function removeResizeHandles() {
      const handles = document.querySelectorAll('.resize-handle');
      handles.forEach(handle => handle.remove());
    }

    // Ensure resize handles are removed when image is deselected
    document.getElementById('editor').addEventListener('click', function(event) {
      const textToolbar = document.getElementById('textToolbar');
      const imageToolbar = document.getElementById('imageToolbar');
      const drawingToolbar = document.getElementById('drawingToolbar');
      const drawingCanvas = document.getElementById('drawingCanvas');

      if (event.target.tagName !== 'IMG') {
          removeResizeHandles();
      }
    });

function loadImage(src) {
  const img = new Image();
  img.src = src;
  img.onload = () => document.getElementById('editor').appendChild(img);
}

   function wrapImage(image) {
  if (!image.parentElement.classList.contains('resizable')) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('resizable');
    image.parentNode.insertBefore(wrapper, image);
    wrapper.appendChild(image);
    addResizeHandles(wrapper);
  }
}

async function convertImageToBase64(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            } catch (err) {
                reject(new Error('Failed to convert image: ' + err.message));
            }
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = url;
    });
}

function unwrapImage(image) {
  const wrapper = image.parentElement;
  if (wrapper.classList.contains('resizable')) {
    wrapper.replaceWith(image);
  }
}

function addResizeHandles(wrapper) {
  const handles = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
  handles.forEach(handle => {
    const handleDiv = document.createElement('div');
    handleDiv.classList.add('resize-handle', handle);
    handleDiv.addEventListener('mousedown', initResize);
    wrapper.appendChild(handleDiv);
  });
}

function initResize(event) {
  startX = event.clientX;
  startY = event.clientY;
  startWidth = parseInt(document.defaultView.getComputedStyle(selectedImage).width, 10);
  startHeight = parseInt(document.defaultView.getComputedStyle(selectedImage).height, 10);
  document.documentElement.addEventListener('mousemove', doResize);
  document.documentElement.addEventListener('mouseup', stopResize);
}

function doResize(event) {
  selectedImage.width = startWidth + event.clientX - startX;
  selectedImage.height = startHeight + event.clientY - startY;
}

function stopResize() {
  document.documentElement.removeEventListener('mousemove', doResize);
  document.documentElement.removeEventListener('mouseup', stopResize);
}

const FILE_MARKERS = {
    UNENCRYPTED_V2: "EBF_UNENCRYPTED_V2",
    ENCRYPTED_V2: "EBF_ENCRYPTED_V2"
};

// GitHub integration

async function saveToGithub(content, fileName) {
    try {
        let sha;

        const response = await fetch(`https://api.github.com/repos/eselagas/app.files/contents/docs/${userId}/${fileName}`, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer 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',
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: sha ? `Updated ${fileName}` : `Created ${fileName}`,
                content: btoa(content),
                sha: sha
            })
        });

        if (!response.ok) throw new Error('Failed to save to GitHub');
        return true;
    } catch (error) {
        console.error('GitHub save failed:', error);
        throw new Error('Failed to save to GitHub');
    }
}

// Event handlers for the UI integration
document.addEventListener('DOMContentLoaded', () => {
    // Save button handler
    document.getElementById('save').onclick = (e) => {
        e.preventDefault();
        showSaveOptions();
    };

    // Open button handler
    document.getElementById('open').onclick = (e) => {
        e.preventDefault();
        showOpenFileModal();
    };

    // File input change handler
    document.getElementById('fileInput').onchange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            await openFile({
                fileContent: e.target.result,
                editorElement: document.getElementById('editor'),
                canvasElement: document.getElementById('drawingCanvas')
            });
            hideModal();
        } catch (error) {
            if (error.message === 'Invalid password') {
                showPasswordModal("Enter Password to Open File", async (password) => {
                    try {
                        await openFile({
                            fileContent: e.target.result,
                            password,
                            editorElement: document.getElementById('editor'),
                            canvasElement: document.getElementById('drawingCanvas')
                        });
                        hideModal();
                    } catch (innerError) {
                        alert("Invalid password!");
                        showPasswordModal("Enter Password to Open File", arguments.callee);
                    }
                });
            } else {
                alert('Failed to open file: ' + error.message);
            }
        }
    };
    reader.readAsText(file);
};

    // Modal handlers
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideModal();
        }
    });
});

// Save option selection state
let selectedSaveOptions = {
    encryption: null,
    saveLocation: null
};

// Modal management
function showSaveOptions() {
    selectedSaveOptions = { encryption: null, saveLocation: null };
    document.querySelectorAll('.save-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    document.getElementById('modalOverlay').style.display = 'block';
    document.getElementById('saveOptionsModal').style.display = 'block';
    document.getElementById('passwordModal').style.display = 'none';
    document.getElementById('openFileModal').style.display = 'none';
}

function selectSaveOption(option) {
    if (['encrypted', 'unencrypted'].includes(option)) {
        selectedSaveOptions.encryption = option;
        document.querySelectorAll('.save-options:first-of-type .save-option')
            .forEach(opt => opt.classList.remove('selected'));
    } else {
        selectedSaveOptions.saveLocation = option;
        document.querySelectorAll('.save-options:last-of-type .save-option')
            .forEach(opt => opt.classList.remove('selected'));
    }
    event.currentTarget.classList.add('selected');
}

async function proceedWithSave() {
    if (!selectedSaveOptions.encryption || !selectedSaveOptions.saveLocation) {
        alert("Please select both encryption and save options");
        return;
    }

    const fileName = await prompts("Enter filename:", "Untitled Document");
    if (!fileName) return;

    try {
        if (selectedSaveOptions.encryption === 'encrypted') {
            // Encryption
            showPasswordModal("Set Password for Encryption", async (password) => {
                try {
                    await saveFile({
                        fileName,
                        password,
                        saveLocation: selectedSaveOptions.saveLocation,
                        editorElement: document.getElementById('editor'),
                        drawingData: savedDrawingData
                    });
                    hideModal();
                } catch (error) {
                    alert('Failed to save file: ' + error.message);
                }
            });
        } else {
            // No Encryption
            await saveFile({
                fileName,
                saveLocation: selectedSaveOptions.saveLocation,
                editorElement: document.getElementById('editor'),
                drawingData: savedDrawingData
            });
            hideModal();
        }
    } catch (error) {
        alert("Couldn't save the file, " + error.message);
    }
}

function showOpenFileModal() {
    // Saved files list
    const filesList = document.getElementById('savedFilesList');
    filesList.innerHTML = '';
    
    try {
        showLoadingSpinner();
        fetch(`https://api.github.com/repos/eselagas/app.files/contents/docs/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer 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',
                'Accept': 'application/vnd.github.v3+json',
            }
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Failed to fetch files from GitHub');
        })
        .then(githubFiles => {
            githubFiles.forEach(file => {
                const fileItem = document.createElement('div');
                fileItem.className = 'saved-file-item';
                fileItem.innerHTML = `
                    <span>${file.name}</span>
                `;
                fileItem.onclick = () => openFile({
                    fileName: file.name,
                    userId: userId,
                    editorElement: document.getElementById('editor'),
                    canvasElement: document.getElementById('drawingCanvas')
                });
                filesList.appendChild(fileItem);
            });
            endSpinner();
        })
        .catch(error => {
            console.error('Failed to load files from GitHub:', error);
        });
    } catch (error) {
        console.error('Failed to fetch files from GitHub:', error);
    }

    // Show the modal
    document.getElementById('modalOverlay').style.display = 'block';
    document.getElementById('openFileModal').style.display = 'block';
    document.getElementById('passwordModal').style.display = 'none';
    document.getElementById('saveOptionsModal').style.display = 'none';
}

let currentModalCallback = null;

function showPasswordModal(title, callback) {
    document.getElementById('modalOverlay').style.display = 'block';
    document.getElementById('passwordModal').style.display = 'block';
    document.getElementById('saveOptionsModal').style.display = 'none';
    document.getElementById('openFileModal').style.display = 'none';
    document.getElementById('passwordModalTitle').textContent = title;
    document.getElementById('passwordInput').value = '';
    currentModalCallback = callback;
}

function hideModal() {
    document.getElementById('modalOverlay').style.display = 'none';
    document.getElementById('passwordModal').style.display = 'none';
    document.getElementById('openFileModal').style.display = 'none';
    document.getElementById('saveOptionsModal').style.display = 'none';
    
    selectedSaveOptions = { encryption: null, saveLocation: null };
    document.querySelectorAll('.save-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    currentModalCallback = null;
}

async function set_as_password() {
    const password = document.getElementById('passwordInput').value;
    if (password && currentModalCallback) {
        await currentModalCallback(password);
    }
}

// Save file
async function saveFile({
    fileName,
    password = null,
    saveLocation,
    editorElement,
    drawingData = null
}) {
    try {
        showLoadingSpinner();
        // Gather content
        const editorContent = editorElement.innerHTML;
        const inkData = drawingData ? `<ink:${drawingData}>` : '';
        
        // Handle images more efficiently
        const imageData = await Promise.all(
            Array.from(editorElement.querySelectorAll('img'))
                .map(async (img) => {
                    const base64 = img.src.startsWith('data:image') 
                        ? img.src 
                        : await new Promise(resolve => convertImageToBase64(img.src, resolve));
                    return `<picture:${base64}>`;
                })
        ).then(images => images.join(''));

        const content = `${editorContent}${inkData}${imageData}`;
        
        // Prepare file data
        let fileData;
        
        if (password) {
            const encryptedData = await encryptContent(content, password);
            fileData = {
                marker: FILE_MARKERS.ENCRYPTED_V2,
                name: fileName,
                data: {
                    encrypted: Array.from(encryptedData.encrypted),
                    salt: Array.from(encryptedData.salt),
                    iv: Array.from(encryptedData.iv)
                },
                date: new Date().toISOString(),
                encrypted: true
            };
        } else {
            fileData = {
                marker: FILE_MARKERS.UNENCRYPTED_V2,
                name: fileName,
                data: content,
                date: new Date().toISOString(),
                encrypted: false
            };
        }
		
		if (saveLocation === 'github') {
        try {
            await saveToGithub(JSON.stringify(fileData), fileName);
        } catch (error) {
            throw new Error('Failed to save to GitHub: ' + error.message);
        	}
    	}

        if (['download', 'both'].includes(saveLocation)) {
            const blob = new Blob([JSON.stringify(fileData)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${fileName}.ebf`;
            a.click();
            URL.revokeObjectURL(url);
        }
        endSpinner();
        return { success: true };
    } catch (error) {
        console.error('Save failed:', error);
        throw new Error('Failed to save the file');
    }
}

// Open file
async function openFile({
    fileName = null,
    password = null,
    fileContent = null,
    editorElement = document.getElementById('editor'),
    userId,
    canvasElement = document.getElementById('drawingCanvas')
}) {
    try {
        showLoadingSpinner();
        let fileData, content;

        if (fileName) {
            // GitHub File
            const response = await fetch(`https://api.github.com/repos/eselagas/app.files/contents/docs/${userId}/${fileName}`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer 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',
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch file from GitHub');
            }
            
            const githubData = await response.json();
            fileContent = atob(githubData.content);
            fileData = JSON.parse(fileContent);
            document.title = `${fileData.name} - EBF Editor`;
            
            if (fileData.marker === FILE_MARKERS.ENCRYPTED_V2) {
                endSpinner();
                return new Promise((resolve) => {
                    showPasswordModal("Enter Password to Open File", async (enteredPassword) => {
                        try {
                            showLoadingSpinner();
                            content = await decryptContent(fileData.data, enteredPassword);
                            resolve(processFileContent(content, editorElement, canvasElement));
                            endSpinner();
                        } catch (error) {
                            alert("Invalid password, try again.");
                            resolve({ success: false, error: "Invalid password" });
                        }
                        hideModal();
                    });
                });
            } else {
                content = fileData.data;
                hideModal();
            }
        } else {
            // Local File
            fileData = JSON.parse(fileContent);
            document.title = `${fileData.name} - EBF Editor`;
            if (fileData.marker === FILE_MARKERS.ENCRYPTED_V2) {
                endSpinner();
                return new Promise((resolve) => {
                    showPasswordModal("Enter Password to Open File", async (enteredPassword) => {
                        try {
                            showLoadingSpinner();
                            content = await decryptContent(fileData.data, enteredPassword);
                            resolve(processFileContent(content, editorElement, canvasElement));
                            endSpinner();
                        } catch (error) {
                            alert("Invalid password, try again.");
                            resolve({ success: false, error: "Invalid password" });
                        }
                        hideModal();
                    });
                });
            } else {
                content = fileData.data;
            }
        } 

        return processFileContent(content, editorElement, canvasElement);
    } catch (error) {
        console.error('Open failed:', error);
        throw new Error(error.message || 'Failed to open the file');
    }
}

function processFileContent(content, editorElement, canvasElement) {
    // Convert content to a string if it's not already
    content = typeof content === 'string' ? content : JSON.stringify(content);

    // Handle drawing data
    if (canvasElement) {
        const inkDataMatch = content.match(/<ink:([^>]*)>/);
        if (inkDataMatch) {
            const drawingData = inkDataMatch[1];
            const context = canvasElement.getContext('2d');
            const savedImage = new Image();
            savedImage.src = drawingData;
            savedImage.onload = () => {
                canvasElement.style.display = 'block';
                canvasElement.style.zIndex = '0';
                context.drawImage(savedImage, 0, 0);
            };
        }
    }

    // Clean and set content
    const cleanContent = content
        .replace(/<ink:.*>/, '')
        .replace(/<picture:[^>]*>/g, '');
    editorElement.innerHTML = cleanContent;
    endSpinner();
    return {
        success: true,
        isEncrypted: content.marker === FILE_MARKERS.ENCRYPTED_V2
    };
}

// Helper functions for encryption/decryption
async function encryptContent(content, password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const passwordKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
    );

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const key = await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        passwordKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt']
    );

    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        data
    );

    return {
        encrypted: new Uint8Array(encrypted),
        salt: salt,
        iv: iv
    };
}

async function decryptContent(encryptedData, password) {
    const encoder = new TextEncoder();
    const passwordKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
    );
    
    const key = await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: new Uint8Array(encryptedData.salt),
            iterations: 100000,
            hash: 'SHA-256'
        },
        passwordKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
    );
    
    try {
        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: new Uint8Array(encryptedData.iv) },
            key,
            new Uint8Array(encryptedData.encrypted)
        );
        
        return new TextDecoder().decode(decrypted);
    } catch (error) {
        throw new Error('Invalid password');
    }
}
