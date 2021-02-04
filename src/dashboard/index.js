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

  useEffect(() => {
    d3.select("#d3-graph").select("svg").remove();
    console.log(forecast);
    if (forecast["forecast"]) {
      console.log(forecast);

      drawChart(w, forecast.forecast.hour);
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
        `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${id}&days=1`
      );

      let { alerts, current, forecast, location } = data;
      let { forecastday } = forecast;

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

      setForcast(forecastData);
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

  let days = {
    0: "Sunday",
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
  };

  return (
    <Wrapper>
      <ResizeDiv>
        <Search>
          <Input
            onChange={(e) => onSearch(e)}
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
      </ResizeDiv>
    </Wrapper>
  );
};

export default Dashboard;

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

const Info = styled.p`
  font-size: 0.8rem;
  margin: 0;
  padding: 0;
`;

const CityName = styled.h1`
  font-size: 2rem;
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
