module.exports = {
  CLIENT_ORIGIN: process.env.NODE_ENV === 'production'
    ? `https://code-talk-client.herokuapp.com`
    : `http://localhost:3000`
};
