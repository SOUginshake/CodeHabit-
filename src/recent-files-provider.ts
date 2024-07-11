import {
  TreeItem,
  TreeItemCollapsibleState,
  TreeDataProvider,
  Event,
  EventEmitter,
} from "vscode";
import { readFileSync } from "fs";
import { join, basename } from "path";
import { homedir } from "os";

const MAX_LOG_SIZE = 10;

class RecentFileItem extends TreeItem {
  constructor(public readonly label: string, public readonly filePath: string) {
    super(label, TreeItemCollapsibleState.None);
    this.tooltip = this.filePath;
    this.command = {
      command: "recentFiles.openFile",
      title: "Open File",
      arguments: [this.filePath],
    };
  }
}

export class RecentFilesProvider implements TreeDataProvider<RecentFileItem> {
  private _onDidChangeTreeData: EventEmitter<
    RecentFileItem | undefined | null | void
  > = new EventEmitter<RecentFileItem | undefined | null | void>();
  readonly onDidChangeTreeData: Event<
    RecentFileItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  private recentFiles: RecentFileItem[] = [];
  private logDirPath: string = join(homedir(), ".config", "codehabit", "logs");
  private logFilePath: string = "";

  constructor() {
    /**
     * 初期データのロード
     */
    this.logFilePath = join(this.logDirPath, "logfile.txt");
    this.loadRecentFiles();
  }

  refresh(): void {
    this.loadRecentFiles();
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: RecentFileItem): TreeItem {
    return element;
  }

  getChildren(element?: RecentFileItem): Thenable<RecentFileItem[]> {
    if (element) {
      return Promise.resolve([]);
    } else {
      return Promise.resolve(this.recentFiles);
    }
  }

  private loadRecentFiles() {
    const filePaths = this.getOpenFilePaths(this.logFilePath);
    this.recentFiles = filePaths
      .reverse()
      .slice(0, MAX_LOG_SIZE)
      .map((filePath) => new RecentFileItem(basename(filePath), filePath));
  }

  private getOpenFilePaths(logFilePath: string): string[] {
    const logData = readFileSync(logFilePath, "utf-8");
    const lineOfLogData = logData.split("\n");

    const openFilePaths: string[] = [];

    for (const logEntries of lineOfLogData) {
      const logEntriesList = logEntries.split(",");
      if (logEntriesList[0] === "Open") {
        openFilePaths.push(logEntriesList[1]);
      }
    }

    return openFilePaths;
  }
}
