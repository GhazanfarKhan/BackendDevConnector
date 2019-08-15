const validator = require('validator');
const isEmpty = require('./is-empty');


module.exports = function (data) {
  let errors = {};

  data.school = !isEmpty(data.school) ? data.school : '';
  data.degree = !isEmpty(data.degree) ? data.degree : '';
  data.from = !isEmpty(data.from) ? data.from : '';


  if (validator.isEmpty(data.school)) {
    errors.school = "Title field is required";
  }
  if (validator.isEmpty(data.degree)) {
    errors.degree = "Company field is required";
  }
  if (validator.isEmpty(data.from)) {
    errors.from = "From field is required";
  }


  return {
    errors,
    isValid: isEmpty(errors)
  }
}
