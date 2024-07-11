"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecordStatistics = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const os_1 = require("os");
class RecordStatistics {
    wrightStatisticsFile(statisticsMap) {
        const statisticsDirPath = (0, path_1.join)((0, os_1.homedir)(), ".config", "Habbit", "statistics");
        if (!(0, fs_1.existsSync)(statisticsDirPath)) {
            (0, fs_1.mkdirSync)(statisticsDirPath, { recursive: true });
            console.log("make Directory");
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
            console.log("write statistics file");
        }
        catch (error) {
            console.error(error);
        }
    }
}
exports.RecordStatistics = RecordStatistics;
//# sourceMappingURL=record-statistics.js.map