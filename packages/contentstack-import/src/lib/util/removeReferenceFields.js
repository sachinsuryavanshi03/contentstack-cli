var _ = require('lodash');

/* eslint-disable no-empty */
var removeReferenceFields = (module.exports = function (schema, flag) {
  for (let i = 0; i < schema.length; i++) {
    if (schema[i].data_type === 'group') {
      removeReferenceFields(schema[i].schema, flag);
    } else if (schema[i].data_type === 'blocks') {
      for (var block in schema[i].blocks) {
        removeReferenceFields(schema[i].blocks[block].schema, flag);
      }
    } else if (schema[i].data_type === 'reference') {
      flag.supressed = true;
      schema.splice(i, 1);
      --i;
      if (schema.length < 1) {
        schema.push({
          data_type: 'text',
          display_name: 'dummyTest',
          uid: 'dummy_test',
          field_metadata: {
            description: '',
            default_value: '',
            version: 3,
          },
          format: '',
          error_messages: {
            format: '',
          },
          multiple: false,
          mandatory: false,
          unique: false,
          non_localizable: false,
        });
      }
    }
  }
});
