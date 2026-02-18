import { createApp } from 'vue';
import { createMidwayApiPlugin } from '@midwayjs/vue';
import App from './web/app.vue';
import { api } from './web/api/client';

createApp(App).use(createMidwayApiPlugin(api)).mount('#root');
