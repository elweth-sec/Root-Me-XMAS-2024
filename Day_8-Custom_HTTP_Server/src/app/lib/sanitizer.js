const htmlEntities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;'
  };
  
class Sanitizer {
    static escapeHtml(str) {
        if (typeof str !== 'string') {
            return '';
        }
        return str.replace(/[&<>"']/g, char => htmlEntities[char]);
    }
  
    static xss(input) {
      return this.escapeHtml(input);
    }
  
    static sql(input, type) {
        if (type === "int") {
            return parseInt(input)
        } else if (type === "string"){
            //todo
        }
    }
}
  
module.exports = Sanitizer;