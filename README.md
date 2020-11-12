# husky-imagemin

automatically optimize newly added image before commit

## How to use

add command to husky hooks config, if already use lint-stage, you can use `&&` to concat husky-imagemin
```json
"husky": {
    "hooks": {
        "pre-commit": "lint-staged && husky-imagemin"
    }
}
```
