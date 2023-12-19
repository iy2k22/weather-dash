const baseURL = "https://api.openweathermap.org";
const apiKey = "cf19e26cd84560f303a4c185e64c50ca";

let sCity;
let visited;
if (!(localStorage.getItem("visited")))
    visited = [];
else
    visited = JSON.parse(localStorage.getItem("visited"));

$(document).ready(() => {
    const isVisited = (city) => {
        for (let vCity of visited) {
            const regex = new RegExp(vCity, "i");
            if (city.match(regex))
                return true;
        }
        return false;
    }
    const instance = axios.create({ baseURL: baseURL });
    const weatherDiv = $("#weather");
    const buttonsDiv = $("#buttons");

    const genBtn = ((city) => {
        const btn = $("<button></button>");
        btn.text(city);
        btn.addClass("prev btn btn-secondary");
        buttonsDiv.append(btn);
    });

    const getData = (city) => {
        if (city.length < 3)
            return;
        instance.get("/geo/1.0/direct", {
            params: {
                appid: apiKey,
                q: city.toLowerCase()
            }
        }).then(({ data }) => {
            const { lat, lon } = data[0];
            weatherDiv.empty();
            return instance.get("/data/2.5/forecast", {
                params: {
                    appid: apiKey,
                    lat: lat,
                    lon: lon
                }
            })
        }).then(({ data }) => {
            if (!isVisited(city)) {
                visited.push(city);
                genBtn(city);
                localStorage.setItem("visited", JSON.stringify(visited));
            }
            let rowDiv;
            for (let i = 0; i < data.list.length; ++i) {
                if (i % 4 === 0) {
                    rowDiv = $("<div></div>");
                    rowDiv.addClass("row");
                    weatherDiv.append(rowDiv);
                }
                const weather = data.list[i];
                const cardDiv = $("<div></div>");
                cardDiv.addClass("card col-lg-3 col-md-3 col-sm-6");
                const cardBody = $("<div></div>");
                cardBody.addClass("card-body");
                cardBody.attr("id", weather.dt);
                const timestamp = $("<p></p>");
                const temp = $("<p></p>");
                const desc = $("<p></p>");

                timestamp.text(dayjs(weather.dt_txt).format("dddd, MMMM Do hh:mm A"));
                timestamp.addClass("card-title");
                temp.text(`Temperature: ${(weather.main.temp - 273.15).toFixed(2)}°C`);
                desc.text(`Description: ${weather.weather[0].description}`);

                cardBody.append(timestamp);
                cardBody.append(temp);
                cardBody.append(desc);
                cardBody.append($("<br>"));

                cardDiv.append(cardBody);
                rowDiv.append(cardDiv);
            }
        });
    }

    for (let vCity of visited)
        genBtn(vCity);

    $("#searchBtn").on("click", (e) => {
        e.preventDefault();
        sCity = $("#city-in").val();
        getData(sCity);
    })
    
    $("#buttons").on("click", (e) => getData($(e.target).text()));
})