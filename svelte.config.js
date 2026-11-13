import adapterNode from '@sveltejs/adapter-node';
import adapterStatic from '@sveltejs/adapter-static';

const isStatic = process.env.ADAPTER === 'static';
const outDir = process.env.BUILD_DIR || 'build/www';
const config = { 
    kit: { 
        adapter: isStatic
            ? adapterStatic({
                pages: outDir,
                assets: outDir,
                fallback: '404.html',
                precompress: false,
                strict: false
            })
            : adapterNode({
                out: 'build/node'
            }),
        paths: {
            base: process.env.BASE_PATH || '',
            relative: false
        }
    },
    edge: false
};

export default config;
