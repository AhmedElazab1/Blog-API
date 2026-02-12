import { Query } from 'mongoose';
import { IQueryStr } from '../../modules/user/DTOs/types';

class ApiFeatures<T> {
  constructor(
    public query: Query<T[], T>,
    public queryStr: IQueryStr,
  ) {}

  filter() {
    const { page, limit, sort, field, ...queryObj } = this.queryStr;

    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryString));
    return this;
  }

  sort() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.toString().split(',').join(' ');
      this.query = this.query.sort(sortBy);
    }
    return this;
  }

  limitFields() {
    if (this.queryStr.field) {
      const fields = this.queryStr.field.toString().split(',').join(' ');
      this.query = this.query.select(fields);
    }
    return this;
  }

  paginate() {
    const page = this.queryStr.page ? parseInt(this.queryStr.page.toString()) : 1;
    const limit = this.queryStr.limit ? parseInt(this.queryStr.limit.toString()) : 10;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

export default ApiFeatures;
