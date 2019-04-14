export class MyError extends Error {
  public status: Number;

  constructor(status, ...props) {
    super(...props);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MyError);
    }
    this.status = status;
  }

}
