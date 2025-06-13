import glob
import re
import os

def replace(content: str) -> str:
    # #/shared/
    content = re.sub(r'(\'|")(#\/shared.*?)(\'|")', r'\1socker/shared\3', content)
    content = re.sub(r'(\'|")(#\/client.*?)(\'|")', r'\1socker/client\3', content)
    return content

def replace_tmp(content: str, filepath: str) -> str:
    # #/shared/
    path_to_shared = os.path.abspath('./tmp/socker/shared/.')
    rel = os.path.relpath(path_to_shared, filepath).replace('../shared', 'shared')
    print('REL', rel)
    #print(os.path.relpath())
    content = re.sub(r'(\'|")(socker\/shared.*?)(\'|")', rf'\1{rel}\3', content)
    #content = re.sub(r'(\'|")(socker\/client.*?)(\'|")', r'\1../../../client\3', content)
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


    #for folder in ['./tmp/socker/server']:
    #    dist_dir = os.path.join(folder, 'dist')
    #    for file in [*glob.glob(f'{dist_dir}/**/*.js'), *glob.glob(f'{dist_dir}/**/*.d.ts')]:
    #        print(file)
    #        content = replace_tmp(get_content(file), file)
    #        with open(file, 'w') as fp:
    #            _ = fp.write(content)
