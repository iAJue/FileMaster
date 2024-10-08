class FileManager {
    constructor() {
        this.directoryHandle = null;
        this.currentPath = [];
    }

    async selectDirectory() {
        try {
            this.directoryHandle = await window.showDirectoryPicker();
            this.currentPath = [];
            return this.directoryHandle;
        } catch (err) {
            console.error('目录选择失败:', err);
            throw new Error('目录选择失败: ' + err.message);
        }
    }

    async navigateToPath(pathArray) {
        if (!this.directoryHandle) {
            throw new Error('未选择任何目录。');
        }
        let handle = this.directoryHandle;
        for (const segment of pathArray) {
            handle = await handle.getDirectoryHandle(segment);
        }
        this.currentHandle = handle;
        this.currentPath = pathArray;
        return handle;
    }

    async listFiles() {
        if (!this.currentHandle) return [];
        const entries = [];
        for await (const [name, entry] of this.currentHandle.entries()) {
            entries.push({ name, kind: entry.kind, handle: entry });
        }
        return entries;
    }

    async previewFile(fileHandle) {
        const file = await fileHandle.getFile();
        const fileType = file.type;

        if (fileType.startsWith('image/')) {
            const buffer = await file.arrayBuffer();
            const base64 = arrayBufferToBase64(buffer);
            return base64;
        } else if (fileType.startsWith('text/') || fileType === 'application/json') {
            const text = await file.text();
            return text;
        } else {
            return null;
        }
    }

    async createFolder(folderName) {
        if (!this.currentHandle) throw new Error('未选择目录');
        await this.currentHandle.getDirectoryHandle(folderName, { create: true });
        console.log(`文件夹 "${folderName}" 创建成功。`);
    }

    async deleteEntry(name) {
        if (!this.currentHandle) throw new Error('未选择目录');
        const entryHandle = await this.currentHandle.getFileHandle(name, { create: false });
        await entryHandle.remove();
        console.log(`文件/文件夹 "${name}" 删除成功。`);
    }

    async copyEntry(name) {
        const entryHandle = await this.currentHandle.getFileHandle(name);
        const newName = `Copy_of_${name}`;
        await entryHandle.move(this.currentHandle, { newName });
        console.log(`文件/文件夹 "${name}" 已复制为 "${newName}"`);
    }
}

const fileMaster = new FileManager();
export default fileMaster;