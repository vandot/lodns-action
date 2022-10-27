## About

GitHub Action for [lodns](https://github.com/vandot/lodns), simple DNS server for local development.
___

* [Usage](#usage)
* [Customizing](#customizing)
  * [inputs](#inputs)
* [Limitation](#limitation)
* [License](#license)

## Usage

```yaml
name: example

on:
  push:

jobs:
  example:
    runs-on: ubuntu-latest
    steps:
      - uses: vandot/lodns-action@v1
```

## Customizing

### inputs

Following inputs can be used as `step.with` keys

| Name          | Type    | Default   | Description                     |
|---------------|---------|-----------|---------------------------------|
| `version`     | String  | `0.1.3`   | lodns version. Example: `0.1.3`|
| `install-only`| Bool    | `false`   | just install lodns              |

## Limitation

This action is not available for Windows [virtual environment].
`lodns` supports Windows while this action still doesn't.

## License

BSD-3-Clause. See `LICENSE` for more details.