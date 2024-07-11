"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WriteLogFile = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const os_1 = require("os");
const diff_1 = require("diff");
class WriteLogFile {
    /**
     * ファイル操作をログファイルに書き込む
     * @param event
     */
    wrightLogFile(action, filePath) {
        const logDirPath = (0, path_1.join)((0, os_1.homedir)(), ".config", "Habbit", "logs");
        if (!(0, fs_1.existsSync)(logDirPath)) {
            (0, fs_1.mkdirSync)(logDirPath, { recursive: true });
        }
        const logFilePath = (0, path_1.join)(logDirPath, "logfile.txt");
        try {
            const creationTime = new Date().toLocaleString();
            /**
             * ログメッセージの作成
             */
            const logMessage = (0, fs_1.readFileSync)(logFilePath) +
                action +
                "," +
                filePath +
                ",Time," +
                creationTime +
                ",\n";
            /**
             * 書き込み
             */
            (0, fs_1.writeFileSync)(logFilePath, logMessage);
        }
        catch (error) {
            console.error(error);
        }
    }
    /**
     * ファイルの編集行数を取得し、ログファイルに書き込む
     */
    changeLineCount(previousText, currentText) {
        const logFilePath = (0, path_1.join)(__dirname, "logfile.txt");
        const changes = (0, diff_1.diffLines)(previousText, currentText);
        let changeCount = 0;
        try {
            changes.forEach((change) => {
                if (change.added || change.removed) {
                    const lines = change.value.split("\n").length - 1;
                    changeCount += lines;
                }
            });
            /**
             * ログメッセージの作成
             */
            const logMessage = (0, fs_1.readFileSync)(logFilePath) + "ChangeLineCount," + changeCount + ",\n";
            /**
             * 書き込み
             */
            (0, fs_1.writeFileSync)(logFilePath, logMessage);
        }
        catch (error) {
            console.error(error);
        }
    }
}
exports.WriteLogFile = WriteLogFile;
//# sourceMappingURL=write-logfile.js.map