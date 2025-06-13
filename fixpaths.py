import glob
import re
import os

def replace(content: str) -> str:
    # #/shared/
    content = re.sub(r'(\'|")(#\/shared.*?)(\'|")', r'\1socker/shared\3', content)
    content = re.sub(r'(\'|")(#\/client.*?)(\'|")', r'\1socker/client\3', content)
    return content


def get_content(path: str) -> str:
    fp = open(path, 'r')
    content = fp.read()
    fp.close()
    return content


DIRS: list[str] = [
    './client',
    './server',
    './shared'
]

if __name__ == '__main__':

    for folder in DIRS:
        dist_dir = os.path.join(folder, 'dist')
        for file in [*glob.glob(f'{dist_dir}/**/*.js'), *glob.glob(f'{dist_dir}/**/*.d.ts')]:
            print(file)
            content = replace(get_content(file))
            with open(file, 'w') as fp:
                _ = fp.write(content)
