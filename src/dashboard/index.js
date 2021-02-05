import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

import styled from "styled-components";

import { Input } from "../components/input";
import { ResizeDiv, Wrapper } from "./styles";
import { useWidth } from "../hooks/width";
import axios from "axios";
import { color } from "d3";

const Dashboard = (props) => {
  let w = useWidth("d3-graph");

  let [cities, setCities] = useState([]);
  let [keyword, setKeyword] = useState("");

  let [forecast, setForcast] = useState({});
  let [forecastDays, setForecastDays] = useState([]);

  let [clothes, setClothes] = useState({});

  useEffect(() => {
    d3.select("#d3-graph2").select("svg").remove();
    d3.select("#d3-graph3").select("svg").remove();
    d3.select("#d3-graph").select("svg").remove();
    if (forecast["forecast"]) {
      drawChart(w, forecast.forecast.hour);
      drawChart2(w / 2, forecastDays[1].hour, 2);
      drawChart2(w / 2, forecastDays[2].hour, 3);
    }
  }, [w, forecast]);

  const apiKey = `fe4855c37e2845f28e403425210601`;

  const onSearch = async (e) => {
    let { value } = e.target;
    setKeyword(value);

    if (value.length < 1) return;

    try {
      let { data } = await axios.get(
        `http://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${value}`
      );

      setCities(data);
    } catch (err) {
      console.log(err.message);
    }
  };

  const onGetWeatherData = async (id) => {
    try {
      let { data } = await axios.get(
        `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${id}&days=3`
      );

      let { alerts, current, forecast, location } = data;
      let { forecastday } = forecast;
      console.log("fulldata", data);
      const forecastData = {
        location: {
          city: location.name,
          country: location.country,
          time: location.localtime,
          ...current,
        },
        forecast: {
          astro: forecastday[0].astro,
          day: forecastday[0].day,
          hour: forecastday[0].hour,
        },
      };
      setForecastDays(data.forecast.forecastday);
      setForcast(forecastData);
      getClothesRecommendation(forecastData.location.temp_c);
      setKeyword("");
      setCities([]);
    } catch (err) {
      console.log(err);
    }
  };

  let cityOptions = cities.map((city, i) => {
    return (
      <AutoCompleteCity
        onGetWeatherData={onGetWeatherData}
        last={i == cities.length - 1}
        key={city.url}
        id={city.url}
        name={city.name}
        country={city.country}
      />
    );
  });

  const getClothesRecommendation = (temp) =>{
    switch (true){
      case (temp < 0):
        setClothes(cloths.veryCold);
        break;
      case (temp >= 0 && temp < 17):
        setClothes(cloths.cold);
        break;
      case (temp >= 17 && temp < 26 ):
        setClothes(cloths.neutral)
        break;
      case (temp >= 26 && temp < 37) :
        setClothes(cloths.hot)
        break;
      case (temp >= 37):
        setClothes(cloths.veryHot)
        console.log("afas")
        break;
    }
  }

  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  };

  let days = {
    0: "Sunday",
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
  };

  const cloths = {
    veryCold: {
      slogan: "Use a heavy jacket or freeze",
      img: "https://images.vexels.com/media/users/3/196248/isolated/preview/35c3af5f5d8d12159fa50c1f09d0d886-personaje-de-pesca-de-ni-ntilde-o-esquimal-by-vexels.png"
    }, 
    cold:{
      slogan:"Mother always said bring a sweater",
      img: "https://s3.amazonaws.com/stockx-sneaker-analysis/wp-content/uploads/2020/04/Supreme-Cartoon-Sweater-Multicolor-Sample-Image.jpg"
    },
    neutral: {
      slogan:"Any tshirt will do it",
      img:"https://images.vexels.com/media/users/3/148719/isolated/preview/e24f106dd220e4a384cc6cd2b08ef410-green-women-t-shirt-cartoon-by-vexels.png"
    },
    hot:{
      slogan:"Time for some pool action",
      img:"https://www.freepnglogos.com/uploads/pool-png/swimming-pool-cartoon-images-download-best-swimming-27.png"
    }, 
    veryHot: {
      slogan:"Is this earth or the sun",
      img:"data:image/png;base64,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"
    } 
  }

  return (
    <Wrapper>
      <ResizeDiv>
        <Search>
          <Input
            onInput={(e) => onSearch(e)}
            value={keyword}
            height={4}
            placeholder="Search"
          />
          {cities.length < 1 ? null : (
            <AutocompleteDiv searchBarHeight={4}>{cityOptions}</AutocompleteDiv>
          )}
        </Search>

        {forecast["location"] ? (
          <MainHeader>
            <WeatherInfo>
              <Temp>{forecast.location.temp_c}</Temp>
              <Info>Humidity: {forecast.location.humidity}%</Info>
              <Info>Precipitation: {forecast.location.precip_mm} mm</Info>
              <Info>Wind: {forecast.location.wind_kph} km/h</Info>
            </WeatherInfo>
            <ClotheInfo>
              <CityName>{clothes.slogan}</CityName> 
              <ClothesImg src={clothes.img} />
            </ClotheInfo>
            <CityInfo>
              <WeatherIcon src={forecast.location.condition.icon} />
              <CityName>{forecast.location.city}</CityName>
              {/* <TimeInfo>{forecast.location.last_updated}</TimeInfo> */}
              <Country>
                {days[new Date(forecast.location.last_updated).getUTCDay()]}{" "}
                {
                  new Date(forecast.location.last_updated)
                    .toLocaleString()
                    .split(",")[1]
                }
              </Country>
              <Condition>{forecast.location.condition.text}</Condition>
            </CityInfo>
          </MainHeader>
        ) : null}

        <GraphContainer>
          <HeaderName>Temperature Forecast</HeaderName>
          <div id={"d3-graph"} />
        </GraphContainer>
        <GraphContainer>
          <HeaderName>Next Days</HeaderName>
          <Container>
            <div>
              <LabelGraph>
                {forecastDays.length > 1
                  ? new Date(forecastDays[1].date).toLocaleDateString(
                      "en-GB",
                      options
                    )
                  : null}
              </LabelGraph>
              <div id={"d3-graph2"} />
            </div>
            <div>
              <LabelGraph>
                {forecastDays.length >= 2
                  ? new Date(forecastDays[2].date).toLocaleDateString(
                      "en-GB",
                      options
                    )
                  : null}
              </LabelGraph>
              <div id={"d3-graph3"} />
            </div>
          </Container>
        </GraphContainer>
      </ResizeDiv>
    </Wrapper>
  );
};

