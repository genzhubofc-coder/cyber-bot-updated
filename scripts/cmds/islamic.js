module.exports = {
  config: {
    name: "islamic",
    version: "7.0",
    author: "Ullash ッ",
    countDown: 5,
    role: 0,
    shortDescription: "all video ðŸ“·",
    longDescription: "",
    category: "Video",
    guide: "{pn}"
  },
   onStart: async function ({ message }) {
   var ULLASH= ["https://files.catbox.moe/4llexm.mp4",
"https://files.catbox.moe/jffhdq.mp4",
"https://files.catbox.moe/fnnlv3.mp4",
"https://files.catbox.moe/7bgriy.mp4",
"https://files.catbox.moe/jh164f.mp4",
"https://files.catbox.moe/9j9car.mp4",
"https://files.catbox.moe/3jy5uw.mp4",
"https://files.catbox.moe/sk5ui2.mp4",
"https://files.catbox.moe/sv7rhb.mp4",
"https://files.catbox.moe/v6x96j.mp4",
"https://files.catbox.moe/x9owq7.mp4",
"https://files.catbox.moe/o6f4yx.mp4",
"https://files.catbox.moe/f21glv.mp4",
"https://files.catbox.moe/j42gdr.mp4",
"https://files.catbox.moe/6765bi.mp4",
"https://files.catbox.moe/25jg3v.mp4",
"https://files.catbox.moe/b618mk.mp4",
"https://files.catbox.moe/471bvs.mp4",
"https://files.catbox.moe/g8xfhm.mp4",
"https://files.catbox.moe/f8g91e.mp4",
"https://files.catbox.moe/sykgrc.mp4",
"https://files.catbox.moe/oefx0q.mp4",
"https://files.catbox.moe/glf1yq.mp4",
"https://files.catbox.moe/py90y3.mp4",
"https://files.catbox.moe/3zziqz.mp4",
"https://files.catbox.moe/eyfohk.mp4",
"https://files.catbox.moe/nbnbhr.mp4",
"https://files.catbox.moe/xwsweu.mp4",
"https://files.catbox.moe/vmj0ns.mp4",
"https://files.catbox.moe/odew3i.mp4",
"https://files.catbox.moe/uo62s0.mp4",
"https://files.catbox.moe/brqi6n.mp4",
"https://files.catbox.moe/diugdv.mp4",
"https://files.catbox.moe/etiv81.mp4",
]

let msg = ULLASH[Math.floor(Math.random()*ULLASH.length)]
message.send({
  body: 'video made by S　A　K　I　B　ツ',attachment: await global.utils.getStreamFromURL(msg)
})
}
     }
