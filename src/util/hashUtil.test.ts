import { assertStrictEquals } from "std/testing/asserts";
import { describe, it } from "std/testing/bdd";
import { generateMD5Hash } from "./hashUtil.ts";

describe("hashUtil", () => {
  it("generateMD5Hash", async () => {
    const originalText = "chocolate is yummy! it is 129 yen!";
    const exceptedHash = "41099b5403c1b621f13bfbbceec04b4e";
    const actualHash = await generateMD5Hash(originalText);

    assertStrictEquals(actualHash, exceptedHash);
  });
});
