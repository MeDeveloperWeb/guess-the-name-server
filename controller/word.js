import Word from "../models/words.js";
import { getRandomWord } from "../utils/word.js";

export async function addWord(req, res, next) {
    try {
        const { words } = req.body;

        const doc = words.map((e) => ({ word: e }));

        Word.create(doc);

        res.status(200).send("Word added successfully!");
    } catch (error) {
        res.status(400).send("Invalid data");
    }
}

export async function getWord(req, res, next) {
    try {
        const word = await getRandomWord();

        res.send(word);
    } catch (error) {
        res.status(400).send(error.message);
    }
}
