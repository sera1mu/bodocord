export interface IBCDiceOriginalTable {
  /**
   * Table title
   */
  readonly title: string;

  /**
   * Dice command
   */
  readonly command: string;

  /**
   * Table items
   */
  readonly items: string[];
}

/**
 * Store BCDice Original Table with object
 */
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
   * Convert table to text for BCDice (URI encoded)
   */
  toBCDiceText(): string {
    const length = this.items.length;
    let parsedItems = "";

    for (const item of this.items) {
      const index = this.items.indexOf(item) + 1;

      // If the item is last, don't include enter
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
