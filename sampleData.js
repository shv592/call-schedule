const SAMPLE_DATA = [
  [{ value: "Time" },
  { value: "Team 1" },
  { value: "Team 2" },
  { value: "Team 3" },
  { value: "Team 4" },
  { value: "Team 5" },
  { value: "Team 6" },
  { value: "Team 7" },
  { value: "Team 8" },
  { value: "Team 9" },
  { value: "Team 10" },
  { value: "Team 11" },
  { value: "Team 12" },
  { value: "Team 13" },
  { value: "Team 14" },
  { value: "Team 15" },
  { value: "Team 16" },
  { value: "Team 17" },
  { value: "Team 18" },
  { value: "Team 19" },
  { value: "Team 20" }]
];

for (let i = 1; i <= 20; i++) {
  const row = [];
  for (let j = 0; j <= 20; j++) {
    if (j === 0) {
      const time = `${i}:00`;
      row.push({ value: time });
    } else {
      row.push({ value: generateRandomName() });
    }
  }
  SAMPLE_DATA.push(row);
};

function generateRandomName() {
  const names = ["John", "Emma", "Michael", "Olivia", "William", "Sophia", "James", "Ava", "Benjamin", "Isabella", "Joseph", "Mia", "Daniel", "Charlotte", "Henry", "Amelia", "Samuel", "Emily", "Sebastian", "Scarlett"];
  const randomIndex = Math.floor(Math.random() * names.length);
  return names[randomIndex];
}