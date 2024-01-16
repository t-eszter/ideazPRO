// profanity.mjs
import { ProfanityEngine } from "@coffeeandfun/google-profanity-words";

function removePunctuation(text) {
  // regular expression to match and remove punctuation
  return text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
}

async function containsProfanity(text) {
  // remove punctuation from the text
  const cleanedText = removePunctuation(text);

  // split the text into words
  const words = cleanedText.split(/\s+/);

  // check each word for regular and obfuscated profanity
  for (const word of words) {
    if (isObfuscatedProfanity(word)) {
      return true;
    }
  }

  const profanity = new ProfanityEngine({ language: "en" });
  return await profanity.hasCurseWords(cleanedText);
}

// Get text from command-line argument
let text = process.argv[2];

containsProfanity(text).then((isProfane) => {
  if (isProfane) {
    console.log("Profanity detected!");
  } else {
    console.log("No profanity detected.");
  }
});
