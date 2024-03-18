const Tour = require("../models/tourModel");

class APIFeatures {
  constructor(query, queryParams) {
    this.query = query;
    this.queryParams = queryParams;
  }
  filter() {
    const queryObject = { ...this.queryParams };

    const excludedField = ["sort", "limit", "page", "fields"];
    excludedField.forEach((field) => delete queryObject[field]);

    let queryString = JSON.stringify(queryObject);

    queryString = queryString.replace(
      /\b(gte|gt|lte|le|ne)\b/g,
      (i) => `$${i}`
    );
    this.query = this.query.find(JSON.parse(queryString));
    return this;
  }
  sort() {
    if (this.queryParams.sort) {
      const sortBy = this.queryParams.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy); // .exec() kullanmaya gerek yok
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }
  page() {
    const page = Number(this.queryParams.page) || 1;
    const limit = Number(this.queryParams.limit) || 10;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
  fields() {
    if (this.queryParams.fields) {
      const fields = this.queryParams.fields.split(",").join(" ");
      this.query = this.query.select(fields); // this.query'yi güncelliyoruz
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }
}

module.exports = APIFeatures;