export default Dashboard;

const LabelGraph = styled.p`
  padding: 0rem 2rem;
`;

const Container = styled.div`
  display: flex;
`;

const GraphContainer = styled.div`
  border: 1px solid #ddd;
  border-radius: 0.2rem;
`;

const HeaderName = styled.h1`
  padding: 1rem;
  padding-top: 0;
  color: #424242;
  font-weight: 300;
`;

const WeatherIcon = styled.img`
  position: absolute;
  width: 3.5rem;
  height: 3.5rem;
  transform: translate(-4.3rem, 0rem);
`;

const ClothesImg = styled.img`
  width: 3.5rem;
  height: 3.5rem;
`;

const Info = styled.p`
  font-size: 0.8rem;
  margin: 0;
  padding: 0;
`;

const CityName = styled.h1`
  font-size: 3vw;
  padding-left: 0.5rem;
  color: #424242;
  font-weight: 300;
  margin: 0;
`;

const Condition = styled.h1`
  font-size: 1rem;
  padding-left: 0.5rem;
  color: #424242;
  font-weight: 800;
  margin: 0;
`;
const Country = styled.h1`
  font-size: 1rem;
  padding-left: 0.5rem;
  color: #424242;
  font-weight: 300;
  margin: 0;
`;

const WeatherInfo = styled.div`
  display: flex;
  flex-direction: column;
  // align-items: center;
  justify-content: center;
`;

const Temp = styled.h1`
  font-size: 3rem;
  margin: 0;
  color: #424242;
  font-weight: 600;
  // align-self: center;
`;

const CityInfo = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  // align-items: center;
  padding: 1rem 0.2rem;
  justify-content: center;
  z-index: -2;
`;

const ClotheInfo = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: -2;
`;

const MainHeader = styled.div`
  display: flex;
  border: 1px solid #ddd;
  justify-content: space-between;
  border-radius: 0.2rem;
  padding: 0rem 1rem;
  margin: 0.5rem 0;
  height: 10rem;
`;

const reDraw = (w, data) => {
  d3.select("d3-graph").selectAll("svg").remove();
  drawChart(w, data);
};

