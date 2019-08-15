const validator = require('validator');
const isEmpty = require('./is-empty');


module.exports = function (data) {
  let errors = {};

  data.handle = !isEmpty(data.handle) ? data.handle : '';
  data.status = !isEmpty(data.status) ? data.status : '';
  data.skills = !isEmpty(data.skills) ? data.skills : '';


  if (!validator.isLength(data.name, { min: 3, max: 40 })) {
    errors.handle = "Handle needs to be between 3 and 40 characters";
  }

  if (validator.isEmpty(data.handle)) {
    errors.email = "Profile handle is required";
  }

  if (validator.isEmpty(data.status)) {
    errors.email = "Status field is required";
  }

  if (validator.isEmpty(data.skills)) {
    errors.password = "Skill field is required";
  }

  if (!isEmpty(data.website)) {
    if (!validator.isURL(data.website)) {
      errors.website = "Not a valid url";
    }
  }
  if (!isEmpty(data.youtube)) {
    if (!validator.isURL(data.youtube)) {
      errors.youtube = "Not a valid url";
    }
  }
  if (!isEmpty(data.facebook)) {
    if (!validator.isURL(data.facebook)) {
      errors.facebook = "Not a valid url";
    }
  }
  if (!isEmpty(data.linkedin)) {
    if (!validator.isURL(data.linkedin)) {
      errors.linkedin = "Not a valid url";
    }
  }
  if (!isEmpty(data.instagram)) {
    if (!validator.isURL(data.instagram)) {
      errors.instagram = "Not a valid url";
    }
  }
  return {
    errors,
    isValid: isEmpty(errors)
  }
}
