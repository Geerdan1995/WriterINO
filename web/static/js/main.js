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
            const icon = getCategoryIcon(category, isActive);
            return `
                <button class="category-btn w-full text-left px-3.5 py-3 rounded-xl font-medium flex items-center space-x-3 ${isActive ? 'category-btn-active category-btn-transition' : 'text-gray-600 hover:bg-white/60 hover:text-gray-800'}"
                        data-category="${category}">
                    <div class="w-9 h-9 rounded-xl flex items-center justify-center ${isActive ? 'bg-white/10' : 'bg-gray-100'}">
                        ${icon}
                    </div>
                    <span class="text-base">${category}</span>
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
        const iconDiv = btn.querySelector('.w-9.h-9');
        const iconElement = btn.querySelector('iconify-icon');
        
        if (isActive) {
            btn.classList.add('category-btn-active', 'category-btn-transition');
            btn.classList.remove('text-gray-600', 'hover:bg-white/60', 'hover:text-gray-800');
            iconDiv.classList.remove('bg-gray-100');
            iconDiv.classList.add('bg-white/10');
            iconElement.classList.remove('text-primary-500');
            iconElement.classList.add('text-white');
        } else {
            btn.classList.remove('category-btn-active', 'category-btn-transition');
            btn.classList.add('text-gray-600', 'hover:bg-white/60', 'hover:text-gray-800');
            iconDiv.classList.remove('bg-white/10');
            iconDiv.classList.add('bg-gray-100');
            iconElement.classList.remove('text-white');
            iconElement.classList.add('text-primary-500');
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
                ${filteredTools.map((tool, index) => `
                    <div class="tool-card tool-card-hover glass-card rounded-3xl p-4 cursor-pointer flex flex-col border-0 fade-in-up stagger-${(index % 6) + 1}"
                         data-category="${tool.category}"
                         data-tool-id="${tool.id}">
                        <div class="flex items-start space-x-3.5 flex-1">
                            <div class="w-12 h-12 icon-wrapper-light rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform flex-shrink-0 mt-1">
                                ${tool.icon}
                            </div>
                            <div class="flex-1 min-w-0">
                                <h3 class="text-base font-bold text-gray-800 group-hover:text-primary-600 transition-colors">
                                    ${tool.name}
                                </h3>
                                <p class="text-sm text-gray-500 mt-0.5 line-clamp-1 leading-relaxed">
                                    ${tool.description}
                                </p>
                            </div>
                        </div>
                        <div class="flex items-center mt-3 text-xs text-gray-400 flex-shrink-0 pt-2.5 border-t border-gray-100/50">
                            <iconify-icon icon="mdi:timer-outline" width="15" height="15" class="mr-1.5"></iconify-icon>
                            <span class="font-medium">已使用 ${appData.stats.tools[tool.id].uses} 次</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    mainContent.querySelectorAll('.tool-card').forEach(card => {
        card.addEventListener('click', function() {
            const toolId = this.dataset.toolId;
            if (toolId === 'meeting_badge') {
                // 如果是会议名牌工具，则直接打开独立的 HTML 页面（保留原版打印功能）
                window.open('/tool/meeting_badge', '_blank');
            } else {
                navigateTo('/tool/' + toolId);
            }
        });
    });
}

function getCategoryIcon(category, isActive) {
    const iconColor = isActive ? 'text-white' : 'text-primary-500';
    if (category === '全部') {
        return `<iconify-icon icon="mdi:apps" width="22" height="22" class="${iconColor}"></iconify-icon>`;
    } else if (category === '公文工具') {
        return `<iconify-icon icon="mdi:file-document" width="22" height="22" class="${iconColor}"></iconify-icon>`;
    } else if (category === '铭牌工具') {
        return `<iconify-icon icon="mdi:ticket-percent" width="22" height="22" class="${iconColor}"></iconify-icon>`;
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
                    card.style.display = 'flex';
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
    } else if (toolId === 'seat_badge_suzhou') {
        mainContent.innerHTML = renderSeatBadgeSuzhouPage(tool);
        initSeatBadgeSuzhouPage();
    } else if (toolId === 'seat_badge_shenzhen') {
        mainContent.innerHTML = renderSeatBadgeShenzhenPage(tool);
        initSeatBadgeShenzhenPage();
    } else {
        mainContent.innerHTML = renderGenericToolPage(tool);
    }
}

function renderDocumentToolPage(tool) {
    return `
        <div class="max-w-4xl mx-auto space-y-5">
            <button onclick="navigateTo('/')" class="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors font-medium no-print">
                <iconify-icon icon="mdi:arrow-left" width="22" height="22" class="mr-2"></iconify-icon>
                返回首页
            </button>
            
            <div class="glass-card rounded-3xl p-4 fade-in-up">
                <div class="flex items-center space-x-3.5">
                    <div class="w-12 h-12 icon-wrapper rounded-xl flex items-center justify-center text-2xl floating">
                        ${tool.icon}
                    </div>
                    <div>
                        <h1 class="text-xl font-bold text-gray-800">${tool.name}</h1>
                        <p class="text-gray-500 mt-0.5 text-sm">${tool.description}</p>
                    </div>
                </div>
            </div>
            
            <div class="glass-card rounded-3xl p-6 fade-in-up stagger-2">
                <div class="text-center">
                    <div id="uploadArea" 
                         class="upload-area border-3 border-dashed border-gray-200 rounded-3xl p-8 cursor-pointer">
                        <div id="uploadPrompt" class="space-y-4">
                            <div class="text-5xl">
                                <iconify-icon icon="mdi:upload" class="mx-auto text-gray-400" width="60" height="60"></iconify-icon>
                            </div>
                            <div>
                                <p class="text-gray-700 text-base font-medium">将文件拖拽到此处</p>
                                <p class="text-gray-400 mt-1">或者</p>
                            </div>
                            <input type="file" id="fileInput" accept=".docx" class="hidden">
                            <button id="uploadBtn" 
                                    class="gradient-btn px-6 py-2.5 text-white rounded-xl font-medium text-base">
                                点击上传文件（小于20M）
                            </button>
                        </div>
                        
                        <div id="fileInfo" class="hidden space-y-4">
                            <div class="text-5xl">
                                <iconify-icon icon="mdi:file-document" class="mx-auto" style="color: #6366F1;" width="60" height="60"></iconify-icon>
                            </div>
                            <p id="fileName" class="text-gray-800 font-bold text-lg"></p>
                            <button id="resetBtn" 
                                    class="px-5 py-2 text-gray-600 hover:text-gray-800 font-medium border border-gray-200 rounded-lg hover:bg-white/60 transition-all">
                                重新上传
                            </button>
                        </div>
                    </div>
                    
                    <div id="actionArea" class="mt-6 space-y-4 hidden">
                        <div id="statusText" class="text-center text-gray-600 h-6 font-medium text-base"></div>
                        
                        <div id="progressContainer" class="hidden w-full max-w-lg mx-auto">
                            <div class="w-full bg-gray-200 rounded-full h-3">
                                <div id="progressBar" class="progress-bar h-3 rounded-full transition-all duration-300" style="width: 0%"></div>
                            </div>
                        </div>
                        
                        <div class="flex justify-center space-x-3">
                            <button id="convertBtn" 
                                    disabled
                                    class="px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold text-base hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-emerald-500 disabled:hover:to-emerald-600 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                                开始转换
                            </button>
                            
                            <button id="downloadWordBtn" 
                                    class="hidden px-6 py-3 gradient-btn text-white rounded-xl font-bold text-base">
                                <iconify-icon icon="mdi:microsoft-word" width="18" height="18"></iconify-icon>
                                下载 Word
                            </button>
                            
                            <button id="downloadPdfBtn" 
                                    class="hidden px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold text-base hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg btn-flex">
                                <iconify-icon icon="mdi:file-pdf-box" width="18" height="18"></iconify-icon>
                                下载 PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="glass-card rounded-3xl p-5 fade-in-up stagger-3">
                <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <iconify-icon icon="mdi:information" width="20" height="20" class="mr-2 text-primary-500"></iconify-icon>
                    工具介绍及使用方法
                </h2>
                <div class="space-y-3 text-gray-600 leading-relaxed">
                    <p class="text-base">公文格式优化是一款便捷的公文格式处理工具，支持将Word文档自动识别并优化为标准公文格式。</p>
                    <ol class="list-decimal list-inside space-y-2 ml-2">
                        <li class="flex items-start">
                            <span class="w-7 h-7 icon-wrapper-light rounded-lg flex items-center justify-center font-bold text-primary-600 mr-3 flex-shrink-0 text-sm">1</span>
                            <span class="pt-0.5 text-sm">点击"上传"按钮，选择需要优化格式的Word文档。</span>
                        </li>
                        <li class="flex items-start">
                            <span class="w-7 h-7 icon-wrapper-light rounded-lg flex items-center justify-center font-bold text-primary-600 mr-3 flex-shrink-0 text-sm">2</span>
                            <span class="pt-0.5 text-sm">确认文件已上传后，点击"开始转换"按钮。</span>
                        </li>
                        <li class="flex items-start">
                            <span class="w-7 h-7 icon-wrapper-light rounded-lg flex items-center justify-center font-bold text-primary-600 mr-3 flex-shrink-0 text-sm">3</span>
                            <span class="pt-0.5 text-sm">等待格式优化完成，状态显示"已完成请下载"。</span>
                        </li>
                        <li class="flex items-start">
                            <span class="w-7 h-7 icon-wrapper-light rounded-lg flex items-center justify-center font-bold text-primary-600 mr-3 flex-shrink-0 text-sm">4</span>
                            <span class="pt-0.5 text-sm">点击下载按钮，将优化后的公文保存到您的设备。</span>
                        </li>
                    </ol>
                </div>
            </div>
        </div>
    `;
}

