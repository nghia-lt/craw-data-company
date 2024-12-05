const axios = require("axios");
const fs = require("fs");
const Tesseract = require("tesseract.js");
const path = require("path");

const urls = require(path.join(__dirname, "./url.json"));
const datas = require(path.join(__dirname, "./output.json"));

(async () => {
  for await (let url of urls) {
    const exist = datas.find((ele) => ele.url === url);
    if (!exist) {
      let data = "";
      try {
        const { data: dataResponse } = await axios.get(url);
        data = dataResponse;
      } catch (error) {
        console.log("GET : " + url + " ERROR");
      }

      // lấy tên cty
      let name = "";
      const matchName = data.match(/title="([^"]*)"/);

      if (matchName) {
        name = matchName[1];
      }

      // lấy địa chỉ
      let address = "";
      const matchAddress = data.match(/Địa chỉ: ([^"]*)<br\/>\r/);

      if (matchAddress) {
        address = matchAddress[1];
      }

      // lấy sđt
      let dataPhone = null;

      const regexPhone = /sở: <img[^>]*src="([^"]*)"/g;
      let matchPhone;
      // Lặp qua tất cả các kết quả khớp
      while ((matchPhone = regexPhone.exec(data)) !== null) {
        if (matchPhone[1].startsWith("data:image/png;base64")) {
          dataPhone = matchPhone[1];
        }
      }

      let phone = "";
      if (dataPhone) {
        // Gọi OCR với Base64
        await Tesseract.recognize(
          dataPhone, // Base64 image string
          "eng" // Ngôn ngữ OCR (tiếng Anh - 'eng')
        ).then(({ data: { text } }) => {
          phone = text.split(" ").join("").slice(0, 10);
        });
      }

      const info = {
        url,
        name,
        address,
        phone,
      };
      console.log(info);
      if (name.length) {
        datas.push(info);
        try {
          fs.writeFileSync(
            path.join(__dirname, "./output.json"),
            JSON.stringify(datas, null, 2),
            "utf8"
          );
        } catch (err) {
          console.error("Lỗi khi ghi file:", err);
        }
      }
    }
  }
})();
