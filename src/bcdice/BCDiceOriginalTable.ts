export interface IBCDiceOriginalTable {
  readonly title: string;

  readonly command: string;

  readonly items: string[];
}

export default class BCDiceOriginalTable implements IBCDiceOriginalTable {
  readonly title: string;

  readonly command: string;

  readonly items: string[];

  constructor(table: IBCDiceOriginalTable) {
    ({
      title: this.title,
      command: this.command,
      items: this.items,
    } = table);
  }

  /**
   * テーブルをURI エンコードされた文字列に変換する
   */
  toBCDiceText(): string {
    const length = this.items.length;
    let parsedItems = "";

    for (const item of this.items) {
      const index = this.items.indexOf(item) + 1;

      if (length === index) {
        parsedItems += `${index}:${item}`;
      } else {
        parsedItems += `${index}:${item}\n`;
      }
    }

    const decodedData = `${this.title}\n${this.command}\n${parsedItems}`;
    const encodedData = encodeURI(decodedData);

    return encodedData;
  }
}
