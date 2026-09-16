import adapterNode from '@sveltejs/adapter-node';
import adapterStatic from '@sveltejs/adapter-static';

const isStatic = process.env.ADAPTER === 'static';

const config = { 
    kit: { 
        adapter: isStatic
            ? adapterStatic({
                pages: 'build/www',
                assets: 'build/www',
                fallback: '404.html',
                precompress: false,
                strict: false
            })
            : adapterNode({
                out: 'build/node'
            }),
        paths: {
            base: process.env.BASE_PATH || ''
        }
    },
    edge: false
};

export default config;
