//profanity.js
import { ProfanityEngine } from "@coffeeandfun/google-profanity-words";

async function containsProfanity(text) {
  const profanity = new ProfanityEngine({ language: "en" }); // or any other language
  return await profanity.hasCurseWords(text);
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
