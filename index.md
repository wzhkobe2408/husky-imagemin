# husky-imagemin

automatically optimize newly added image before commit

[![NPM](https://img.shields.io/npm/v/husky-imagemin.svg)](https://www.npmjs.com/package/husky-imagemin) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com) [![Downloads/week](https://img.shields.io/npm/dw/husky-imagemin.svg)](https://npmjs.org/package/husky-imagemin)

## Install
```bash
npm install husky-imagemin --save-dev
or
yarn add husky-imagemin -D
```

## How to use

### Basic usage

add command to husky hooks config, if already use lint-stage, you can use `&&` to concat husky-imagemin
```json
"husky": {
    "hooks": {
        "pre-commit": "lint-staged && husky-imagemin"
    }
}
```

### Custom usage

you can specific large image definination by pass parameter to husky-imagemin, default large image definination is `> 50kb`
```json
"husky": {
    "hooks": {
        "pre-commit": "lint-staged && husky-imagemin --size=100"
    }
}
```

### Support or Contact

Feel free to create issue or make pr to contribute
