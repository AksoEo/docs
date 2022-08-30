#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const header = fs.readFileSync(path.join(__dirname, 'spec/openapi.header.yaml'), 'utf-8');

const out = [];
out.push('paths:');
for (const item of fs.readdirSync(path.join(__dirname, 'spec/paths'))) {
    if (path.extname(item) === '.yaml') {
        const name = path.basename(item, '.yaml');
        const pathComponents = name.split('@');
        const pathname = '/' + pathComponents.join('/');
        out.push(`  '${pathname}':`);
        out.push(`    $ref: 'paths/${item}'`);
        /*const contents = fs.readFileSync(path.join(__dirname, 'spec/paths', item), 'utf-8');
        for (const line of contents.split('\n')) {
            out.push(`    ${line}`);
        }*/
    }
}

out.push('components:');
function walkComponents(dir, level = 1) {
    const indent = ' '.repeat(level * 2);

    for (const item of fs.readdirSync(path.join(__dirname, 'spec', dir), { withFileTypes: true })) {
        const fullItemPath = path.join(dir, item.name);
        if (item.isDirectory()) {
            if (level === 1) {
                out.push(`${indent}'${item.name}':`);
                walkComponents(fullItemPath, level + 1);
            } else {
                walkComponents(fullItemPath, level);
            }
        } else if (path.extname(item.name) === '.yaml') {
            const itemName = path.basename(item.name, '.yaml');
            out.push(`${indent}'${itemName}':`);
            out.push(`${indent}  $ref: '${fullItemPath}'`);
            /*const contents = fs.readFileSync(path.join(__dirname, 'spec', fullItemPath), 'utf-8');
            for (const line of contents.split('\n')) {
                out.push(`${indent}  ${line}`);
            }*/
        }
    }
}
walkComponents('components');

const banner = `# note: this file is automatically generated\n`;
fs.writeFileSync(path.join(__dirname, 'spec/openapi.yaml'), banner + header + '\n' + out.join('\n'));