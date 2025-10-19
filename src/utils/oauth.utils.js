// const query_string = require("querystring");

import query_string from "querystring";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();


const google_access_token_endpoint = "https://oauth2.googleapis.com/token";

const google_auth_token_endpoint =
  "https://accounts.google.com/o/oauth2/v2/auth";
const query_params = {
  client_id: process.env.CLIENT_ID,
  redirect_uri: `http://localhost:3000${process.env.REDIRECT_URI}`,
};
// this objects contains information that will be passed as query params to the auth // token endpoint
const auth_token_params = {
  ...query_params,
  response_type: "code",
};
// the scopes (portion of user's data) we want to access
const scopes = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];
// a url formed with the auth token endpoint and the
export const request_get_auth_code_url = `${google_auth_token_endpoint}?${query_string.stringify(auth_token_params)}&scope=${scopes.join(" ")}`;

export const get_access_token = async (auth_code) => {
  const access_token_params = {
    ...query_params,
    client_secret: process.env.CLIENT_SECRET,
    code: auth_code,
    grant_type: "authorization_code",
  };

  return await axios({
    method: "post",
    url: `${google_access_token_endpoint}?${query_string.stringify(access_token_params)}`,
  });
};

export const get_profile_data = async (access_token) => {
  return await axios({
    method: "post",
    url: `https://www.googleapis.com/oauth2/v3/userinfo?alt=json&access_token=${access_token}`,
  });
};
