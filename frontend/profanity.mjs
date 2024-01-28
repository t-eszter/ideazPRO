// profanity.mjs
import { ProfanityEngine } from "@coffeeandfun/google-profanity-words";

function removePunctuation(text) {
  // regular expression to match and remove punctuation
  return text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
}

async function containsProfanity(text) {
  // remove punctuation from text
  const cleanedText = removePunctuation(text);

  // create an instance of ProfanityEngine
  const profanity = new ProfanityEngine({ language: "en" });

  // check cleaned text for profanity
  return await profanity.hasCurseWords(cleanedText);
}

// get text from command-line argument
let text = process.argv[2];

containsProfanity(text).then((isProfane) => {
  if (isProfane) {
    console.log("Profanity detected!");
  } else {
    console.log("No profanity detected.");
  }
});
