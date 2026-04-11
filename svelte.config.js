import adapter from '@sveltejs/adapter-node';

const config = { 
    kit: { adapter: adapter() },
    edge:false

};

export default config;
