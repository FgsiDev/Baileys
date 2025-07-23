import webpmux from "node-webpmux";

/**
 * input media @Buffer or @filepath image webp
 * output @Buffer
 */
export default async function writeExif(media, packname = "", publisher = "") {
  const stringJson = JSON.stringify({
    "sticker-pack-name": packname,
    "sticker-pack-publisher": publisher,
    emojis: [""],
  });
  const exifAttr = Buffer.from("SUkqAAgAAAABAEFXBwAAAAAAFgAAAA==", "base64");
  const jsonBuff = Buffer.from(stringJson, "utf8");
  const exif = Buffer.concat([exifAttr, jsonBuff]);
  exif.writeUIntLE(jsonBuff.length, 14, 4);

  const img = new webpmux.Image();
  await img.load(media);
  img.exif = exif;
  return img.save(null);
}
