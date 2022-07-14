import { crypto } from "std/crypto";
import { Interaction } from "harmony";

/**
 * テキストからMD5ハッシュを生成する
 */
export async function generateMD5Hash(
  text: string,
) {
  const encodedText = new TextEncoder().encode(text); // Encode text
  const hashBuffer = await crypto.subtle.digest("MD5", encodedText); // Digest encoded text
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // Convert buffer to byte array
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join(
    "",
  ); // Convert bytes to HEX string

  return hashHex;
}

/**
 * HarmonyのInteractionからMD5ハッシュを生成する
 *
 * ログからエラーを簡単に検索するために使用されます。
 */
export async function generateInteractionErrorHash(i: Interaction) {
  const text = `t:${i.timestamp.toString},g:${i.guild?.id},c:${i.channel
    ?.id},i:${i.id}`; // t = timestamp, g = guild id, c = channel id, i = interaction id
  const hash = await generateMD5Hash(text);

  return hash;
}
