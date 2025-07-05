const axios = require("axios");

async function tiktokDl(url) {
  try {
    const res = await axios.get(`https://api.tiklydown.me/api/download?url=${encodeURIComponent(url)}`);
    return {
      nowm: res.data.video[0], // video tanpa watermark
    };
  } catch {
    return null;
  }
}

module.exports = { tiktokDl };