function renderMeetingBadgePage(tool) {
    return `
        <div class="max-w-4xl mx-auto space-y-5 no-print">
            <button onclick="navigateTo('/')" class="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors font-medium">
                <iconify-icon icon="mdi:arrow-left" width="22" height="22" class="mr-2"></iconify-icon>
                返回首页
            </button>
            
            <div class="glass-card rounded-3xl p-4 fade-in-up">
                <div class="flex items-center space-x-3.5">
                    <div class="w-12 h-12 icon-wrapper rounded-xl flex items-center justify-center text-2xl floating">
                        ${tool.icon}
                    </div>
                    <div>
                        <h1 class="text-xl font-bold text-gray-800">${tool.name}</h1>
                        <p class="text-gray-500 mt-0.5 text-sm">${tool.description}</p>
                    </div>
                </div>
            </div>
            
            <div class="glass-card rounded-3xl p-6 fade-in-up stagger-2">
                <div class="space-y-5">
                    <div>
                        <label class="block text-gray-700 font-medium mb-2">请输入姓名，用中文顿号（、）分隔：</label>
                        <textarea id="meetingBadgeNamesInput" 
                                  placeholder="例如：张三、李四、王五"
                                  class="w-full h-32 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all text-gray-700 placeholder-gray-400 font-medium shadow-sm resize-y bg-white/60 backdrop-blur"></textarea>
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 font-medium mb-2">选择排版模式：</label>
                        <select id="meetingBadgeLayoutMode" 
                                class="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all text-gray-700 font-medium shadow-sm bg-white/60 backdrop-blur">
                            <option value="mode1">模式一（单行大字）</option>
                            <option value="mode2">模式二（中文+拼音）</option>
                            <option value="mode3">模式三（对称旋转）</option>
                            <option value="mode4">模式四（带横线标记）</option>
                            <option value="mode5">模式五（汇川书院讲师席卡）</option>
                            <option value="mode6">模式六（汇川书院学员胸贴）</option>
                        </select>
                    </div>
                    
                    <div id="meetingBadgeMode6SubtextContainer" class="hidden">
                        <label class="block text-gray-700 font-medium mb-2">模式六底部文字：</label>
                        <input type="text" id="meetingBadgeMode6Subtext" 
                               placeholder="请输入底部小字内容，如：汇川书院新员工导师特训营"
                               class="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all text-gray-700 placeholder-gray-400 font-medium shadow-sm bg-white/60 backdrop-blur">
                    </div>
                    
                    <div class="flex flex-wrap gap-3 pt-2">
                        <button id="meetingBadgePreviewBtn" 
                                class="gradient-btn px-6 py-3 text-white rounded-xl font-bold text-base">
                            <iconify-icon icon="mdi:eye" width="18" height="18"></iconify-icon>
                            生成预览
                        </button>
                        <button id="meetingBadgePrintBtn" 
                                class="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold text-base hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg btn-flex">
                            <iconify-icon icon="mdi:printer" width="18" height="18"></iconify-icon>
                            打印
                        </button>
                        <button id="meetingBadgePdfBtn" 
                                class="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold text-base hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg btn-flex">
                            <iconify-icon icon="mdi:file-pdf-box" width="18" height="18"></iconify-icon>
                            保存PDF
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="glass-card rounded-3xl p-5 fade-in-up stagger-4">
                <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <iconify-icon icon="mdi:information" width="20" height="20" class="mr-2 text-primary-500"></iconify-icon>
                    工具介绍及使用方法
                </h2>
                <div class="space-y-3 text-gray-600 leading-relaxed">
                    <p class="text-base">会议名牌生成器是一款便捷的会议名牌制作工具，支持6种排版模式，可生成打印或保存为PDF。</p>
                    <ol class="list-decimal list-inside space-y-2 ml-2">
                        <li class="flex items-start">
                            <span class="w-7 h-7 icon-wrapper-light rounded-lg flex items-center justify-center font-bold text-primary-600 mr-3 flex-shrink-0 text-sm">1</span>
                            <span class="pt-0.5 text-sm">在文本框中输入姓名，多个姓名用中文顿号（、）分隔。</span>
                        </li>
                        <li class="flex items-start">
                            <span class="w-7 h-7 icon-wrapper-light rounded-lg flex items-center justify-center font-bold text-primary-600 mr-3 flex-shrink-0 text-sm">2</span>
                            <span class="pt-0.5 text-sm">选择排版模式，模式六需要额外输入底部文字。</span>
                        </li>
                        <li class="flex items-start">
                            <span class="w-7 h-7 icon-wrapper-light rounded-lg flex items-center justify-center font-bold text-primary-600 mr-3 flex-shrink-0 text-sm">3</span>
                            <span class="pt-0.5 text-sm">点击"生成预览"查看效果。</span>
                        </li>
                        <li class="flex items-start">
                            <span class="w-7 h-7 icon-wrapper-light rounded-lg flex items-center justify-center font-bold text-primary-600 mr-3 flex-shrink-0 text-sm">4</span>
                            <span class="pt-0.5 text-sm">确认无误后，点击"打印"或"保存PDF"。</span>
                        </li>
                    </ol>
                </div>
            </div>
        </div>
        
        <div id="meetingBadgePreviewArea" class="glass-card rounded-3xl p-6 fade-in-up stagger-3">
            <div class="text-center text-gray-400 py-12 no-print">
                <iconify-icon icon="mdi:file-document-outline" width="60" height="60" class="mx-auto mb-4"></iconify-icon>
                <p class="text-base font-medium">点击"生成预览"查看效果</p>
            </div>
        </div>
    `;
}

