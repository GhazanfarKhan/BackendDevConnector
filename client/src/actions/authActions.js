import axios from "axios";
import setAuthToken from '../utils/setAuthToken';
import jwt_decode from 'jwt-decode';
import { GET_ERRORS, SET_CURRENT_USER } from "./types";

// Register

export const registerUser = (userData, history) => dispatch => {
  axios
    .post('/api/users/register', userData)
    .then(res => history.push('/login'))
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};


// Login - Get User TOken

export const loginUser = userData => dispatch => {
  axios
    .post("/api/users/login", userData)
    .then(res => {

      // Save to localstorage
      const { token } = res.data;
      localStorage.setItem('jwtToken', token);
      // Set token to auth header
      setAuthToken(token);
      // Decode token to get user data
      const decoded = jwt_decode(token);
      // Set current user
      dispatch(setCurrentUser(decoded));
    })
    .catch(error => {
      dispatch({
        type: GET_ERRORS,
        payload: error.response.data
      });
    });
};



// Set Current User
export const setCurrentUser = decoded => {
  return {
    type: SET_CURRENT_USER,
    payload: decoded
  }
};


// Log user out

export const logoutUser = () => dispatch => {
  debugger;
  // Remove from local storage
  localStorage.removeItem('jwtToken');

  // Remove auth header for future request
  setAuthToken(false);

  // Set current user
  dispatch(setCurrentUser({}));
}