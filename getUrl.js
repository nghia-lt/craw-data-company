const axios = require("axios");
const fs = require("fs");
const path = require("path");

(async () => {
  const url = "https://www.tratencongty.com/tinh-vinh-phuc/";

  let linksCompany = [];
  for (let i = 1; i < 347; i++) {
    const url = `https://www.tratencongty.com/tinh-vinh-phuc/?page=${i}`;

    const { status, data } = await axios.get(url);

    // Regex để tìm giá trị href
    const regex = /<a[^>]*href="([^"]*)"/g;

    let match;
    const links = [];

    // Lặp qua tất cả các kết quả khớp
    while ((match = regex.exec(data)) !== null) {
      if (
        match[1].startsWith("https://www.tratencongty.com/company") &&
        !links.includes(match[1])
      ) {
        links.push(match[1]); // match[1] chứa giá trị trong href
      }
    }
    linksCompany = [...linksCompany, ...links];
  }

  // Kết quả
  console.log(linksCompany.length);
  try {
    fs.writeFileSync(
      path.join(__dirname, "./urlCompany.json"),
      JSON.stringify(linksCompany, null, 2),
      "utf8"
    );
    console.log('Dữ liệu JSON đã được ghi vào file "urlCompany.json".');
  } catch (err) {
    console.error("Lỗi khi ghi file:", err);
  }
})();
