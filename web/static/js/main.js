let appData = {
    tools: [],
    categories: [],
    stats: null,
    currentCategory: '全部',
    currentTool: null
};

document.addEventListener('DOMContentLoaded', function() {
    initSPA();
});

async function initSPA() {
    try {
        await loadAppData();
        initSearch();
        handleRoute();
        window.addEventListener('popstate', handleRoute);
    } catch (error) {
        console.error('初始化失败:', error);
    }
}

async function loadAppData() {
    const response = await fetch('/api/tools');
    const data = await response.json();
    appData.tools = data.tools;
    appData.categories = data.categories;
    appData.stats = data.stats;
    updateStatsDisplay();
}

function updateStatsDisplay() {
    if (appData.stats) {
        document.getElementById('totalHelps').textContent = appData.stats.total_helps;
        document.getElementById('totalMinutes').textContent = appData.stats.total_minutes_saved;
    }
}

function renderCategoryNav() {
    const nav = document.getElementById('categoryNav');
    
    if (nav.children.length === 0) {
        nav.innerHTML = appData.categories.map(category => {
            const isActive = category === appData.currentCategory;
            const icon = getCategoryIcon(category);
            return `
                <button class="category-btn w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}"
                        data-category="${category}">
                    <div class="flex items-center space-x-2">
                        ${icon}
                        <span>${category}</span>
                    </div>
                </button>
            `;
        }).join('');

        nav.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const category = this.dataset.category;
                appData.currentCategory = category;
                updateCategoryNavHighlight();
                renderCategoryTools();
                window.history.pushState({}, '', '/');
            });
        });
    } else {
        updateCategoryNavHighlight();
    }
}

function updateCategoryNavHighlight() {
    const nav = document.getElementById('categoryNav');
    nav.querySelectorAll('.category-btn').forEach(btn => {
        const category = btn.dataset.category;
        const isActive = category === appData.currentCategory;
        
        if (isActive) {
            btn.classList.add('bg-blue-50', 'text-blue-600');
            btn.classList.remove('text-gray-700');
        } else {
            btn.classList.remove('bg-blue-50', 'text-blue-600');
            btn.classList.add('text-gray-700');
        }
    });
}

function renderCategoryTools() {
    const mainContent = document.getElementById('mainContent');
    const filteredTools = appData.currentCategory === '全部' 
        ? appData.tools 
        : appData.tools.filter(tool => tool.category === appData.currentCategory);

    mainContent.innerHTML = `
        <div class="space-y-6">
            <div id="toolGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${filteredTools.map(tool => `
                    <div class="tool-card group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer flex flex-col"
                         data-category="${tool.category}"
                         data-tool-id="${tool.id}">
                        <div class="flex items-start space-x-4 flex-1">
                            <div class="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform flex-shrink-0">
                                ${tool.icon}
                            </div>
                            <div class="flex-1 min-w-0">
                                <h3 class="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    ${tool.name}
                                </h3>
                                <p class="text-sm text-gray-500 mt-1 line-clamp-2">
                                    ${tool.description}
                                </p>
                            </div>
                        </div>
                        <div class="flex items-center mt-3 text-xs text-gray-400 flex-shrink-0">
                            <iconify-icon icon="mdi:timer-outline" width="14" height="14" class="mr-1"></iconify-icon>
                            <span>已使用 ${appData.stats.tools[tool.id].uses} 次</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    mainContent.querySelectorAll('.tool-card').forEach(card => {
        card.addEventListener('click', function() {
            const toolId = this.dataset.toolId;
            navigateTo('/tool/' + toolId);
        });
    });
}

function getCategoryIcon(category) {
    if (category === '全部') {
        return '<iconify-icon icon="mdi:apps" width="20" height="20"></iconify-icon>';
    } else if (category === '公文工具') {
        return '<iconify-icon icon="mdi:file-document" width="20" height="20"></iconify-icon>';
    } else if (category === '铭牌工具') {
        return '<iconify-icon icon="mdi:ticket-percent" width="20" height="20"></iconify-icon>';
    }
    return '';
}

function handleRoute() {
    const path = window.location.pathname;
    
    if (path === '/' || path === '') {
        renderHomePage();
    } else if (path.startsWith('/tool/')) {
        const toolId = path.replace('/tool/', '');
        renderToolPage(toolId);
    } else {
        renderHomePage();
    }
}

function navigateTo(path) {
    window.history.pushState({}, '', path);
    handleRoute();
}

function renderHomePage() {
    appData.currentCategory = '全部';
    renderCategoryNav();
    renderCategoryTools();
}

function initSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        const toolCards = document.querySelectorAll('.tool-card');
        
        toolCards.forEach(card => {
            const toolId = card.dataset.toolId;
            const tool = appData.tools.find(t => t.id === toolId);
            if (tool) {
                const name = tool.name.toLowerCase();
                const desc = tool.description.toLowerCase();
                if (name.includes(query) || desc.includes(query)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            }
        });
    });
}

