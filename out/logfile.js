"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogFile = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const os_1 = require("os");
const diff_1 = require("diff");
class LogFile {
    /**
     * ファイル操作をログファイルに書き込む
     * @param event
     */
    wrightLogFile(action, filePath) {
        const logDirPath = (0, path_1.join)((0, os_1.homedir)(), ".config", "codehabit", "logs");
        if (!(0, fs_1.existsSync)(logDirPath)) {
            (0, fs_1.mkdirSync)(logDirPath, { recursive: true });
        }
        const logFilePath = (0, path_1.join)(logDirPath, "logfile.txt");
        try {
            const creationTime = new Date().toLocaleString();
            /**
             * ログファイルが存在しないときに新規作成するように
             */
            let existsText = "";
            if (!(0, fs_1.existsSync)(logFilePath)) {
                (0, fs_1.writeFileSync)(logFilePath, "");
            }
            else {
                existsText = (0, fs_1.readFileSync)(logFilePath, "utf-8");
            }
            /**
             * ログメッセージの作成
             */
            const logMessage = existsText +
                action +
                "," +
                filePath +
                ",1,Time," +
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
     * カウントがなんか違うの気になる！余裕あったら直す！7/2
     */
    changeLineCount(previousText, currentText, filePath) {
        const logDirPath = (0, path_1.join)((0, os_1.homedir)(), ".config", "codehabit", "logs");
        const logFilePath = (0, path_1.join)(logDirPath, "logfile.txt");
        const changes = (0, diff_1.diffLines)(previousText, currentText);
        let changeCount = 0;
        try {
            changes.forEach((change) => {
                if (change.added) {
                    console.log("change value", change.value);
                    const lines = change.value.split("\n").slice(0, -1).length;
                    console.log("lines", lines);
                    changeCount += lines;
                }
            });
            /**
             * ログメッセージの作成
             */
            const existsText = (0, fs_1.readFileSync)(logFilePath, "utf-8");
            const logMessage = existsText + "ChangeLineCount," + filePath + "," + changeCount + ",\n";
            console.log("ChangeLineCount", changeCount);
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
exports.LogFile = LogFile;
//# sourceMappingURL=logfile.js.map