function renderSeatBadgeSuzhouPage(tool) {
    return `
        <div class="max-w-4xl mx-auto space-y-5">
            <button onclick="navigateTo('/')" class="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors font-medium no-print">
                <iconify-icon icon="mdi:arrow-left" width="22" height="22" class="mr-2"></iconify-icon>
                返回首页
            </button>
            
            <div class="glass-card rounded-3xl p-4 fade-in-up">
                <div class="flex items-center space-x-3.5">
                    <div class="w-12 h-12 icon-wrapper rounded-xl flex items-center justify-center text-2xl floating">
                        ${tool.icon}
                    </div>
                    <div>
                        <h1 class="text-xl font-bold text-gray-800">${tool.name}</h1>
                        <p class="text-gray-500 mt-0.5 text-sm">${tool.description}</p>
                    </div>
                </div>
            </div>
            
            <div class="glass-card rounded-3xl p-6 fade-in-up stagger-2">
                <div class="text-center">
                    <div id="suzhouUploadArea" 
                         class="upload-area border-3 border-dashed border-gray-200 rounded-3xl p-8 cursor-pointer">
                        <div id="suzhouUploadPrompt" class="space-y-4">
                            <div class="text-5xl">
                                <iconify-icon icon="mdi:upload" class="mx-auto text-gray-400" width="60" height="60"></iconify-icon>
                            </div>
                            <div>
                                <p class="text-gray-700 text-base font-medium">将ZIP文件拖拽到此处</p>
                                <p class="text-gray-400 mt-1">或者</p>
                            </div>
                            <input type="file" id="suzhouFileInput" accept=".zip" class="hidden">
                            <button id="suzhouUploadBtn" 
                                    class="gradient-btn px-6 py-2.5 text-white rounded-xl font-medium text-base">
                                点击上传ZIP文件
                            </button>
                        </div>
                        
                        <div id="suzhouFileInfo" class="hidden space-y-4">
                            <div class="text-5xl">
                                <iconify-icon icon="mdi:folder-zip" class="mx-auto" style="color: #6366F1;" width="60" height="60"></iconify-icon>
                            </div>
                            <p id="suzhouFileName" class="text-gray-800 font-bold text-lg"></p>
                            <button id="suzhouResetBtn" 
                                    class="px-5 py-2 text-gray-600 hover:text-gray-800 font-medium border border-gray-200 rounded-lg hover:bg-white/60 transition-all">
                                重新上传
                            </button>
                        </div>
                    </div>
                    
                    <div id="suzhouActionArea" class="mt-6 space-y-4 hidden">
                        <div id="suzhouStatusText" class="text-center text-gray-600 h-6 font-medium text-base"></div>
                        
                        <div id="suzhouProgressContainer" class="hidden w-full max-w-lg mx-auto">
                            <div class="w-full bg-gray-200 rounded-full h-3">
                                <div id="suzhouProgressBar" class="progress-bar h-3 rounded-full transition-all duration-300" style="width: 0%"></div>
                            </div>
                        </div>
                        
                        <div class="flex justify-center space-x-3">
                            <button id="suzhouGenerateBtn" 
                                    disabled
                                    class="px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold text-base hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-emerald-500 disabled:hover:to-emerald-600 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                                开始生成
                            </button>
                            
                            <button id="suzhouDownloadPdfBtn" 
                                    class="hidden px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold text-base hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg btn-flex">
                                <iconify-icon icon="mdi:file-pdf-box" width="18" height="18"></iconify-icon>
                                下载 PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="glass-card rounded-3xl p-5 fade-in-up stagger-3">
                <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <iconify-icon icon="mdi:information" width="20" height="20" class="mr-2 text-primary-500"></iconify-icon>
                    工具介绍及使用方法
                </h2>
                <div class="space-y-3 text-gray-600 leading-relaxed">
                    <p class="text-base">苏州座位名牌生成器是一款便捷的座位名牌制作工具，支持批量生成员工座位名牌。</p>
                    <ol class="list-decimal list-inside space-y-2 ml-2">
                        <li class="flex items-start">
                            <span class="w-7 h-7 icon-wrapper-light rounded-lg flex items-center justify-center font-bold text-primary-600 mr-3 flex-shrink-0 text-sm">1</span>
                            <span class="pt-0.5 text-sm">准备一个文件夹，包含员工信息Excel和员工照片。</span>
                        </li>
                        <li class="flex items-start">
                            <span class="w-7 h-7 icon-wrapper-light rounded-lg flex items-center justify-center font-bold text-primary-600 mr-3 flex-shrink-0 text-sm">2</span>
                            <span class="pt-0.5 text-sm">将该文件夹打包成ZIP文件。</span>
                        </li>
                        <li class="flex items-start">
                            <span class="w-7 h-7 icon-wrapper-light rounded-lg flex items-center justify-center font-bold text-primary-600 mr-3 flex-shrink-0 text-sm">3</span>
                            <span class="pt-0.5 text-sm">点击"上传"按钮，选择ZIP文件。</span>
                        </li>
                        <li class="flex items-start">
                            <span class="w-7 h-7 icon-wrapper-light rounded-lg flex items-center justify-center font-bold text-primary-600 mr-3 flex-shrink-0 text-sm">4</span>
                            <span class="pt-0.5 text-sm">确认文件已上传后，点击"开始生成"按钮。</span>
                        </li>
                        <li class="flex items-start">
                            <span class="w-7 h-7 icon-wrapper-light rounded-lg flex items-center justify-center font-bold text-primary-600 mr-3 flex-shrink-0 text-sm">5</span>
                            <span class="pt-0.5 text-sm">等待生成完成，点击下载按钮保存PDF。</span>
                        </li>
                    </ol>
                </div>
            </div>
        </div>
    `;
}

