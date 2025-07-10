let currentMode = 'create';
    let baselineData = null;
    let folderFiles = [];
    let baselineFile = null;

    // Mode switching
function switchMode(mode) {
    currentMode = mode;
    
    // Update buttons
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update panels
    document.querySelectorAll('.mode-panel').forEach(panel => panel.classList.remove('active'));
    document.getElementById(`${mode}-mode`).classList.add('active');
    
    // Clear outputs
    clearOutput();
}

function clearOutput() {
    const outputs = ['create-output', 'compare-output'];
    outputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.innerHTML = currentMode === 'create' 
                ? '<div class="result-item info">Ready to create baseline. Select a folder to start hashing.</div>'
                : '<div class="result-item info">Ready to compare. Please select both a folder and baseline.json file.</div>';
        }
    });
    
    document.getElementById('download-baseline').style.display = 'none';
}

// Hash calculation using Web Crypto API
async function calculateHash(file, algorithm) {
    const buffer = await file.arrayBuffer();
    const hashAlgorithm = algorithm === 'sha1' ? 'SHA-1' : 
                            algorithm === 'sha256' ? 'SHA-256' : 'SHA-512';
    const hashBuffer = await crypto.subtle.digest(hashAlgorithm, buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Create baseline
async function createBaseline(files, algorithm) {
    const output = document.getElementById('create-output');
    output.innerHTML = '<div class="result-item info">Creating baseline snapshot with ' + algorithm.toUpperCase() + '...</div>';
    
    const fileList = Array.from(files);
    const results = {};
    
    for (const file of fileList) {
        const relativePath = file.webkitRelativePath || file.name;
        
        try {
            const fileHash = await calculateHash(file, algorithm);
            const fileSize = file.size;
            const fileMtime = file.lastModified / 1000;
            
            if (fileHash) {
                results[relativePath] = {
                    hash: fileHash,
                    size: fileSize,
                    mtime: fileMtime
                };
                output.innerHTML += `<div class="result-item info">📄 ${file.name} - recorded (${algorithm.toUpperCase()})</div>`;
            }
        } catch (error) {
            output.innerHTML += `<div class="result-item error">❌ ${file.name} - failed to hash: ${error.message}</div>`;
        }
        
        output.scrollTop = output.scrollHeight;
    }
    
    baselineData = {
        metadata: {
            hash_algorithm: algorithm,
            created_at: (Date.now() / 1000).toString(),
            version: '1.0'
        },
        files: results
    };
    
    output.innerHTML += `<div class="result-item success">✅ Baseline created! ${Object.keys(results).length} files recorded using ${algorithm.toUpperCase()}</div>`;
    document.getElementById('download-baseline').style.display = 'block';
}

// Compare files (improved version based on Python code)
async function compareFiles(files, baseline, algorithm) {
    const output = document.getElementById('compare-output');
    output.innerHTML = '<div class="result-item info">Checking file integrity...</div>';
    
    // Check hash algorithm compatibility
    const baselineAlgorithm = baseline.metadata.hash_algorithm;
    if (baselineAlgorithm !== algorithm) {
        output.innerHTML += `
            <div class="result-item error">Hash Algorithm Mismatch!</div>
            <div class="result-item error">Baseline uses: ${baselineAlgorithm.toUpperCase()}</div>
            <div class="result-item error">Current check uses: ${algorithm.toUpperCase()}</div>
        `;
        return;
    }
    
    output.innerHTML += `<div class="result-item info">Using ${algorithm.toUpperCase()} hash algorithm (matches baseline)</div>`;
    
    const changes = [];
    const currentFiles = new Set();
    const baselineFiles = baseline.files;
    
    // First pass: Check existing files (modified and new)
    const fileList = Array.from(files);
    for (const file of fileList) {
        const relativePath = file.webkitRelativePath || file.name;
        currentFiles.add(relativePath);
        
        try {
            const currentSize = file.size;
            const currentMtime = file.lastModified / 1000;
            
            if (baselineFiles[relativePath]) {
                const oldInfo = baselineFiles[relativePath];

                // First check size and time instead of hashing directly
                if (currentSize !== oldInfo.size || 
                    Math.abs(currentMtime - oldInfo.mtime) > 1) {
                    
                    output.innerHTML += `<div class="result-item info">📄 ${file.name} - size/time changed, hashing...</div>`;
                    const currentHash = await calculateHash(file, algorithm);
                    
                    if (currentHash !== oldInfo.hash) {
                        changes.push({
                            file: relativePath,
                            status: 'modified',
                            old_hash: oldInfo.hash.substring(0, 8),
                            new_hash: currentHash.substring(0, 8)
                        });
                    } else {
                        output.innerHTML += `<div class="result-item info">📄 ${file.name} - false alarm (same hash)</div>`;
                    }
                } else {
                    output.innerHTML += `<div class="result-item info">📄 ${file.name} - unchanged</div>`;
                }
            } else {
                // New file
                changes.push({
                    file: relativePath,
                    status: 'new'
                });
            }
        } catch (error) {
            output.innerHTML += `<div class="result-item error">❌ ${file.name} - error checking: ${error.message}</div>`;
        }
        
        output.scrollTop = output.scrollHeight;
    }
    
    // Second pass: Check for deleted files
    const baselineFilePaths = new Set(Object.keys(baselineFiles));
    const deletedFiles = [...baselineFilePaths].filter(file => !currentFiles.has(file));
    
    for (const deletedFile of deletedFiles) {
        changes.push({
            file: deletedFile,
            status: 'deleted'
        });
    }
    
    // Show results
    if (changes.length > 0) {
        output.innerHTML += `<div class="result-item warning">Found ${changes.length} changes:</div>`;
        
        let modifiedCount = 0, newCount = 0, deletedCount = 0;
        
        for (const change of changes) {
            if (change.status === 'modified') {
                output.innerHTML += `
                    <div class="result-item modified">🔄 MODIFIED: ${change.file}</div>
                    <div class="hash-compare">Old: ${change.old_hash} → New: ${change.new_hash}</div>
                `;
                modifiedCount++;
            } else if (change.status === 'new') {
                output.innerHTML += `<div class="result-item new">➕ NEW: ${change.file}</div>`;
                newCount++;
            } else if (change.status === 'deleted') {
                output.innerHTML += `<div class="result-item deleted">❌ DELETED: ${change.file}</div>`;
                deletedCount++;
            }
        }
        
        // Update summary
        output.innerHTML += `
            <div class="result-item info">Summary:</div>
            <div class="result-item new">New files: ${newCount}</div>
            <div class="result-item modified">Modified files: ${modifiedCount}</div>
            <div class="result-item deleted">Deleted files: ${deletedCount}</div>
        `;
    } else {
        output.innerHTML += `<div class="result-item success">✅ No changes detected in file contents!</div>`;
    }
}

// Event listeners
document.getElementById('folder-input').addEventListener('change', async (e) => {
    if (e.target.files.length > 0) {
        const algorithm = document.querySelector('input[name="hash-create"]:checked').value;
        await createBaseline(e.target.files, algorithm);
    }
});

document.getElementById('folder-compare-input').addEventListener('change', (e) => {
    folderFiles = e.target.files;
    checkCompareReady();
});

document.getElementById('baseline-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                baselineFile = JSON.parse(e.target.result);
                checkCompareReady();
            } catch (error) {
                document.getElementById('compare-output').innerHTML = 
                    `<div class="result-item error">❌ Invalid JSON file: ${error.message}</div>`;
            }
        };
        reader.readAsText(file);
    }
});

