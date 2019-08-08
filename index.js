"use strict";
const _ = require('lodash');
const citiesRawData = require('./data/cities/latest.json');
const timezonesCountriesRawData = require('./data/timezones_countries/latest.json');

function findPartialMatch(itemsToSearch, searchString) {
    const searchItems = searchString.split(" ");
    const isPartialMatch = searchItems.every(function (i) {
        return itemsToSearch.join().toLowerCase().indexOf(i.toLowerCase()) >= 0;
    });
    return isPartialMatch;
};

function attachOffsetsWithCities(cities, timezones) {
    return cities.map(city => {
        const { utcOffset, offsetStr } = timezones[city.timezone];
        city.utcOffset = utcOffset;
        city.offsetStr = offsetStr;
        return city;
    });
};

const countriesAndTimezones = {
    getAllCountries: function () {
        return timezonesCountriesRawData.countries;
    },

    getAllTimezones: function () {
        return timezonesCountriesRawData.timezones;
    },

    getTimezonesForCountry: function (countryId) {
        const countries = this.getAllCountries();
        const timezones = this.getAllTimezones();
        const timezoneIds = (countries[countryId] || {}).timezones || [];
        return timezoneIds.map(function (timezoneId) {
            return timezones[timezoneId];
        });
    },

    getCountriesForTimezone: function (timezoneId) {
        const countries = this.getAllCountries();
        const timezones = this.getAllTimezones();
        const countryIds = (timezones[timezoneId] || {}).countries || [];
        return countryIds.map(function (countryId) {
            return countries[countryId];
        });
    },
    lookupViaCity: function (city) {
        let cityLookup = _.filter(citiesRawData, function (o) { return o.city.toLowerCase() === city.toLowerCase() })
        if (cityLookup && cityLookup.length) {
            cityLookup = attachOffsetsWithCities(cityLookup, this.getAllTimezones()[(city.timezone)]);
            return cityLookup;
        } else {
            return [];
        }
    },
    findFromCityStateProvince: function (searchString) {
        if (searchString) {
            let cityLookup = _.filter(citiesRawData, function (o) { return findPartialMatch([o.city, o.state_ansi, o.province, o.country], searchString) })
            if (cityLookup && cityLookup.length) {
                cityLookup = attachOffsetsWithCities(cityLookup, this.getAllTimezones());
                return cityLookup;
            } else {
                return [];
            };
        } else {
            return [];
        };
    }
};
const city = countriesAndTimezones.findFromCityStateProvince('lucknow india');
module.exports = countriesAndTimezones;