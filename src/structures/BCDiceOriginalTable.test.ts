import BCDiceOriginalTable from "./BCDiceOriginalTable.ts";
import { assertEquals } from "std/testing/asserts";

Deno.test("BCDiceOriginalTable: toBCDiceText", () => {
  const exceptedTable = "TestTable\n1D6\n1:A\n2:あ\n3:b\n4:び\n5:★\n6:＊";
  const actualTable = new BCDiceOriginalTable({
    title: "TestTable",
    command: "1D6",
    items: ["A", "あ", "b", "び", "★", "＊"],
  }).toBCDiceText();

  console.log(actualTable);

  assertEquals(actualTable, exceptedTable);
});
