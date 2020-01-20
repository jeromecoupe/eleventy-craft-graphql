const moment = require("moment");

module.exports = function(eleventyConfig) {
  // limit filter
  eleventyConfig.addFilter("limit", function(iterable, limit) {
    return iterable.slice(0, limit);
  });

  // date filter
  eleventyConfig.addFilter("date", function(string, format) {
    return moment(string).format(format);
  });

  // return your config
  return {
    dir: {
      input: "./src",
      output: "./dist"
    }
  };
};
