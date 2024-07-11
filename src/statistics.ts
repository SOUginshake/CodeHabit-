import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join, extname } from "path";
import { homedir } from "os";

export class Statistics {
  /**
   * インスタンス
   */
  private statisticsMap = new Map<string, Map<string, number>>();

  /**
   * コンストラクタ
   */
  constructor() {
    this.statisticsMap = new Map<string, Map<string, number>>();
  }

  /**
   * 統計情報を返すメソッド
   * @returns Map<string, Map<string, number>>
   */
  getStatistics(logFilePath: string) {
    const returnMap = this.statisticsMap;
    try {
      const allLogData = readFileSync(logFilePath, "utf-8");
      const lineOfLogData = allLogData.split("\n");

      for (const logEntries of lineOfLogData) {
        const logEntriesList = logEntries.split(",");
        const action = logEntriesList[0];
        const unavoidableCount = logEntriesList[2];
        const addCount = parseInt(unavoidableCount, 10);
        if (returnMap.has(action)) {
          const countMap = returnMap.get(logEntriesList[0]);
          const ext = extname(logEntriesList[1]);
          if (countMap?.has(ext)) {
            const existsCount = countMap.get(ext);
            countMap.set(ext, existsCount ? existsCount + addCount : 1);
            returnMap.set(action, countMap);
          } else {
            countMap?.set(ext, addCount);
            returnMap.set(action, countMap ? countMap : new Map());
          }
        } else {
          const countMap = new Map<string, number>();
          const ext = extname(logEntriesList[1]);
          countMap.set(ext, addCount);
          returnMap.set(action, countMap);
        }
      }
    } catch (error) {
      console.error("statistics!!!\n" + error);
    }

    return returnMap;
  }
}

/**
 * 統計情報をファイルに書き込むクラス
 */
export class RecordStatistics {
  wrightStatisticsFile(statisticsMap: Map<string, Map<string, number>>) {
    const statisticsDirPath = join(
      homedir(),
      ".config",
      "codehabit",
      "statistics"
    );

    if (!existsSync(statisticsDirPath)) {
      mkdirSync(statisticsDirPath, { recursive: true });
    }

    const statisticsFilePath = join(statisticsDirPath, "statistics-data.txt");
    try {
      let statisticsMessage = "";
      for (const [action, countMap] of statisticsMap) {
        statisticsMessage += action + "\n";
        for (const [ext, count] of countMap) {
          statisticsMessage += "-" + ext + ":" + count + "\n";
        }
      }
      writeFileSync(statisticsFilePath, statisticsMessage);
    } catch (error) {
      console.error(error);
    }
  }
}