const drawChart = (w, data) => {
  const h = 300;
  const padding = 30;

  const toDate = (time) => {
    let parser = d3.timeParse("%Y-%m-%d %H:%M");
    return parser(time);
  };

  var x = d3
    .scaleTime()
    .domain([
      d3.min(data, (d) => toDate(d.time)),
      d3.max(data, (d) => toDate(d.time)),
    ])
    .range([padding, w - padding]);

  let minTemp = d3.min(data, (d) => d.temp_c);

  const y = d3
    .scaleLinear()
    .domain([minTemp < 0 ? 0 : 0, d3.max(data, (d) => d.temp_c)])
    .range([h - padding, padding]);

  const getY = (y) => {
    return h - y - 20;
  };

  const scale = 0.5;

  const svg = d3
    .select("#d3-graph")
    .append("svg")
    .attr("width", w)
    .attr("height", h);
  // .style("border", "1px solid black")

  // svg.append("g")
  // .attr("transform", "translate(20,0)")

  // .call(d3.axisLeft(yScale));

  // svg.append("g")
  // .attr("transform", "translate(0," + 480 + ")")
  // .call(d3.axisBottom(scaleX));

  //linear gradient
  var lg = svg
    .append("defs")
    .append("linearGradient")
    .attr("id", "mygrad")
    .attr("x1", "0%")
    .attr("x2", "0%")
    .attr("y1", "0%")
    .attr("y2", "100%");
  lg.append("stop")
    .attr("offset", "0%")
    .style("stop-color", "#47d147")
    .style("stop-opacity", 0.5);

  lg.append("stop")
    .attr("offset", "100%")
    .style("stop-color", "#9fff80")
    .style("stop-opacity", 0.4);

  lg.append("stop")
    .attr("offset", "100%")
    .style("stop-color", "#d9ffcc")
    .style("stop-opacity", 0.3);

  lg.append("stop")
    .attr("offset", "100%")
    .style("stop-color", "#ffffff")
    .style("stop-opacity", 0.2);

  //area
  svg
    .append("path")
    .datum(data)
    .attr("fill", "url(#mygrad)")
    .attr("opacity", 0.8)
    .attr(
      "d",
      d3
        .area()
        .x((d, i) => x(toDate(d.time)))
        .y0(getY(40))
        .y1((d) => y(d.temp_c * scale))
    );

  //line

  //  var lineGen = d3.line()

  //  svg
  //     .append("path")
  //     .attr("d", lineGen([[padding, y(0)], [w-padding, y(0)]]))
  //     .attr("fill", "none")
  //     .attr("stroke-width", 5)
  //     .attr("stroke", "#ddd")

  //     svg
  //     .append("text")
  //     .text("0 Degrees")
  //     .attr("x", padding + 5)
  //     .attr("y", y(0)+20)
  //     .style("fill", "#ababab")

  svg
    .append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "#33cc33")

    .attr("stroke-width", 3.5)
    .attr(
      "d",
      d3
        .line()
        .x(function (d) {
          return x(toDate(d.time));
        })
        .y(function (d) {
          return y(d.temp_c * scale);
        })
    );

  svg
    .selectAll("text.yaxis")
    .data(data)
    .enter()
    .append("text")
    .style("font-weight", 600)
    .style("fill", "#ababab")
    .text((d, i) =>
      i % 3 == 0 && i != data.length - 1 && i != 0 ? d.temp_c : ""
    )
    .attr("x", (d) => x(toDate(d.time)) - 15)
    .attr("y", (d) => y(d.temp_c * scale) - 20);

  svg
    .selectAll("text.xaxis")
    .data(data)
    .enter()
    .append("text")
    .style("font-weight", 600)
    .style("fill", "#ababab")
    .text((d, i) => {
      const hour = toDate(d.time).getHours();

      if (i % 3 != 0 || hour == 0) return "";

      const offset = hour > 12 ? 12 : 0;
      let postFix = hour > 12 ? "PM" : "AM";

      return `${hour - offset} ${postFix}`;
    })
    .attr("x", (d) => x(toDate(d.time)) - 40)
    .attr("y", (d) => h - 20);
};

