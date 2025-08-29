document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const fileList = document.getElementById('fileList');
    const convertBtn = document.getElementById('convertBtn');
    const testBtn = document.getElementById('testBtn');
    const status = document.getElementById('status');
    const previewContainer = document.getElementById('previewContainer');
    const previewContent = document.getElementById('previewContent');
    const saveBtn = document.getElementById('saveBtn');
    const progressContainer = document.getElementById('progressContainer');
    const progressStatus = document.getElementById('progressStatus');
    const progressPercent = document.getElementById('progressPercent');
    const progressFill = document.getElementById('progressFill');
    let selectedFiles = [];
    let currentConvertedContent = '';

    // 显示状态消息
    function showStatus(message, isError = false) {
        status.textContent = message;
        status.className = `status ${isError ? 'error' : ''}`;
        console.log(`Status: ${message}`, isError ? '(Error)' : '');
    }

    // 更新进度
    function updateProgress(current, total, statusText) {
        const percent = Math.round((current / total) * 100);
        progressStatus.textContent = statusText;
        progressPercent.textContent = `${percent}%`;
        progressFill.style.width = `${percent}%`;
    }

    // 测试服务器连接
    testBtn.addEventListener('click', async () => {
        testBtn.disabled = true;
        showStatus('正在测试服务器连接...');

        try {
            console.log('Testing connection to http://localhost:8181/convert');
            const response = await fetch('http://localhost:8181/convert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ test: true })
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));

            if (response.ok) {
                const data = await response.json();
                console.log('Response data:', data);
                showStatus('服务器连接正常！');
            } else {
                const errorData = await response.json().catch(() => ({ error: '未知错误' }));
                console.error('Server error:', errorData);
                throw new Error(errorData.error || `服务器错误: ${response.status}`);
            }
        } catch (error) {
            console.error('Connection error:', error);
            showStatus(`服务器连接失败: ${error.message}`, true);
            
            if (error.message.includes('Failed to fetch')) {
                showStatus('请检查：\n1. 后端服务器是否正在运行\n2. 端口号是否正确\n3. 是否有防火墙阻止', true);
            }
        } finally {
            testBtn.disabled = false;
        }
    });

    // 处理拖放事件
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#2980b9';
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = '#3498db';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#3498db';
        handleFiles(e.dataTransfer.files);
    });

    // 处理点击上传
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    // 处理文件选择
    function handleFiles(files) {
        selectedFiles = Array.from(files);
        updateFileList();
        convertBtn.disabled = selectedFiles.length === 0;
        previewContainer.style.display = 'none';
        progressContainer.style.display = 'none';
    }

    // 更新文件列表显示
    function updateFileList() {
        fileList.innerHTML = '';
        selectedFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <span>${file.name}</span>
                <button onclick="removeFile(${index})">删除</button>
            `;
            fileList.appendChild(fileItem);
        });
    }

    // 删除文件
    window.removeFile = (index) => {
        selectedFiles.splice(index, 1);
        updateFileList();
        convertBtn.disabled = selectedFiles.length === 0;
        previewContainer.style.display = 'none';
        progressContainer.style.display = 'none';
    };

    // 保存文件
    saveBtn.addEventListener('click', () => {
        const blob = new Blob([currentConvertedContent], { type: 'text/markdown' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // 获取原始文件名（不包含扩展名）并添加 .md 扩展名
        const originalFileName = selectedFiles[0].name.split('.').slice(0, -1).join('.');
        a.download = `${originalFileName}.md`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    });

    // 转换按钮点击事件
    convertBtn.addEventListener('click', async () => {
        if (selectedFiles.length === 0) return;

        convertBtn.disabled = true;
        showStatus('正在转换...');
        progressContainer.style.display = 'block';
        updateProgress(0, selectedFiles.length, '准备转换...');

        try {
            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                updateProgress(i, selectedFiles.length, `正在转换 ${file.name}...`);
                
                const formData = new FormData();
                formData.append('file', file);

                console.log('Sending file:', file.name);
                let response;
                try {
                    response = await fetch('http://localhost:8181/convert', {
                        method: 'POST',
                        body: formData
                    });
                    console.log('Response status:', response.status);
                } catch (error) {
                    console.error('Fetch error:', error);
                    throw new Error(`无法连接到服务器: ${error.message}`);
                }

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ error: '未知错误' }));
                    console.error('Server error:', errorData);
                    throw new Error(errorData.error || `服务器错误: ${response.status}`);
                }

                // 获取转换后的内容
                const text = await response.text();
                currentConvertedContent = text;
                
                // 显示预览
                previewContent.textContent = text;
                previewContainer.style.display = 'block';

                updateProgress(i + 1, selectedFiles.length, `${file.name} 转换完成`);
            }

            showStatus('所有文件转换完成！');
            selectedFiles = [];
            updateFileList();
        } catch (error) {
            console.error('Conversion error:', error);
            showStatus(`转换失败: ${error.message}`, true);
            progressContainer.style.display = 'none';
        } finally {
            convertBtn.disabled = false;
        }
    });
}); 