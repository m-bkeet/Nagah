import fetch from 'node-fetch';
fetch('http://localhost:3000/api/groups')
  .then(res => res.json())
  .then(console.log)
  .catch(console.error);
