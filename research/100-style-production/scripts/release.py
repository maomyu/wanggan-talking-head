from pathlib import Path
import json, subprocess, hashlib, zipfile

R = Path(__file__).resolve().parents[1]
APP = Path.home() / 'plugins/wanggan-talking-head'
DELIVERY = R.parents[1] / '交付'
read = lambda p: json.loads(p.read_text())
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
version = read(APP / '.codex-plugin/plugin.json')['version']
catalog = read(APP / 'style-library/catalog.json')
assert catalog['version'] == version
assert not subprocess.check_output(['git', '-C', str(APP), 'status', '--porcelain'], text=True).strip(), 'Commit the validated source before release'
repo = json.loads(subprocess.check_output(['gh', 'repo', 'view', 'maomyu/wanggan-talking-head', '--json', 'isPrivate,url']))
assert repo['isPrivate']
head = subprocess.check_output(['git', '-C', str(APP), 'rev-parse', 'HEAD'], text=True).strip()
remote = subprocess.check_output(['git', '-C', str(APP), 'ls-remote', 'origin', 'refs/heads/main'], text=True).split()[0]
assert head == remote
with (R / f'qa/install-{version}.json').open('w') as log:
    subprocess.run(['codex', 'plugin', 'add', 'wanggan-talking-head@personal', '--json'], stdout=log, check=True)
installed_path = Path(read(R / f'qa/install-{version}.json')['installedPath'])
for name, script, command in [('doctor', 'studio.mjs', ['doctor']), ('package', 'validate-package.mjs', [])]:
    with (R / f'qa/installed-{name}-{version}.json').open('w') as log:
        subprocess.run(['node', str(installed_path / 'scripts' / script), *command], stdout=log, check=True)
doctor = read(R / f'qa/installed-doctor-{version}.json')
assert doctor['ready'] and read(R / f'qa/installed-package-{version}.json')['ok']
assert next(c['value']['prefix'] for c in doctor['checks'] if c['name'] == 'python') == str(installed_path / 'runtime/.venv')
plugins = json.loads(subprocess.check_output(['codex', 'plugin', 'list', '--json']))
installed = next(p for p in plugins['installed'] if p['pluginId'] == 'wanggan-talking-head@personal')
assert installed['enabled'] and installed['version'] == version
manifest = read(APP / 'package-manifest.json')
assert manifest['version'] == version
archive = DELIVERY / f'网感口播-{version}.zip'
if not archive.exists():
    with zipfile.ZipFile(archive, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=6) as z:
        for file, checksum in manifest['files'].items():
            assert sha(APP / file) == checksum
            z.write(APP / file, 'wanggan-talking-head/' + file)
        z.write(APP / 'package-manifest.json', 'wanggan-talking-head/package-manifest.json')
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None
    for file, checksum in manifest['files'].items():
        assert hashlib.sha256(z.read('wanggan-talking-head/' + file)).hexdigest() == checksum
    assert not any('/.git/' in p or '/node_modules/' in p or '/.venv/' in p for p in z.namelist())
report = dict(ok=True, private=True, url=repo['url'], head=head, version=version, enabled=True,
              implemented=len(catalog['styles']), userApproved=catalog['approvedCount'],
              productionVerified=catalog['productionVerifiedCount'], pending=catalog['plannedCount'],
              installedDependencies=True, packageIntegrity=True, zipIntegrity=True,
              archive=str(archive), archiveSha256=sha(archive))
(R / f'qa/release-verification-{version}.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(report, ensure_ascii=False), flush=True)
