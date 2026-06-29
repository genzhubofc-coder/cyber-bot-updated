const axios = require('axios');

module.exports = {
  config: {
    name: "say",
    aliases: ["voice"],
    version: "2.5",
    author: "ST | Sheikh Tamim",
    countDown: 1,
    role: 0,
    shortDescription: "say something in Bengali",
    longDescription: "Generate voice from text, defaults to Bengali.",
    category: "Voice Generator",
    guide: {
      en: "{pn} [text] (default is Bengali)\nExample: {pn} কেমন আছো"
    }
  },

  onStart: async function ({ api, message, args, event }) {
    // ডিফল্ট ভাষা বাংলা (bn) সেট করা হয়েছে
    let lng = "bn";
    let say;

    if (args.length === 0) {
      return message.reply("দয়া করে কিছু টেক্সট লিখুন।");
    }

    // যদি ইউজার অন্য কোনো ভাষা কোড দেয় (যেমন: .say en hello)
    if (ln.includes(args[0].toLowerCase())) {
      lng = args[0].toLowerCase();
      args.shift();
      say = encodeURIComponent(args.join(" "));
    } else {
      say = encodeURIComponent(args.join(" "));
    }

    try {
      let url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lng}&client=tw-ob&q=${say}`;
      
      await message.reply({
        body: "",
        attachment: await global.utils.getStreamFromURL(url)
      });
    } catch (e) {
      console.log(e);
      message.reply(`ভয়েস জেনারেট করতে সমস্যা হয়েছে।`);
    }
  }
};

const ln = [
  "af", "sq", "ar", "ay", "eu", "bn", "bs", "bg", "my", "ca", "km", "ch", "ce", "hr", "cs", "da", "dv", "nl", "en", "et", "fi", "fr", "de", "el", "gu", "he", "hu", "is", "id", "it", "ja", "jv", "kn", "kr", "ks", "kk", "rw", "kv", "kg", "ko", "kj", "ku", "ky", "lo", "la", "lv", "lb", "li", "ln", "lt", "lu", "mk", "mg", "ms", "ml", "mt", "gv", "mi", "mr", "mh", "ro", "mn", "na", "nv", "nd", "ng", "ne", "se", "no", "nb", "nn", "ii", "oc", "oj", "or", "om", "os", "pi", "pa", "ps", "fa", "pl", "pt", "qu", "rm", "rn", "ru", "sm", "sg", "sa", "sc", "sr", "sn", "sd", "si", "sk", "sl", "so", "st", "nr", "es", "su", "sw", "ss", "sv", "tl", "ty", "tg", "ta", "tt", "te", "th", "bo", "ti", "to", "ts", "tn", "tr", "tk", "tw", "ug", "uk", "ur", "uz", "ve", "vi", "vo", "wa", "cy", "fy", "wo", "xh", "yi", "yo", "za", "zu"
];
