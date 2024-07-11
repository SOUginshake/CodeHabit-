"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode_1 = require("vscode");
const path_1 = require("path");
const os_1 = require("os");
const recent_files_provider_1 = require("./recent-files-provider");
const statistics_1 = require("./statistics");
const logfile_1 = require("./logfile");
function activate(context) {
    /**
     * ログファイル操作を行うクラスのインスタンス
     */
    const logFile = new logfile_1.LogFile();
    /**
     * TreeViewで最近開いたファイルを表示する
     */
    const recentFilesProvider = new recent_files_provider_1.RecentFilesProvider();
    vscode_1.window.registerTreeDataProvider("recentFiles", recentFilesProvider);
    /**
     * TreeView内にあるコマンドの登録
     */
    vscode_1.commands.registerCommand("recentFiles.openFile", (filePath) => {
        vscode_1.workspace.openTextDocument(filePath).then((doc) => {
            vscode_1.window.showTextDocument(doc);
        });
    });
    /**
     * ソースファイルを新規作成した日時と拡張子を取得する
     */
    vscode_1.workspace.onDidCreateFiles((event) => {
        vscode_1.window.showInformationMessage("新しいソースファイルを作成しました");
        const action = "Create";
        const file = event.files[0];
        const filePath = file.fsPath;
        logFile.wrightLogFile(action, filePath);
    });
    /**
     * ソースファイルを開いた日時と拡張子を取得する
     */
    vscode_1.workspace.onDidOpenTextDocument((event) => {
        vscode_1.window.showInformationMessage("ソースファイルを開きました");
        const action = "Open";
        const filePath = event.fileName;
        logFile.wrightLogFile(action, filePath);
        recentFilesProvider.refresh();
    });
    /**
     * 編集前のテキストを保持するMap
     */
    let documentTextMap = new Map();
    /**
     * ソースファイルに変更があった瞬間に、その時点のテキストを取得する
     */
    vscode_1.workspace.onDidChangeTextDocument((event) => {
        const text = event.document.getText();
        const filePath = event.document.fileName;
        if (!documentTextMap.has(filePath)) {
            documentTextMap.set(filePath, text);
        }
    });
    /**
     * ソースファイル保存時に編集前後のテキストを比較し、編集行数を取得する
     */
    vscode_1.workspace.onDidSaveTextDocument((event) => {
        vscode_1.window.showInformationMessage("ソースファイルを保存しました");
        const filePath = event.fileName;
        const previousText = documentTextMap.get(filePath);
        const currentText = event.getText();
        const action = "Save";
        logFile.wrightLogFile(action, filePath);
        if (previousText !== undefined) {
            logFile.changeLineCount(previousText, currentText, filePath);
            documentTextMap.delete(filePath);
        }
    });
    /**
     * デバッグ終了した日時を取得する
     */
    vscode_1.debug.onDidTerminateDebugSession(() => {
        vscode_1.window.showInformationMessage("デバッグを終了しました");
        const action = "EndDebug";
        const activeTextEditor = vscode_1.window.activeTextEditor;
        if (activeTextEditor) {
            const filePath = activeTextEditor.document.fileName;
            logFile.wrightLogFile(action, filePath);
        }
        else {
            vscode_1.window.showInformationMessage("アクティブなエディタがありません。");
        }
    });
    /**
     * 拡張子毎にファイル数・編集行数の統計を取得する
     */
    vscode_1.commands.registerCommand("extension.getStatistics", () => {
        /**
         * 統計データを管理するクラスのインスタンスを生成する
         */
        const statistics = new statistics_1.Statistics();
        const recordStatistics = new statistics_1.RecordStatistics();
        const logDirPath = (0, path_1.join)((0, os_1.homedir)(), ".config", "codehabit", "logs");
        const logFilePath = (0, path_1.join)(logDirPath, "logfile.txt");
        try {
            const statisticsData = statistics.getStatistics(logFilePath);
            recordStatistics.wrightStatisticsFile(statisticsData);
            vscode_1.window.showInformationMessage("統計情報を取得しました");
        }
        catch (error) {
            console.error("getStatisticsCommand!!!\n" + error);
            vscode_1.window.showErrorMessage("統計情報の取得に失敗しました");
        }
    });
    /**
     * 統計情報を更新する
     */
    const interval = 5 * 60 * 1000;
    setInterval(() => {
        vscode_1.commands.executeCommand("extension.getStatistics");
    }, interval);
}
// This method is called when your extension is deactivated
function deactivate() { }
//# sourceMappingURL=extension.js.map