function renderSeatBadgeShenzhenPage(tool) {
    return `
        <div class="max-w-4xl mx-auto space-y-5">
            <button onclick="navigateTo('/')" class="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors font-medium no-print">
                <iconify-icon icon="mdi:arrow-left" width="22" height="22" class="mr-2"></iconify-icon>
                返回首页
            </button>
            
            <div class="glass-card rounded-3xl p-4 fade-in-up">
                <div class="flex items-center space-x-3.5">
                    <div class="w-12 h-12 icon-wrapper rounded-xl flex items-center justify-center text-2xl floating">
                        ${tool.icon}
                    </div>
                    <div>
                        <h1 class="text-xl font-bold text-gray-800">${tool.name}</h1>
                        <p class="text-gray-500 mt-0.5 text-sm">${tool.description}</p>
                    </div>
                </div>
            </div>
            
            <div class="glass-card rounded-3xl p-6 fade-in-up stagger-2">
                <div class="text-center">
                    <div id="shenzhenUploadArea" 
                         class="upload-area border-3 border-dashed border-gray-200 rounded-3xl p-8 cursor-pointer">
                        <div id="shenzhenUploadPrompt" class="space-y-4">
                            <div class="text-5xl">
                                <iconify-icon icon="mdi:upload" class="mx-auto text-gray-400" width="60" height="60"></iconify-icon>
                            </div>
                            <div>
                                <p class="text-gray-700 text-base font-medium">将ZIP文件拖拽到此处</p>
                                <p class="text-gray-400 mt-1">或者</p>
                            </div>
                            <input type="file" id="shenzhenFileInput" accept=".zip" class="hidden">
                            <button id="shenzhenUploadBtn" 
                                    class="gradient-btn px-6 py-2.5 text-white rounded-xl font-medium text-base">
                                点击上传ZIP文件
                            </button>
                        </div>
                        
                        <div id="shenzhenFileInfo" class="hidden space-y-4">
                            <div class="text-5xl">
                                <iconify-icon icon="mdi:folder-zip" class="mx-auto" style="color: #6366F1;" width="60" height="60"></iconify-icon>
                            </div>
                            <p id="shenzhenFileName" class="text-gray-800 font-bold text-lg"></p>
                            <button id="shenzhenResetBtn" 
                                    class="px-5 py-2 text-gray-600 hover:text-gray-800 font-medium border border-gray-200 rounded-lg hover:bg-white/60 transition-all">
                                重新上传
                            </button>
                        </div>
                    </div>
                    
                    <div id="shenzhenActionArea" class="mt-6 space-y-4 hidden">
                        <div id="shenzhenStatusText" class="text-center text-gray-600 h-6 font-medium text-base"></div>
                        
                        <div id="shenzhenProgressContainer" class="hidden w-full max-w-lg mx-auto">
                            <div class="w-full bg-gray-200 rounded-full h-3">
                                <div id="shenzhenProgressBar" class="progress-bar h-3 rounded-full transition-all duration-300" style="width: 0%"></div>
                            </div>
                        </div>
                        
                        <div class="flex justify-center space-x-3">
                            <button id="shenzhenGenerateBtn" 
                                    disabled
                                    class="px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold text-base hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-emerald-500 disabled:hover:to-emerald-600 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                                开始生成
                            </button>
                            
                            <button id="shenzhenDownloadPdfBtn" 
                                    class="hidden px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold text-base hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg btn-flex">
                                <iconify-icon icon="mdi:file-pdf-box" width="18" height="18"></iconify-icon>
                                下载 PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="glass-card rounded-3xl p-5 fade-in-up stagger-3">
                <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <iconify-icon icon="mdi:information" width="20" height="20" class="mr-2 text-primary-500"></iconify-icon>
                    工具介绍及使用方法
                </h2>
                <div class="space-y-3 text-gray-600 leading-relaxed">
                    <p class="text-base">深圳座位名牌生成器是一款便捷的座位名牌制作工具，支持批量生成员工座位名牌。</p>
                    <ol class="list-decimal list-inside space-y-2 ml-2">
                        <li class="flex items-start">
                            <span class="w-7 h-7 icon-wrapper-light rounded-lg flex items-center justify-center font-bold text-primary-600 mr-3 flex-shrink-0 text-sm">1</span>
                            <span class="pt-0.5 text-sm">准备一个文件夹，包含员工信息Excel和员工照片。</span>
                        </li>
                        <li class="flex items-start">
                            <span class="w-7 h-7 icon-wrapper-light rounded-lg flex items-center justify-center font-bold text-primary-600 mr-3 flex-shrink-0 text-sm">2</span>
                            <span class="pt-0.5 text-sm">将该文件夹打包成ZIP文件。</span>
                        </li>
                        <li class="flex items-start">
                            <span class="w-7 h-7 icon-wrapper-light rounded-lg flex items-center justify-center font-bold text-primary-600 mr-3 flex-shrink-0 text-sm">3</span>
                            <span class="pt-0.5 text-sm">点击"上传"按钮，选择ZIP文件。</span>
                        </li>
                        <li class="flex items-start">
                            <span class="w-7 h-7 icon-wrapper-light rounded-lg flex items-center justify-center font-bold text-primary-600 mr-3 flex-shrink-0 text-sm">4</span>
                            <span class="pt-0.5 text-sm">确认文件已上传后，点击"开始生成"按钮。</span>
                        </li>
                        <li class="flex items-start">
                            <span class="w-7 h-7 icon-wrapper-light rounded-lg flex items-center justify-center font-bold text-primary-600 mr-3 flex-shrink-0 text-sm">5</span>
                            <span class="pt-0.5 text-sm">等待生成完成，点击下载按钮保存PDF。</span>
                        </li>
                    </ol>
                </div>
            </div>
        </div>
    `;
}

