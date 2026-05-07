// Quick test: node test-sms.mjs
const res = await fetch("http://localhost:3000/api/send-alert", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ phone: "9045644116", lat: 27.225, lng: 77.998 }),
});
const data = await res.json();
console.log("Status:", res.status);
console.log("Response:", JSON.stringify(data, null, 2));
