import { ExtensionContext, window, workspace, debug, commands } from "vscode";
import { join } from "path";
import { homedir } from "os";
import { RecentFilesProvider } from "./recent-files-provider";
import { Statistics, RecordStatistics } from "./statistics";
import { LogFile } from "./logfile";

export function activate(context: ExtensionContext) {
  /**
   * ログファイル操作を行うクラスのインスタンスとログファイルの生成
   */
  const logFile = new LogFile();
  logFile.startupLogFile();

  /**
   * TreeViewで最近開いたファイルを表示する
   */
  const recentFilesProvider = new RecentFilesProvider();
  window.registerTreeDataProvider("recentFiles", recentFilesProvider);

  /**
   * TreeView内にあるコマンドの登録
   */
  commands.registerCommand("recentFiles.openFile", (filePath: string) => {
    workspace.openTextDocument(filePath).then((doc) => {
      window.showTextDocument(doc);
    });
  });

  /**
   * ソースファイルを新規作成した日時と拡張子を取得する
   */
  workspace.onDidCreateFiles((event) => {
    window.showInformationMessage("新しいソースファイルを作成しました");
    const action = "Create";
    const file = event.files[0];
    const filePath = file.fsPath;
    logFile.wrightLogFile(action, filePath);
  });

  /**
   * ソースファイルを開いた日時と拡張子を取得する
   */
  workspace.onDidOpenTextDocument((event) => {
    window.showInformationMessage("ソースファイルを開きました");
    const action = "Open";
    const filePath = event.fileName;
    logFile.wrightLogFile(action, filePath);
    recentFilesProvider.refresh();
  });

  /**
   * 編集前のテキストを保持するMap
   */
  let documentTextMap: Map<string, string> = new Map();

  /**
   * ソースファイルに変更があった瞬間に、その時点のテキストを取得する
   */
  workspace.onDidChangeTextDocument((event) => {
    const text = event.document.getText();
    const filePath = event.document.fileName;
    if (!documentTextMap.has(filePath)) {
      documentTextMap.set(filePath, text);
    }
  });

  /**
   * ソースファイル保存時に編集前後のテキストを比較し、編集行数を取得する
   */
  workspace.onDidSaveTextDocument((event) => {
    window.showInformationMessage("ソースファイルを保存しました");
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
  debug.onDidTerminateDebugSession(() => {
    window.showInformationMessage("デバッグを終了しました");
    const action = "EndDebug";
    const activeTextEditor = window.activeTextEditor;
    if (activeTextEditor) {
      const filePath = activeTextEditor.document.fileName;
      logFile.wrightLogFile(action, filePath);
    } else {
      window.showInformationMessage("アクティブなエディタがありません。");
    }
  });

  /**
   * 拡張子毎にファイル数・編集行数の統計を取得する
   */
  commands.registerCommand("extension.getStatistics", () => {
    /**
     * 統計データを管理するクラスのインスタンスを生成する
     */
    const statistics = new Statistics();
    const recordStatistics = new RecordStatistics();

    const logDirPath = join(homedir(), ".config", "codehabit", "logs");
    const logFilePath = join(logDirPath, "logfile.txt");
    try {
      const statisticsData = statistics.getStatistics(logFilePath);
      recordStatistics.wrightStatisticsFile(statisticsData);
      window.showInformationMessage("統計情報を取得しました");
    } catch (error) {
      console.error("getStatisticsCommand!!!\n" + error);
      window.showErrorMessage("統計情報の取得に失敗しました");
    }
  });

  /**
   * 統計情報を更新する
   */
  const interval = 5 * 60 * 1000;
  setInterval(() => {
    commands.executeCommand("extension.getStatistics");
  }, interval);
}

// This method is called when your extension is deactivated
export function deactivate() {}
