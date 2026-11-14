
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const inputPath = path.join(__dirname, "cities500.txt");
const outputPath = path.join(__dirname, "../public/cities500.json");

async function convertCities() {
  const cities = [];

  const fileStream = fs.createReadStream(inputPath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    if (!line.trim()) continue;

    const fields = line.split("\t");

    cities.push({
      id: fields[0],
      name: fields[1],
      lat: fields[4],
      lon: fields[5],
      country: fields[8],
      admin1: fields[10],
      admin2: fields[11],
      pop: fields[14],
    });
  }

  fs.writeFileSync(
    outputPath,
    JSON.stringify(cities),
    "utf8"
  );

  console.log(`Converted ${cities.length} locations.`);
}

convertCities().catch(console.error);