function renderToolPage(toolId) {
    const tool = appData.tools.find(t => t.id === toolId);
    if (!tool) {
        navigateTo('/');
        return;
    }

    appData.currentTool = tool;
    appData.currentCategory = tool.category;
    renderCategoryNav();
    
    const mainContent = document.getElementById('mainContent');
    
    if (toolId === 'document') {
        mainContent.innerHTML = renderDocumentToolPage(tool);
        initDocumentToolPage();
    } else if (toolId === 'meeting_badge') {
        mainContent.innerHTML = renderMeetingBadgePage(tool);
    } else if (toolId === 'seat_badge') {
        mainContent.innerHTML = renderSeatBadgePage(tool);
    } else {
        mainContent.innerHTML = renderGenericToolPage(tool);
    }
}

function renderDocumentToolPage(tool) {
    return `
        <div class="max-w-3xl mx-auto space-y-6">
            <button onclick="navigateTo('/')" class="inline-flex items-center text-blue-600 hover:text-blue-700">
                <iconify-icon icon="mdi:arrow-left" width="20" height="20" class="mr-1"></iconify-icon>
                返回首页
            </button>
            
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div class="flex items-center space-x-4">
                    <div class="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center text-3xl">
                        ${tool.icon}
                    </div>
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900">${tool.name}</h1>
                        <p class="text-gray-500">${tool.description}</p>
                    </div>
                </div>
            </div>
            
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div class="text-center">
                    <div id="uploadArea" 
                         class="border-2 border-dashed border-gray-300 rounded-xl p-12 hover:border-blue-400 transition-colors cursor-pointer">
                        <div id="uploadPrompt" class="space-y-4">
                            <div class="text-5xl">
                                <iconify-icon icon="mdi:upload" class="mx-auto text-gray-400" width="64" height="64"></iconify-icon>
                            </div>
                            <div>
                                <p class="text-gray-600">将文件拖拽到此处</p>
                                <p class="text-gray-400 text-sm mt-1">或者</p>
                            </div>
                            <input type="file" id="fileInput" accept=".docx" class="hidden">
                            <button id="uploadBtn" 
                                    class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                点击上传文件（小于20M）
                            </button>
                        </div>
                        
                        <div id="fileInfo" class="hidden space-y-4">
                            <div class="text-5xl">
                                <iconify-icon icon="mdi:file-document" class="mx-auto text-blue-500" width="64" height="64"></iconify-icon>
                            </div>
                            <p id="fileName" class="text-gray-900 font-medium"></p>
                            <button id="resetBtn" 
                                    class="px-4 py-2 text-gray-600 hover:text-gray-800">
                                重新上传
                            </button>
                        </div>
                    </div>
                    
                    <div class="mt-6 space-y-4">
                        <div id="statusText" class="text-center text-gray-600 h-6"></div>
                        
                        <div id="progressContainer" class="hidden w-full max-w-md mx-auto">
                            <div class="w-full bg-gray-200 rounded-full h-2.5">
                                <div id="progressBar" class="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style="width: 0%"></div>
                            </div>
                        </div>
                        
                        <div class="flex justify-center space-x-4">
                            <button id="convertBtn" 
                                    disabled
                                    class="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                开始转换
                            </button>
                            
                            <button id="downloadWordBtn" 
                                    class="hidden px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                下载 Word
                            </button>
                            
                            <button id="downloadPdfBtn" 
                                    class="hidden px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                                下载 PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">工具介绍及使用方法</h2>
                <div class="space-y-4 text-gray-600">
                    <p>公文格式优化是一款便捷的公文格式处理工具，支持将Word文档自动识别并优化为标准公文格式。</p>
                    <ol class="list-decimal list-inside space-y-2">
                        <li>点击"上传"按钮，选择需要优化格式的Word文档。</li>
                        <li>确认文件已上传后，点击"开始转换"按钮。</li>
                        <li>等待格式优化完成，状态显示"已完成请下载"。</li>
                        <li>点击"点击下载"按钮，将优化后的公文保存到您的设备。</li>
                    </ol>
                </div>
            </div>
        </div>
    `;
}

function renderMeetingBadgePage(tool) {
    return renderGenericToolPage(tool);
}

function renderSeatBadgePage(tool) {
    return renderGenericToolPage(tool);
}

function renderGenericToolPage(tool) {
    return `
        <div class="max-w-3xl mx-auto space-y-6">
            <button onclick="navigateTo('/')" class="inline-flex items-center text-blue-600 hover:text-blue-700">
                <iconify-icon icon="mdi:arrow-left" width="20" height="20" class="mr-1"></iconify-icon>
                返回首页
            </button>
            
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div class="flex items-center space-x-4">
                    <div class="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center text-3xl">
                        ${tool.icon}
                    </div>
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900">${tool.name}</h1>
                        <p class="text-gray-500">${tool.description}</p>
                    </div>
                </div>
            </div>
            
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div class="text-center py-12">
                    <iconify-icon icon="mdi:construction" class="mx-auto text-gray-400" width="64" height="64"></iconify-icon>
                    <p class="mt-4 text-gray-600">该工具正在开发中，敬请期待！</p>
                </div>
            </div>
        </div>
    `;
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
        convertBtn.disabled = false;
        convertBtn.classList.remove('hidden');
        downloadWordBtn.classList.add('hidden');
        downloadPdfBtn.classList.add('hidden');
        statusText.textContent = '';
    });
    
    if (downloadWordBtn) {
        downloadWordBtn.addEventListener('click', function() {
            const filename = this.dataset.file;
            if (filename) {
                downloadFile(filename);
            }
        });
    }
    
    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', function() {
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
                    appData.stats = result.stats;
                    updateStatsDisplay();
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
