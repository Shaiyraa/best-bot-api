module.exports = class APIFeatures {
  constructor(query, queryString) {
    const { page, sort, limit, fields, ...queryObj } = queryString;
    this.query = query;
    this.page = page;
    this.sortKeys = sort;
    this.limit = limit || 1000;
    this.fields = fields;
    this.queryObj = queryObj;
  };

  filter() {
    let queryStr = JSON.stringify(this.queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  };

  sort() {
    if (this.sortKeys) {
      const sortBy = this.sortKeys.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    };

    return this;
  }

  limitFields() {
    if (this.fields) {
      const fieldsToSelect = this.fields.split(",").join(" ");
      this.query = this.query.select(fieldsToSelect);
    } else {
      this.query = this.query.select("-__v");
    };

    return this;
  }

  paginate() {
    const pageToDisplay = this.page * 1 || 1;
    const limitOfDocs = this.limit * 1 || 100;
    const skip = (this.page - 1) * this.limit;
    this.query = this.query.skip(skip).limit(limitOfDocs);
    return this;
  }
}