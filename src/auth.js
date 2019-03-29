const crypt = require('common')();
const querystring = require('querystring');

module.exports = {
  // ACL: User has access to this path ?
  check_acl: (profile, path, action) => {
    if (!profile || !path || !action) 
      return false;

    return profile.restrictions.some((rule) => {
      // caso encontre o caminho no perfil do usuario
      const regex = new RegExp(rule.path);
      if (regex.test(path)) {
        // confere agora se tem permissão de leitura e/ou escrita
        if (action === 'query' || action === 'lastOne') {
          return (rule.permission.indexOf('r') !== -1);
        } else {
          return (rule.permission.indexOf('w') !== -1);
        }
      }
    });
  }
};
