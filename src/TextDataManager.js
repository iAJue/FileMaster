class TextDataManager {
    constructor(text = '') {
        this.text = text || ''; // 确保文本为字符串
    }

    // 确保参数为字符串
    validateString(input) {
        if (typeof input !== 'string') {
            throw new TypeError(`Expected a string, but received ${typeof input}`);
        }
    }

    // 1. 文本统计功能
    wordCount() {
        this.validateString(this.text);
        return this.text.trim().split(/\s+/).length;
    }

    charCount(excludeSpaces = false) {
        this.validateString(this.text);
        return excludeSpaces ? this.text.replace(/\s/g, '').length : this.text.length;
    }

    sentenceCount() {
        this.validateString(this.text);
        return this.text.split(/[.!?]+/).filter(Boolean).length;
    }

    paragraphCount() {
        this.validateString(this.text);
        return this.text.split(/\n+/).filter(Boolean).length;
    }

    // 2. 文本格式化功能
    capitalizeWords() {
        this.validateString(this.text);
        this.text = this.text.replace(/\b\w/g, char => char.toUpperCase());
        return this.text;
    }

    capitalizeSentences() {
        this.validateString(this.text);
        this.text = this.text.replace(/(^\s*\w|[.!?]\s*\w)/g, char => char.toUpperCase());
        return this.text;
    }

    limitLines(maxLines) {
        this.validateString(this.text);
        const lines = this.text.split('\n');
        if (lines.length > maxLines) {
            this.text = lines.slice(0, maxLines).join('\n');
        }
        return this.text;
    }

    // 3. 高级查找替换功能
    highlightText(search, className = 'highlight') {
        this.validateString(this.text);
        const regex = new RegExp(search, 'g');
        this.text = this.text.replace(regex, `<span class="${className}">$&</span>`);
        return this.text;
    }

    findRepeatedWords() {
        this.validateString(this.text);
        const words = this.text.toLowerCase().split(/\s+/);
        const repeats = words.filter((word, index) => words.indexOf(word) !== index);
        return [...new Set(repeats)];
    }

    advancedReplace(searchPattern, replacement) {
        this.validateString(this.text);
        if (!(searchPattern instanceof RegExp)) {
            throw new TypeError('searchPattern must be a RegExp.');
        }
        this.text = this.text.replace(searchPattern, replacement);
        return this.text;
    }

    // 4. 文本分析功能
    wordFrequency() {
        this.validateString(this.text);
        const words = this.text.toLowerCase().match(/\b\w+\b/g);
        const frequencies = {};
        words.forEach(word => {
            frequencies[word] = (frequencies[word] || 0) + 1;
        });
        return frequencies;
    }

    detectSentiment() {
        this.validateString(this.text);
        const positiveWords = ['good', 'great', 'happy', 'positive'];
        const negativeWords = ['bad', 'sad', 'negative', 'terrible'];
        let score = 0;
        this.text.toLowerCase().split(/\s+/).forEach(word => {
            if (positiveWords.includes(word)) score++;
            if (negativeWords.includes(word)) score--;
        });
        return score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral';
    }

    detectLanguage() {
        this.validateString(this.text);
        // 简单语言检测示例（实际生产中可使用第三方库）
        const englishLetters = this.text.match(/[a-z]/gi)?.length || 0;
        const chineseCharacters = this.text.match(/[\u4e00-\u9fa5]/g)?.length || 0;
        if (chineseCharacters > englishLetters) return 'Chinese';
        return 'English';
    }

    // 5. 更多文本转换功能
    markdownToHTML() {
        this.validateString(this.text);
        // 简单转换：实际生产中可使用更强大的 Markdown 库
        return this.text.replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
            .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
            .replace(/\*(.*)\*/gim, '<i>$1</i>')
            .replace(/!\[(.*?)\]\((.*?)\)/gim, "<img alt='$1' src='$2' />")
            .replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2'>$1</a>")
            .replace(/\n$/gim, '<br />');
    }

    htmlToMarkdown() {
        this.validateString(this.text);
        return this.text.replace(/<h1>(.*?)<\/h1>/gim, '# $1')
            .replace(/<h2>(.*?)<\/h2>/gim, '## $1')
            .replace(/<h3>(.*?)<\/h3>/gim, '### $1')
            .replace(/<b>(.*?)<\/b>/gim, '**$1**')
            .replace(/<i>(.*?)<\/i>/gim, '*$1*')
            .replace(/<blockquote>(.*?)<\/blockquote>/gim, '> $1')
            .replace(/<img alt='(.*?)' src='(.*?)' \/>/gim, '![Alt text]($2)')
            .replace(/<a href='(.*?)'>(.*?)<\/a>/gim, '[$2]($1)')
            .replace(/<br \/>/gim, '\n');
    }

    // 6. 文本加密/解密（简单 Caesar 加密）
    caesarEncrypt(shift) {
        this.validateString(this.text);
        return this.text.replace(/[a-z]/gi, char => {
            const code = char.charCodeAt(0);
            const base = code >= 65 && code <= 90 ? 65 : 97;
            return String.fromCharCode(((code - base + shift) % 26) + base);
        });
    }

    caesarDecrypt(shift) {
        return this.caesarEncrypt(-shift);
    }

    // 7. 增强的文件操作（处理大文件或递归操作文件夹）
    async processLargeFile(fileHandle, processCallback) {
        const file = await fileHandle.getFile();
        const reader = file.stream().getReader();
        let result;
        while (!(result = await reader.read()).done) {
            processCallback(result.value);
        }
    }

    async traverseDirectory(directoryHandle, processCallback) {
        for await (const entry of directoryHandle.values()) {
            if (entry.kind === 'file') {
                const file = await entry.getFile();
                processCallback(file);
            } else if (entry.kind === 'directory') {
                await this.traverseDirectory(entry, processCallback);
            }
        }
    }
}

// 导出类
export default TextDataManager;