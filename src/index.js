import './style.css'
import fileMaster from './FileManager.js';
import TextDataManager from './TextDataManager.js';

let selectedFiles = []; // 用于存储当前选中的文件或文件夹
let clipboard = []; // 用于存储复制的文件或文件夹
let fileList = null; // 将 DOM 元素存为全局变量
let breadcrumb = null;

// 显示操作提示
function showMessage(msg, isError = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    messageDiv.textContent = msg;
    messageDiv.style.backgroundColor = isError ? '#f8d7da' : '#d4edda';
    messageDiv.style.color = isError ? '#721c24' : '#155724';

    document.body.appendChild(messageDiv);

    // 2秒后自动消失
    setTimeout(() => {
        messageDiv.remove();
    }, 2000);
}

// 显示目录中的所有文件
async function displayFiles() {
    const files = await fileMaster.listFiles();
    fileList.innerHTML = ''; // 确保 fileList 已定义

    files.forEach((file) => {
        const li = document.createElement('li');
        li.textContent = file.name;
        li.className = file.kind === 'directory' ? 'folder' : 'file';
        li.onclick = () => selectFile(file);
        li.oncontextmenu = (e) => {
            e.preventDefault(); // 阻止默认右键菜单
            toggleSelection(file, li);
        };
        fileList.appendChild(li);
    });

    updateBreadcrumb(); // 更新面包屑导航
}

// 更新面包屑导航
function updateBreadcrumb() {
    breadcrumb.innerHTML = ''; // 清空之前的内容

    const path = ['根目录', ...fileMaster.currentPath];
    path.forEach((segment, index) => {
        const span = document.createElement('span');
        span.textContent = segment;
        span.className = 'breadcrumb-segment';
        span.style.cursor = 'pointer';
        span.addEventListener('click', async () => {
            if (index === 0) {
                await fileMaster.navigateToPath([]); // 返回根目录
            } else {
                const targetPath = fileMaster.currentPath.slice(0, index);
                await fileMaster.navigateToPath(targetPath);
            }
            displayFiles();
        });
        breadcrumb.appendChild(span);

        if (index < path.length - 1) {
            const separator = document.createElement('span');
            separator.textContent = ' / ';
            breadcrumb.appendChild(separator);
        }
    });
}

// 选择或取消选择文件/文件夹
function toggleSelection(file, listItem) {
    if (selectedFiles.includes(file)) {
        selectedFiles = selectedFiles.filter(f => f !== file);
        listItem.classList.remove('selected');
    } else {
        selectedFiles.push(file);
        listItem.classList.add('selected');
    }
}

// 选择并读取文件或进入文件夹
async function selectFile(file) {
    if (file.kind === 'directory') {
        try {
            await fileMaster.navigateToPath([...fileMaster.currentPath, file.name]);
            displayFiles(); // 重新显示该文件夹下的文件
            showMessage(`进入文件夹: ${file.name}`);
        } catch (error) {
            showMessage(`无法进入文件夹: ${error.message}`, true);
        }
    } else {
        try {
            const fileContent = await fileMaster.previewFile(file.handle);
            const fileType = file?.handle?.type || '';

            if (fileType.startsWith('image/')) {
                const imgPreview = document.createElement('img');
                imgPreview.src = `data:${fileType};base64,${fileContent}`;
                document.getElementById('filePreview').innerHTML = ''; // 清空之前的内容
                document.getElementById('filePreview').appendChild(imgPreview);
                showMessage(`图片: ${file.name} 已加载`);
            } else if (fileType.startsWith('text/') || fileType === 'application/json') {
                document.getElementById('filePreview').value = fileContent;
                currentTextData = new TextDataManager(fileContent);
                showMessage(`文本文件: ${file.name} 已加载`);
            } else {
                showMessage(`无法预览文件类型: ${file.name}`, true);
            }
        } catch (error) {
            showMessage(`无法读取文件: ${error.message}`, true);
        }
    }
}

// 复制选中文件/文件夹
function copySelected() {
    clipboard = [...selectedFiles]; // 复制到剪贴板
    showMessage(`已复制 ${clipboard.length} 项`);
}

// 粘贴选中的文件/文件夹
async function pasteSelected() {
    if (!clipboard.length) {
        showMessage('剪贴板为空', true);
        return;
    }
    for (const file of clipboard) {
        try {
            await fileMaster.copyEntry(file.name);
        } catch (err) {
            showMessage(`无法粘贴 ${file.name}: ${err.message}`, true);
        }
    }
    displayFiles();
    showMessage(`粘贴成功: ${clipboard.length} 项`);
}

// 删除选中的文件/文件夹
async function deleteSelected() {
    if (!selectedFiles.length) {
        showMessage('未选择任何文件', true);
        return;
    }

    for (const file of selectedFiles) {
        try {
            await fileMaster.deleteEntry(file.name);
        } catch (err) {
            showMessage(`无法删除 ${file.name}: ${err.message}`, true);
        }
    }
    selectedFiles = []; // 清空已选择的文件
    displayFiles();
    showMessage('删除成功');
}

// 在页面加载后再添加事件监听器
window.onload = () => {
    // 预先获取 DOM 元素
    fileList = document.getElementById('filesList');
    breadcrumb = document.getElementById('breadcrumb');

    document.getElementById('createFolderBtn').addEventListener('click', async () => {
        const folderName = document.getElementById('createFolderName').value;
        if (folderName) {
            await fileMaster.createFolder(folderName);
            displayFiles();
            showMessage(`文件夹 "${folderName}" 创建成功`);
        }
    });

    document.getElementById('copySelectedBtn').addEventListener('click', copySelected);
    document.getElementById('pasteSelectedBtn').addEventListener('click', pasteSelected);
    document.getElementById('deleteSelectedBtn').addEventListener('click', deleteSelected);

    document.getElementById('selectDirBtn').addEventListener('click', async () => {
        try {
            await fileMaster.selectDirectory();
            document.getElementById('currentDir').textContent = `当前目录: ${fileMaster.directoryHandle.name}`;
            displayFiles();
        } catch (err) {
            showMessage('目录选择失败', true);
            console.error('目录选择失败:', err);
        }
    });
};