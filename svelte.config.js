import adapterNode from '@sveltejs/adapter-node';
import adapterStatic from '@sveltejs/adapter-static';

const isStatic = process.env.ADAPTER === 'static';

const config = { 
    kit: { 
        adapter: isStatic
            ? adapterStatic({
                pages: 'build',
                assets: 'build',
                fallback: '404.html',
                precompress: false,
                strict: false
            })
            : adapterNode(),
        paths: {
            base: process.env.BASE_PATH || ''
        }
    },
    edge: false
};

export default config;
