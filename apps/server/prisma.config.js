require('dotenv/config');
const path = require('path');

module.exports = {
  earlyAccess: true,
  schema: path.join('prisma', 'schema'),
}; 