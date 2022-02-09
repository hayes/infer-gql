module.exports = {
  "$schema": "http://json.schemastore.org/prettierrc",
  "arrowParens": "always",
  "bracketSameLine": false,
  "bracketSpacing": true,
  "endOfLine": "lf",
  "printWidth": 100,
  "proseWrap": "always",
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "useTabs": false,
  "overrides": [
    {
      "files": [
        "*.json",
        "*.yaml"
      ],
      "options": {
        "useTabs": false
      }
    }
  ]
};