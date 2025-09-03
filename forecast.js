/*This is my js file, where i spent most of my time,
most of it was inspired by different side projects i've done
I tried using Openweathermap's documentation as much as I could
co pilot did assist me in the making of the graph.
- Yash Magane
*/

//variables
const apiKey = "3404ed1ccb7e712f3dcce4a8b069e8ac"; //Member's key for the API
const city = "Lisbon"; //My hometown location
const forecastDiv = document.getElementById("forecast"); //just container for forecast
const dateInput = document.getElementById("date-input"); //input for date search
const showBtn = document.getElementById("show-btn"); // button for making forecast big
const errorMessage = document.getElementById("error-message"); //error handling
const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`; //building url for data

fetch(url) //fetching data
  .then(response => response.json()) //converting raw data into js objects
  .then(data => {
    if (!data.list) {
      forecastDiv.innerText = "Could not fetch forecast data."; //error handler
      return;
    }

    let html = `<h2>5-Day Forecast for ${city}</h2>`; //display

    const daily = {};
    data.list.forEach(entry => {
      const date = new Date(entry.dt * 1000);
      const day = date.toDateString();

      if (!daily[day]) { //only using first reading of the day as API gives 8 entries per day
        daily[day] = entry;
      }
    });

    Object.keys(daily).forEach((day, index) => { //forecast cards for the display
      const entry = daily[day];
      const temp = entry.main.temp;
      const description = entry.weather[0].description;
      const icon = entry.weather[0].icon;
      const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`; //icons from API

      html += `
        <div class="forecast-day" data-date="${day}">
          <img src="${iconUrl}" alt="${description}" />
          <div>
            <strong>Day ${index + 1} (${day})</strong><br>
            Temp: ${temp}°C<br>
            Condition: ${description}
          </div>
        </div>
      `;
    });

    forecastDiv.innerHTML = html;
  })
  .catch(error => {
    forecastDiv.innerText = "Error: " + error; //error handling
  });

//Date lookup function - expand if date found
function expandForecast() {
  const inputDate = dateInput.value.trim();
  let found = false;

  document.querySelectorAll(".forecast-day").forEach(dayDiv => {
    if (dayDiv.dataset.date === inputDate) {
      dayDiv.classList.add("expanded");
      dayDiv.scrollIntoView({ behavior: "smooth", block: "center" });
      found = true;
    } else {
      dayDiv.classList.remove("expanded");
    }
  });

  if (!found) {
    errorMessage.innerText = "Invalid date"; //handling incorrect inputs
  } else {
    errorMessage.innerText = "";
  }
}

//event listeners for when searching for date
dateInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    expandForecast();
  }
});

showBtn.addEventListener("click", expandForecast);

//Using the graph button
const graphBtn = document.getElementById("graph-btn");
const canvas = document.getElementById("temp-graph");
const ctx = canvas.getContext("2d");

graphBtn.addEventListener("click", () => {
  const temps = [];
  const labels = [];
  //taking the temps and dates from the forecast
  document.querySelectorAll(".forecast-day").forEach(dayDiv => {
    const tempText = dayDiv.querySelector("div").innerHTML.match(/Temp: ([\d.]+)/);
    if (tempText) {
      temps.push(parseFloat(tempText[1]));
      labels.push(dayDiv.dataset.date.split(" ").slice(1, 4).join(" "));
    }
  });

  drawGraph(labels, temps); //drawing the temp trending line

  // scroll to graph after drawing
  canvas.scrollIntoView({ behavior: "smooth", block: "center" });
});

 // drawing the graph
function drawGraph(labels, temps) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const padding = 40;
  const w = canvas.width - 2 * padding;
  const h = canvas.height - 2 * padding;

  const maxTemp = Math.max(...temps) + 2;
  const minTemp = Math.min(...temps) - 2;

  // axes
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, h + padding);
  ctx.lineTo(w + padding, h + padding);
  ctx.stroke();

  // line
  ctx.beginPath();
  temps.forEach((temp, i) => {
    const x = padding + (i * (w / (temps.length - 1)));
    const y = padding + h - ((temp - minTemp) / (maxTemp - minTemp)) * h;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = "red";
  ctx.lineWidth = 2;
  ctx.stroke();

  // points
  temps.forEach((temp, i) => {
    const x = padding + (i * (w / (temps.length - 1)));
    const y = padding + h - ((temp - minTemp) / (maxTemp - minTemp)) * h;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI);
    ctx.fillStyle = "red";
    ctx.fill();
  });

  // labels
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  labels.forEach((label, i) => {
    const x = padding + (i * (w / (temps.length - 1)));
    ctx.fillText(label, x, h + padding + 15);
  });

  ctx.textAlign = "right";
  ctx.fillText(maxTemp.toFixed(1) + "°C", padding - 5, padding + 5);
  ctx.fillText(minTemp.toFixed(1) + "°C", padding - 5, h + padding);
}
