const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const app = express();
const PORT = 3000;

app.use(express.static("public"));
app.use(bodyParser.json());

app.post("/submit", (req, res) => {
  const { date, hours } = req.body;

  const [day, month, year] = date.split("-");
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthHeading = `${monthNames[parseInt(month) - 1]}'${year}`;

  const entry = `${day}-${month}-${year}: ${hours}\n`;

  let fileContent = "";
  try {
    fileContent = fs.readFileSync("work_done.txt", "utf8");
  } catch (err) {
    fileContent = "";
  }

  if (!fileContent.includes(monthHeading)) {
    fileContent += `\n${monthHeading}\n`;
  }

  const newContent = fileContent.replace(
    new RegExp(`(${monthHeading}\\n)((?:.*\\n)*)`, "m"),
    `$1$2${entry}`
  );

  fs.writeFileSync("work_done.txt", newContent, "utf8");
  res.json({ message: "Work logged successfully" });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
