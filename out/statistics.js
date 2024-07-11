"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecordStatistics = exports.Statistics = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const os_1 = require("os");
class Statistics {
    /**
     * インスタンス
     */
    statisticsMap = new Map();
    /**
     * コンストラクタ
     */
    constructor() {
        this.statisticsMap = new Map();
    }
    /**
     * 統計情報を返すメソッド
     * @returns Map<string, Map<string, number>>
     */
    getStatistics(logFilePath) {
        const returnMap = this.statisticsMap;
        try {
            const allLogData = (0, fs_1.readFileSync)(logFilePath, "utf-8");
            const lineOfLogData = allLogData.split("\n");
            for (const logEntries of lineOfLogData) {
                const logEntriesList = logEntries.split(",");
                const action = logEntriesList[0];
                const unavoidableCount = logEntriesList[2];
                const addCount = parseInt(unavoidableCount, 10);
                if (returnMap.has(action)) {
                    const countMap = returnMap.get(logEntriesList[0]);
                    const ext = (0, path_1.extname)(logEntriesList[1]);
                    if (countMap?.has(ext)) {
                        const existsCount = countMap.get(ext);
                        countMap.set(ext, existsCount ? existsCount + addCount : 1);
                        returnMap.set(action, countMap);
                    }
                    else {
                        countMap?.set(ext, addCount);
                        returnMap.set(action, countMap ? countMap : new Map());
                    }
                }
                else {
                    const countMap = new Map();
                    const ext = (0, path_1.extname)(logEntriesList[1]);
                    countMap.set(ext, addCount);
                    returnMap.set(action, countMap);
                }
            }
        }
        catch (error) {
            console.error("statistics!!!\n" + error);
        }
        return returnMap;
    }
}
exports.Statistics = Statistics;
/**
 * 統計情報をファイルに書き込むクラス
 */
class RecordStatistics {
    wrightStatisticsFile(statisticsMap) {
        const statisticsDirPath = (0, path_1.join)((0, os_1.homedir)(), ".config", "codehabit", "statistics");
        if (!(0, fs_1.existsSync)(statisticsDirPath)) {
            (0, fs_1.mkdirSync)(statisticsDirPath, { recursive: true });
        }
        const statisticsFilePath = (0, path_1.join)(statisticsDirPath, "statistics-data.txt");
        try {
            let statisticsMessage = "";
            for (const [action, countMap] of statisticsMap) {
                statisticsMessage += action + "\n";
                for (const [ext, count] of countMap) {
                    statisticsMessage += "-" + ext + ":" + count + "\n";
                }
            }
            (0, fs_1.writeFileSync)(statisticsFilePath, statisticsMessage);
        }
        catch (error) {
            console.error(error);
        }
    }
}
exports.RecordStatistics = RecordStatistics;
//# sourceMappingURL=statistics.js.map