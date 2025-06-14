# pyright: basic


import json
from typing import Any


def get_json(filepath: str) -> dict[str, Any]:
    fp = open(filepath, 'r')
    data = json.loads(fp.read())
    fp.close()
    return data


if __name__ == '__main__':
    package_json = get_json('./package.json')
    version: str = package_json.get('version', '1.0.0')
    version_numbers = [int(x) for x in version.split('.')]
    x, y, z = version_numbers

    z += 1
    next_version = '.'.join([str(v) for v in [x, y, z]])
    print(f'{version} -> {next_version}')
    package_json['version'] = next_version

    with open('./package.json', 'w') as fp:
        fp.write(json.dumps(package_json, indent=2))
