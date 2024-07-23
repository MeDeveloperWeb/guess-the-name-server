import Word from "../models/words.js";

export async function getRandomWord() {
    const [{ word }] = await Word.aggregate([{ $sample: { size: 1 } }]);

    return word;
}
