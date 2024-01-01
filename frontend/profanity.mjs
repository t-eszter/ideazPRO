import { ProfanityEngine } from "@coffeeandfun/google-profanity-words";

function removePunctuation(text) {
  // Regular expression to match and remove punctuation
  return text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
}

function isObfuscatedProfanity(word) {
  // Regular expression pattern for 'motherfucker' with obfuscations
  const pattern = /m[o0]{1,}th[e3]{1,}rf[u*]{2,}ck[e3]{1,}r/i;
  return pattern.test(word);
}

async function containsProfanity(text) {
  // Remove punctuation from the text
  const cleanedText = removePunctuation(text);

  // Split the text into words
  const words = cleanedText.split(/\s+/);

  // Check each word for regular and obfuscated profanity
  for (const word of words) {
    if (isObfuscatedProfanity(word)) {
      return true;
    }
  }

  const profanity = new ProfanityEngine({ language: "en" }); // or any other language
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
