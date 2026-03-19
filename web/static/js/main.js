document.addEventListener('DOMContentLoaded', function() {
    initHomePage();
    initDocumentToolPage();
});

function initHomePage() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    const toolCards = document.querySelectorAll('.tool-card');
    const searchInput = document.getElementById('searchInput');
    
    if (categoryBtns.length === 0) return;
    
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.dataset.category;
            
            categoryBtns.forEach(b => {
                b.classList.remove('bg-blue-50', 'text-blue-600');
                b.classList.add('text-gray-700');
            });
            this.classList.remove('text-gray-700');
            this.classList.add('bg-blue-50', 'text-blue-600');
            
            toolCards.forEach(card => {
                if (category === '全部' || card.dataset.category === category) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            toolCards.forEach(card => {
                const name = card.querySelector('h3').textContent.toLowerCase();
                const desc = card.querySelector('p').textContent.toLowerCase();
                if (name.includes(query) || desc.includes(query)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
}

function initDocumentToolPage() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadPrompt = document.getElementById('uploadPrompt');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const resetBtn = document.getElementById('resetBtn');
    const convertBtn = document.getElementById('convertBtn');
    const downloadWordBtn = document.getElementById('downloadWordBtn');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    const statusText = document.getElementById('statusText');
    
    if (!uploadArea) return;
    
    let selectedFile = null;
    
    function downloadFile(filename) {
        const link = document.createElement('a');
        link.href = '/download/' + filename;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    uploadBtn.addEventListener('click', () => fileInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('border-blue-400');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('border-blue-400');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('border-blue-400');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });
    
    function handleFileSelect(file) {
        if (!file.name.endsWith('.docx')) {
            alert('请上传 .docx 格式的文件！');
            return;
        }
        selectedFile = file;
        fileName.textContent = file.name;
        uploadPrompt.classList.add('hidden');
        fileInfo.classList.remove('hidden');
        convertBtn.disabled = false;
    }
    
    resetBtn.addEventListener('click', () => {
        selectedFile = null;
        fileInput.value = '';
        uploadPrompt.classList.remove('hidden');
        fileInfo.classList.add('hidden');
        convertBtn.disabled = true;
        convertBtn.classList.remove('hidden');
        downloadWordBtn.classList.add('hidden');
        downloadPdfBtn.classList.add('hidden');
        statusText.textContent = '';
    });
    
    if (downloadWordBtn) {
        downloadWordBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const filename = this.dataset.file;
            if (filename) {
                downloadFile(filename);
            }
        });
    }
    
    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const filename = this.dataset.file;
            if (filename) {
                downloadFile(filename);
            }
        });
    }
    
    convertBtn.addEventListener('click', async () => {
        if (!selectedFile) return;
        
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        convertBtn.disabled = true;
        convertBtn.textContent = '正在转换';
        
        const progressContainer = document.getElementById('progressContainer');
        const progressBar = document.getElementById('progressBar');
        
        progressContainer.classList.remove('hidden');
        
        function updateProgress(percent, text) {
            progressBar.style.width = percent + '%';
            statusText.textContent = text;
        }
        
        let currentProgress = 0;
        const targetProgress = 90;
        
        function animateProgress() {
            if (currentProgress < targetProgress) {
                currentProgress += 2;
                if (currentProgress <= 30) {
                    updateProgress(currentProgress, '正在上传...');
                } else if (currentProgress <= 60) {
                    updateProgress(currentProgress, '正在解析文档...');
                } else if (currentProgress <= 90) {
                    updateProgress(currentProgress, '正在生成...');
                }
            }
        }
        
        const progressInterval = setInterval(animateProgress, 80);
        
        try {
            const response = await fetch('/api/document/convert', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            clearInterval(progressInterval);
            
            if (result.success) {
                updateProgress(100, '已完成请下载');
                convertBtn.classList.add('hidden');
                
                if (result.word_file) {
                    downloadWordBtn.classList.remove('hidden');
                    downloadWordBtn.dataset.file = result.word_file;
                }
                
                if (result.pdf_file) {
                    downloadPdfBtn.classList.remove('hidden');
                    downloadPdfBtn.dataset.file = result.pdf_file;
                }
                
                if (result.stats) {
                    document.getElementById('totalHelps').textContent = result.stats.total_helps;
                    document.getElementById('totalMinutes').textContent = result.stats.total_minutes_saved;
                }
            } else {
                clearInterval(progressInterval);
                progressContainer.classList.add('hidden');
                alert('转换失败：' + (result.error || '未知错误'));
                statusText.textContent = '';
                convertBtn.disabled = false;
                convertBtn.textContent = '开始转换';
            }
        } catch (error) {
            clearInterval(progressInterval);
            progressContainer.classList.add('hidden');
            alert('网络错误，请重试');
            statusText.textContent = '';
            convertBtn.disabled = false;
            convertBtn.textContent = '开始转换';
        }
    });
}