function checkCompareReady() {
    if (folderFiles.length > 0 && baselineFile) {
        const algorithm = document.querySelector('input[name="hash-compare"]:checked').value;
        compareFiles(folderFiles, baselineFile, algorithm);
    }
}

document.getElementById('download-baseline').addEventListener('click', () => {
    if (baselineData) {
        const blob = new Blob([JSON.stringify(baselineData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'baseline.json';
        a.click();
        URL.revokeObjectURL(url);
    }
});

// Drag and drop functionality
document.querySelectorAll('.drop-zone').forEach(zone => {
    zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('dragover');
    });
    
    zone.addEventListener('dragleave', () => {
        zone.classList.remove('dragover');
    });
    
    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            if (zone.id === 'baseline-drop-zone') {
                // Handle baseline file
                const file = files[0];
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        baselineFile = JSON.parse(e.target.result);
                        checkCompareReady();
                    } catch (error) {
                        document.getElementById('compare-output').innerHTML = 
                            `<div class="result-item error">❌ Invalid JSON file: ${error.message}</div>`;
                    }
                };
                reader.readAsText(file);
            } else {
                // Handle folder files
                if (currentMode === 'create') {
                    const algorithm = document.querySelector('input[name="hash-create"]:checked').value;
                    createBaseline(files, algorithm);
                } else {
                    folderFiles = files;
                    checkCompareReady();
                }
            }
        }
    });
});

// Prevent default drag behaviors on document
document.addEventListener('dragover', (e) => {
    e.preventDefault();
});

document.addEventListener('drop', (e) => {
    e.preventDefault();
});