function renderGenericToolPage(tool) {
    return `
        <div class="max-w-4xl mx-auto space-y-8">
            <button onclick="navigateTo('/')" class="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors font-medium">
                <iconify-icon icon="mdi:arrow-left" width="22" height="22" class="mr-2"></iconify-icon>
                返回首页
            </button>
            
            <div class="glass-card rounded-3xl p-8 fade-in-up">
                <div class="flex items-center space-x-6">
                    <div class="w-20 h-20 icon-wrapper rounded-2xl flex items-center justify-center text-4xl">
                        ${tool.icon}
                    </div>
                    <div>
                        <h1 class="text-3xl font-bold text-gray-800">${tool.name}</h1>
                        <p class="text-gray-500 mt-2 text-lg">${tool.description}</p>
                    </div>
                </div>
            </div>
            
            <div class="glass-card rounded-3xl p-16 fade-in-up stagger-2">
                <div class="text-center">
                    <iconify-icon icon="mdi:construction" class="mx-auto text-gray-400" width="100" height="100"></iconify-icon>
                    <p class="mt-6 text-gray-600 text-xl font-medium">该工具正在开发中，敬请期待！</p>
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
    const actionArea = document.getElementById('actionArea');
    
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
        uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
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
        actionArea.classList.remove('hidden');
        convertBtn.disabled = false;
        
        // 给上传区域添加已选择文件的样式类
        const uploadArea = document.getElementById('uploadArea');
        if (uploadArea) uploadArea.classList.add('has-file');
    }
    
    resetBtn.addEventListener('click', () => {
        selectedFile = null;
        fileInput.value = '';
        uploadPrompt.classList.remove('hidden');
        fileInfo.classList.add('hidden');
        actionArea.classList.add('hidden');
        convertBtn.classList.add('hidden');
        downloadWordBtn.classList.add('hidden');
        downloadPdfBtn.classList.add('hidden');
        statusText.textContent = '';
        
        // 移除上传区域已选择文件的样式类
        const uploadArea = document.getElementById('uploadArea');
        if (uploadArea) uploadArea.classList.remove('has-file');
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
        convertBtn.textContent = '正在转换...';
        
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

/* ========== 会议名牌 JavaScript 逻辑 ========== */

let meetingBadgeData = {
    layoutChanged: false,
    currentLayoutMode: 'mode1'
};

async function incrementMeetingBadgeUsage() {
    try {
        const response = await fetch('/api/tool/meeting_badge/usage', {
            method: 'POST'
        });
        
        const result = await response.json();
        
        if (result.success && result.stats) {
            appData.stats = result.stats;
            updateStatsDisplay();
        }
    } catch (error) {
        console.error('更新使用统计失败:', error);
    }
}

function initMeetingBadgePage() {
    const namesInput = document.getElementById('meetingBadgeNamesInput');
    const layoutMode = document.getElementById('meetingBadgeLayoutMode');
    const previewBtn = document.getElementById('meetingBadgePreviewBtn');
    const printBtn = document.getElementById('meetingBadgePrintBtn');
    const pdfBtn = document.getElementById('meetingBadgePdfBtn');
    const mode6SubtextContainer = document.getElementById('meetingBadgeMode6SubtextContainer');

    if (!namesInput) return;

    meetingBadgeData.currentLayoutMode = layoutMode.value;

    layoutMode.addEventListener('change', function() {
        if (this.value !== meetingBadgeData.currentLayoutMode) {
            meetingBadgeData.layoutChanged = true;
            meetingBadgeData.currentLayoutMode = this.value;
        }

        if (this.value === 'mode6') {
            mode6SubtextContainer.classList.remove('hidden');
        } else {
            mode6SubtextContainer.classList.add('hidden');
        }
    });

    previewBtn.addEventListener('click', function() {
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 150);

        createMeetingBadgeHearts(this);
        generateMeetingBadgePreview();
    });

    printBtn.addEventListener('click', function() {
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 150);

        createMeetingBadgeHearts(this);

        const previewArea = document.getElementById('meetingBadgePreviewArea');
        if (!previewArea.querySelector('.meeting-badge-page') && 
            !previewArea.querySelector('.mode3-page')) {
            alert('请先生成预览，查看效果后再打印！');
            return;
        }

        if (meetingBadgeData.layoutChanged) {
            alert('排版布局切换后，请先生成预览查看效果');
            return;
        }

        setTimeout(async () => {
            document.querySelectorAll('.meeting-badge-heart').forEach(heart => heart.remove());
            await incrementMeetingBadgeUsage();
            window.print();
        }, 300);
    });

    pdfBtn.addEventListener('click', function() {
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 150);

        createMeetingBadgeHearts(this);

        const previewArea = document.getElementById('meetingBadgePreviewArea');
        if (!previewArea.querySelector('.meeting-badge-page') && 
            !previewArea.querySelector('.mode3-page')) {
            alert('请先生成预览，查看效果后再保存PDF！');
            return;
        }

        if (meetingBadgeData.layoutChanged) {
            alert('排版布局切换后，请先生成预览查看效果');
            return;
        }

        setTimeout(async () => {
            document.querySelectorAll('.meeting-badge-heart').forEach(heart => heart.remove());
            await incrementMeetingBadgeUsage();
            saveMeetingBadgePDF();
        }, 300);
    });
}

function createMeetingBadgeHearts(element) {
    const heartsCount = 10;
    const rect = element.getBoundingClientRect();
    const buttonX = rect.left + window.scrollX;
    const buttonY = rect.top + window.scrollY;
    const characters = ['👍'];

    for (let i = 0; i < heartsCount; i++) {
        const heart = document.createElement('div');
        heart.className = 'meeting-badge-heart';
        const randomIndex = Math.floor(Math.random() * characters.length);
        heart.innerHTML = characters[randomIndex];

        const offsetX = (Math.random() - 0.5) * 200;
        const offsetY = (Math.random() - 0.5) * 50;
        const delay = Math.random() * 0.8;

        heart.style.left = (buttonX + element.offsetWidth / 2 + offsetX) + 'px';
        heart.style.top = (buttonY + element.offsetHeight / 2 + offsetY) + 'px';
        heart.style.animationDelay = delay + 's';

        document.body.appendChild(heart);

        setTimeout(() => {
            heart.remove();
        }, 1500 + delay * 1000);
    }
}

function toPinyin(chinese) {
    if (!chinese || chinese.trim() === '') return '';

    try {
        if (typeof pinyinPro === 'object' && typeof pinyinPro.pinyin === 'function') {
            let pinyinResult = pinyinPro.pinyin(chinese, {
                toneType: 'none',
                type: 'array',
                separator: ' '
            });

            return pinyinResult.map(word => {
                if (word && word.length > 0) {
                    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                }
                return word;
            }).join(' ');
        } else {
            console.error('pinyinPro库未正确加载');
            return chinese;
        }
    } catch (error) {
        console.error('拼音转换错误:', error);
        return chinese;
    }
}

function createMode2Card(name, pinyin) {
    const card = document.createElement('div');
    card.className = 'mode2-card';

    const logo = document.createElement('img');
    logo.src = '/static/assets/meeting_badge/logo.png';
    logo.className = 'mode2-logo';
    card.appendChild(logo);

    const nameElement = document.createElement('div');
    nameElement.className = 'mode2-name' + (name.length === 2 ? ' two-chars' : '');
    nameElement.textContent = name;
    card.appendChild(nameElement);

    const pinyinElement = document.createElement('div');
    pinyinElement.className = 'mode2-pinyin';
    pinyinElement.textContent = pinyin;
    card.appendChild(pinyinElement);

    return card;
}

function createMode6Card(name) {
    const card = document.createElement('div');
    card.className = 'mode6-card';

    const logo = document.createElement('img');
    logo.src = '/static/assets/meeting_badge/acd.png';
    logo.className = 'mode6-logo';
    card.appendChild(logo);

    const nameElement = document.createElement('div');
    const isEnglishName = /[a-zA-Z\s]/.test(name);

    if (isEnglishName) {
        nameElement.className = 'mode6-name';
        const nameWords = name.split(/[\s-]+/).filter(word => word.trim() !== '');
        const totalLength = name.length;
        const wordCount = nameWords.length;

        let fontSize = 55;
        if (totalLength > 20 || wordCount >= 4) {
            fontSize = 32;
        } else if (totalLength > 15 || wordCount >= 3) {
            fontSize = 40;
        } else if (totalLength > 10 || wordCount >= 2) {
            fontSize = 45;
        }

        nameElement.style.fontSize = fontSize + 'px';

        if (wordCount > 1) {
            nameElement.style.whiteSpace = 'pre-wrap';
            nameElement.style.lineHeight = '1.1';

            let formattedText = name;
            if (wordCount === 2) {
                formattedText = name;
            } else if (wordCount === 3) {
                const words = name.split(' ');
                formattedText = words[0] + '\n' + words[1] + ' ' + words[2];
            } else {
                const midPoint = Math.ceil(wordCount / 2);
                const firstLine = nameWords.slice(0, midPoint).join(' ');
                const secondLine = nameWords.slice(midPoint).join(' ');
                formattedText = firstLine + '\n' + secondLine;
            }

            nameElement.textContent = formattedText;
        } else {
            nameElement.textContent = name;
        }
    } else {
        if (name.length === 2) {
            nameElement.className = 'mode6-name two-chars';
        } else {
            nameElement.className = 'mode6-name';
        }
        nameElement.textContent = name;
    }

    nameElement.style.marginTop = 'calc(0mm + 10px)';
    card.appendChild(nameElement);

    const textElement = document.createElement('div');
    textElement.className = 'mode6-pinyin';
    const mode6SubtextInput = document.getElementById('meetingBadgeMode6Subtext');
    textElement.textContent = mode6SubtextInput.value.trim();
    card.appendChild(textElement);

    return card;
}

function generateMeetingBadgePreview() {
    const namesInput = document.getElementById('meetingBadgeNamesInput');
    const layoutMode = document.getElementById('meetingBadgeLayoutMode');
    const previewArea = document.getElementById('meetingBadgePreviewArea');

    const names = namesInput.value.split('、').filter(name => name.trim() !== '');
    const mode = layoutMode.value;

    meetingBadgeData.layoutChanged = false;
    meetingBadgeData.currentLayoutMode = mode;

    previewArea.innerHTML = '';

    if (names.length === 0) {
        previewArea.innerHTML = '<div class="text-center text-gray-400 py-12"><iconify-icon icon="mdi:file-document-outline" width="60" height="60" class="mx-auto mb-4"></iconify-icon><p class="text-base font-medium">请输入至少一个姓名</p></div>';
        return;
    }

    if (mode === 'mode6') {
        const mode6SubtextInput = document.getElementById('meetingBadgeMode6Subtext');
        if (!mode6SubtextInput || !mode6SubtextInput.value.trim()) {
            alert('请输入模式六底部显示的文字内容');
            return;
        }
    }

    if (mode === 'mode1') {
        for (let i = 0; i < names.length; i += 3) {
            const page = document.createElement('div');
            page.className = 'meeting-badge-page';

            const namesInThisPage = Math.min(3, names.length - i);

            if (namesInThisPage > 0) {
                for (let j = 0; j < namesInThisPage; j++) {
                    const bgImage = document.createElement('img');
                    bgImage.src = '/static/assets/meeting_badge/pic5.png';
                    bgImage.className = 'mode1-bg-image bg-image-' + (j + 1);
                    page.appendChild(bgImage);

                    const nameDiv = document.createElement('div');
                    nameDiv.className = 'meeting-badge-name';
                    const nameText = names[i + j].trim();
                    nameDiv.textContent = nameText;

                    if (nameText.length === 2) {
                        nameDiv.classList.add('two-chars');
                    }

                    nameDiv.classList.add('name-' + (j + 1));
                    page.appendChild(nameDiv);
                }
                previewArea.appendChild(page);
            }
        }
    } else if (mode === 'mode2') {
        for (let i = 0; i < names.length; i += 8) {
            const page = document.createElement('div');
            page.className = 'meeting-badge-page';

            const grid = document.createElement('div');
            grid.className = 'mode2-grid';
            page.appendChild(grid);

            const horizontalLine = document.createElement('div');
            horizontalLine.className = 'horizontal-line';
            grid.appendChild(horizontalLine);

            const verticalLine = document.createElement('div');
            verticalLine.className = 'vertical-line';
            grid.appendChild(verticalLine);

            const namesInThisPage = Math.min(8, names.length - i);

            for (let j = 0; j < namesInThisPage; j++) {
                const name = names[i + j].trim();
                const pinyin = toPinyin(name);
                const card = createMode2Card(name, pinyin);
                grid.appendChild(card);
            }

            previewArea.appendChild(page);
        }
    } else if (mode === 'mode3') {
        for (let i = 0; i < names.length; i++) {
            const page = document.createElement('div');
            page.className = 'mode3-page';

            const nameText = names[i].trim();

            const topImage = document.createElement('img');
            topImage.src = '/static/assets/meeting_badge/card2.png';
            topImage.style.position = 'absolute';
            topImage.style.top = '48mm';
            topImage.style.left = '0';
            topImage.style.width = '100%';
            topImage.style.zIndex = '1';
            page.appendChild(topImage);

            const bottomImage = document.createElement('img');
            bottomImage.src = '/static/assets/meeting_badge/pic4.png';
            bottomImage.style.position = 'absolute';
            bottomImage.style.bottom = '48mm';
            bottomImage.style.left = '0';
            bottomImage.style.width = '100%';
            bottomImage.style.zIndex = '1';
            page.appendChild(bottomImage);

            const leftName = document.createElement('div');
            leftName.className = 'mode3-name left';
            leftName.textContent = nameText;
            leftName.style.zIndex = '2';
            leftName.style.top = 'calc(30% + 17mm)';
            leftName.style.left = '50%';
            leftName.style.width = '100%';
            leftName.style.textAlign = 'center';

            const rightName = document.createElement('div');
            rightName.className = 'mode3-name right';
            rightName.textContent = nameText;
            rightName.style.zIndex = '2';
            rightName.style.bottom = 'calc(30% + 17mm)';
            rightName.style.left = '50%';
            rightName.style.width = '100%';
            rightName.style.textAlign = 'center';

            const isEnglishName = /[a-zA-Z\s]/.test(nameText);

            if (isEnglishName) {
                leftName.classList.add('english-name');
                rightName.classList.add('english-name');

                let fontSize = 110;
                let lineHeight = 1.2;
                const nameWords = nameText.split(/[\s-]+/).filter(word => word.trim() !== '');
                const totalLength = nameText.length;
                const wordCount = nameWords.length;

                if (totalLength > 20 || wordCount >= 4) {
                    fontSize = 60;
                    lineHeight = 1.1;
                } else if (totalLength > 15 || wordCount >= 3) {
                    fontSize = 75;
                    lineHeight = 1.15;
                } else if (totalLength > 10 || wordCount >= 2) {
                    fontSize = 90;
                }

                leftName.style.fontSize = fontSize + 'px';
                rightName.style.fontSize = fontSize + 'px';
                leftName.style.lineHeight = lineHeight.toString();
                rightName.style.lineHeight = lineHeight.toString();
                leftName.style.whiteSpace = 'pre-wrap';
                rightName.style.whiteSpace = 'pre-wrap';
                leftName.style.transform = 'translate(-50%, -50%) rotate(180deg)';
                rightName.style.transform = 'translate(-50%, 50%)';

                let formattedText = nameText;
                if (nameText.includes('-') || wordCount >= 3) {
                    const midPoint = Math.min(Math.ceil(nameText.length / 2), nameText.indexOf(' ', nameText.length / 3));
                    if (midPoint > 0) {
                        const firstPart = nameText.substring(0, midPoint);
                        const secondPart = nameText.substring(midPoint).trim();
                        formattedText = firstPart + '\n' + secondPart;
                    } else {
                        const midWordIndex = Math.ceil(wordCount / 2);
                        const firstLine = nameWords.slice(0, midWordIndex).join(' ');
                        const secondLine = nameWords.slice(midWordIndex).join(' ');
                        formattedText = firstLine + '\n' + secondLine;
                    }
                }

                leftName.textContent = formattedText;
                rightName.textContent = formattedText;
            } else if (nameText.length === 2) {
                leftName.classList.add('two-chars');
                rightName.classList.add('two-chars');
                leftName.style.letterSpacing = '0.8em';
                rightName.style.letterSpacing = '0.8em';
                leftName.style.transform = '';
                rightName.style.transform = '';
                leftName.style.transform = 'translate(calc(-50% - 0.4em), -50%) rotate(180deg)';
                rightName.style.transform = 'translate(calc(-50% + 0.4em), 50%)';
            } else {
                leftName.style.transform = '';
                rightName.style.transform = '';
                leftName.style.transform = 'translate(-50%, -50%) rotate(180deg)';
                rightName.style.transform = 'translate(-50%, 50%)';
            }

            page.appendChild(leftName);
            page.appendChild(rightName);
            previewArea.appendChild(page);
        }
    } else if (mode === 'mode4') {
        for (let i = 0; i < names.length; i++) {
            const page = document.createElement('div');
            page.className = 'mode4-page';

            const nameText = names[i].trim();

            const topLine = document.createElement('div');
            topLine.className = 'mode4-horizontal-line';
            topLine.style.top = '50mm';
            page.appendChild(topLine);

            const middleLine = document.createElement('div');
            middleLine.className = 'mode4-horizontal-line';
            middleLine.style.top = '50%';
            page.appendChild(middleLine);

            const bottomLine = document.createElement('div');
            bottomLine.className = 'mode4-horizontal-line';
            bottomLine.style.bottom = '50mm';
            page.appendChild(bottomLine);

            const topLeftLogo = document.createElement('img');
            topLeftLogo.src = '/static/assets/meeting_badge/logo.png';
            topLeftLogo.className = 'mode4-logo';
            topLeftLogo.style.top = '160mm';
            topLeftLogo.style.left = '15mm';
            page.appendChild(topLeftLogo);

            const bottomRightLogo = document.createElement('img');
            bottomRightLogo.src = '/static/assets/meeting_badge/logo.png';
            bottomRightLogo.className = 'mode4-logo';
            bottomRightLogo.style.bottom = '160mm';
            bottomRightLogo.style.right = '15mm';
            bottomRightLogo.style.transform = 'rotate(180deg)';
            page.appendChild(bottomRightLogo);

            const leftName = document.createElement('div');
            leftName.className = 'mode4-name left';
            leftName.textContent = nameText;
            leftName.style.zIndex = '2';

            const rightName = document.createElement('div');
            rightName.className = 'mode4-name right';
            rightName.textContent = nameText;
            rightName.style.zIndex = '2';

            const isEnglishName = /[a-zA-Z\s]/.test(nameText);

            if (isEnglishName) {
                leftName.classList.add('english-name');
                rightName.classList.add('english-name');

                let fontSize = 110;
                let lineHeight = 1.2;
                const nameWords = nameText.split(/[\s-]+/).filter(word => word.trim() !== '');
                const totalLength = nameText.length;
                const wordCount = nameWords.length;

                if (totalLength > 20 || wordCount >= 4) {
                    fontSize = 60;
                    lineHeight = 1.1;
                } else if (totalLength > 15 || wordCount >= 3) {
                    fontSize = 75;
                    lineHeight = 1.15;
                } else if (totalLength > 10 || wordCount >= 2) {
                    fontSize = 90;
                }

                leftName.style.fontSize = fontSize + 'px';
                rightName.style.fontSize = fontSize + 'px';
                leftName.style.lineHeight = lineHeight.toString();
                rightName.style.lineHeight = lineHeight.toString();
                leftName.style.whiteSpace = 'pre-wrap';
                rightName.style.whiteSpace = 'pre-wrap';
                leftName.style.transform = 'translate(-50%, -50%) rotate(180deg)';
                rightName.style.transform = 'translate(-50%, 50%)';

                let formattedText = nameText;
                if (nameText.includes('-') || wordCount >= 3) {
                    const midPoint = Math.min(Math.ceil(nameText.length / 2), nameText.indexOf(' ', nameText.length / 3));
                    if (midPoint > 0) {
                        const firstPart = nameText.substring(0, midPoint);
                        const secondPart = nameText.substring(midPoint).trim();
                        formattedText = firstPart + '\n' + secondPart;
                    } else {
                        const midWordIndex = Math.ceil(wordCount / 2);
                        const firstLine = nameWords.slice(0, midWordIndex).join(' ');
                        const secondLine = nameWords.slice(midWordIndex).join(' ');
                        formattedText = firstLine + '\n' + secondLine;
                    }
                }

                leftName.textContent = formattedText;
                rightName.textContent = formattedText;
            } else if (nameText.length === 2) {
                leftName.classList.add('two-chars');
                rightName.classList.add('two-chars');
                leftName.style.letterSpacing = '0.8em';
                rightName.style.letterSpacing = '0.8em';
                leftName.style.transform = '';
                rightName.style.transform = '';
                leftName.style.transform = 'translate(calc(-50% - 0.4em), -50%) rotate(180deg)';
                rightName.style.transform = 'translate(calc(-50% + 0.4em), 50%)';
            }

            page.appendChild(leftName);
            page.appendChild(rightName);
            previewArea.appendChild(page);
        }
    } else if (mode === 'mode5') {
        for (let i = 0; i < names.length; i++) {
            const page = document.createElement('div');
            page.className = 'mode5-page';

            const nameText = names[i].trim();

            const topLine = document.createElement('div');
            topLine.className = 'mode5-horizontal-line';
            topLine.style.top = '50mm';
            page.appendChild(topLine);

            const middleLine = document.createElement('div');
            middleLine.className = 'mode5-horizontal-line';
            middleLine.style.top = '50%';
            page.appendChild(middleLine);

            const bottomLine = document.createElement('div');
            bottomLine.className = 'mode5-horizontal-line';
            bottomLine.style.bottom = '50mm';
            page.appendChild(bottomLine);

            const topText = document.createElement('div');
            topText.className = 'mode5-text';
            topText.textContent = '以成就客户为先，以贡献者为本，坚持开放协作，持续追求卓越';
            topText.style.top = 'calc(50mm + 15px)';
            topText.style.transform = 'rotate(180deg)';
            page.appendChild(topText);

            const bottomText = document.createElement('div');
            bottomText.className = 'mode5-text';
            bottomText.textContent = '以成就客户为先，以贡献者为本，坚持开放协作，持续追求卓越';
            bottomText.style.bottom = 'calc(50mm + 15px)';
            page.appendChild(bottomText);

            const topLeftLogo = document.createElement('img');
            topLeftLogo.src = '/static/assets/meeting_badge/acd.png';
            topLeftLogo.className = 'mode5-logo';
            topLeftLogo.style.top = '155mm';
            topLeftLogo.style.left = '12mm';
            page.appendChild(topLeftLogo);

            const bottomRightLogo = document.createElement('img');
            bottomRightLogo.src = '/static/assets/meeting_badge/acd.png';
            bottomRightLogo.className = 'mode5-logo';
            bottomRightLogo.style.bottom = '155mm';
            bottomRightLogo.style.right = '12mm';
            bottomRightLogo.style.transform = 'rotate(180deg)';
            page.appendChild(bottomRightLogo);

            const leftName = document.createElement('div');
            leftName.className = 'mode5-name left';
            leftName.textContent = nameText;
            leftName.style.zIndex = '2';

            const rightName = document.createElement('div');
            rightName.className = 'mode5-name right';
            rightName.textContent = nameText;
            rightName.style.zIndex = '2';

            const isEnglishName = /[a-zA-Z\s]/.test(nameText);

            if (isEnglishName) {
                leftName.classList.add('english-name');
                rightName.classList.add('english-name');

                let fontSize = 110;
                let lineHeight = 1.2;
                const nameWords = nameText.split(/[\s-]+/).filter(word => word.trim() !== '');
                const totalLength = nameText.length;
                const wordCount = nameWords.length;

                if (totalLength > 20 || wordCount >= 4) {
                    fontSize = 60;
                    lineHeight = 1.1;
                } else if (totalLength > 15 || wordCount >= 3) {
                    fontSize = 75;
                    lineHeight = 1.15;
                } else if (totalLength > 10 || wordCount >= 2) {
                    fontSize = 90;
                }

                leftName.style.fontSize = fontSize + 'px';
                rightName.style.fontSize = fontSize + 'px';
                leftName.style.lineHeight = lineHeight.toString();
                rightName.style.lineHeight = lineHeight.toString();
                leftName.style.whiteSpace = 'pre-wrap';
                rightName.style.whiteSpace = 'pre-wrap';
                leftName.style.transform = 'translate(-50%, -50%) rotate(180deg)';
                rightName.style.transform = 'translate(-50%, 50%)';

                let formattedText = nameText;
                const specialNames = ["Schaerer-Lim Mei Qin Genevieve", "Schaerer Lim Mei Qin Genevieve"];
                if (specialNames.includes(nameText)) {
                    formattedText = "Schaerer-Lim\nMei Qin Genevieve";
                } else if (nameText.includes('-') || wordCount >= 3) {
                    if (nameText.includes('-')) {
                        const hyphenParts = nameText.split(' ');
                        const firstPart = hyphenParts[0];
                        const secondPart = hyphenParts.slice(1).join(' ');
                        formattedText = firstPart + '\n' + secondPart;
                    } else {
                        const midPoint = nameText.indexOf(' ', nameText.length / 3);
                        if (midPoint > 0) {
                            const firstPart = nameText.substring(0, midPoint);
                            const secondPart = nameText.substring(midPoint).trim();
                            formattedText = firstPart + '\n' + secondPart;
                        } else {
                            const midWordIndex = Math.ceil(wordCount / 2);
                            const firstLine = nameWords.slice(0, midWordIndex).join(' ');
                            const secondLine = nameWords.slice(midWordIndex).join(' ');
                            formattedText = firstLine + '\n' + secondLine;
                        }
                    }
                }

                leftName.textContent = formattedText;
                rightName.textContent = formattedText;
            } else if (nameText.length === 2) {
                leftName.classList.add('two-chars');
                rightName.classList.add('two-chars');
                leftName.style.letterSpacing = '0.8em';
                rightName.style.letterSpacing = '0.8em';
                leftName.style.transform = '';
                rightName.style.transform = '';
                leftName.style.transform = 'translate(calc(-50% - 0.4em), -50%) rotate(180deg)';
                rightName.style.transform = 'translate(calc(-50% + 0.4em), 50%)';
            } else {
                leftName.style.transform = '';
                rightName.style.transform = '';
                leftName.style.transform = 'translate(-50%, -50%) rotate(180deg)';
                rightName.style.transform = 'translate(-50%, 50%)';
            }

            page.appendChild(leftName);
            page.appendChild(rightName);
            previewArea.appendChild(page);
        }
    } else if (mode === 'mode6') {
        for (let i = 0; i < names.length; i += 8) {
            const page = document.createElement('div');
            page.className = 'meeting-badge-page';

            const grid = document.createElement('div');
            grid.className = 'mode6-grid';
            page.appendChild(grid);

            const horizontalLine = document.createElement('div');
            horizontalLine.className = 'mode6-horizontal-line';
            grid.appendChild(horizontalLine);

            const verticalLine = document.createElement('div');
            verticalLine.className = 'mode6-vertical-line';
            grid.appendChild(verticalLine);

            const namesInThisPage = Math.min(8, names.length - i);

            for (let j = 0; j < namesInThisPage; j++) {
                const name = names[i + j].trim();
                const card = createMode6Card(name);
                grid.appendChild(card);
            }

            previewArea.appendChild(page);
        }
    }
}

function saveMeetingBadgePDF() {
    const pages = document.querySelectorAll('.meeting-badge-page, .mode3-page');
    if (pages.length > 0) {
        pages[pages.length - 1].style.pageBreakAfter = 'avoid';
        pages[pages.length - 1].style.breakAfter = 'avoid';
    }
    document.querySelectorAll('.meeting-badge-heart').forEach(heart => heart.remove());
    window.print();
}

/* ========== 苏州座位名牌 JavaScript 逻辑 ========== */

function initSeatBadgeSuzhouPage() {
    const uploadArea = document.getElementById('suzhouUploadArea');
    const fileInput = document.getElementById('suzhouFileInput');
    const uploadBtn = document.getElementById('suzhouUploadBtn');
    const uploadPrompt = document.getElementById('suzhouUploadPrompt');
    const fileInfo = document.getElementById('suzhouFileInfo');
    const fileName = document.getElementById('suzhouFileName');
    const resetBtn = document.getElementById('suzhouResetBtn');
    const generateBtn = document.getElementById('suzhouGenerateBtn');
    const downloadPdfBtn = document.getElementById('suzhouDownloadPdfBtn');
    const statusText = document.getElementById('suzhouStatusText');
    const actionArea = document.getElementById('suzhouActionArea');
    
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
        uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
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
        if (!file.name.endsWith('.zip')) {
            alert('请上传 .zip 格式的文件！');
            return;
        }
        selectedFile = file;
        fileName.textContent = file.name;
        uploadPrompt.classList.add('hidden');
        fileInfo.classList.remove('hidden');
        actionArea.classList.remove('hidden');
        generateBtn.disabled = false;
        
        // 给上传区域添加已选择文件的样式类
        if (uploadArea) uploadArea.classList.add('has-file');
    }
    
    resetBtn.addEventListener('click', () => {
        selectedFile = null;
        fileInput.value = '';
        uploadPrompt.classList.remove('hidden');
        fileInfo.classList.add('hidden');
        actionArea.classList.add('hidden');
        generateBtn.classList.add('hidden');
        downloadPdfBtn.classList.add('hidden');
        statusText.textContent = '';
        
        // 移除上传区域已选择文件的样式类
        if (uploadArea) uploadArea.classList.remove('has-file');
    });
    
    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', function() {
            const filename = this.dataset.file;
            if (filename) {
                downloadFile(filename);
            }
        });
    }
    
    generateBtn.addEventListener('click', async () => {
        if (!selectedFile) return;
        
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        generateBtn.disabled = true;
        generateBtn.textContent = '正在生成...';
        
        const progressContainer = document.getElementById('suzhouProgressContainer');
        const progressBar = document.getElementById('suzhouProgressBar');
        
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
                    updateProgress(currentProgress, '正在解压文件...');
                } else if (currentProgress <= 90) {
                    updateProgress(currentProgress, '正在生成PDF...');
                }
            }
        }
        
        const progressInterval = setInterval(animateProgress, 80);
        
        try {
            const response = await fetch('/api/seat_badge/suzhou/generate', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            clearInterval(progressInterval);
            
            if (result.success) {
                updateProgress(100, '已完成请下载');
                generateBtn.classList.add('hidden');
                
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
                alert('生成失败：' + (result.error || '未知错误'));
                statusText.textContent = '';
                generateBtn.disabled = false;
                generateBtn.textContent = '开始生成';
            }
        } catch (error) {
            clearInterval(progressInterval);
            progressContainer.classList.add('hidden');
            alert('网络错误，请重试');
            statusText.textContent = '';
            generateBtn.disabled = false;
            generateBtn.textContent = '开始生成';
        }
});
}

/* ========== 深圳座位名牌 JavaScript 逻辑 ========== */

function initSeatBadgeShenzhenPage() {
    const uploadArea = document.getElementById('shenzhenUploadArea');
    const fileInput = document.getElementById('shenzhenFileInput');
    const uploadBtn = document.getElementById('shenzhenUploadBtn');
    const uploadPrompt = document.getElementById('shenzhenUploadPrompt');
    const fileInfo = document.getElementById('shenzhenFileInfo');
    const fileName = document.getElementById('shenzhenFileName');
    const resetBtn = document.getElementById('shenzhenResetBtn');
    const generateBtn = document.getElementById('shenzhenGenerateBtn');
    const downloadPdfBtn = document.getElementById('shenzhenDownloadPdfBtn');
    const statusText = document.getElementById('shenzhenStatusText');
    const actionArea = document.getElementById('shenzhenActionArea');
    
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
        uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
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
        if (!file.name.endsWith('.zip')) {
            alert('请上传 .zip 格式的文件！');
            return;
        }
        selectedFile = file;
        fileName.textContent = file.name;
        uploadPrompt.classList.add('hidden');
        fileInfo.classList.remove('hidden');
        actionArea.classList.remove('hidden');
        generateBtn.disabled = false;
        
        // 给上传区域添加已选择文件的样式类
        if (uploadArea) uploadArea.classList.add('has-file');
    }
    
    resetBtn.addEventListener('click', () => {
        selectedFile = null;
        fileInput.value = '';
        uploadPrompt.classList.remove('hidden');
        fileInfo.classList.add('hidden');
        actionArea.classList.add('hidden');
        generateBtn.classList.add('hidden');
        downloadPdfBtn.classList.add('hidden');
        statusText.textContent = '';
        
        // 移除上传区域已选择文件的样式类
        if (uploadArea) uploadArea.classList.remove('has-file');
    });
    
    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', function() {
            const filename = this.dataset.file;
            if (filename) {
                downloadFile(filename);
            }
        });
    }
    
    generateBtn.addEventListener('click', async () => {
        if (!selectedFile) return;
        
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        generateBtn.disabled = true;
        generateBtn.textContent = '正在生成...';
        
        const progressContainer = document.getElementById('shenzhenProgressContainer');
        const progressBar = document.getElementById('shenzhenProgressBar');
        
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
                    updateProgress(currentProgress, '正在解压文件...');
                } else if (currentProgress <= 90) {
                    updateProgress(currentProgress, '正在生成PDF...');
                }
            }
        }
        
        const progressInterval = setInterval(animateProgress, 80);
        
        try {
            const response = await fetch('/api/seat_badge/shenzhen/generate', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            clearInterval(progressInterval);
            
            if (result.success) {
                updateProgress(100, '已完成请下载');
                generateBtn.classList.add('hidden');
                
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
                alert('生成失败：' + (result.error || '未知错误'));
                statusText.textContent = '';
                generateBtn.disabled = false;
                generateBtn.textContent = '开始生成';
            }
        } catch (error) {
            clearInterval(progressInterval);
            progressContainer.classList.add('hidden');
            alert('网络错误，请重试');
            statusText.textContent = '';
            generateBtn.disabled = false;
            generateBtn.textContent = '开始生成';
        }
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
        initMeetingBadgePage();
    } else if (toolId === 'seat_badge_suzhou') {
        mainContent.innerHTML = renderSeatBadgeSuzhouPage(tool);
        initSeatBadgeSuzhouPage();
    } else if (toolId === 'seat_badge_shenzhen') {
        mainContent.innerHTML = renderSeatBadgeShenzhenPage(tool);
        initSeatBadgeShenzhenPage();
    } else {
        mainContent.innerHTML = renderGenericToolPage(tool);
    }
}