const drawChart2 = (w, data, selector) => {
  const h = 300;
  const padding = 30;

  const toDate = (time) => {
    let parser = d3.timeParse("%Y-%m-%d %H:%M");
    return parser(time);
  };

  var x = d3
    .scaleTime()
    .domain([
      d3.min(data, (d) => toDate(d.time)),
      d3.max(data, (d) => toDate(d.time)),
    ])
    .range([padding, w - padding]);

  let minTemp = d3.min(data, (d) => d.temp_c);

  const y = d3
    .scaleLinear()
    .domain([minTemp < 0 ? 0 : 0, d3.max(data, (d) => d.temp_c)])
    .range([h - padding, padding]);

  const getY = (y) => {
    return h - y - 20;
  };

  const scale = 0.5;

  const svg = d3
    .select(`#d3-graph${selector}`)
    .append("svg")
    .attr("width", w)
    .attr("height", h);
  // .style("border", "1px solid black")

  // svg.append("g")
  // .attr("transform", "translate(20,0)")

  // .call(d3.axisLeft(yScale));

  // svg.append("g")
  // .attr("transform", "translate(0," + 480 + ")")
  // .call(d3.axisBottom(scaleX));

  //linear gradient
  var lg = svg
    .append("defs")
    .append("linearGradient")
    .attr("id", "mygrad")
    .attr("x1", "0%")
    .attr("x2", "0%")
    .attr("y1", "0%")
    .attr("y2", "100%");
  lg.append("stop")
    .attr("offset", "0%")
    .style("stop-color", "#47d147")
    .style("stop-opacity", 0.5);

  lg.append("stop")
    .attr("offset", "100%")
    .style("stop-color", "#9fff80")
    .style("stop-opacity", 0.4);

  lg.append("stop")
    .attr("offset", "100%")
    .style("stop-color", "#d9ffcc")
    .style("stop-opacity", 0.3);

  lg.append("stop")
    .attr("offset", "100%")
    .style("stop-color", "#ffffff")
    .style("stop-opacity", 0.2);

  //area
  svg
    .append("path")
    .datum(data)
    .attr("fill", "url(#mygrad)")
    .attr("opacity", 0.8)
    .attr(
      "d",
      d3
        .area()
        .x((d, i) => x(toDate(d.time)))
        .y0(getY(40))
        .y1((d) => y(d.temp_c * scale))
    );

  //line

  //  var lineGen = d3.line()

  //  svg
  //     .append("path")
  //     .attr("d", lineGen([[padding, y(0)], [w-padding, y(0)]]))
  //     .attr("fill", "none")
  //     .attr("stroke-width", 5)
  //     .attr("stroke", "#ddd")

  //     svg
  //     .append("text")
  //     .text("0 Degrees")
  //     .attr("x", padding + 5)
  //     .attr("y", y(0)+20)
  //     .style("fill", "#ababab")

  svg
    .append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "#33cc33")

    .attr("stroke-width", 3.5)
    .attr(
      "d",
      d3
        .line()
        .x(function (d) {
          return x(toDate(d.time));
        })
        .y(function (d) {
          return y(d.temp_c * scale);
        })
    );

  svg
    .selectAll("text.yaxis")
    .data(data)
    .enter()
    .append("text")
    .style("font-weight", 600)
    .style("fill", "#ababab")
    .text((d, i) =>
      i % 3 == 0 && i != data.length - 1 && i != 0 ? d.temp_c : ""
    )
    .attr("x", (d) => x(toDate(d.time)) - 15)
    .attr("y", (d) => y(d.temp_c * scale) - 20);

  svg
    .selectAll("text.xaxis")
    .data(data)
    .enter()
    .append("text")
    .style("font-weight", 600)
    .style("fill", "#ababab")
    .text((d, i) => {
      const hour = toDate(d.time).getHours();

      if (i % 3 != 0 || hour == 0) return "";

      const offset = hour > 12 ? 12 : 0;
      let postFix = hour > 12 ? "PM" : "AM";

      return `${hour - offset} ${postFix}`;
    })
    .attr("x", (d) => x(toDate(d.time)) - 40)
    .attr("y", (d) => h - 20);
};

const Search = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%; ;
`;

const AutocompleteDiv = styled.div`
  box-sizing: border-box;
  width: 100%;

  border: 1px solid #ddd;
  border-top: 1px solid #ddd;
  position: absolute;
  max-height: 20rem;
  overflow-y: scroll;
  border-top-left-radius: 0.2rem;
  border-top-right-radius: 0.2rem;

  border-bottom-left-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
  display: flex;
  transform: translateY(${({ searchBarHeight }) => searchBarHeight}rem);
  flex-direction: column;
  z-axis: 10;
  shadow: 1px;
  margin-top: 0.3rem;

  box-shadow: 0 15px 30px -20px gray;
`;

const AutoCompleteCity = ({ name, country, last, id, onGetWeatherData }) => {
  return (
    <AutoCompleteItem last={last} onClick={() => onGetWeatherData(id)}>
      <Header>{name}</Header>
      <CountryName>{country}</CountryName>
    </AutoCompleteItem>
  );
};

const CountryName = styled.h1`
  font-size: 0.9rem;
`;

const Header = styled.h1`
  font-size: 0.8rem;
  font-family: Futura, sans-serif;
  // font-weight: 500;
  color: rgba(0, 0, 0, 0.7);
`;

const AutoCompleteItem = styled.div`
  display: flex;
  justify-content: space-between;
  ::hover {
    background-color: green;
  }

  cursor: pointer;

  border-bottom: ${({ last }) => (last ? "none" : "1px solid #ddd;")};
  padding: 0.2rem 1rem;
  background-color: white;
`;
