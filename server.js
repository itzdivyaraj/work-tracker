const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

app.use(express.static("public"));
app.use(bodyParser.json());

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

const filePath = path.join(__dirname, "work_done.txt");
console.log("📄 Writing to file at:", filePath);

// ---------- Handle Work Submission ----------
app.post("/submit", (req, res) => {
  const { date, hours } = req.body;

  if (!date || !hours) {
    return res.status(400).json({ message: "Invalid data submitted." });
  }

  const [day, month, year] = date.split("-");
  const monthHeading = `${monthNames[parseInt(month) - 1]}'${year}`;
  const entry = `${day}-${month}-${year}: ${hours}`;

  let fileContent = "";
  try {
    fileContent = fs.readFileSync(filePath, "utf8");
  } catch (err) {
    fileContent = "";
  }

  // 🔍 Split into month blocks using regex
  const blocks = fileContent.split(/\n(?=[A-Z][a-z]{2}'\d{2})/); // splits before each new month block
  let updated = false;

  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].startsWith(monthHeading)) {
      let lines = blocks[i].trim().split("\n");
      let existingEntries = lines
        .slice(1)
        .filter((line) => !line.startsWith("Total:"));

      // ❌ Prevent duplicate entries
      if (
        existingEntries.some((line) =>
          line.startsWith(`${day}-${month}-${year}:`)
        )
      ) {
        return res
          .status(409)
          .json({ message: "⚠️ Entry for this date already exists." });
      }

      // ✅ Add new entry
      existingEntries.push(entry);

      // 🧠 Sort by day
      existingEntries.sort((a, b) => {
        const d1 = parseInt(a.split("-")[0]);
        const d2 = parseInt(b.split("-")[0]);
        return d1 - d2;
      });

      // 🧮 Calculate total hours
      const totalHours = existingEntries.reduce((sum, line) => {
        const time = line.split(": ")[1];
        if (!time) return sum;
        if (time.endsWith("h")) {
          const val = parseFloat(time.replace("h", ""));
          return sum + (isNaN(val) ? 0 : val);
        }
        return sum;
      }, 0);

      // 🧾 Rebuild block with updated entries and total
      blocks[i] = `${monthHeading}\n${existingEntries.join(
        "\n"
      )}\nTotal: ${totalHours.toFixed(1)}h`;
      updated = true;
      break;
    }
  }

  // 🌱 Create new month block if not found
  if (!updated) {
    blocks.push(
      `${monthHeading}\n${entry}\nTotal: ${parseFloat(
        hours.replace("h", "")
      ).toFixed(1)}h`
    );
  }

  try {
    // 🧹 Clean up each block (remove leading/trailing blank lines)
    const cleanedBlocks = blocks.map((b) => b.trim());

    // 📄 Join with exactly ONE blank line between months
    fs.writeFileSync(filePath, cleanedBlocks.join("\n\n") + "\n", "utf8");

    res.json({ message: "✅ Work saved and summarized." });
  } catch (err) {
    console.error("❌ Failed to write file:", err);
    res.status(500).json({ message: "❌ File write failed." });
  }
});

// 🔊 Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
