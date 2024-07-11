"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecentFilesProvider = void 0;
const vscode_1 = require("vscode");
const fs_1 = require("fs");
const path_1 = require("path");
const os_1 = require("os");
const MAX_LOG_SIZE = 10;
class RecentFileItem extends vscode_1.TreeItem {
    label;
    filePath;
    constructor(label, filePath) {
        super(label, vscode_1.TreeItemCollapsibleState.None);
        this.label = label;
        this.filePath = filePath;
        this.tooltip = this.filePath;
        this.command = {
            command: "recentFiles.openFile",
            title: "Open File",
            arguments: [this.filePath],
        };
    }
}
class RecentFilesProvider {
    _onDidChangeTreeData = new vscode_1.EventEmitter();
    onDidChangeTreeData = this._onDidChangeTreeData.event;
    recentFiles = [];
    logDirPath = (0, path_1.join)((0, os_1.homedir)(), ".config", "codehabit", "logs");
    logFilePath = "";
    constructor() {
        /**
         * 初期データのロード
         */
        this.logFilePath = (0, path_1.join)(this.logDirPath, "logfile.txt");
        this.loadRecentFiles();
    }
    refresh() {
        this.loadRecentFiles();
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (element) {
            return Promise.resolve([]);
        }
        else {
            return Promise.resolve(this.recentFiles);
        }
    }
    loadRecentFiles() {
        const filePaths = this.getOpenFilePaths(this.logFilePath);
        this.recentFiles = filePaths
            .reverse()
            .slice(0, MAX_LOG_SIZE)
            .map((filePath) => new RecentFileItem((0, path_1.basename)(filePath), filePath));
    }
    getOpenFilePaths(logFilePath) {
        const logData = (0, fs_1.readFileSync)(logFilePath, "utf-8");
        const lineOfLogData = logData.split("\n");
        const openFilePaths = [];
        for (const logEntries of lineOfLogData) {
            const logEntriesList = logEntries.split(",");
            if (logEntriesList[0] === "Open") {
                openFilePaths.push(logEntriesList[1]);
            }
        }
        return openFilePaths;
    }
}
exports.RecentFilesProvider = RecentFilesProvider;
//# sourceMappingURL=recent-files-provider.js.map